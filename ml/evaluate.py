"""
BoneTalk — Evaluation Pipeline

Loads the trained model and the held-out test split saved by train.py,
runs predictions, computes metrics, and saves a structured evaluation report.

Usage:
    python evaluate.py
"""
import argparse
import json
import logging
import sys
from pathlib import Path

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix,
)

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import SPLITS_DIR, MODELS_DIR, METADATA_DIR

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
)
log = logging.getLogger("bonetalk.evaluate")


def evaluate() -> None:
    """Evaluate the saved model on the held-out test split."""

    # ── Load model ───────────────────────────────────────────────────────
    model_path = MODELS_DIR / "bonetalk_random_forest.joblib"
    if not model_path.exists():
        log.error("Model not found at %s — run train.py first.", model_path)
        sys.exit(1)

    clf = joblib.load(model_path)
    log.info("Model loaded from %s", model_path)

    # ── Load label mapping ───────────────────────────────────────────────
    mapping_path = MODELS_DIR / "label_mapping.json"
    label_map: dict = {}
    if mapping_path.exists():
        with open(mapping_path) as f:
            label_map = json.load(f).get("id_to_label", {})

    # ── Load test split ──────────────────────────────────────────────────
    X_test_path = SPLITS_DIR / "X_test.npy"
    y_test_path = SPLITS_DIR / "y_test.npy"

    if not X_test_path.exists() or not y_test_path.exists():
        log.error("Test splits not found in %s — run train.py first.", SPLITS_DIR)
        sys.exit(1)

    X_test = np.load(X_test_path, allow_pickle=True)
    y_test = np.load(y_test_path, allow_pickle=True)
    log.info("Test set loaded: %d samples.", len(y_test))

    # ── Predict ──────────────────────────────────────────────────────────
    y_pred = clf.predict(X_test)

    # ── Metrics ──────────────────────────────────────────────────────────
    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="macro", zero_division=0)
    rec  = recall_score(y_test, y_pred, average="macro", zero_division=0)
    f1   = f1_score(y_test, y_pred, average="macro", zero_division=0)

    print("\n" + "=" * 60)
    print("  BoneTalk — Test-Set Evaluation Results")
    print("=" * 60)
    print(f"  Accuracy:          {acc:.4f}")
    print(f"  Precision (macro): {prec:.4f}")
    print(f"  Recall (macro):    {rec:.4f}")
    print(f"  F1 Score (macro):  {f1:.4f}")
    print("=" * 60 + "\n")

    report_text = classification_report(y_test, y_pred, zero_division=0)
    print("Classification Report:\n")
    print(report_text)

    # ── Confusion matrix ─────────────────────────────────────────────────
    unique_labels = sorted(set(y_test) | set(y_pred))
    cm = confusion_matrix(y_test, y_pred, labels=unique_labels)

    fig, ax = plt.subplots(figsize=(min(14, max(6, len(unique_labels))),
                                     min(12, max(5, len(unique_labels)))))
    sns.heatmap(cm, annot=len(unique_labels) <= 30, fmt="d", cmap="Blues", ax=ax)
    ax.set_ylabel("Actual")
    ax.set_xlabel("Predicted")
    ax.set_title("BoneTalk — Confusion Matrix (Test Set)")
    fig.tight_layout()

    cm_path = MODELS_DIR / "confusion_matrix_test.png"
    fig.savefig(cm_path, dpi=150)
    plt.close(fig)
    log.info("Confusion matrix plot → %s", cm_path)

    # ── Save structured report ───────────────────────────────────────────
    METADATA_DIR.mkdir(parents=True, exist_ok=True)
    report_dict = {
        "accuracy": float(acc),
        "precision_macro": float(prec),
        "recall_macro": float(rec),
        "f1_macro": float(f1),
        "num_test_samples": int(len(y_test)),
        "num_classes": int(len(unique_labels)),
        "confusion_matrix_path": str(cm_path),
    }
    report_path = METADATA_DIR / "evaluation_report.json"
    with open(report_path, "w") as f:
        json.dump(report_dict, f, indent=2)
    log.info("Evaluation report → %s", report_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BoneTalk — Evaluate trained model")
    parser.parse_args()  # no required args
    evaluate()
