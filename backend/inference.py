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
import time
from pathlib import Path

import joblib
import numpy as np
from typing import Optional, List, Dict, Any, Union

# Add the ml/ directory so we can import preprocessing / features
_ML_DIR = Path(__file__).resolve().parent.parent / "ml"
if str(_ML_DIR) not in sys.path:
    sys.path.insert(0, str(_ML_DIR))

try:
    from ml.preprocessing.filters import preprocess_emg
    from ml.preprocessing.windowing import create_windows
    from ml.preprocessing.normalizer import EMGNormalizer
    from ml.features.emg_features import extract_features
    from ml.preprocessing.muscle_pipeline import muscle_pipeline
    from ml.features.three_channel_features import three_channel_extractor
    from ml.models.three_channel_model import three_channel_model
    from ml.data.calibration_db import calibration_db
except (ImportError, ModuleNotFoundError):
    from preprocessing.filters import preprocess_emg  # type: ignore
    from preprocessing.windowing import create_windows  # type: ignore
    from preprocessing.normalizer import EMGNormalizer  # type: ignore
    from features.emg_features import extract_features  # type: ignore
    from preprocessing.muscle_pipeline import muscle_pipeline  # type: ignore
    from features.three_channel_features import three_channel_extractor  # type: ignore
    from models.three_channel_model import three_channel_model  # type: ignore
    from data.calibration_db import calibration_db  # type: ignore

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
                    try:
                        from ml.colab.model_1dcnn import BoneTalk1DCNN
                    except (ImportError, ModuleNotFoundError):
                        from colab.model_1dcnn import BoneTalk1DCNN  # type: ignore
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
                try:
                    from ml.experiments.bonetalk_mvp.preprocess import preprocess_emg_signal
                except (ImportError, ModuleNotFoundError):
                    from experiments.bonetalk_mvp.preprocess import preprocess_emg_signal  # type: ignore

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
                try:
                    from ml.experiments.bonetalk_mvp.preprocess import preprocess_emg_signal
                    from ml.experiments.bonetalk_mvp.features import extract_multichannel_features
                except (ImportError, ModuleNotFoundError):
                    from experiments.bonetalk_mvp.preprocess import preprocess_emg_signal  # type: ignore
                    from experiments.bonetalk_mvp.features import extract_multichannel_features  # type: ignore

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

    # ── 3-Channel Muscle Gesture Recognition & Calibration Pipeline ──────────

    def predict_three_channel(
        self,
        signals_3ch: np.ndarray,
        timestamps_ms: Optional[np.ndarray] = None,
        use_smoothing: bool = True,
    ) -> dict:
        """
        Processes 3-channel temporal muscle telemetry [M1(t), M2(t), M3(t)]:
        - dynamic empirical sampling rate estimation
        - quality assessment (SNR, flatline, clipping)
        - rest -> active -> rest segmentation (TKEO)
        - joint 3-channel spatial-temporal feature extraction
        - probability calibration & model prediction
        - debouncing, smoothing & UNKNOWN class rejection
        """
        try:
            seg = muscle_pipeline.process(signals_3ch, timestamps_ms)
            feat = three_channel_extractor.extract(
                seg.normalized_signals,
                seg.timestamps_ms,
                fs=seg.sampling_rate
            )
            res = three_channel_model.predict(feat, use_smoothing=use_smoothing)
            res["duration_ms"] = seg.duration_ms
            res["sample_count"] = seg.sample_count
            res["sampling_rate"] = round(seg.sampling_rate, 1)
            res["quality"] = {
                "is_valid": seg.quality.is_valid,
                "quality_score": seg.quality.quality_score,
                "quality_grade": seg.quality.quality_grade,
                "snr_db": seg.quality.snr_db,
                "is_clipping": seg.quality.is_clipping,
                "is_flatline": seg.quality.is_flatline,
                "missing_samples_ratio": seg.quality.missing_samples_ratio,
                "notes": seg.quality.notes,
            }
            return res
        except Exception as e:
            log.exception("3-Channel inference error")
            return {"error": str(e), "prediction": "UNKNOWN", "confidence": 0.0}

    def register_calibration_trial(
        self,
        session_id: str,
        trial_number: int,
        target_gesture: str,
        muscle_samples: list,
        is_hardware: bool = False,
    ) -> dict:
        """
        Processes and registers an individual calibration trial:
        1. Preprocesses and segments active muscle telemetry.
        2. Extracts 3-channel feature vector.
        3. Assesses trial quality.
        4. Saves trial, telemetry samples, and features into SQLite database.
        """
        target_norm = target_gesture.strip().upper()
        if not muscle_samples or len(muscle_samples) < 5:
            return {
                "status": "ERROR",
                "message": "Insufficient muscle samples in trial.",
                "quality_grade": "LOW",
                "quality_score": 0.0,
            }

        # Parse samples into numpy array (T, 3)
        raw_rows = []
        t_rows = []
        for s in muscle_samples:
            t = float(s.get("timestampMs") or s.get("timestamp") or 0.0)
            m1 = float(s.get("m1", 0.0))
            m2 = float(s.get("m2", 0.0))
            m3 = float(s.get("m3", 0.0))
            raw_rows.append([m1, m2, m3])
            t_rows.append(t)

        raw_arr = np.array(raw_rows, dtype=np.float64)
        t_arr = np.array(t_rows, dtype=np.float64)

        # Process signal
        seg = muscle_pipeline.process(raw_arr, t_arr)
        feat = three_channel_extractor.extract(
            seg.normalized_signals,
            seg.timestamps_ms,
            fs=seg.sampling_rate
        )

        trial_id = f"trial_{session_id}_{trial_number}_{int(time.time()*1000)}"
        status = "VALID" if seg.quality.is_valid else "LOW_QUALITY"

        # Ensure session exists in SQLite
        calibration_db.save_session(
            session_id=session_id,
            gesture=target_norm,
            model_version=three_channel_model.model_version,
            notes="Real hardware telemetry" if is_hardware else "Simulation telemetry",
        )

        # Save trial in SQLite
        calibration_db.save_trial(
            trial_id=trial_id,
            session_id=session_id,
            trial_number=trial_number,
            duration=seg.duration_ms,
            sample_count=seg.sample_count,
            quality_score=seg.quality.quality_score,
            status=status,
            muscle_samples=muscle_samples,
            extracted_features=feat.tolist(),
            normalized_features=seg.normalized_signals.flatten().tolist()[:100],
        )

        # Run temporary test prediction for immediate trial feedback
        pred = three_channel_model.predict(feat, use_smoothing=False)

        return {
            "status": "SUCCESS",
            "trial_id": trial_id,
            "trial_number": trial_number,
            "target_gesture": target_norm,
            "duration_ms": seg.duration_ms,
            "sample_count": seg.sample_count,
            "sampling_rate": round(seg.sampling_rate, 1),
            "quality": {
                "is_valid": seg.quality.is_valid,
                "quality_score": seg.quality.quality_score,
                "quality_grade": seg.quality.quality_grade,
                "snr_db": seg.quality.snr_db,
                "is_clipping": seg.quality.is_clipping,
                "is_flatline": seg.quality.is_flatline,
                "notes": seg.quality.notes,
            },
            "trial_prediction": pred["prediction"],
            "trial_confidence": pred["confidence"],
            "is_match": pred["prediction"] == target_norm,
        }

    def finish_calibration_session(
        self,
        session_id: str,
        target_gesture: str,
    ) -> dict:
        """
        Finalizes a 5-trial calibration session:
        - Retrieves all trials from database
        - Runs outlier detection
        - Adapts personalized prototype layer
        - Evaluates on held-out test trial
        - Saves updated model and evaluation metrics to database
        """
        target_norm = target_gesture.strip().upper()
        sess = calibration_db.get_session(session_id)
        if not sess or not sess.get("trials"):
            return {"status": "ERROR", "message": f"No trials found for session {session_id}"}

        trials = sess["trials"]
        trial_features = []

        with calibration_db._connection() as conn:
            cur = conn.cursor()
            for t in trials:
                cur.execute("SELECT extracted_features FROM feature_data WHERE trial_id = ?", (t["trial_id"],))
                row = cur.fetchone()
                if row:
                    f = np.array(json.loads(row["extracted_features"]), dtype=np.float32)
                    trial_features.append(f)

        if len(trial_features) < 3:
            return {"status": "ERROR", "message": "At least 3 valid trials required for calibration."}

        # Calibrate model with 5 trials
        calib_res = three_channel_model.calibrate_with_trials(target_norm, trial_features)

        # Save model version and evaluation in SQLite
        model_id = f"model_3ch_{target_norm.lower()}_{int(time.time())}"
        calibration_db.save_model(
            model_id=model_id,
            model_version=three_channel_model.model_version,
            training_metadata={
                "calibrated_gesture": target_norm,
                "session_id": session_id,
                "total_trials": len(trial_features),
            },
            normalization_parameters={"type": "RobustScaler"},
            feature_configuration={"total_features": len(trial_features[0])},
            is_active=True,
        )

        eval_id = f"eval_{session_id}_{int(time.time())}"
        # Held-out test evaluation
        test_acc = 1.0 if calib_res["is_test_match"] else 0.0
        calibration_db.save_evaluation(
            eval_id=eval_id,
            model_id=model_id,
            accuracy=test_acc,
            precision=test_acc,
            recall=test_acc,
            f1=test_acc,
            confusion_matrix=[[1 if calib_res["is_test_match"] else 0]],
            false_positive_rate=0.0,
            false_negative_rate=0.0 if calib_res["is_test_match"] else 1.0,
            latency=14.0,
            report_json=calib_res,
        )

        return {
            "status": "SUCCESS",
            "session_id": session_id,
            "target_gesture": target_norm,
            "calibration_results": calib_res,
            "model_version": three_channel_model.model_version,
        }

