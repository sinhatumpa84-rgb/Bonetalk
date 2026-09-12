"""
BoneTalk MVP — Standalone High-Accuracy Inference Predictor

Runs the trained BoneTalk MVP pipeline (preprocessor, 128-dim features,
scaler, and RBF-SVM classifier) on any raw EMG recording file.
"""
import argparse
import json
import logging
import random
import sys
from pathlib import Path
import joblib
import numpy as np

EXPERIMENT_DIR = Path(__file__).resolve().parent
ML_DIR = EXPERIMENT_DIR.parent.parent
sys.path.insert(0, str(ML_DIR))
sys.path.insert(0, str(EXPERIMENT_DIR))

from preprocess import preprocess_emg_signal
from features import extract_multichannel_features

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("bonetalk.mvp.predict")

MODELS_DIR = EXPERIMENT_DIR / "models"


def predict_sample(emg_raw: np.ndarray, clf, scaler, feat_cfg: dict) -> tuple[np.ndarray, list]:
    """Run full MVP preprocessing, 128-dim feature extraction, scaling, and prediction."""
    cleaned = preprocess_emg_signal(emg_raw, fs=1000.0, target_fs=800.0, apply_gating=True)
    feats = extract_multichannel_features(cleaned, fs=800.0).reshape(1, -1)
    feats_scaled = scaler.transform(feats)

    if hasattr(clf, "predict_proba"):
        probs = clf.predict_proba(feats_scaled)[0]
    else:
        # Decision function for non-probabilistic models
        decision = clf.decision_function(feats_scaled)[0]
        exp_d = np.exp(decision - np.max(decision))
        probs = exp_d / np.sum(exp_d)

    return probs, list(clf.classes_)


def main():
    parser = argparse.ArgumentParser(description="BoneTalk MVP Inference")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--input", type=str, help="Path to a raw .npy EMG file")
    group.add_argument("--random-test", action="store_true", help="Pick a random sample from isolated commands")
    args = parser.parse_args()

    model_p = MODELS_DIR / "mvp_model.joblib"
    scaler_p = MODELS_DIR / "scaler.pkl"
    cfg_p = MODELS_DIR / "mvp_feature_config.json"

    if not model_p.exists() or not scaler_p.exists():
        log.error("Model artifacts not found in %s. Run train_mvp.py first.", MODELS_DIR)
        sys.exit(1)

    clf = joblib.load(model_p)
    scaler = joblib.load(scaler_p)
    with open(cfg_p, "r") as f:
        feat_cfg = json.load(f)

    actual_label = None
    if args.input:
        p = Path(args.input)
        if not p.exists():
            log.error("File not found: %s", p)
            sys.exit(1)
        emg_raw = np.load(p)
        log.info("Loaded file: %s (shape: %s)", p.name, emg_raw.shape)
    else:
        from dataset import load_isolated_commands_dataset
        samples = load_isolated_commands_dataset(ML_DIR / "data" / "raw" / "emg_data", include_rest=True)
        chosen = random.choice(samples)
        emg_raw = chosen["emg"]
        actual_label = chosen["label"]
        log.info("Selected random test sample: %s (Actual: %s)", chosen["recording_id"], actual_label)

    probs, classes = predict_sample(emg_raw, clf, scaler, feat_cfg)
    top_k = min(3, len(classes))
    top_idx = np.argsort(probs)[-top_k:][::-1]

    print("\n+======================================+")
    print("|   BoneTalk MVP - Prediction Results  |")
    print("+======================================+")
    best_cls = classes[top_idx[0]]
    print(f"|  Predicted:  {best_cls:<23s} |")
    print(f"|  Confidence: {probs[top_idx[0]]:.4f}                   |")
    if actual_label:
        print(f"|  Actual:     {actual_label:<23s} |")
    print("+======================================+")
    print("|  Top Predictions:                    |")
    for r, idx in enumerate(top_idx, 1):
        print(f"|   {r}. {classes[idx]:<20s} {probs[idx]:.4f}     |")
    print("+======================================+\n")


if __name__ == "__main__":
    main()
