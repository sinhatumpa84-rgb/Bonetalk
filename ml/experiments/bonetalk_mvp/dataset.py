"""
BoneTalk MVP — Dataset Loader & Curator

Extracts experimentally valid, genuine communication command recordings
from the Berkeley Silent Speech EMG dataset, preserving recording IDs,
session dates, and speech modalities (voiced vs silent).
"""
import json
import re
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import numpy as np


def clean_text_label(text: str) -> str:
    """Normalize text prompt to alphanumeric uppercase string."""
    text = re.sub(r"[^\w\s]", "", text)
    return text.upper().strip()


def load_emg_sample(npy_path: Path) -> Tuple[np.ndarray, dict]:
    """Load a single EMG array and its corresponding metadata JSON."""
    emg = np.load(npy_path)
    info_path = npy_path.with_name(npy_path.stem.replace("_emg", "_info.json"))
    info = {}
    if info_path.exists():
        with open(info_path, "r", encoding="utf-8") as f:
            try:
                info = json.load(f)
            except Exception:
                pass
    return emg, info


def load_isolated_commands_dataset(
    data_dir: Path,
    include_rest: bool = True,
    max_rest_samples: int = 20,
) -> List[Dict]:
    """
    Extracts genuine isolated communication recordings:
    - 'YES' (exact 'Yes.' isolated utterance, 20 recordings)
    - 'NO' (exact 'No.' isolated utterance, 11 recordings)
    - 'THANK YOU' (exact 'Thank you.' isolated phrase, 10 recordings)
    - 'REST' (silence baseline recordings where sentence_index == -1)
    """
    samples = []
    # Locate metadata dir (ml/data/metadata)
    metadata_dir = data_dir.parent / "metadata" if (data_dir.parent / "metadata").exists() else data_dir.parent.parent / "metadata"
    isolated_index_file = metadata_dir / "isolated_words_index.json"

    if isolated_index_file.exists():
        with open(isolated_index_file, "r", encoding="utf-8") as fp:
            entries = json.load(fp)
        for entry in entries:
            emg_p = Path(entry["emg_path"])
            if emg_p.exists():
                try:
                    emg = np.load(emg_p)
                    samples.append({
                        "emg": emg,
                        "label": entry["word"],
                        "raw_text": entry["word"],
                        "recording_id": f"{emg_p.parent.name}_{emg_p.stem}",
                        "session": emg_p.parent.name,
                        "file_path": str(emg_p),
                    })
                except Exception:
                    pass

    # Extract balanced REST samples from closed_vocab reference recordings
    if include_rest:
        closed_dir = data_dir / "closed_vocab" if (data_dir / "closed_vocab").exists() else data_dir
        rest_count = 0
        for info_p in sorted(closed_dir.rglob("*_info.json")):
            if rest_count >= max_rest_samples:
                break
            try:
                with open(info_p, "r", encoding="utf-8") as fp:
                    info = json.load(fp)
                if info.get("sentence_index") == -1:
                    emg_p = info_p.with_name(info_p.stem.replace("_info", "_emg.npy"))
                    if emg_p.exists():
                        emg = np.load(emg_p)
                        if emg.shape[0] >= 400:
                            samples.append({
                                "emg": emg[:min(2000, emg.shape[0])],
                                "label": "REST",
                                "raw_text": "(REST/BASELINE)",
                                "recording_id": f"rest_{emg_p.parent.name}_{emg_p.stem}",
                                "session": emg_p.parent.name,
                                "file_path": str(emg_p),
                            })
                            rest_count += 1
            except Exception:
                pass

    return samples


def load_discrete_vocabulary_dataset(
    data_dir: Path,
    classes: Optional[List[str]] = None,
    include_rest: bool = True,
    max_rest_samples: int = 35,
) -> List[Dict]:
    """
    Extracts high-support discrete articulatory commands from closed_vocab,
    such as the 7 Days of the Week ('MONDAY'..'SUNDAY') plus 'REST'.
    """
    if classes is None:
        classes = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

    class_set = set(c.upper() for c in classes)
    samples = []
    rest_count = 0

    closed_dir = data_dir / "closed_vocab" if (data_dir / "closed_vocab").exists() else data_dir

    for info_p in closed_dir.rglob("*_info.json"):
        try:
            with open(info_p, "r", encoding="utf-8") as fp:
                info = json.load(fp)
        except Exception:
            continue

        sentence_idx = info.get("sentence_index", 0)
        raw_text = info.get("text", "")
        words = raw_text.strip().split()
        first_word = clean_text_label(words[0]) if words else ""

        if sentence_idx == -1 and include_rest:
            if rest_count < max_rest_samples:
                emg_p = info_p.with_name(info_p.stem.replace("_info", "_emg.npy"))
                if emg_p.exists():
                    try:
                        emg = np.load(emg_p)
                        if emg.shape[0] >= 400:
                            samples.append({
                                "emg": emg[:min(2000, emg.shape[0])],
                                "label": "REST",
                                "raw_text": "(REST/BASELINE)",
                                "recording_id": f"rest_{emg_p.parent.name}_{emg_p.stem}",
                                "session": emg_p.parent.name,
                                "file_path": str(emg_p),
                            })
                            rest_count += 1
                    except Exception:
                        pass
            continue

        if first_word in class_set:
            emg_p = info_p.with_name(info_p.stem.replace("_info", "_emg.npy"))
            if emg_p.exists():
                try:
                    emg = np.load(emg_p)
                    samples.append({
                        "emg": emg,
                        "label": first_word,
                        "raw_text": raw_text,
                        "recording_id": f"{emg_p.parent.name}_{emg_p.stem}",
                        "session": emg_p.parent.name,
                        "file_path": str(emg_p),
                    })
                except Exception:
                    pass

    return samples
