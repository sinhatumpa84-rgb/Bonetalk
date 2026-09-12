"""
BoneTalk — Training Pipeline

Loads the Zenodo Silent Speech EMG dataset (or user recordings),
preprocesses it, extracts time-domain features, performs session-aware
data splitting (recording-level isolation to prevent data leakage),
trains a Random Forest classifier, evaluates on the validation split,
and saves all model artifacts.

Usage:
    python ml/train.py --task closed_vocab
    python ml/train.py --task days
    python ml/train.py --task all
"""
import argparse
import json
import logging
import sys
from collections import Counter
from pathlib import Path

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import StratifiedGroupKFold, GroupShuffleSplit

# Ensure ml/ is on the import path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import (
    RAW_DIR, PROCESSED_DIR, METADATA_DIR, SPLITS_DIR, MODELS_DIR,
    EMG_CHANNELS, SAMPLING_RATE, TARGET_SAMPLING_RATE,
    WINDOW_SIZE_MS, WINDOW_OVERLAP_MS, RANDOM_FOREST_PARAMS, DATA_SUBDIRS,
)
from preprocessing.loader import load_dataset, validate_emg
from preprocessing.filters import preprocess_emg
from preprocessing.windowing import create_labeled_windows
from preprocessing.normalizer import EMGNormalizer
from features.emg_features import extract_features, get_feature_names

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
)
log = logging.getLogger("bonetalk.train")


def _resolve_data_dir(user_path: str | Path) -> Path:
    """Resolve the raw dataset path — expects the emg_data/ dir inside."""
    p = Path(user_path)
    if not p.exists():
        return p
    emg_inside = p / "emg_data"
    return emg_inside if emg_inside.exists() else p


