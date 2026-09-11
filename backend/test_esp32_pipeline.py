"""
BoneTalk — End-to-End Pipeline & ESP32 Integration Verification Test

Tests:
1. Backend Status Endpoint (GET /api/status)
2. HTTP POST Prediction (POST /api/predict) with Real EMG Utterances (YES, NO, THANK YOU, REST)
3. HTTP POST Prediction with Simulated ESP32 1000-sample ADC Buffer
4. Real-time WebSocket Streaming (WS /ws/emg) with 500-sample Buffer
5. Edge Cases & Error Handling
"""
import json
import time
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import numpy as np
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_status_endpoint():
    print("\n[TEST 1] Testing /api/status endpoint...")
    res = client.get("/api/status")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    print("  Status Response:", data)
    assert data["model_loaded"] is True, "Model is not loaded!"
    assert len(data["classes"]) == 4, f"Expected 4 classes, got {len(data['classes'])}"
    print("  [OK] /api/status PASSED!")


def test_real_emg_samples():
    print("\n[TEST 2] Testing /api/predict with real dataset recordings...")
    index_file = ROOT_DIR / "ml" / "data" / "metadata" / "isolated_words_index.json"
    if not index_file.exists():
        print("  Index file not found, skipping real sample test.")
        return

    with open(index_file, "r") as f:
        records = json.load(f)

    # Test one sample of each available isolated word
    tested_words = set()
    for rec in records:
        word = rec["word"]
        if word in tested_words:
            continue

        emg_path = Path(rec["emg_path"])
        if not emg_path.exists():
            continue

        emg = np.load(emg_path)
        payload = {
            "sampling_rate": 1000,
            "emg_data": emg.tolist(),
        }

        t0 = time.time()
        res = client.post("/api/predict", json=payload)
        latency_ms = (time.time() - t0) * 1000

        assert res.status_code == 200, f"Error {res.status_code}: {res.text}"
        result = res.json()
        print(f"  Ground Truth: {word:<10} | Predicted: {result['prediction']:<10} | Confidence: {result['confidence']:.4f} | Latency: {latency_ms:.1f}ms")
        assert "prediction" in result
        assert "confidence" in result
        assert "all_predictions" in result
        tested_words.add(word)

    print("  [OK] Real EMG Samples Test PASSED!")


def test_esp32_simulated_buffer():
    print("\n[TEST 3] Testing /api/predict with simulated 1000-sample ESP32 buffer...")
    # Simulate 1 second of resting baseline EMG (8 channels, 1000 samples, low microvolt amplitude)
    np.random.seed(42)
    resting_buffer = (np.random.randn(1000, 8) * 0.05).tolist()

    payload = {
        "sampling_rate": 1000,
        "emg_data": resting_buffer,
    }

    t0 = time.time()
    res = client.post("/api/predict", json=payload)
    latency_ms = (time.time() - t0) * 1000

    assert res.status_code == 200
    result = res.json()
    print(f"  Simulated Rest -> Predicted: {result['prediction']} | Confidence: {result['confidence']:.4f} | Latency: {latency_ms:.1f}ms")
    print("  Top predictions:", result["all_predictions"][:3])
    assert result["prediction"] == "REST", f"Expected REST, got {result['prediction']}"
    print("  [OK] Simulated ESP32 Buffer Test PASSED!")


def test_websocket_streaming():
    print("\n[TEST 4] Testing /ws/emg real-time WebSocket streaming...")
    with client.websocket_connect("/ws/emg") as ws:
        # Stream 500 samples (1 time step per message, 8 channels)
        np.random.seed(123)
        samples = np.random.randn(500, 8) * 0.05

        print("  Streaming 500 samples into WebSocket...")
        for sample in samples:
            ws.send_text(json.dumps(sample.tolist()))

        # Receive the buffered prediction response
        response_text = ws.receive_text()
        result = json.loads(response_text)
        print("  WebSocket Prediction Received:", result)
        assert "prediction" in result
        assert "confidence" in result
        assert "timestamp" in result
        print("  [OK] WebSocket Streaming Test PASSED!")


def test_edge_cases():
    print("\n[TEST 5] Testing Edge Cases & Error Handling...")
    # Degenerate payload (too short)
    short_payload = {"sampling_rate": 1000, "emg_data": [[0.1] * 8]}
    res = client.post("/api/predict", json=short_payload)
    assert res.status_code == 200
    print("  Short signal response:", res.json())

    # Empty payload
    empty_payload = {"sampling_rate": 1000, "emg_data": []}
    res = client.post("/api/predict", json=empty_payload)
    assert res.status_code == 200
    print("  Empty signal response:", res.json())
    print("  [OK] Edge Cases Test PASSED!")


if __name__ == "__main__":
    print("=" * 65)
    print("  BoneTalk -- End-to-End Pipeline & ESP32 Integration Verification")
    print("=" * 65)
    test_status_endpoint()
    test_real_emg_samples()
    test_esp32_simulated_buffer()
    test_websocket_streaming()
    test_edge_cases()
    print("\n" + "=" * 65)
    print("  ALL 5 VERIFICATION TESTS PASSED SUCCESSFULLY! [OK]")
    print("=" * 65)
