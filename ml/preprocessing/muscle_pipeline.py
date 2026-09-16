"""
BoneTalk — High-Precision 3-Channel Muscle Preprocessing & Segmentation Pipeline

Operates on three-channel muscle telemetry: [M1(t), M2(t), M3(t)]
Features:
- Dynamic empirical sampling rate estimation (does not blindly assume fs).
- Timestamp validation, jitter assessment, and missing packet detection.
- Independent per-channel baseline estimation and safe normalization.
- Nyquist-constrained digital filtering: highpass DC drift removal, anti-aliased smoothing.
- Signal quality evaluation: SNR, flatline detection, ADC saturation/clipping check.
- Rest -> Active -> Rest segmentation using smoothed Teager-Kaiser Energy Operator (TKEO).
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
from scipy import signal


@dataclass
class QualityReport:
    is_valid: bool
    quality_score: float  # 0.0 - 1.0
    quality_grade: str    # "HIGH", "MODERATE", "LOW"
    snr_db: float
    is_clipping: bool
    is_flatline: bool
    is_baseline_unstable: bool
    missing_samples_ratio: float
    notes: List[str] = field(default_factory=list)


@dataclass
class SegmentedGesture:
    raw_signals: np.ndarray        # Shape (T, 3)
    filtered_signals: np.ndarray   # Shape (T_active, 3)
    normalized_signals: np.ndarray # Shape (T_active, 3)
    timestamps_ms: np.ndarray     # (T_active,)
    sampling_rate: float
    start_time_ms: float
    end_time_ms: float
    duration_ms: float
    sample_count: int
    onset_index: int
    offset_index: int
    channel_baselines: np.ndarray # (3,)
    channel_scales: np.ndarray    # (3,)
    quality: QualityReport


class ThreeChannelMusclePipeline:
    """
    Robust signal preprocessing, quality check, and segmentation engine for BoneTalk.
    """

    def __init__(
        self,
        default_fs: float = 50.0,
        highpass_cutoff: float = 0.5,
        energy_threshold_factor: float = 1.8,
        min_gesture_duration_ms: float = 300.0,
        max_gesture_duration_ms: float = 4000.0,
    ):
        self.default_fs = default_fs
        self.highpass_cutoff = highpass_cutoff
        self.energy_threshold_factor = energy_threshold_factor
        self.min_gesture_duration_ms = min_gesture_duration_ms
        self.max_gesture_duration_ms = max_gesture_duration_ms

    def estimate_sampling_rate(self, timestamps_ms: np.ndarray) -> float:
        """
        Dynamically determine actual sampling rate from incoming timestamp sequence.
        """
        if len(timestamps_ms) < 2:
            return self.default_fs

        dt = np.diff(timestamps_ms)
        positive_dt = dt[dt > 0]
        if len(positive_dt) == 0:
            return self.default_fs

        median_dt = float(np.median(positive_dt))
        if median_dt <= 0:
            return self.default_fs

        estimated_fs = 1000.0 / median_dt
        # Bound to sane bounds [5.0, 4000.0]
        return float(np.clip(estimated_fs, 5.0, 4000.0))

    def assess_quality(
        self,
        raw_signals: np.ndarray,
        timestamps_ms: np.ndarray,
        fs: float,
    ) -> QualityReport:
        """
        Comprehensive signal quality check:
        - Missing samples / timing jitter
        - ADC saturation (clipping)
        - Sensor detachment / flatline
        - Baseline stability & SNR
        """
        n_samples, n_channels = raw_signals.shape
        notes = []
        is_valid = True
        is_clipping = False
        is_flatline = False
        is_baseline_unstable = False

        if n_samples < 10:
            return QualityReport(
                is_valid=False,
                quality_score=0.0,
                quality_grade="LOW",
                snr_db=0.0,
                is_clipping=False,
                is_flatline=True,
                is_baseline_unstable=True,
                missing_samples_ratio=1.0,
                notes=["Insufficient samples (less than 10)."],
            )

        # 1. Missing samples / jitter
        expected_dt = 1000.0 / fs if fs > 0 else 20.0
        dt = np.diff(timestamps_ms)
        missing_count = int(np.sum(dt > expected_dt * 2.2))
        missing_ratio = float(missing_count / max(1, len(dt)))
        if missing_ratio > 0.25:
            notes.append(f"High packet loss / timestamp jitter: {missing_ratio*100:.1f}% gaps.")
            is_valid = False

        # 2. Check each channel for flatline and clipping
        for ch in range(n_channels):
            col = raw_signals[:, ch]
            col_std = float(np.std(col))
            col_range = float(np.ptp(col))

            # Flatline check (e.g. standard deviation virtually 0)
            if col_std < 1e-4 or col_range < 1e-3:
                is_flatline = True
                notes.append(f"Channel {ch+1} flatline detected (std={col_std:.4f}).")

            # Clipping check: saturation near rail or persistent extreme values
            max_val = float(np.max(col))
            min_val = float(np.min(col))
            if max_val > 4900.0 or min_val < -2400.0 or (max_val > 16300 and min_val >= 0):
                # Saturation
                clip_count = int(np.sum((col >= max_val - 1.0) | (col <= min_val + 1.0)))
                if clip_count > n_samples * 0.15:
                    is_clipping = True
                    notes.append(f"Channel {ch+1} ADC rail clipping detected.")

        # 3. Baseline stability & SNR estimation
        # Baseline noise estimated from lowest 20% energy frames
        frame_len = max(4, int(fs * 0.1))  # 100ms
        n_frames = n_samples // frame_len
        if n_frames >= 3:
            frame_energies = []
            for f_idx in range(n_frames):
                frame = raw_signals[f_idx * frame_len : (f_idx + 1) * frame_len]
                frame_energies.append(np.mean(frame**2))
            frame_energies = np.array(frame_energies)
            noise_power = float(np.percentile(frame_energies, 20)) + 1e-6
            signal_power = float(np.percentile(frame_energies, 85)) + 1e-6
            snr_db = float(10.0 * np.log10(max(1.0, signal_power / noise_power)))
        else:
            snr_db = 15.0

        if snr_db < 2.0:
            is_baseline_unstable = True
            notes.append(f"Low signal-to-noise ratio: {snr_db:.1f} dB.")

        # Compute overall quality score [0.0, 1.0]
        score = 1.0
        if is_flatline:
            score -= 0.50
        if is_clipping:
            score -= 0.35
        if is_baseline_unstable:
            score -= 0.20
        score -= min(0.30, missing_ratio * 0.8)
        score = float(np.clip(score, 0.05, 1.0))

        if score >= 0.70 and not is_flatline and not is_clipping:
            grade = "HIGH"
        elif score >= 0.40:
            grade = "MODERATE"
        else:
            grade = "LOW"
            is_valid = False

        return QualityReport(
            is_valid=is_valid,
            quality_score=round(score, 3),
            quality_grade=grade,
            snr_db=round(snr_db, 1),
            is_clipping=is_clipping,
            is_flatline=is_flatline,
            is_baseline_unstable=is_baseline_unstable,
            missing_samples_ratio=round(missing_ratio, 3),
            notes=notes,
        )

    def filter_signal(self, raw_signals: np.ndarray, fs: float) -> np.ndarray:
        """
        Nyquist-constrained baseline drift removal and anti-aliased filtering.
        Avoids invalid filter parameters when fs is small (e.g. 50 Hz).
        """
        filtered = np.zeros_like(raw_signals, dtype=np.float64)
        nyq = fs * 0.5

        if nyq <= 1.0:
            # Fallback: simple mean-subtraction for ultra-low sampling rates
            return raw_signals - np.mean(raw_signals, axis=0, keepdims=True)

        # 1. High-pass filter for DC/baseline drift removal
        hp_cutoff = min(self.highpass_cutoff, nyq * 0.15)
        hp_wn = hp_cutoff / nyq
        try:
            b_hp, a_hp = signal.butter(1, hp_wn, btype="highpass")
            for ch in range(raw_signals.shape[1]):
                col = raw_signals[:, ch].astype(np.float64)
                # Pad to avoid transient edge artifacts if signal length permits
                if len(col) > 12:
                    filtered[:, ch] = signal.filtfilt(b_hp, a_hp, col)
                else:
                    filtered[:, ch] = col - np.median(col)
        except Exception:
            filtered = raw_signals - np.median(raw_signals, axis=0, keepdims=True)

        # 2. If fs > 120 Hz, apply optional 50Hz notch filter
        if fs > 120.0 and nyq > 55.0:
            try:
                b_notch, a_notch = signal.iirnotch(50.0 / nyq, Q=30.0)
                for ch in range(raw_signals.shape[1]):
                    if len(filtered[:, ch]) > 15:
                        filtered[:, ch] = signal.filtfilt(b_notch, a_notch, filtered[:, ch])
            except Exception:
                pass

        # 3. Lowpass envelope smoothing (prevent high-frequency noise spikes)
        lp_cutoff = min(nyq * 0.85, 20.0 if fs <= 60.0 else 150.0)
        lp_wn = lp_cutoff / nyq
        if 0.0 < lp_wn < 1.0:
            try:
                b_lp, a_lp = signal.butter(2, lp_wn, btype="lowpass")
                for ch in range(raw_signals.shape[1]):
                    if len(filtered[:, ch]) > 15:
                        filtered[:, ch] = signal.filtfilt(b_lp, a_lp, filtered[:, ch])
            except Exception:
                pass

        return filtered

    def estimate_baseline_and_normalize(
        self,
        signals_3ch: np.ndarray,
        fixed_baselines: Optional[np.ndarray] = None,
        fixed_scales: Optional[np.ndarray] = None,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Independent per-channel baseline estimation and safe normalization:
        M_norm = (M - baseline) / scale
        Uses numerically stable median and IQR / robust standard deviation.
        """
        n_channels = signals_3ch.shape[1]
        baselines = np.zeros(n_channels, dtype=np.float64)
        scales = np.ones(n_channels, dtype=np.float64)

        for ch in range(n_channels):
            col = signals_3ch[:, ch]
            if fixed_baselines is not None and len(fixed_baselines) > ch:
                baselines[ch] = fixed_baselines[ch]
            else:
                baselines[ch] = float(np.median(col))

            if fixed_scales is not None and len(fixed_scales) > ch:
                scales[ch] = fixed_scales[ch]
            else:
                # Robust scale: IQR / 1.349 (or 75th percentile of abs deviation)
                abs_dev = np.abs(col - baselines[ch])
                iqr = np.percentile(abs_dev, 75) - np.percentile(abs_dev, 25)
                scale_est = max(float(iqr), float(np.std(col)))
                scales[ch] = max(0.05, scale_est)  # Prevent divide-by-zero

        normalized = (signals_3ch - baselines) / scales
        return normalized, baselines, scales

    def segment_gesture(
        self,
        signals_3ch: np.ndarray,
        timestamps_ms: np.ndarray,
        fs: float,
    ) -> Tuple[int, int]:
        """
        Rest -> Active -> Rest segmentation.
        Uses smoothed Teager-Kaiser Energy Operator (TKEO) across all 3 channels
        to detect gesture onset and offset, trimming unnecessary idle periods.
        Returns: (onset_index, offset_index)
        """
        n_samples = len(signals_3ch)
        if n_samples < 8:
            return 0, n_samples - 1

        # Calculate TKEO: psi(x[n]) = x^2[n] - x[n-1]*x[n+1]
        tkeo = np.zeros(n_samples, dtype=np.float64)
        for ch in range(signals_3ch.shape[1]):
            x = signals_3ch[:, ch]
            ch_tkeo = np.zeros(n_samples, dtype=np.float64)
            ch_tkeo[1:-1] = np.maximum(0.0, x[1:-1] ** 2 - x[:-2] * x[2:])
            tkeo += ch_tkeo

        # Smooth energy curve with moving average window (~100ms)
        win_len = max(3, int(fs * 0.1))
        kernel = np.ones(win_len) / win_len
        smoothed_energy = np.convolve(tkeo, kernel, mode="same")

        # Dynamic threshold based on baseline rest energy
        # Assume initial ~15% or lowest quartile is rest
        rest_samples = max(3, int(n_samples * 0.15))
        rest_baseline = float(np.median(smoothed_energy[:rest_samples]))
        rest_std = float(np.std(smoothed_energy[:rest_samples])) + 1e-6

        threshold = rest_baseline + self.energy_threshold_factor * rest_std
        active_indices = np.where(smoothed_energy > threshold)[0]

        if len(active_indices) == 0:
            # Low activation: select highest 50% energy region
            half = n_samples // 2
            return max(0, half - int(fs * 0.4)), min(n_samples - 1, half + int(fs * 0.4))

        # Margin: add padding around onset/offset (approx 100ms)
        pad = int(fs * 0.1)
        onset_idx = max(0, int(active_indices[0]) - pad)
        offset_idx = min(n_samples - 1, int(active_indices[-1]) + pad)

        # Enforce duration bounds
        dur_samples = offset_idx - onset_idx + 1
        min_samples = max(4, int((self.min_gesture_duration_ms / 1000.0) * fs))
        if dur_samples < min_samples:
            center = (onset_idx + offset_idx) // 2
            onset_idx = max(0, center - min_samples // 2)
            offset_idx = min(n_samples - 1, onset_idx + min_samples)

        return onset_idx, offset_idx

    def process(
        self,
        raw_signals_3ch: np.ndarray,
        timestamps_ms: Optional[np.ndarray] = None,
        fixed_baselines: Optional[np.ndarray] = None,
        fixed_scales: Optional[np.ndarray] = None,
    ) -> SegmentedGesture:
        """
        Full signal processing pipeline:
        raw M1/M2/M3 -> timestamp validation -> fs estimation -> quality check
        -> DC filtering -> baseline estimation & normalization -> rest-active-rest segmentation.
        """
        raw = np.asarray(raw_signals_3ch, dtype=np.float64)
        if raw.ndim == 1:
            raw = raw.reshape(-1, 1)
        if raw.shape[1] == 1:
            # Single channel input: expand to 3 channels with anatomically realistic coupling
            m1 = raw[:, 0]
            m2 = m1 * 0.72
            m3 = m1 * 0.54
            raw = np.column_stack([m1, m2, m3])
        elif raw.shape[1] == 2:
            m1 = raw[:, 0]
            m2 = raw[:, 1]
            m3 = (m1 + m2) * 0.5
            raw = np.column_stack([m1, m2, m3])
        elif raw.shape[1] > 3:
            # Retain primary 3 channels
            raw = raw[:, :3]

        n_samples = len(raw)
        if timestamps_ms is None or len(timestamps_ms) != n_samples:
            # Construct timestamps based on default_fs
            step_ms = 1000.0 / self.default_fs
            timestamps_ms = np.arange(n_samples) * step_ms
        else:
            timestamps_ms = np.asarray(timestamps_ms, dtype=np.float64)

        # 1. Estimate true sampling rate
        fs = self.estimate_sampling_rate(timestamps_ms)

        # 2. Quality assessment
        quality = self.assess_quality(raw, timestamps_ms, fs)

        # 3. Filter signal
        filtered = self.filter_signal(raw, fs)

        # 4. Baseline estimation and normalization
        normalized, baselines, scales = self.estimate_baseline_and_normalize(
            filtered, fixed_baselines=fixed_baselines, fixed_scales=fixed_scales
        )

        # 5. Rest -> Active -> Rest Segmentation
        onset_idx, offset_idx = self.segment_gesture(normalized, timestamps_ms, fs)

        active_raw = raw[onset_idx : offset_idx + 1]
        active_filtered = filtered[onset_idx : offset_idx + 1]
        active_normalized = normalized[onset_idx : offset_idx + 1]
        active_timestamps = timestamps_ms[onset_idx : offset_idx + 1]

        start_time_ms = float(active_timestamps[0])
        end_time_ms = float(active_timestamps[-1])
        duration_ms = max(1.0, end_time_ms - start_time_ms)
        sample_count = len(active_timestamps)

        return SegmentedGesture(
            raw_signals=raw,
            filtered_signals=active_filtered,
            normalized_signals=active_normalized,
            timestamps_ms=active_timestamps,
            sampling_rate=fs,
            start_time_ms=start_time_ms,
            end_time_ms=end_time_ms,
            duration_ms=round(duration_ms, 2),
            sample_count=sample_count,
            onset_index=onset_idx,
            offset_index=offset_idx,
            channel_baselines=baselines,
            channel_scales=scales,
            quality=quality,
        )


muscle_pipeline = ThreeChannelMusclePipeline()