def train_pipeline(args: argparse.Namespace) -> None:
    """Full training pipeline."""
    data_dir = _resolve_data_dir(args.data_dir)

    # ── 1. Select subdirectories based on task ───────────────────────────
    if args.task in ("closed_vocab", "days", "top_words"):
        subdirs = ["closed_vocab"]
    else:
        subdirs = DATA_SUBDIRS

    log.info("Loading dataset from %s (subdirs: %s) …", data_dir, subdirs)
    dataset = load_dataset(data_dir, subdirs)

    if not dataset:
        log.error(
            "Training cannot begin because the dataset has not been "
            "successfully loaded. Make sure you have downloaded and "
            "extracted the Zenodo archive into %s", RAW_DIR,
        )
        sys.exit(1)

    log.info("Loaded %d raw recordings.", len(dataset))

    # ── 2. Determine class labels ────────────────────────────────────────
    DAYS_SET = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"}

    filtered_dataset = []
    for item in dataset:
        info = item.get("info", {})
        text = info.get("text", "").strip()
        words = text.split()
        first_word = words[0].upper() if words else ""

        if args.task == "days":
            if first_word in DAYS_SET:
                item["class_label"] = first_word
                filtered_dataset.append(item)
        elif args.task in ("closed_vocab", "top_words"):
            # Group by first word for recurring closed-vocabulary classes
            if first_word:
                item["class_label"] = first_word
                filtered_dataset.append(item)
        else:
            # Full dataset: prompt or sentence index
            idx = info.get("sentence_index", -1)
            item["class_label"] = text if text else f"sentence_{idx}"
            filtered_dataset.append(item)

    # Filter out classes with too few recordings for reliable train/val/test splitting
    min_count = 6 if args.task in ("closed_vocab", "top_words") else 2
    class_counts = Counter(item["class_label"] for item in filtered_dataset)
    valid_classes = {cls for cls, cnt in class_counts.items() if cnt >= min_count}

    final_dataset = [item for item in filtered_dataset if item["class_label"] in valid_classes]
    log.info("Filtered to %d recordings across %d classes with >= %d recordings each.",
             len(final_dataset), len(valid_classes), min_count)
    log.info("Classes: %s", sorted(valid_classes))

    if not final_dataset:
        log.error("No recordings met class criteria. Cannot train.")
        sys.exit(1)

    # ── 3. Preprocess + window + extract features ────────────────────────
    all_features: list[np.ndarray] = []
    all_labels: list[str] = []
    all_groups: list[str] = []  # Recording ID ensures windows from same recording stay together

    skipped = 0
    for item in final_dataset:
        emg = item["emg"]
        sample_id = item["sample_id"]
        subdir = item["subdir"]
        label = item["class_label"]
        rec_id = f"{subdir}_{sample_id}"

        if not validate_emg(emg, EMG_CHANNELS):
            skipped += 1
            continue

        emg_clean = preprocess_emg(emg, fs=SAMPLING_RATE, target_fs=TARGET_SAMPLING_RATE)

        labeled_wins = create_labeled_windows(
            emg_clean, label, rec_id,
            fs=TARGET_SAMPLING_RATE,
            window_ms=args.window_size,
            overlap_ms=args.overlap,
        )
        if not labeled_wins:
            skipped += 1
            continue

        for lw in labeled_wins:
            feat = extract_features(lw["window"])
            all_features.append(feat)
            all_labels.append(lw["label"])
            all_groups.append(lw["recording_id"])

    if not all_features:
        log.error("No valid feature vectors extracted. Cannot train.")
        sys.exit(1)

    X = np.vstack(all_features)
    y = np.array(all_labels)
    groups = np.array(all_groups)

    log.info("Feature matrix: %s | Unique recordings: %d | Skipped: %d",
             X.shape, len(set(groups)), skipped)

    # ── 4. Session-Aware / Recording-Aware Splitting ──────────────────────
    # Uses StratifiedGroupKFold to maintain class balance while guaranteeing
    # that ALL windows from any single recording remain strictly in one split.
    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    train_idx, test_idx = next(sgkf.split(X, y, groups))

    # Split train further into train (70%) and val (15%)
    X_train_full, y_train_full, groups_train_full = X[train_idx], y[train_idx], groups[train_idx]
    sgkf_val = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    sub_train_idx, sub_val_idx = next(sgkf_val.split(X_train_full, y_train_full, groups_train_full))

    real_train_idx = train_idx[sub_train_idx]
    real_val_idx = train_idx[sub_val_idx]

    X_train, y_train = X[real_train_idx], y[real_train_idx]
    X_val, y_val = X[real_val_idx], y[real_val_idx]
    X_test, y_test = X[test_idx], y[test_idx]

    # Verify zero data leakage across groups
    train_groups = set(groups[real_train_idx])
    val_groups = set(groups[real_val_idx])
    test_groups = set(groups[test_idx])
    assert train_groups.isdisjoint(val_groups), "Data leakage: train ∩ val"
    assert train_groups.isdisjoint(test_groups), "Data leakage: train ∩ test"
    assert val_groups.isdisjoint(test_groups), "Data leakage: val ∩ test"
    log.info("✓ Zero data leakage: train (%d recs), val (%d recs), test (%d recs) are disjoint.",
             len(train_groups), len(val_groups), len(test_groups))
    log.info("Window counts: train=%d, val=%d, test=%d", len(X_train), len(X_val), len(X_test))

    # ── 5. Normalization (fit ONLY on training split) ─────────────────────
    normalizer = EMGNormalizer()
    X_train_n = normalizer.fit_transform(X_train)
    X_val_n = normalizer.transform(X_val)
    X_test_n = normalizer.transform(X_test)

    # ── 6. Train Random Forest ───────────────────────────────────────────
    log.info("Training Random Forest Classifier (trees=%d)...", args.n_estimators)
    clf = RandomForestClassifier(
        n_estimators=args.n_estimators,
        max_depth=RANDOM_FOREST_PARAMS.get("max_depth"),
        random_state=RANDOM_FOREST_PARAMS.get("random_state", 42),
        n_jobs=-1,
    )
    clf.fit(X_train_n, y_train)

    # ── 7. Evaluate on Validation Split ──────────────────────────────────
    y_val_pred = clf.predict(X_val_n)
    report_text = classification_report(y_val, y_val_pred, zero_division=0)
    print("\n" + "=" * 60)
    print("  Validation Classification Report")
    print("=" * 60)
    print(report_text)
    print("=" * 60 + "\n")

    # ── 8. Save Artifacts ────────────────────────────────────────────────
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    SPLITS_DIR.mkdir(parents=True, exist_ok=True)
    METADATA_DIR.mkdir(parents=True, exist_ok=True)

    # Model
    model_path = MODELS_DIR / "bonetalk_random_forest.joblib"
    joblib.dump(clf, model_path)
    log.info("Saved model → %s", model_path)

    # Normalizer
    normalizer.save(MODELS_DIR / "normalizer.pkl")
    log.info("Saved normalizer → %s", MODELS_DIR / "normalizer.pkl")

    # Splits for evaluate.py
    np.save(SPLITS_DIR / "X_test.npy", X_test_n)
    np.save(SPLITS_DIR / "y_test.npy", y_test)
    log.info("Saved test split → %s", SPLITS_DIR)

    # Label mapping
    unique_labels = sorted(list(clf.classes_))
    label_map = {i: lbl for i, lbl in enumerate(unique_labels)}
    inverse_map = {lbl: i for i, lbl in label_map.items()}
    with open(MODELS_DIR / "label_mapping.json", "w") as f:
        json.dump({"id_to_label": label_map, "label_to_id": inverse_map}, f, indent=2)

    # Configs
    with open(MODELS_DIR / "feature_config.json", "w") as f:
        json.dump({
            "feature_names": get_feature_names(EMG_CHANNELS),
            "n_channels": EMG_CHANNELS,
            "n_features_per_channel": 8,
            "total_features": EMG_CHANNELS * 8,
        }, f, indent=2)

    with open(MODELS_DIR / "preprocessing_config.json", "w") as f:
        json.dump({
            "original_sampling_rate": SAMPLING_RATE,
            "target_sampling_rate": TARGET_SAMPLING_RATE,
            "window_size_ms": args.window_size,
            "window_overlap_ms": args.overlap,
            "notch_freq": 60.0,
            "notch_harmonics": 3,
            "highpass_cutoff": 2.0,
            "task": args.task,
        }, f, indent=2)

    # Confusion matrix plot
    cm = confusion_matrix(y_val, y_val_pred, labels=unique_labels)
    fig, ax = plt.subplots(figsize=(max(8, len(unique_labels)), max(6, len(unique_labels) - 2)))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=unique_labels, yticklabels=unique_labels, ax=ax)
    ax.set_ylabel("Actual")
    ax.set_xlabel("Predicted")
    ax.set_title("BoneTalk — Validation Confusion Matrix")
    plt.xticks(rotation=45, ha="right")
    fig.tight_layout()
    cm_path = MODELS_DIR / "confusion_matrix.png"
    fig.savefig(cm_path, dpi=150)
    plt.close(fig)
    log.info("Saved confusion matrix → %s", cm_path)

    log.info("═══ Training Complete ═══")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BoneTalk — Train EMG classifier")
    parser.add_argument("--data-dir", type=str, default=str(RAW_DIR),
                        help="Path to the raw dataset directory")
    parser.add_argument("--task", type=str, default="closed_vocab",
                        choices=["closed_vocab", "days", "top_words", "all"],
                        help="Vocabulary classification task (default: closed_vocab)")
    parser.add_argument("--window-size", type=int, default=WINDOW_SIZE_MS,
                        help="Window size in ms (default: %(default)s)")
    parser.add_argument("--overlap", type=int, default=WINDOW_OVERLAP_MS,
                        help="Window overlap in ms (default: %(default)s)")
    parser.add_argument("--n-estimators", type=int,
                        default=RANDOM_FOREST_PARAMS.get("n_estimators", 100),
                        help="Number of Random Forest trees (default: %(default)s)")
    args = parser.parse_args()
    train_pipeline(args)
