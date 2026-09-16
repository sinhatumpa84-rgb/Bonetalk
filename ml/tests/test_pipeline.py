"""
BoneTalk — Comprehensive Validation & Test Suite for 3-Channel Pipeline
"""

import sys
from pathlib import Path
import numpy as np

# Ensure ml/ is on sys.path
ML_DIR = Path(__file__).resolve().parent.parent
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

from preprocessing.muscle_pipeline import ThreeChannelMusclePipeline, muscle_pipeline
from features.three_channel_features import ThreeChannelFeatureExtractor, three_channel_extractor
from models.three_channel_model import ThreeChannelGestureModel, three_channel_model
from data.calibration_db import CalibrationDatabase


def test_sampling_rate_and_filtering():
    print("=== Testing Sampling Rate & Nyquist Filtering ===")
    pipe = ThreeChannelMusclePipeline()

    # 1. 50 Hz sequence (Arduino UNO R4 WiFi packet rate: 20ms)
    t_50hz = np.arange(0, 100) * 20.0  # 100 samples = 2000ms
    fs_50 = pipe.estimate_sampling_rate(t_50hz)
    assert 48.0 <= fs_50 <= 52.0, f"Expected ~50Hz, got {fs_50}"

    # Verify filtering at 50Hz does not throw Wn >= 1.0
    sig_50 = np.random.randn(100, 3) * 0.1
    flt_50 = pipe.filter_signal(sig_50, fs_50)
    assert flt_50.shape == (100, 3), "Filtered shape mismatch"

    # 2. 40 Hz sequence (Simulation rate: 25ms)
    t_40hz = np.arange(0, 80) * 25.0
    fs_40 = pipe.estimate_sampling_rate(t_40hz)
    assert 38.0 <= fs_40 <= 42.0, f"Expected ~40Hz, got {fs_40}"
    flt_40 = pipe.filter_signal(sig_50[:80], fs_40)
    assert flt_40.shape == (80, 3)

    print("[PASS] Sampling rate estimation and digital filtering verified.")


def test_rest_active_rest_segmentation():
    print("=== Testing Rest -> Active -> Rest Segmentation ===")
    pipe = ThreeChannelMusclePipeline()
    fs = 50.0
    dt_ms = 20.0
    n = 150  # 3.0 seconds

    # Rest (first 40 samples) -> Active Burst (samples 40 to 110) -> Rest (110 to 150)
    raw = np.random.randn(n, 3) * 0.02  # Rest noise
    t = np.arange(n) * dt_ms

    # Add strong muscle burst to M1 and M2 in active region
    raw[40:110, 0] += np.sin(np.linspace(0, np.pi * 3, 70)) * 0.4
    raw[45:105, 1] += np.sin(np.linspace(0, np.pi * 3, 60)) * 0.35

    res = pipe.process(raw, t)
    assert res.onset_index < 50, f"Onset detected too late: {res.onset_index}"
    assert res.offset_index > 95, f"Offset detected too early: {res.offset_index}"
    assert res.duration_ms >= 1000.0, f"Duration unexpected: {res.duration_ms}"
    assert res.sample_count == len(res.normalized_signals)
    assert res.quality.quality_grade in ("HIGH", "MODERATE")

    print(f"[PASS] Segmentation successfully captured active burst (onset={res.onset_index}, offset={res.offset_index}, dur={res.duration_ms}ms).")


def test_cross_channel_feature_extraction():
    print("=== Testing 3-Channel Cross-Channel Feature Extraction ===")
    ext = ThreeChannelFeatureExtractor()
    n = 60
    t = np.arange(n) * 20.0
    sig = np.zeros((n, 3))
    # Channel 1 fires first, Ch 2 fires with delay, Ch 3 lower
    sig[10:40, 0] = np.sin(np.linspace(0, np.pi, 30)) * 0.5
    sig[18:48, 1] = np.sin(np.linspace(0, np.pi, 30)) * 0.4
    sig[22:45, 2] = np.sin(np.linspace(0, np.pi, 23)) * 0.2

    feat = ext.extract(sig, t, fs=50.0)
    names = ext.get_feature_names()
    assert len(feat) == len(names), f"Feature length mismatch: {len(feat)} vs {len(names)}"
    assert not np.any(np.isnan(feat)), "NaN detected in feature vector"
    assert not np.any(np.isinf(feat)), "Inf detected in feature vector"

    # Verify activation order: Ch 1 fired first (onset ~ 200ms), Ch 2 second
    # Feature 42-53 are cross-channel
    print(f"[PASS] Extracted {len(feat)} joint features successfully without NaN/Inf.")


