"""
BoneTalk — Inference Module

Loads the trained Random Forest model and provides a predict() method
that applies the EXACT SAME preprocessing → windowing → feature-extraction
→ normalization pipeline that was used during training.

Imported by the FastAPI backend.
"""
import json
import logging
import sys
from pathlib import Path

import joblib
import numpy as np

# Add the ml/ directory so we can import preprocessing / features
_ML_DIR = Path(__file__).resolve().parent.parent / "ml"
if str(_ML_DIR) not in sys.path:
    sys.path.insert(0, str(_ML_DIR))

from preprocessing.filters import preprocess_emg
from preprocessing.windowing import create_windows
from preprocessing.normalizer import EMGNormalizer
from features.emg_features import extract_features

log = logging.getLogger("bonetalk.inference")


class BoneTalkInference:
    """Wraps model + pipeline for serving predictions."""

    def __init__(self, models_dir: str | Path):
        self.models_dir = Path(models_dir)
        self.model = None
        self.normalizer: EMGNormalizer | None = None
        self.id_to_label: dict = {}
        self.preproc_cfg: dict = {}
        self.feature_cfg: dict = {}
        self.classes: list = []
        self.feature_count: int = 0
        self.model_type: str = "RandomForest"
        self.is_pytorch: bool = False
        self.is_mvp: bool = False
        self._load()

    # ── loading ──────────────────────────────────────────────────────────
    def _load(self) -> None:
        # 1. Check for PyTorch 1D-CNN model from Google Colab
        pt_paths = [
            self.models_dir / "bonetalk_emg_model.pt",
            self.models_dir.parent / "colab" / "models" / "bonetalk_emg_model.pt",
        ]
        for pt_p in pt_paths:
            if pt_p.exists():
                try:
                    import torch
                    from colab.model_1dcnn import BoneTalk1DCNN
                    checkpoint = torch.load(pt_p, map_location="cpu", weights_only=False)
                    class_names = [str(c) for c in checkpoint.get("class_names", [])]
                    num_classes = checkpoint.get("num_classes", len(class_names))
                    self.model = BoneTalk1DCNN(in_channels=8, num_classes=num_classes)
                    self.model.load_state_dict(checkpoint["model_state_dict"])
                    self.model.eval()
                    self.classes = class_names
                    self.id_to_label = {str(i): c for i, c in enumerate(class_names)}
                    self.model_type = f"BoneTalk-1DCNN (PyTorch {num_classes} classes)"
                    self.is_pytorch = True
                    self.is_mvp = False
                    log.info("Loaded BoneTalk 1D-CNN PyTorch model from %s (classes: %s)", pt_p, self.classes)
                    return
                except Exception as e:
                    log.warning("Found %s but failed to load: %s", pt_p, e)

        # 2. Check for MVP experiment model
        mvp_dir = self.models_dir.parent / "experiments" / "bonetalk_mvp" / "models"
        if (mvp_dir / "mvp_model.joblib").exists():
            try:
                self.model = joblib.load(mvp_dir / "mvp_model.joblib")
                self.scaler = joblib.load(mvp_dir / "scaler.pkl")
                with open(mvp_dir / "mvp_label_mapping.json") as f:
                    data = json.load(f)
                self.classes = data.get("classes", [])
                self.id_to_label = data.get("id_to_label", {str(i): c for i, c in enumerate(self.classes)})
                with open(mvp_dir / "mvp_feature_config.json") as f:
                    self.feature_cfg = json.load(f)
                self.feature_count = self.feature_cfg.get("total_features", 128)
                self.model_type = f"BoneTalk-MVP ({type(self.model).__name__})"
                self.is_mvp = True
                log.info("Loaded BoneTalk MVP model from %s (classes: %s)", mvp_dir, self.classes)
                return
            except Exception as e:
                log.warning("Failed to load MVP model, falling back to baseline: %s", e)

        self.is_mvp = False
        model_path = self.models_dir / "bonetalk_random_forest.joblib"
        norm_path  = self.models_dir / "normalizer.pkl"
        map_path   = self.models_dir / "label_mapping.json"
        preproc_path = self.models_dir / "preprocessing_config.json"
        feat_path  = self.models_dir / "feature_config.json"

        if not model_path.exists():
            log.warning("Model not found at %s — predictions disabled.", model_path)
            return

        try:
            self.model = joblib.load(model_path)
            log.info("Model loaded from %s", model_path)
        except Exception as e:
            log.error("Failed to load model: %s", e)
            return

        # Normalizer
        if norm_path.exists():
            self.normalizer = EMGNormalizer()
            self.normalizer.load(norm_path)

        # Label mapping
        if map_path.exists():
            with open(map_path) as f:
                data = json.load(f)
            self.id_to_label = data.get("id_to_label", {})
            self.classes = list(self.id_to_label.values())

        # Preprocessing config
        if preproc_path.exists():
            with open(preproc_path) as f:
                self.preproc_cfg = json.load(f)

        # Feature config
        if feat_path.exists():
            with open(feat_path) as f:
                self.feature_cfg = json.load(f)
            self.feature_count = self.feature_cfg.get("total_features", 64)

    # ── public API ───────────────────────────────────────────────────────
    def is_loaded(self) -> bool:
        return self.model is not None

    def predict(self, emg_data: np.ndarray, sampling_rate: int = 1000) -> dict:
        """Run full inference pipeline on raw EMG data.

        Args:
            emg_data: Raw EMG array, shape (T, n_channels).
            sampling_rate: Sampling rate of the incoming data.

        Returns:
            Dict with 'prediction', 'confidence', 'all_predictions'.
        """
        if not self.is_loaded():
            return {"error": "Model not loaded. Run train.py first."}

        if emg_data is None or len(emg_data) < 50:
            return {"error": "EMG signal too short for analysis (minimum 50 samples required)."}

        try:
            if self.is_pytorch:
                import torch
                from experiments.bonetalk_mvp.preprocess import preprocess_emg_signal

                cleaned = preprocess_emg_signal(emg_data, fs=sampling_rate, target_fs=800.0, apply_gating=True)
                sig = cleaned.T  # (8, T)
                mean = np.mean(sig, axis=1, keepdims=True)
                std = np.std(sig, axis=1, keepdims=True) + 1e-6
                sig = (sig - mean) / std
                tensor_sig = torch.from_numpy(sig.astype(np.float32)).unsqueeze(0)  # (1, 8, T)
                with torch.no_grad():
                    logits = self.model(tensor_sig)
                    avg_probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

                best_idx = int(np.argmax(avg_probs))
                best_label = self.classes[best_idx]
                all_preds = []
                for i, cls in enumerate(self.classes):
                    all_preds.append({"label": cls, "confidence": round(float(avg_probs[i]), 4)})
                all_preds.sort(key=lambda x: x["confidence"], reverse=True)

                return {
                    "prediction": best_label,
                    "confidence": round(float(avg_probs[best_idx]), 4),
                    "all_predictions": all_preds[:10],
                }

            elif self.is_mvp:
                from experiments.bonetalk_mvp.preprocess import preprocess_emg_signal
                from experiments.bonetalk_mvp.features import extract_multichannel_features

                cleaned = preprocess_emg_signal(emg_data, fs=sampling_rate, target_fs=800.0, apply_gating=True)
                feats = extract_multichannel_features(cleaned, fs=800.0).reshape(1, -1)
                feats_scaled = self.scaler.transform(feats)

                if hasattr(self.model, "predict_proba"):
                    avg_probs = self.model.predict_proba(feats_scaled)[0]
                else:
                    decision = self.model.decision_function(feats_scaled)[0]
                    exp_d = np.exp(decision - np.max(decision))
                    avg_probs = exp_d / np.sum(exp_d)
            else:
                target_sr = self.preproc_cfg.get("target_sampling_rate", 800)
                win_ms = self.preproc_cfg.get("window_size_ms", 200)
                ovl_ms = self.preproc_cfg.get("window_overlap_ms", 100)

                # 1. Preprocess
                emg_clean = preprocess_emg(emg_data, fs=sampling_rate, target_fs=target_sr)

                # 2. Windowing
                windows = create_windows(emg_clean, fs=target_sr, window_ms=win_ms, overlap_ms=ovl_ms)
                if not windows:
                    return {"error": "EMG signal too short for a single window."}

                # 3. Feature extraction
                feat_list = [extract_features(w) for w in windows]
                X = np.vstack(feat_list)

                # 4. Normalize
                if self.normalizer is not None:
                    X = self.normalizer.transform(X)

                # 5. Predict — average window probabilities
                probs = self.model.predict_proba(X)
                avg_probs = np.mean(probs, axis=0)

            best_idx = int(np.argmax(avg_probs))
            best_class = self.model.classes_[best_idx]
            best_label = self.id_to_label.get(str(best_class), str(best_class))

            all_preds = []
            for i, cls in enumerate(self.model.classes_):
                label = self.id_to_label.get(str(cls), str(cls))
                all_preds.append({"label": label, "confidence": round(float(avg_probs[i]), 4)})
            all_preds.sort(key=lambda x: x["confidence"], reverse=True)

            return {
                "prediction": best_label,
                "confidence": round(float(avg_probs[best_idx]), 4),
                "all_predictions": all_preds[:10],   # top 10
            }

        except Exception as e:
            log.exception("Prediction error")
            return {"error": str(e)}
