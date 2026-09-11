"""
BoneTalk MVP — Evaluation Script

Loads the trained MVP model, scaler, and held-out test split,
computes full classification metrics and updates the report.
"""
import json
import logging
from pathlib import Path
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s  %(message)s")
log = logging.getLogger("bonetalk.mvp.evaluate")

EXPERIMENT_DIR = Path(__file__).resolve().parent
MODELS_DIR = EXPERIMENT_DIR / "models"
REPORTS_DIR = EXPERIMENT_DIR / "reports"


def main():
    model_p = MODELS_DIR / "mvp_model.joblib"
    x_test_p = MODELS_DIR / "X_test_mvp.npy"
    y_test_p = MODELS_DIR / "y_test_mvp.npy"
    label_p = MODELS_DIR / "mvp_label_mapping.json"

    if not model_p.exists() or not x_test_p.exists():
        log.error("Model or test split not found in %s. Run train_mvp.py first.", MODELS_DIR)
        return

    clf = joblib.load(model_p)
    X_test = np.load(x_test_p)
    y_test = np.load(y_test_p)
    with open(label_p, "r") as f:
        classes_list = json.load(f)["classes"]

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average="macro", zero_division=0)

    print("\n" + "=" * 60)
    print("  BoneTalk MVP — Held-out Evaluation Results")
    print("=" * 60)
    print(f"  Test Accuracy:     {acc * 100:.2f}%")
    print(f"  Macro F1 Score:    {macro_f1:.4f}")
    print(f"  Test Samples:      {len(X_test)}")
    print(f"  Classes ({len(classes_list)}): {classes_list}")
    print("=" * 60)
    print("\nDetailed Classification Report:\n")
    print(classification_report(y_test, y_pred, labels=classes_list, zero_division=0))

    # Save confusion matrix plot
    cm = confusion_matrix(y_test, y_pred, labels=classes_list)
    fig, ax = plt.subplots(figsize=(max(6, len(classes_list) * 1.5), max(5, len(classes_list) * 1.2)))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=classes_list, yticklabels=classes_list, ax=ax)
    ax.set_ylabel("Actual")
    ax.set_xlabel("Predicted")
    ax.set_title("BoneTalk MVP — Test Confusion Matrix")
    fig.tight_layout()
    cm_path = REPORTS_DIR / "confusion_matrix_mvp.png"
    fig.savefig(cm_path, dpi=150)
    plt.close(fig)
    log.info("Saved confusion matrix → %s", cm_path)


if __name__ == "__main__":
    main()