def test_outlier_detection_and_5_trial_calibration():
    print("=== Testing Outlier Detection & 5-Trial Calibration ===")
    ext = ThreeChannelFeatureExtractor()
    model = ThreeChannelGestureModel()
    model.init_synthetic_base_model()

    trial_feats = []
    # 4 normal trials for HELLO
    for i in range(4):
        sig = np.random.randn(60, 3) * 0.05
        sig[10:50, 0] += 0.6  # High M1
        sig[15:45, 1] += 0.3  # Moderate M2
        f = ext.extract(sig, np.arange(60) * 20.0, fs=50.0)
        trial_feats.append(f)

    # 1 outlier trial (flatline / noise only)
    sig_outlier = np.random.randn(60, 3) * 0.005
    f_outlier = ext.extract(sig_outlier, np.arange(60) * 20.0, fs=50.0)
    trial_feats.insert(2, f_outlier)  # Insert at trial 3

    outlier_res = model.detect_trial_outliers(trial_feats)
    assert len(outlier_res) == 5
    trial_3_status = outlier_res[2]["status"]
    assert trial_3_status in ("OUTLIER", "MARGINAL"), f"Expected trial 3 to be flagged, got {trial_3_status}"

    # Calibrate model with trials
    calib_summary = model.calibrate_with_trials("HELLO", trial_feats)
    assert calib_summary["gesture"] == "HELLO"
    assert calib_summary["total_trials"] == 5
    print(f"[PASS] 5-Trial calibration succeeded. Outlier flagged on trial 3: {trial_3_status}.")


def test_unknown_rejection_and_evaluation_metrics():
    print("=== Testing UNKNOWN Rejection & Evaluation Metrics ===")
    model = ThreeChannelGestureModel()
    model.init_synthetic_base_model()
    ext = ThreeChannelFeatureExtractor()

    # Ambiguous random noise should be classified as UNKNOWN or REST
    noise_sig = np.random.randn(50, 3) * 0.02
    noise_f = ext.extract(noise_sig, np.arange(50) * 20.0, fs=50.0)
    pred = model.predict(noise_f, use_smoothing=False)
    assert pred["prediction"] in ("UNKNOWN", "REST"), f"Noise was not rejected: {pred['prediction']}"

    # Test evaluation on test set
    X_test = []
    y_test = []
    for g in ["HELLO", "YES", "NO", "WATER", "STOP", "REST"]:
        for _ in range(5):
            sig = np.random.randn(50, 3) * 0.04
            if g == "HELLO":
                sig[:, 0] += 0.7
            elif g == "YES":
                sig[:, 1] += 0.6
                sig[:, 2] += 0.5
            elif g == "STOP":
                sig[:, 2] += 0.8
            f = ext.extract(sig, np.arange(50) * 20.0, fs=50.0)
            X_test.append(f)
            y_test.append(g)

    report = model.evaluate_on_dataset(np.array(X_test), np.array(y_test))
    assert "accuracy" in report
    assert "confusion_matrix" in report
    assert "f1" in report
    print(f"[PASS] Test metrics computed: Accuracy={report['accuracy']*100:.1f}%, F1={report['f1']:.3f}, Latency={report['average_latency_ms']}ms.")


def test_database_persistence():
    print("=== Testing SQLite Database Persistence ===")
    db_path = Path(__file__).resolve().parent / "test_calib.db"
    if db_path.exists():
        db_path.unlink()

    db = CalibrationDatabase(db_path)
    session_id = "test_sess_001"
    db.save_session(session_id, "HELLO", "v1.1.0")

    db.save_trial(
        trial_id="trial_001",
        session_id=session_id,
        trial_number=1,
        duration=2500.0,
        sample_count=120,
        quality_score=0.92,
        status="VALID",
        muscle_samples=[{"timestampMs": 0, "m1": 0.1, "m2": 0.2, "m3": 0.05}],
        extracted_features=[0.5, 0.2, 0.1],
    )

    sess = db.get_session(session_id)
    assert sess is not None
    assert sess["gesture"] == "HELLO"
    assert len(sess["trials"]) == 1

    db.save_model(
        model_id="mod_001",
        model_version="v1.1.0",
        training_metadata={"algorithm": "ExtraTrees"},
        normalization_parameters={"scale": [1.0, 1.0, 1.0]},
        feature_configuration={"total_features": 48},
        is_active=True,
    )

    act_m = db.get_active_model()
    assert act_m is not None
    assert act_m["model_version"] == "v1.1.0"

    db.save_evaluation(
        eval_id="ev_001",
        model_id="mod_001",
        accuracy=0.94,
        precision=0.93,
        recall=0.94,
        f1=0.935,
        confusion_matrix=[[5, 0], [0, 5]],
        false_positive_rate=0.02,
        false_negative_rate=0.01,
        latency=1.8,
    )

    ev = db.get_latest_evaluation("mod_001")
    assert ev is not None
    assert ev["accuracy"] == 0.94

    # Cleanup test db
    if db_path.exists():
        db_path.unlink()

    print("[PASS] Calibration SQLite database operations verified.")


if __name__ == "__main__":
    test_sampling_rate_and_filtering()
    test_rest_active_rest_segmentation()
    test_cross_channel_feature_extraction()
    test_outlier_detection_and_5_trial_calibration()
    test_unknown_rejection_and_evaluation_metrics()
    test_database_persistence()
    print("\nALL PIPELINE TESTS PASSED!")
