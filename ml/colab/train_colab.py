"""
BoneTalk — PyTorch 1D-CNN Training Pipeline for Google Colab (Tesla T4 GPU)

Features:
- Auto-detects NVIDIA Tesla T4 GPU (CUDA) and activates mixed precision (AMP)
- Zero-leakage StratifiedGroupKFold splitting (keeps recording sessions disjoint)
- Real-time training metrics (Loss, Accuracy, Macro F1)
- Cosine Annealing learning rate schedule + Early Stopping
- Comprehensive test evaluation, confusion matrix plot, and training curves plot
- Exports model checkpoint (.pt), ONNX format, and label mappings
"""
import argparse
import json
import logging
import os
import sys
import time
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import torch
import torch.nn as nn
from sklearn.metrics import classification_report, confusion_matrix, f1_score, accuracy_score, precision_score, recall_score
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.utils.class_weight import compute_class_weight
from torch.utils.data import DataLoader

# Add ml/colab and Bonetalk root to sys.path
COLAB_DIR = Path(__file__).resolve().parent
PROJECT_DIR = COLAB_DIR.parent.parent
if str(COLAB_DIR) not in sys.path:
    sys.path.insert(0, str(COLAB_DIR))
if str(PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(PROJECT_DIR))

from model_1dcnn import BoneTalk1DCNN, count_parameters
from dataset_colab import BoneTalkEMGDataset, collate_emg_batch

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s  %(message)s")
log = logging.getLogger("bonetalk.colab_train")


def setup_device(requested_device: str = "auto") -> torch.device:
    """Configures compute device and displays hardware diagnostics."""
    if requested_device == "auto":
        device_str = "cuda" if torch.cuda.is_available() else "cpu"
    else:
        device_str = requested_device

    device = torch.device(device_str)
    print("\n" + "=" * 65)
    print("  BoneTalk Deep Learning Hardware Diagnostic")
    print("=" * 65)
    if device.type == "cuda":
        props = torch.cuda.get_device_properties(0)
        print(f"  Device:            CUDA Acceleration ACTIVE")
        print(f"  GPU Name:          {props.name}")
        print(f"  Compute Capability:{props.major}.{props.minor}")
        print(f"  VRAM Total:        {props.total_memory / (1024**3):.2f} GB")
        print(f"  PyTorch CUDA:      {torch.version.cuda}")
        print(f"  Mixed Precision:   Enabled (FP16 via torch.cuda.amp)")
        torch.backends.cudnn.benchmark = True
    else:
        print("  Device:            CPU Host Execution (CUDA unavailable)")
        print("  Mixed Precision:   Disabled (CPU mode)")
    print("=" * 65 + "\n")
    return device


def load_packaged_data(data_path: Path):
    """Loads arrays and metadata from packaged .npz file."""
    if not data_path.exists():
        raise FileNotFoundError(f"Data package not found: {data_path}")

    data = np.load(data_path, allow_pickle=True)
    signals = list(data["signals"])
    labels = data["labels"]
    groups = data["groups"]
    class_names = list(data["class_names"])
    metadata = json.loads(str(data["metadata"]))

    log.info("Loaded %d signals across %d classes from %s", len(signals), len(class_names), data_path.name)
    log.info("Classes: %s", class_names)
    return signals, labels, groups, class_names, metadata


def get_autocast(device: torch.device):
    """Returns PyTorch version-compatible autocast context manager."""
    if hasattr(torch, "amp") and hasattr(torch.amp, "autocast"):
        return torch.amp.autocast(device_type=device.type, enabled=(device.type == "cuda"))
    return torch.cuda.amp.autocast(enabled=(device.type == "cuda"))


