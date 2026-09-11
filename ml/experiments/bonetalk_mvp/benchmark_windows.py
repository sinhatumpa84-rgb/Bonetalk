"""
BoneTalk MVP — Window Size & Aggregation Comparison (Step 8)

Compares:
- 250 ms (125 ms stride)
- 500 ms (250 ms stride)
- 750 ms (375 ms stride)
- 1000 ms (500 ms stride)
- Utterance-level pooling (active contraction)
"""
import sys
import time
from pathlib import Path
import numpy as np
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, f1_score

EXPERIMENT_DIR = Path(__file__).resolve().parent
ML_DIR = EXPERIMENT_DIR.parent.parent
sys.path.insert(0, str(ML_DIR))
sys.path.insert(0, str(EXPERIMENT_DIR))

from dataset import load_isolated_commands_dataset
from train_mvp import extract_dataset_features

data_dir = ML_DIR / "data" / "raw" / "emg_data"
raw_samples = load_isolated_commands_dataset(data_dir, include_rest=True, max_rest_samples=20)

configs = [
    {"name": "250 ms (50% overlap)", "mode": "window", "win": 250.0, "ov": 125.0},
    {"name": "500 ms (50% overlap)", "mode": "window", "win": 500.0, "ov": 250.0},
    {"name": "750 ms (50% overlap)", "mode": "window", "win": 750.0, "ov": 375.0},
    {"name": "1000 ms (50% overlap)", "mode": "window", "win": 1000.0, "ov": 500.0},
    {"name": "Utterance-Level Pooling", "mode": "utterance", "win": 500.0, "ov": 250.0},
]

print("=" * 75)
print("  WINDOW DURATION BENCHMARK (BoneTalk Isolated MVP)")
print("=" * 75)
print(f"{'CONFIGURATION':<26} | {'TOTAL WINS':<10} | {'VAL ACC':<10} | {'VAL F1':<10} | NOTES")
print("-" * 75)

for cfg in configs:
    X, y, groups = extract_dataset_features(
        raw_samples, mode=cfg["mode"], window_ms=cfg["win"], overlap_ms=cfg["ov"]
    )
    sgkf = StratifiedGroupKFold(n_splits=4, shuffle=True, random_state=42)
    accs, f1s = [], []
    for tr_idx, val_idx in sgkf.split(X, y, groups):
        X_tr, y_tr = X[tr_idx], y[tr_idx]
        X_v, y_v = X[val_idx], y[val_idx]
        scaler = StandardScaler()
        X_tr_s = scaler.fit_transform(X_tr)
        X_v_s = scaler.transform(X_v)
        clf = SVC(kernel="rbf", C=10.0, random_state=42)
        clf.fit(X_tr_s, y_tr)
        preds = clf.predict(X_v_s)
        accs.append(accuracy_score(y_v, preds))
        f1s.append(f1_score(y_v, preds, average="macro", zero_division=0))

    mean_acc = np.mean(accs) * 100
    mean_f1 = np.mean(f1s)
    notes = "Optimal SNR" if cfg["mode"] == "utterance" else ""
    print(f"{cfg['name']:<26} | {len(X):<10} | {mean_acc:.2f}%{'':<4} | {mean_f1:.4f}{'':<4} | {notes}")

print("=" * 75)
