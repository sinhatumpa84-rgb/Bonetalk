"""
BoneTalk — Joint 3-Channel Spatial-Temporal Muscle Feature Extractor

Extracts joint features across three coupled muscle channels [M1, M2, M3]:
- Time Domain per channel: RMS, MAV, Mean, Std, Var, Peak, Pk-to-Pk, WL, ZCR, SSC, SSI.
- Cross-Channel Relationships: Cross-correlation (M1-M2, M1-M3, M2-M3), relative activation ratios,
  onset timing differences (lags), channel activation sequence order.
- Temporal Dynamics: Rise time, fall time, peak timing relative to onset, temporal energy skewness.
"""

from typing import Dict, List, Tuple, Any
import numpy as np


class ThreeChannelFeatureExtractor:
    """
    Extracts a structured, high-discriminability 3-channel feature vector.
    """

    def __init__(self, zcr_threshold: float = 0.02, ssc_threshold: float = 0.02):
        self.zcr_threshold = zcr_threshold
        self.ssc_threshold = ssc_threshold

    def get_feature_names(self) -> List[str]:
        names = []
        # Single-channel time-domain features for Ch 1, 2, 3
        single_feats = [
            "rms", "mav", "mean", "std", "var", "peak", "ptp",
            "wl", "zcr", "ssc", "ssi", "rise_time_ms", "fall_time_ms", "peak_time_ratio"
        ]
        for ch in [1, 2, 3]:
            for f in single_feats:
                names.append(f"ch{ch}_{f}")

        # Cross-channel joint features
        cross_feats = [
            "corr_m1_m2", "corr_m1_m3", "corr_m2_m3",
            "lag_m1_m2_ms", "lag_m1_m3_ms", "lag_m2_m3_ms",
            "ratio_rms_m1_m2", "ratio_rms_m1_m3", "ratio_rms_m2_m3",
            "first_activated_ch", "second_activated_ch", "third_activated_ch"
        ]
        names.extend(cross_feats)

        # Global temporal dynamics
        global_feats = [
            "total_energy", "energy_m1_ratio", "energy_m2_ratio", "energy_m3_ratio",
            "duration_ms", "mean_temporal_skewness"
        ]
        names.extend(global_feats)
        return names

    def extract(
        self,
        signals_3ch: np.ndarray,
        timestamps_ms: np.ndarray,
        fs: float = 50.0,
    ) -> np.ndarray:
        """
        Extract feature vector from segmented 3-channel muscle signal.
        signals_3ch: shape (T, 3)
        timestamps_ms: shape (T,)
        Returns 1D numpy array.
        """
        x = np.asarray(signals_3ch, dtype=np.float64)
        n_samples, n_channels = x.shape
        t = np.asarray(timestamps_ms, dtype=np.float64)
        if len(t) != n_samples:
            t = np.arange(n_samples) * (1000.0 / max(1.0, fs))

        duration_ms = float(t[-1] - t[0]) if n_samples > 1 else 100.0
        dt_ms = 1000.0 / max(1.0, fs)

        features: List[float] = []

        channel_peaks_idx = []
        channel_onsets_ms = []
        channel_rms = []
        channel_energies = []

        # ── 1. Single Channel Features ─────────────────────────────────────
        for ch in range(3):
            col = x[:, ch] if ch < n_channels else np.zeros(n_samples)
            abs_col = np.abs(col)

            # Basic Statistics
            rms = float(np.sqrt(np.mean(col**2)))
            mav = float(np.mean(abs_col))
            mean_val = float(np.mean(col))
            std_val = float(np.std(col))
            var_val = float(np.var(col))
            peak_val = float(np.max(abs_col))
            ptp_val = float(np.ptp(col))

            channel_rms.append(rms)
            energy = float(np.sum(col**2))
            channel_energies.append(energy)

            # Waveform Length (WL): sum of absolute differences
            if n_samples > 1:
                wl = float(np.sum(np.abs(np.diff(col))))
            else:
                wl = 0.0

            # Zero Crossing Rate (ZCR)
            if n_samples > 2:
                diff_prod = col[:-1] * col[1:]
                amp_diff = np.abs(col[:-1] - col[1:])
                zcr_count = np.sum((diff_prod < 0) & (amp_diff >= self.zcr_threshold))
                zcr = float(zcr_count / (n_samples - 1))
            else:
                zcr = 0.0

            # Slope Sign Changes (SSC)
            if n_samples > 2:
                d1 = col[1:-1] - col[:-2]
                d2 = col[1:-1] - col[2:]
                ssc_count = np.sum((d1 * d2 >= self.ssc_threshold**2))
                ssc = float(ssc_count / (n_samples - 2))
            else:
                ssc = 0.0

            # Simple Square Integral (SSI)
            ssi = float(np.sum(col**2))

            # Temporal timing within channel
            peak_idx = int(np.argmax(abs_col))
            channel_peaks_idx.append(peak_idx)
            peak_time_ms = float(t[peak_idx] - t[0]) if n_samples > 1 else 0.0
            peak_time_ratio = float(peak_time_ms / max(1.0, duration_ms))

            rise_time_ms = peak_time_ms
            fall_time_ms = max(0.0, duration_ms - peak_time_ms)

            # Channel Onset: time at which abs_col exceeds 25% of its peak
            thresh = 0.25 * peak_val
            above_thresh = np.where(abs_col >= thresh)[0]
            onset_ms = float(t[above_thresh[0]] - t[0]) if len(above_thresh) > 0 else 0.0
            channel_onsets_ms.append(onset_ms)

            features.extend([
                rms, mav, mean_val, std_val, var_val, peak_val, ptp_val,
                wl, zcr, ssc, ssi, rise_time_ms, fall_time_ms, peak_time_ratio
            ])

        # ── 2. Cross-Channel Relationships ─────────────────────────────────
        m1 = x[:, 0]
        m2 = x[:, 1] if n_channels > 1 else m1 * 0.72
        m3 = x[:, 2] if n_channels > 2 else m1 * 0.54

        def calc_cross_corr_and_lag(sig_a: np.ndarray, sig_b: np.ndarray) -> Tuple[float, float]:
            if np.std(sig_a) < 1e-5 or np.std(sig_b) < 1e-5:
                return 0.0, 0.0
            norm_a = (sig_a - np.mean(sig_a)) / (np.std(sig_a) + 1e-8)
            norm_b = (sig_b - np.mean(sig_b)) / (np.std(sig_b) + 1e-8)
            corr = np.correlate(norm_a, norm_b, mode="full") / len(sig_a)
            max_idx = int(np.argmax(corr))
            max_corr = float(corr[max_idx])
            lag_samples = max_idx - (len(sig_a) - 1)
            lag_ms = float(lag_samples * dt_ms)
            return max_corr, lag_ms

        corr_12, lag_12 = calc_cross_corr_and_lag(m1, m2)
        corr_13, lag_13 = calc_cross_corr_and_lag(m1, m3)
        corr_23, lag_23 = calc_cross_corr_and_lag(m2, m3)

        # Relative activation ratios
        ratio_12 = float(channel_rms[0] / max(1e-4, channel_rms[1]))
        ratio_13 = float(channel_rms[0] / max(1e-4, channel_rms[2]))
        ratio_23 = float(channel_rms[1] / max(1e-4, channel_rms[2]))

        # Activation Order: sort channels by onset timing
        order = np.argsort(channel_onsets_ms)  # 0, 1, or 2
        first_act = float(order[0] + 1)
        second_act = float(order[1] + 1)
        third_act = float(order[2] + 1)

        features.extend([
            corr_12, corr_13, corr_23,
            lag_12, lag_13, lag_23,
            ratio_12, ratio_13, ratio_23,
            first_act, second_act, third_act
        ])

        # ── 3. Global Temporal Dynamics ────────────────────────────────────
        total_energy = float(sum(channel_energies))
        e1_ratio = float(channel_energies[0] / max(1e-6, total_energy))
        e2_ratio = float(channel_energies[1] / max(1e-6, total_energy))
        e3_ratio = float(channel_energies[2] / max(1e-6, total_energy))

        # Temporal envelope skewness across the 3 channels
        # (measures whether activation burst happens early or late in the gesture)
        t_normalized = np.linspace(0.0, 1.0, n_samples)
        envelope = np.sum(np.abs(x), axis=1)
        env_sum = np.sum(envelope) + 1e-6
        mean_t = np.sum(t_normalized * envelope) / env_sum
        var_t = np.sum(((t_normalized - mean_t)**2) * envelope) / env_sum
        skewness = float(np.sum(((t_normalized - mean_t)**3) * envelope) / (env_sum * (var_t**1.5 + 1e-6)))

        features.extend([
            total_energy, e1_ratio, e2_ratio, e3_ratio,
            duration_ms, skewness
        ])

        return np.asarray(features, dtype=np.float32)

    def extract_batch(
        self,
        segmented_trials: List[Any],
    ) -> np.ndarray:
        """
        Extract feature matrix (N_trials, N_features) from list of SegmentedGesture objects.
        """
        rows = []
        for sg in segmented_trials:
            sig = sg.normalized_signals if hasattr(sg, "normalized_signals") else sg
            t = sg.timestamps_ms if hasattr(sg, "timestamps_ms") else np.arange(len(sig)) * 20.0
            fs = sg.sampling_rate if hasattr(sg, "sampling_rate") else 50.0
            feat = self.extract(sig, t, fs=fs)
            rows.append(feat)
        return np.vstack(rows)


three_channel_extractor = ThreeChannelFeatureExtractor()
