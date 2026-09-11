"""
BoneTalk — Dataset Packager for Google Colab

Packages the targeted BoneTalk EMG dataset into a single, highly-compressed
.npz file (< 45 MB) that can be uploaded to Google Colab or Google Drive in seconds.

Usage:
    # Package Core MVP (4 classes: REST, YES, NO, THANK YOU)
    python ml/colab/package_dataset.py --task mvp --output ml/colab/bonetalk_mvp_data.npz

    # Package Days benchmark (8 classes: Mon-Sun + REST)
    python ml/colab/package_dataset.py --task days --output ml/colab/bonetalk_days_data.npz

    # Package Combined dataset
    python ml/colab/package_dataset.py --task combined --output ml/colab/bonetalk_combined_data.npz
"""
import argparse
import json
import logging
import sys
from collections import Counter
from pathlib import Path

import numpy as np

# Ensure repository root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Bonetalk/
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))
if str(BASE_DIR / "ml") not in sys.path:
    sys.path.insert(0, str(BASE_DIR / "ml"))

from ml.config import RAW_DIR, SAMPLING_RATE, TARGET_SAMPLING_RATE
from ml.experiments.bonetalk_mvp.preprocess import preprocess_emg_signal

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s  %(message)s")
log = logging.getLogger("bonetalk.package")


def load_mvp_samples(raw_dir: Path, max_rest: int = 20) -> list[dict]:
    """Loads genuine isolated word recordings (YES, NO, THANK YOU) plus balanced REST baselines."""
    index_file = BASE_DIR / "ml" / "data" / "metadata" / "isolated_words_index.json"
    if not index_file.exists():
        log.error("Index file not found: %s", index_file)
        return []

    with open(index_file, "r") as f:
        records = json.load(f)

    samples = []
    for rec in records:
        emg_path = Path(rec["emg_path"])
        if not emg_path.exists():
            continue
        try:
            emg = np.load(emg_path)
            # Derive session group
            parts = emg_path.parts
            session_id = parts[-2] if len(parts) >= 2 else "sess_0"
            samples.append({
                "emg": emg,
                "label": rec["word"],
                "group": f"{session_id}_{emg_path.stem}",
                "session": session_id,
            })
        except Exception as e:
            log.warning("Could not load %s: %s", emg_path, e)

    # Add balanced REST reference recordings (sentence_index == -1)
    emg_dir = raw_dir / "emg_data" if (raw_dir / "emg_data").exists() else raw_dir
    closed_dir = emg_dir / "closed_vocab"
    rest_count = 0
    if closed_dir.exists():
        for info_p in sorted(closed_dir.rglob("*_info.json")):
            if rest_count >= max_rest:
                break
            try:
                with open(info_p, "r") as f:
                    info = json.load(f)
                if info.get("sentence_index") == -1:
                    emg_p = info_p.with_name(info_p.stem.replace("_info", "_emg.npy"))
                    if emg_p.exists():
                        emg = np.load(emg_p)
                        if emg.shape[0] >= 400:
                            samples.append({
                                "emg": emg[:min(1600, emg.shape[0])],
                                "label": "REST",
                                "group": f"rest_{emg_p.parent.name}_{emg_p.stem}",
                                "session": emg_p.parent.name,
                            })
                            rest_count += 1
            except Exception:
                pass

    return samples


def load_days_samples(raw_dir: Path) -> list[dict]:
    """Loads discrete day utterances (Monday-Sunday + Rest) from closed_vocab."""
    emg_dir = raw_dir / "emg_data" if (raw_dir / "emg_data").exists() else raw_dir
    closed_vocab_dir = emg_dir / "closed_vocab"
    if not closed_vocab_dir.exists():
        log.error("closed_vocab directory not found in %s", emg_dir)
        return []

    DAYS = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"}
    samples = []

    for emg_file in closed_vocab_dir.rglob("*_emg.npy"):
        info_file = emg_file.with_name(emg_file.name.replace("_emg.npy", "_info.json"))
        if not info_file.exists():
            continue

        try:
            with open(info_file, "r") as f:
                info = json.load(f)

            sent_idx = info.get("sentence_index", 0)
            text = info.get("text", "").strip()
            first_word = text.split()[0].upper() if text else ""

            if sent_idx == -1:
                label = "REST"
            elif first_word in DAYS:
                label = first_word
            else:
                continue

            emg = np.load(emg_file)
            session_id = emg_file.parent.name
            samples.append({
                "emg": emg,
                "label": label,
                "group": f"{session_id}_{emg_file.stem}",
                "session": session_id,
            })
        except Exception as e:
            log.debug("Error loading %s: %s", emg_file, e)

    return samples


