"""
BoneTalk MVP — Training & Model Benchmarking Pipeline

Benchmarks multiple classifiers and windowing strategies on genuine
isolated EMG communication commands and discrete articulatory classes.
Enforces strict session-aware splitting (StratifiedGroupKFold) to guarantee
zero data leakage.
"""
import argparse
import json
import logging
import sys
import time
from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

# Add paths
EXPERIMENT_DIR = Path(__file__).resolve().parent
ML_DIR = EXPERIMENT_DIR.parent.parent
sys.path.insert(0, str(ML_DIR))
sys.path.insert(0, str(EXPERIMENT_DIR))

from dataset import load_isolated_commands_dataset, load_discrete_vocabulary_dataset
from preprocess import preprocess_emg_signal, create_windows
from features import extract_multichannel_features, get_feature_names

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s  %(message)s")
log = logging.getLogger("bonetalk.mvp.train")

MODELS_DIR = EXPERIMENT_DIR / "models"
REPORTS_DIR = EXPERIMENT_DIR / "reports"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def extract_dataset_features(
    raw_samples: List[Dict],
    mode: str = "utterance",
    window_ms: float = 500.0,
    overlap_ms: float = 250.0,
    target_fs: float = 800.0,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Preprocess and extract 128-dimensional features.
    mode='utterance': 1 feature vector per spoken utterance / recording (high SNR).
    mode='window': sliding windows across the preprocessed signal.
    """
    X_list = []
    y_list = []
    groups_list = []

    for item in raw_samples:
        raw_emg = item["emg"]
        label = item["label"]
        rec_id = item["recording_id"]

        # Preprocess: Bandpass 20-380 Hz + Notch 60 Hz + TKEO active burst gating
        cleaned = preprocess_emg_signal(
            raw_emg, fs=1000.0, target_fs=target_fs, apply_gating=(mode == "utterance")
        )

        if cleaned.shape[0] < 40:
            continue

        if mode == "utterance":
            feat = extract_multichannel_features(cleaned, fs=target_fs)
            X_list.append(feat)
            y_list.append(label)
            groups_list.append(rec_id)
        else:
            wins = create_windows(cleaned, fs=target_fs, window_ms=window_ms, overlap_ms=overlap_ms)
            for w in wins:
                feat = extract_multichannel_features(w, fs=target_fs)
                X_list.append(feat)
                y_list.append(label)
                groups_list.append(rec_id)

    X = np.vstack(X_list)
    y = np.array(y_list)
    groups = np.array(groups_list)
    return X, y, groups


def benchmark_models(
    X_train: np.ndarray,
    y_train: np.ndarray,
    groups_train: np.ndarray,
    n_splits: int = 4,
) -> Dict:
    """
    Compares candidate ML models using cross-validation on the training set.
    Evaluates: Random Forest, Linear SVM, RBF SVM, LDA, HistGradientBoosting.
    """
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=150, max_depth=12, random_state=42, n_jobs=-1),
        "SVM (RBF)": SVC(kernel="rbf", C=10.0, gamma="scale", probability=True, random_state=42),
        "Linear SVM": SVC(kernel="linear", C=1.0, probability=True, random_state=42),
        "LDA": LinearDiscriminantAnalysis(solver="lsqr", shrinkage="auto"),
        "HistGradientBoosting": HistGradientBoostingClassifier(max_iter=100, random_state=42),
    }

    results = {}
    sgkf = StratifiedGroupKFold(n_splits=n_splits, shuffle=True, random_state=42)

    for name, clf in models.items():
        val_accs = []
        val_f1s = []
        t0 = time.time()

        for fold_tr_idx, fold_val_idx in sgkf.split(X_train, y_train, groups_train):
            X_tr, y_tr = X_train[fold_tr_idx], y_train[fold_tr_idx]
            X_v, y_v = X_train[fold_val_idx], y_train[fold_val_idx]

            scaler = StandardScaler()
            X_tr_s = scaler.fit_transform(X_tr)
            X_v_s = scaler.transform(X_v)

            clf.fit(X_tr_s, y_tr)
            y_pred = clf.predict(X_v_s)

            val_accs.append(accuracy_score(y_v, y_pred))
            val_f1s.append(f1_score(y_v, y_pred, average="macro", zero_division=0))

        train_time = time.time() - t0
        mean_acc = float(np.mean(val_accs))
        mean_f1 = float(np.mean(val_f1s))

        results[name] = {
            "model": clf,
            "val_accuracy": mean_acc,
            "val_f1": mean_f1,
            "train_time_sec": round(train_time, 2),
        }

    return results


def run_training_experiment(args: argparse.Namespace) -> None:
    """Executes the full MVP training pipeline."""
    data_dir = ML_DIR / "data" / "raw" / "emg_data"

    # 1. Load chosen dataset
    if args.dataset == "isolated":
        log.info("Loading genuine isolated commands (YES, NO, THANK YOU, REST)...")
        raw_samples = load_isolated_commands_dataset(data_dir, include_rest=True, max_rest_samples=20)
    else:
        log.info("Loading discrete 7-day vocabulary + REST baseline...")
        raw_samples = load_discrete_vocabulary_dataset(data_dir, include_rest=True, max_rest_samples=35)

    log.info("Loaded %d raw recordings across classes: %s",
             len(raw_samples), sorted(list(set(s["label"] for s in raw_samples))))

    # 2. Extract features
    log.info("Extracting features with mode='%s', window_ms=%s...", args.mode, args.window_ms)
    X, y, groups = extract_dataset_features(
        raw_samples, mode=args.mode, window_ms=args.window_ms, overlap_ms=args.overlap_ms
    )
    log.info("Extracted feature matrix: shape=%s across %d groups", X.shape, len(set(groups)))

    # 3. Session/Recording-Aware Holdout Test Split (80% train, 20% test)
    sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    train_idx, test_idx = next(sgkf.split(X, y, groups))

    X_train, y_train, groups_train = X[train_idx], y[train_idx], groups[train_idx]
    X_test, y_test, groups_test = X[test_idx], y[test_idx], groups[test_idx]

    # Assert zero data leakage
    assert set(groups_train).isdisjoint(set(groups_test)), "Data leakage: train ∩ test is not disjoint!"
    log.info("✓ Zero data leakage: Train groups (%d) and Test groups (%d) are disjoint.",
             len(set(groups_train)), len(set(groups_test)))
    log.info("Sample counts: Train=%d, Test=%d", len(X_train), len(X_test))

    # 4. Benchmark Models on Train Split
    log.info("Benchmarking candidate ML algorithms...")
    benchmark_results = benchmark_models(X_train, y_train, groups_train)

    print("\n" + "=" * 80)
    print(f"  MODEL COMPARISON TABLE (Task: {args.dataset}, Mode: {args.mode})")
    print("=" * 80)
    print(f"{'MODEL':<24} | {'VAL ACCURACY':<14} | {'MACRO F1':<10} | {'TRAIN TIME':<12} | NOTES")
    print("-" * 80)

    best_name = None
    best_acc = -1.0
    for name, res in benchmark_results.items():
        notes = "Top candidate" if res["val_accuracy"] > best_acc else ""
        if res["val_accuracy"] > best_acc:
            best_acc = res["val_accuracy"]
            best_name = name
        print(f"{name:<24} | {res['val_accuracy'] * 100:.2f}%{'':<8} | {res['val_f1']:.4f}{'':<4} | {res['train_time_sec']}s{'':<7} | {notes}")
    print("=" * 80 + "\n")

    log.info("Selected best model based on validation: %s (Val Acc: %.2f%%)", best_name, best_acc * 100)

    # 5. Train Selected Best Model on Full Training Split
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    best_model = benchmark_results[best_name]["model"]
    best_model.fit(X_train_scaled, y_train)

    # 6. Evaluate on Held-Out Test Set
    y_test_pred = best_model.predict(X_test_scaled)
    test_acc = accuracy_score(y_test, y_test_pred)
    test_f1 = f1_score(y_test, y_test_pred, average="macro", zero_division=0)

    print("\n" + "=" * 60)
    print(f"  BoneTalk MVP — Test Set Results ({best_name})")
    print("=" * 60)
    print(f"  Test Accuracy:     {test_acc * 100:.2f}%")
    print(f"  Macro F1 Score:    {test_f1:.4f}")
    print("=" * 60)
    print("\nClassification Report:\n")
    print(classification_report(y_test, y_test_pred, zero_division=0))

    # 7. Save Artifacts
    model_file = MODELS_DIR / "mvp_model.joblib"
    scaler_file = MODELS_DIR / "scaler.pkl"
    label_map_file = MODELS_DIR / "mvp_label_mapping.json"
    feat_cfg_file = MODELS_DIR / "mvp_feature_config.json"

    joblib.dump(best_model, model_file)
    joblib.dump(scaler, scaler_file)

    classes_list = sorted(list(best_model.classes_))
    label_map = {i: c for i, c in enumerate(classes_list)}
    with open(label_map_file, "w") as f:
        json.dump({"id_to_label": label_map, "classes": classes_list}, f, indent=2)

    with open(feat_cfg_file, "w") as f:
        json.dump({
            "feature_names": get_feature_names(8),
            "n_channels": 8,
            "features_per_channel": 16,
            "total_features": 128,
            "mode": args.mode,
            "window_ms": args.window_ms,
            "overlap_ms": args.overlap_ms,
            "best_model": best_name,
            "val_accuracy": best_acc,
            "test_accuracy": test_acc,
        }, f, indent=2)

    # Save test split for evaluate_mvp.py
    np.save(MODELS_DIR / "X_test_mvp.npy", X_test_scaled)
    np.save(MODELS_DIR / "y_test_mvp.npy", y_test)

    # 8. Confusion Matrix Plot
    cm = confusion_matrix(y_test, y_test_pred, labels=classes_list)
    fig, ax = plt.subplots(figsize=(max(6, len(classes_list) * 1.5), max(5, len(classes_list) * 1.2)))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=classes_list, yticklabels=classes_list, ax=ax)
    ax.set_ylabel("Actual")
    ax.set_xlabel("Predicted")
    ax.set_title(f"BoneTalk MVP — Test Confusion Matrix ({best_name})")
    fig.tight_layout()
    cm_path = REPORTS_DIR / "confusion_matrix_mvp.png"
    fig.savefig(cm_path, dpi=150)
    plt.close(fig)

    # Save JSON report
    report_dict = {
        "task": args.dataset,
        "mode": args.mode,
        "best_model": best_name,
        "validation_accuracy": float(best_acc),
        "test_accuracy": float(test_acc),
        "macro_f1": float(test_f1),
        "classes": classes_list,
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "benchmark_comparison": {k: {"val_accuracy": v["val_accuracy"], "val_f1": v["val_f1"]} for k, v in benchmark_results.items()},
    }
    with open(REPORTS_DIR / "mvp_evaluation_report.json", "w") as f:
        json.dump(report_dict, f, indent=2)

    log.info("Saved all artifacts to %s and %s", MODELS_DIR, REPORTS_DIR)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BoneTalk MVP Training & Benchmark")
    parser.add_argument("--dataset", type=str, default="isolated", choices=["isolated", "discrete"],
                        help="Task: isolated (YES, NO, THANK YOU, REST) or discrete (7 Days + REST)")
    parser.add_argument("--mode", type=str, default="utterance", choices=["utterance", "window"],
                        help="Feature aggregation mode: utterance (high SNR whole token) or window")
    parser.add_argument("--window-ms", type=float, default=500.0, help="Window size in ms (if mode=window)")
    parser.add_argument("--overlap-ms", type=float, default=250.0, help="Window overlap in ms (if mode=window)")
    args = parser.parse_args()
    run_training_experiment(args)
