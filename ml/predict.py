"""
BoneTalk — Prediction Script

Loads the trained model and runs inference on a single EMG recording.
Applies the EXACT SAME preprocessing → windowing → feature-extraction
pipeline used during training.

Usage:
    python predict.py --input path/to/emg_sample.npy
    python predict.py --random-test
"""
import argparse
import json
import logging
import sys
from pathlib import Path

import joblib
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))

from config import MODELS_DIR, RAW_DIR, DATA_SUBDIRS, TARGET_SAMPLING_RATE
from preprocessing.filters import preprocess_emg
from preprocessing.windowing import create_windows
from preprocessing.normalizer import EMGNormalizer
from features.emg_features import extract_features

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("bonetalk.predict")


def load_pipeline() -> tuple:
    """Load model, normalizer, label mapping, and preprocessing config."""
    model_path = MODELS_DIR / "bonetalk_random_forest.joblib"
    norm_path  = MODELS_DIR / "normalizer.pkl"
    map_path   = MODELS_DIR / "label_mapping.json"
    cfg_path   = MODELS_DIR / "preprocessing_config.json"

    missing = [p for p in (model_path, norm_path, map_path, cfg_path) if not p.exists()]
    if missing:
        log.error("Missing model files: %s\nRun train.py first.", missing)
        sys.exit(1)

    clf = joblib.load(model_path)

    normalizer = EMGNormalizer()
    normalizer.load(norm_path)

    with open(map_path) as f:
        label_data = json.load(f)
    id_to_label = label_data.get("id_to_label", {})

    with open(cfg_path) as f:
        preproc_cfg = json.load(f)

    return clf, normalizer, id_to_label, preproc_cfg


def predict_emg(emg_raw: np.ndarray, clf, normalizer, preproc_cfg) -> tuple[np.ndarray, np.ndarray]:
    """Run the full inference pipeline on raw EMG data.

    Returns (avg_probabilities, classes).
    """
    orig_sr = preproc_cfg.get("original_sampling_rate", 1000)
    target_sr = preproc_cfg.get("target_sampling_rate", TARGET_SAMPLING_RATE)
    win_ms = preproc_cfg.get("window_size_ms", 200)
    ovl_ms = preproc_cfg.get("window_overlap_ms", 100)

    # 1. Preprocess
    emg_clean = preprocess_emg(emg_raw, fs=orig_sr, target_fs=target_sr)

    # 2. Window
    windows = create_windows(emg_clean, fs=target_sr, window_ms=win_ms, overlap_ms=ovl_ms)
    if not windows:
        raise ValueError("EMG signal too short to create even one window.")

    # 3. Features
    feat_list = [extract_features(w) for w in windows]
    X = np.vstack(feat_list)

    # 4. Normalize
    X_norm = normalizer.transform(X)

    # 5. Predict — average window probabilities
    probs = clf.predict_proba(X_norm)
    avg_probs = np.mean(probs, axis=0)

    return avg_probs, clf.classes_


def main(args: argparse.Namespace) -> None:
    clf, normalizer, id_to_label, preproc_cfg = load_pipeline()

    emg_data: np.ndarray | None = None
    actual_label: str | None = None

    if args.input:
        p = Path(args.input)
        if not p.exists():
            log.error("File not found: %s", p)
            sys.exit(1)
        emg_data = np.load(p)
        log.info("Loaded %s  shape=%s", p.name, emg_data.shape)

    elif args.random_test:
        import random
        from preprocessing.loader import load_dataset

        data_dir = RAW_DIR / "emg_data" if (RAW_DIR / "emg_data").exists() else RAW_DIR
        task = preproc_cfg.get("task", "closed_vocab")
        search_dir = data_dir / "closed_vocab" if (data_dir / "closed_vocab").exists() else data_dir
        emg_files = list(search_dir.rglob("*_emg.npy"))
        if not emg_files:
            log.error("No EMG samples found for random test.")
            sys.exit(1)

        chosen_file = random.choice(emg_files)
        from preprocessing.loader import load_emg_sample
        emg_data, info = load_emg_sample(chosen_file)
        actual_label = info.get("text", f"sentence_{info.get('sentence_index', '?')}")
        log.info("Picked random sample: %s (actual text: %s)", chosen_file.name, actual_label)

    else:
        log.error("Provide --input <file.npy> or --random-test.")
        sys.exit(1)

    if emg_data is None or emg_data.size == 0:
        log.error("Empty EMG data.")
        sys.exit(1)

    try:
        avg_probs, classes = predict_emg(emg_data, clf, normalizer, preproc_cfg)
    except ValueError as e:
        log.error("Prediction failed: %s", e)
        sys.exit(1)

    # Display results
    top_k = min(3, len(classes))
    top_idx = np.argsort(avg_probs)[-top_k:][::-1]

    print("\n+======================================+")
    print("|   BoneTalk - Prediction Results      |")
    print("+======================================+")
    best = classes[top_idx[0]]
    best_name = id_to_label.get(str(best), str(best))
    print(f"|  Predicted:  {best_name:<22s} |")
    print(f"|  Confidence: {avg_probs[top_idx[0]]:.4f}                    |")
    if actual_label:
        print(f"|  Actual:     {actual_label[:22]:<22s} |")
    print("+======================================+")
    print("|  Top-3 Predictions:                  |")
    for rank, idx in enumerate(top_idx, 1):
        name = id_to_label.get(str(classes[idx]), str(classes[idx]))
        prob = avg_probs[idx]
        print(f"|   {rank}. {name[:26]:<26s} {prob:.4f}  |")
    print("+======================================+\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BoneTalk — Run EMG prediction")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--input", type=str, help="Path to a .npy EMG file")
    group.add_argument("--random-test", action="store_true",
                       help="Pick a random sample from the raw dataset")
    args = parser.parse_args()
    main(args)