def package_data(task: str, output_path: Path, raw_dir: Path) -> None:
    log.info("Collecting data for task '%s'...", task)

    raw_samples = []
    if task == "mvp":
        raw_samples = load_mvp_samples(raw_dir)
    elif task == "days":
        raw_samples = load_days_samples(raw_dir)
    elif task == "combined":
        mvp_samples = load_mvp_samples(raw_dir)
        days_samples = load_days_samples(raw_dir)
        raw_samples = mvp_samples + days_samples
    else:
        raise ValueError(f"Unknown task: {task}")

    if not raw_samples:
        log.error("No samples found to package!")
        sys.exit(1)

    log.info("Found %d raw recordings. Preprocessing with 20-380Hz Butterworth + 60Hz Notch + TKEO Gating...", len(raw_samples))

    processed_signals = []
    labels = []
    groups = []

    for item in raw_samples:
        emg = item["emg"]
        # Preprocess to target 800 Hz with biomedical bandpass and TKEO gating
        cleaned = preprocess_emg_signal(
            emg,
            fs=SAMPLING_RATE,
            target_fs=TARGET_SAMPLING_RATE,
            apply_gating=True,
        )
        if cleaned.shape[0] < 50:  # Skip degenerate snippets
            continue

        processed_signals.append(cleaned.astype(np.float32))
        labels.append(item["label"])
        groups.append(item["group"])

    counts = Counter(labels)
    log.info("Class distribution (%d classes):", len(counts))
    for cls, cnt in sorted(counts.items()):
        log.info("  %-12s : %4d recordings", cls, cnt)

    class_names = sorted(list(counts.keys()))
    label_to_id = {c: i for i, c in enumerate(class_names)}
    int_labels = np.array([label_to_id[l] for l in labels], dtype=np.int64)

    # Save as compressed .npz
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Pack into np.savez_compressed
    signals_arr = np.empty(len(processed_signals), dtype=object)
    for i, s in enumerate(processed_signals):
        signals_arr[i] = s

    metadata = {
        "task": task,
        "sampling_rate": TARGET_SAMPLING_RATE,
        "channels": 8,
        "num_samples": len(processed_signals),
        "class_names": class_names,
        "class_counts": dict(counts),
    }

    np.savez_compressed(
        output_path,
        signals=signals_arr,
        labels=int_labels,
        str_labels=np.array(labels),
        groups=np.array(groups),
        class_names=np.array(class_names),
        metadata=json.dumps(metadata),
    )

    file_size_mb = output_path.stat().st_size / (1024 * 1024)
    log.info("Successfully packaged dataset to %s (Size: %.2f MB)", output_path, file_size_mb)
    log.info("Ready for instant upload to Google Colab!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Package BoneTalk dataset for Google Colab")
    parser.add_argument("--task", choices=["mvp", "days", "combined"], default="mvp",
                        help="Task dataset to package (default: mvp)")
    parser.add_argument("--output", type=str, default="ml/colab/bonetalk_mvp_data.npz",
                        help="Output .npz file path")
    parser.add_argument("--data-dir", type=str, default=str(RAW_DIR),
                        help="Raw dataset directory")
    args = parser.parse_args()

    out_file = Path(args.output)
    if not out_file.is_absolute():
        out_file = BASE_DIR / out_file

    package_data(args.task, out_file, Path(args.data_dir))