def evaluate_split(model: nn.Module, loader: DataLoader, criterion: nn.Module, device: torch.device):
    """Evaluates model on validation or test DataLoader."""
    model.eval()
    total_loss = 0.0
    all_preds = []
    all_targets = []

    with torch.no_grad():
        for batch_x, batch_y, _ in loader:
            batch_x = batch_x.to(device, non_blocking=True)
            batch_y = batch_y.to(device, non_blocking=True)

            with get_autocast(device):
                logits = model(batch_x)
                loss = criterion(logits, batch_y)

            total_loss += loss.item() * len(batch_y)
            preds = torch.argmax(logits, dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_targets.extend(batch_y.cpu().numpy())

    avg_loss = total_loss / max(1, len(all_targets))
    acc = accuracy_score(all_targets, all_preds)
    f1_macro = f1_score(all_targets, all_preds, average="macro", zero_division=0)
    return avg_loss, acc, f1_macro, np.array(all_targets), np.array(all_preds)


def train_colab(args: argparse.Namespace):
    device = setup_device(args.device)
    use_amp = (device.type == "cuda")
    if hasattr(torch, "amp") and hasattr(torch.amp, "GradScaler"):
        scaler = torch.amp.GradScaler(device.type, enabled=use_amp)
    else:
        scaler = torch.cuda.amp.GradScaler(enabled=use_amp)

    data_path = Path(args.data_package)
    signals, labels, groups, class_names, metadata = load_packaged_data(data_path)
    num_classes = len(class_names)

    # ── Session-Aware Split (Stratified Group K-Fold) ─────────────────────
    # Ensures zero session/recording data leakage
    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    train_val_idx, test_idx = next(sgkf.split(signals, labels, groups))

    # Split train_val into train (80%) and val (20%)
    train_val_signals = [signals[i] for i in train_val_idx]
    train_val_labels = labels[train_val_idx]
    train_val_groups = groups[train_val_idx]

    sgkf_val = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    sub_train_idx, sub_val_idx = next(sgkf_val.split(train_val_signals, train_val_labels, train_val_groups))

    real_train_idx = train_val_idx[sub_train_idx]
    real_val_idx = train_val_idx[sub_val_idx]

    # Leakage check
    train_groups = set(groups[real_train_idx])
    val_groups = set(groups[real_val_idx])
    test_groups = set(groups[test_idx])
    assert train_groups.isdisjoint(val_groups), "Data leakage: train ∩ val"
    assert train_groups.isdisjoint(test_groups), "Data leakage: train ∩ test"
    assert val_groups.isdisjoint(test_groups), "Data leakage: val ∩ test"

    log.info("Zero-leakage split confirmed: Train=%d, Val=%d, Test=%d recordings",
             len(real_train_idx), len(real_val_idx), len(test_idx))

    # Datasets and Loaders
    train_ds = BoneTalkEMGDataset(
        [signals[i] for i in real_train_idx],
        labels[real_train_idx],
        groups[real_train_idx],
        is_train=True,
    )
    val_ds = BoneTalkEMGDataset(
        [signals[i] for i in real_val_idx],
        labels[real_val_idx],
        groups[real_val_idx],
        is_train=False,
    )
    test_ds = BoneTalkEMGDataset(
        [signals[i] for i in test_idx],
        labels[test_idx],
        groups[test_idx],
        is_train=False,
    )

    num_workers = 2 if device.type == "cuda" else 0
    train_loader = DataLoader(
        train_ds, batch_size=args.batch_size, shuffle=True,
        collate_fn=collate_emg_batch, pin_memory=(device.type == "cuda"),
        num_workers=num_workers
    )
    val_loader = DataLoader(
        val_ds, batch_size=args.batch_size, shuffle=False,
        collate_fn=collate_emg_batch, pin_memory=(device.type == "cuda"),
        num_workers=num_workers
    )
    test_loader = DataLoader(
        test_ds, batch_size=args.batch_size, shuffle=False,
        collate_fn=collate_emg_batch, pin_memory=(device.type == "cuda"),
        num_workers=num_workers
    )

    # Compute class weights to counter minor imbalances
    weights = compute_class_weight("balanced", classes=np.arange(num_classes), y=labels[real_train_idx])
    class_weights = torch.tensor(weights, dtype=torch.float, device=device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    # Instantiate Model
    model = BoneTalk1DCNN(in_channels=8, num_classes=num_classes, dropout=args.dropout).to(device)
    log.info("Initialized BoneTalk1DCNN (%d classes, %s params)", num_classes, f"{count_parameters(model):,}")

    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-5)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    best_val_f1 = -1.0
    best_val_acc = 0.0
    patience = args.patience
    patience_counter = 0

    history = {
        "train_loss": [], "val_loss": [],
        "train_acc": [], "val_acc": [],
        "val_f1": []
    }

    start_time = time.time()
    log.info("Beginning training for %d epochs...", args.epochs)

    for epoch in range(1, args.epochs + 1):
        model.train()
        train_loss = 0.0
        train_preds, train_targets = [], []

        for batch_x, batch_y, _ in train_loader:
            batch_x = batch_x.to(device, non_blocking=True)
            batch_y = batch_y.to(device, non_blocking=True)

            optimizer.zero_grad()
            with get_autocast(device):
                logits = model(batch_x)
                loss = criterion(logits, batch_y)

            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=2.0)
            scaler.step(optimizer)
            scaler.update()

            train_loss += loss.item() * len(batch_y)
            preds = torch.argmax(logits, dim=1).detach().cpu().numpy()
            train_preds.extend(preds)
            train_targets.extend(batch_y.cpu().numpy())

        scheduler.step()

        epoch_train_loss = float(train_loss / len(train_targets))
        epoch_train_acc = float(accuracy_score(train_targets, train_preds))

        val_loss, val_acc, val_f1, _, _ = evaluate_split(model, val_loader, criterion, device)

        history["train_loss"].append(epoch_train_loss)
        history["val_loss"].append(float(val_loss))
        history["train_acc"].append(epoch_train_acc)
        history["val_acc"].append(float(val_acc))
        history["val_f1"].append(float(val_f1))

        is_best = val_f1 > best_val_f1
        if is_best:
            best_val_f1 = float(val_f1)
            best_val_acc = float(val_acc)
            patience_counter = 0
            # Save best checkpoint
            torch.save({
                "epoch": int(epoch),
                "model_state_dict": model.state_dict(),
                "val_f1": float(val_f1),
                "val_acc": float(val_acc),
                "num_classes": int(num_classes),
                "class_names": [str(c) for c in class_names],
            }, output_dir / "bonetalk_emg_model.pt")
        else:
            patience_counter += 1

        if epoch % 5 == 0 or epoch == 1 or is_best:
            log.info(
                "Epoch [%3d/%3d]  Train Loss: %.4f | Val Loss: %.4f | Val Acc: %5.2f%% | Val F1: %.4f %s",
                epoch, args.epochs, epoch_train_loss, val_loss, val_acc * 100, val_f1,
                "★ (BEST)" if is_best else ""
            )

        if patience_counter >= patience and epoch >= 25:
            log.info("Early stopping triggered after %d epochs without validation F1 improvement.", patience)
            break

    elapsed = time.time() - start_time
    log.info("Training completed in %.2f seconds.", elapsed)

    # ── Test Evaluation on Held-Out Split ────────────────────────────────
    log.info("Loading best model checkpoint for held-out test evaluation...")
    ckpt_path = output_dir / "bonetalk_emg_model.pt"
    try:
        checkpoint = torch.load(ckpt_path, map_location=device, weights_only=False)
    except TypeError:
        checkpoint = torch.load(ckpt_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])

    test_loss, test_acc, test_f1, test_y_true, test_y_pred = evaluate_split(
        model, test_loader, criterion, device
    )

    test_prec = precision_score(test_y_true, test_y_pred, average="macro", zero_division=0)
    test_rec = recall_score(test_y_true, test_y_pred, average="macro", zero_division=0)

    print("\n" + "=" * 65)
    print("  BoneTalk 1D-CNN (Colab T4) — Held-out Test Results")
    print("=" * 65)
    print(f"  Test Accuracy:     {test_acc * 100:.2f}%")
    print(f"  Macro F1 Score:    {test_f1:.4f}")
    print(f"  Macro Precision:   {test_prec:.4f}")
    print(f"  Macro Recall:      {test_rec:.4f}")
    print(f"  Test Samples:      {len(test_y_true)}")
    print(f"  Classes ({num_classes}): {class_names}")
    print("=" * 65 + "\n")

    report_text = classification_report(test_y_true, test_y_pred, target_names=class_names, zero_division=0)
    print("Detailed Classification Report:\n")
    print(report_text)

    # Save Label Mapping
    label_map = {str(i): name for i, name in enumerate(class_names)}
    with open(output_dir / "label_mapping.json", "w") as f:
        json.dump({"id_to_label": label_map, "classes": class_names}, f, indent=2)

    # Save Structured Evaluation Report
    eval_report = {
        "model_architecture": "BoneTalk1DCNN",
        "device": device.type if device.type != "cuda" else torch.cuda.get_device_name(0),
        "test_accuracy": float(test_acc),
        "macro_f1": float(test_f1),
        "macro_precision": float(test_prec),
        "macro_recall": float(test_rec),
        "test_samples": int(len(test_y_true)),
        "num_classes": num_classes,
        "class_names": class_names,
        "best_val_f1": float(best_val_f1),
        "best_val_acc": float(best_val_acc),
        "training_time_seconds": round(elapsed, 2),
    }
    with open(output_dir / "evaluation_report.json", "w") as f:
        json.dump(eval_report, f, indent=2)
    log.info("Saved evaluation report → %s", output_dir / "evaluation_report.json")

    # Plot Confusion Matrix
    cm = confusion_matrix(test_y_true, test_y_pred, labels=np.arange(num_classes))
    fig, ax = plt.subplots(figsize=(max(6, num_classes + 1), max(5, num_classes)))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=class_names, yticklabels=class_names, ax=ax)
    ax.set_ylabel("Actual Label")
    ax.set_xlabel("Predicted Label")
    ax.set_title(f"BoneTalk 1D-CNN Confusion Matrix (Acc: {test_acc * 100:.1f}%)")
    plt.xticks(rotation=35, ha="right")
    fig.tight_layout()
    cm_path = output_dir / "confusion_matrix_test.png"
    fig.savefig(cm_path, dpi=160)
    plt.close(fig)
    log.info("Saved confusion matrix → %s", cm_path)

    # Plot Training Curves
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4.5))
    ax1.plot(history["train_loss"], label="Train Loss")
    ax1.plot(history["val_loss"], label="Val Loss")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Cross Entropy Loss")
    ax1.set_title("Training & Validation Loss")
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    ax2.plot([acc * 100 for acc in history["train_acc"]], label="Train Acc %")
    ax2.plot([acc * 100 for acc in history["val_acc"]], label="Val Acc %")
    ax2.plot([f1 * 100 for f1 in history["val_f1"]], label="Val Macro F1 %", linestyle="--")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Percentage (%)")
    ax2.set_title("Accuracy & F1 Score")
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    fig.tight_layout()
    curves_path = output_dir / "training_curves.png"
    fig.savefig(curves_path, dpi=160)
    plt.close(fig)
    log.info("Saved training curves → %s", curves_path)

    # Optional ONNX Export
    try:
        dummy_input = torch.randn(1, 8, 800, device=device)
        onnx_path = output_dir / "bonetalk_emg_model.onnx"
        torch.onnx.export(
            model,
            dummy_input,
            onnx_path,
            input_names=["emg_input"],
            output_names=["logits"],
            dynamic_axes={"emg_input": {0: "batch_size", 2: "time_steps"}, "logits": {0: "batch_size"}},
            opset_version=14,
        )
        log.info("Exported ONNX model → %s", onnx_path)
    except Exception as e:
        log.warning("ONNX export skipped: %s", e)

    log.info("═══ Colab Pipeline Complete! All artifacts saved in %s ═══", output_dir)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BoneTalk PyTorch 1D-CNN Training")
    parser.add_argument("--data-package", type=str, default="ml/colab/bonetalk_mvp_data.npz",
                        help="Path to packaged .npz dataset")
    parser.add_argument("--epochs", type=int, default=70, help="Training epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Initial learning rate")
    parser.add_argument("--weight-decay", type=float, default=1e-4, help="Weight decay")
    parser.add_argument("--dropout", type=float, default=0.3, help="Dropout rate")
    parser.add_argument("--patience", type=int, default=18, help="Early stopping patience")
    parser.add_argument("--device", type=str, default="auto", choices=["auto", "cuda", "cpu"])
    parser.add_argument("--output-dir", type=str, default="ml/colab/models")
    args = parser.parse_args()

    # Resolve relative paths relative to Bonetalk root
    pkg = Path(args.data_package)
    if not pkg.is_absolute():
        pkg = PROJECT_DIR / pkg
    args.data_package = str(pkg)

    out = Path(args.output_dir)
    if not out.is_absolute():
        out = PROJECT_DIR / out
    args.output_dir = str(out)

    train_colab(args)
