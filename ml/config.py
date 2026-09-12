"""
BoneTalk ML Pipeline — Global Configuration

All paths, dataset parameters, model hyperparameters, and vocabulary
settings are centralized here for consistency across training and inference.
"""
from pathlib import Path

# ── Base Directories ─────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent          # ml/
PROJECT_DIR = BASE_DIR.parent                        # Bonetalk/
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
METADATA_DIR = DATA_DIR / "metadata"
SPLITS_DIR = DATA_DIR / "splits"
MODELS_DIR = BASE_DIR / "models"
USER_RECORDINGS_DIR = DATA_DIR / "user_recordings"

# ── Zenodo Dataset ───────────────────────────────────────────────────────
ZENODO_URL = "https://zenodo.org/records/4064409/files/emg_data.tar.gz?download=1"
ZENODO_MD5 = "7f97d2182b896652999b1b2d0c69fd7b"
ZENODO_FILENAME = "emg_data.tar.gz"

# Hardware / Recording Configuration
EMG_CHANNELS = 8
SAMPLING_RATE = 1000
TARGET_SAMPLING_RATE = 800

# Windowing Configuration
WINDOW_SIZE_MS = 200
WINDOW_OVERLAP_MS = 100

# Feature Configuration
FEATURE_NAMES = [
    "rms", "mav", "mean", "std", "var", "wl", "zc", "energy"
]

# Vocabulary Configuration
TARGET_WORDS = ['REST', 'YES', 'NO', 'HELP', 'WATER', 'STOP', 'PAIN', 'PLEASE', 'THANK YOU', 'COME', 'GO']
MVP_WORDS = ['REST', 'YES', 'NO', 'HELP', 'WATER']

# ML Model Parameters
RANDOM_FOREST_PARAMS = {
    'n_estimators': 100,
    'max_depth': None,
    'random_state': 42
}

# Dataset subdirectories to process
DATA_SUBDIRS = ['nonparallel_data', 'silent_parallel_data', 'voiced_parallel_data', 'closed_vocab']
