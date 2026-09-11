"""
BoneTalk MVP — Advanced EMG Signal Preprocessing

Implements SENIAM-compliant biomedical surface EMG filtering:
1. 4th-order Butterworth bandpass filter (20 Hz - 380 Hz) to eliminate DC baseline
   wander and high-frequency instrumentation noise.
2. High-Q notch filtering at 60 Hz and harmonics (120 Hz, 180 Hz) for power-line rejection.
3. Per-recording / per-session mean centering and impedance normalization.
4. Active muscle contraction energy gating (Teager-Kaiser Energy Operator) to
   isolate intentional articulation bursts from dead silence.
"""
import numpy as np
from scipy import signal


def notch_filter(
    emg: np.ndarray,
    fs: float = 1000.0,
    freq: float = 60.0,
    harmonics: int = 3,
    Q: float = 35.0,
) -> np.ndarray:
    """Apply high-Q notch filters at power-line frequency and harmonics."""
    filtered = emg.copy()
    for i in range(1, harmonics + 1):
        f0 = freq * i
        if f0 >= (fs / 2.0):
            break
        b, a = signal.iirnotch(f0, Q, fs)
        filtered = signal.filtfilt(b, a, filtered, axis=0)
    return filtered


def bandpass_filter(
    emg: np.ndarray,
    fs: float = 1000.0,
    lowcut: float = 20.0,
    highcut: float = 380.0,
    order: int = 4,
) -> np.ndarray:
    """
    4th-order zero-phase Butterworth bandpass filter.
    Eliminates motion artifacts (< 20 Hz) and high-frequency noise (> 380 Hz).
    """
    nyq = 0.5 * fs
    low = max(0.001, lowcut / nyq)
    high = min(0.999, highcut / nyq)
    b, a = signal.butter(order, [low, high], btype="bandpass")
    return signal.filtfilt(b, a, emg, axis=0)


def teager_kaiser_energy(emg: np.ndarray) -> np.ndarray:
    """
    Compute Teager-Kaiser Energy Operator (TKEO):
    psi[x(n)] = x(n)^2 - x(n-1)*x(n+1)
    Significantly increases SNR for articulatory onset detection.
    """
    tkeo = np.zeros_like(emg)
    tkeo[1:-1, :] = emg[1:-1, :] ** 2 - emg[:-2, :] * emg[2:, :]
    tkeo[0, :] = tkeo[1, :]
    tkeo[-1, :] = tkeo[-2, :]
    return np.maximum(0, tkeo)


def isolate_active_contraction(
    emg: np.ndarray,
    fs: float,
    threshold_factor: float = 1.8,
    pad_ms: float = 100.0,
) -> np.ndarray:
    """
    Detects the active articulatory contraction burst using smoothed TKEO energy.
    Trims leading/trailing dead silence so that feature extraction focuses on the
    actual muscle action. If no burst is found (e.g. REST), returns the original signal.
    """
    if emg.shape[0] < int(0.2 * fs):
        return emg

    # Multi-channel mean energy
    energy = np.mean(teager_kaiser_energy(emg), axis=1)

    # Smooth energy with a 50ms moving average
    win_len = max(5, int(0.05 * fs))
    kernel = np.ones(win_len) / win_len
    smoothed = np.convolve(energy, kernel, mode="same")

    # Baseline threshold based on first 100ms or 15th percentile
    baseline = np.percentile(smoothed, 15)
    std_baseline = np.std(smoothed[:max(10, int(0.1 * fs))]) + 1e-6
    threshold = baseline + threshold_factor * std_baseline

    active_indices = np.where(smoothed > threshold)[0]
    if len(active_indices) < int(0.1 * fs):  # Less than 100ms of active burst
        return emg  # Return as-is (e.g. genuine REST class)

    pad_samples = int((pad_ms / 1000.0) * fs)
    start_idx = max(0, active_indices[0] - pad_samples)
    end_idx = min(emg.shape[0], active_indices[-1] + pad_samples)

    if (end_idx - start_idx) < int(0.15 * fs):
        return emg

    return emg[start_idx:end_idx, :]


def preprocess_emg_signal(
    raw_emg: np.ndarray,
    fs: float = 1000.0,
    target_fs: float = 800.0,
    apply_gating: bool = True,
) -> np.ndarray:
    """
    Complete end-to-end preprocessing pipeline:
    1. Baseline centering (subtract channel mean)
    2. Power-line notch filtering (60, 120, 180 Hz)
    3. Physiological bandpass filtering (20 - 380 Hz)
    4. Anti-aliased resampling to target_fs
    5. Optional active burst isolation
    """
    # 1. Zero-mean centering
    centered = raw_emg - np.mean(raw_emg, axis=0, keepdims=True)

    # 2. Notch filter
    notched = notch_filter(centered, fs=fs, freq=60.0, harmonics=3, Q=35.0)

    # 3. Bandpass filter (20 - 380 Hz)
    bandpassed = bandpass_filter(notched, fs=fs, lowcut=20.0, highcut=380.0, order=4)

    # 4. Resample if needed
    if fs != target_fs:
        num_target_samples = int(len(bandpassed) * float(target_fs) / fs)
        resampled = signal.resample(bandpassed, num_target_samples, axis=0)
    else:
        resampled = bandpassed

    # 5. Energy gating
    if apply_gating:
        cleaned = isolate_active_contraction(resampled, fs=target_fs)
    else:
        cleaned = resampled

    return cleaned


def create_windows(
    emg: np.ndarray,
    fs: float,
    window_ms: float = 500.0,
    overlap_ms: float = 250.0,
) -> list[np.ndarray]:
    """Generate fixed-duration overlapping windows from continuous EMG."""
    win_samples = int((window_ms / 1000.0) * fs)
    step_samples = int(((window_ms - overlap_ms) / 1000.0) * fs)

    if step_samples <= 0:
        raise ValueError("Overlap must be less than window size.")

    windows = []
    n_samples = emg.shape[0]

    if n_samples < win_samples:
        # Zero pad short segments if at least 50% length
        if n_samples >= win_samples // 2:
            padded = np.pad(emg, ((0, win_samples - n_samples), (0, 0)), mode="edge")
            windows.append(padded)
        return windows

    for start in range(0, n_samples - win_samples + 1, step_samples):
        windows.append(emg[start:start + win_samples, :])

    return windows
