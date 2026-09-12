"""
BoneTalk MVP — Biomedical Feature Extraction for Surface EMG

Extracts 16 biomechanically informative features per channel (128 total features for 8 channels):
1.  MAV   - Mean Absolute Value (primary muscle activation amplitude)
2.  RMS   - Root Mean Square (motor unit recruitment power)
3.  SSI   - Simple Square Integral (cumulative contraction energy)
4.  VAR   - Variance (signal dispersion)
5.  WL    - Waveform Length (waveform complexity & cumulative force)
6.  ZC    - Zero Crossings (frequency proxy with deadband noise threshold)
7.  SSC   - Slope Sign Changes (motor unit firing rate indicator)
8.  WAMP  - Willison Amplitude (muscle action potential burst count)
9.  ACT   - Hjorth Activity (signal power)
10. MOB   - Hjorth Mobility (mean frequency estimate)
11. COM   - Hjorth Complexity (signal bandwidth & shape variation)
12. MNF   - Mean Frequency (centroid of power spectral density)
13. MDF   - Median Frequency (50% cumulative spectral power divide)
14. SKEW  - Skewness (asymmetry of action potential distribution)
15. KURT  - Kurtosis (peakedness / heavy-tailed motor recruitment)
16. PEAK  - Maximum Absolute Peak Amplitude
"""
from typing import List
import numpy as np
from scipy import stats


def extract_channel_features(ch_signal: np.ndarray, fs: float = 800.0) -> np.ndarray:
    """Extracts 16 biomedical features for a single 1D channel signal."""
    N = len(ch_signal)
    if N < 4:
        return np.zeros(16, dtype=np.float32)

    abs_sig = np.abs(ch_signal)
    diff_sig = np.diff(ch_signal)
    threshold = 0.015 * (np.std(ch_signal) + 1e-6)

    # 1. Amplitude & Energy
    mav = np.mean(abs_sig)
    rms = np.sqrt(np.mean(ch_signal ** 2))
    ssi = np.sum(ch_signal ** 2)
    var = np.var(ch_signal)
    peak = np.max(abs_sig)

    # 2. Time-Domain Complexity
    wl = np.sum(np.abs(diff_sig))

    # Zero Crossings with noise threshold
    sign_prod = ch_signal[:-1] * ch_signal[1:]
    diff_abs = np.abs(diff_sig)
    zc = np.sum((sign_prod < 0) & (diff_abs > threshold))

    # Slope Sign Changes
    if N >= 3:
        d1 = ch_signal[1:-1] - ch_signal[:-2]
        d2 = ch_signal[1:-1] - ch_signal[2:]
        ssc = np.sum((d1 * d2 > 0) & ((np.abs(d1) > threshold) | (np.abs(d2) > threshold)))
    else:
        ssc = 0

    # Willison Amplitude
    wamp = np.sum(diff_abs > threshold)

    # 3. Hjorth Parameters
    # Activity = variance
    act = var
    # Mobility = sqrt(var(dx) / var(x))
    var_d1 = np.var(diff_sig)
    mob = np.sqrt(var_d1 / (var + 1e-9))
    # Complexity = mobility(dx) / mobility(x)
    if len(diff_sig) >= 2:
        diff2_sig = np.diff(diff_sig)
        var_d2 = np.var(diff2_sig)
        mob_d = np.sqrt(var_d2 / (var_d1 + 1e-9))
        com = mob_d / (mob + 1e-9)
    else:
        com = 1.0

    # 4. Spectral Features (MNF, MDF via FFT)
    fft_vals = np.abs(np.fft.rfft(ch_signal)) ** 2
    freqs = np.fft.rfftfreq(N, d=1.0 / fs)
    total_power = np.sum(fft_vals) + 1e-9

    mnf = np.sum(freqs * fft_vals) / total_power
    cum_power = np.cumsum(fft_vals)
    mdf_idx = np.searchsorted(cum_power, total_power * 0.5)
    mdf = freqs[min(mdf_idx, len(freqs) - 1)]

    # 5. Statistical Moments
    skew = stats.skew(ch_signal)
    kurt = stats.kurtosis(ch_signal)

    return np.array([
        mav, rms, ssi, var, wl, zc, ssc, wamp,
        act, mob, com, mnf, mdf, skew, kurt, peak
    ], dtype=np.float32)


def extract_multichannel_features(
    window: np.ndarray,
    fs: float = 800.0,
) -> np.ndarray:
    """
    Extracts features for all channels in the window and concatenates them.
    Input shape: (N_samples, N_channels).
    Output shape: (N_channels * 16,) -> e.g. 8 * 16 = 128.
    """
    n_channels = window.shape[1]
    feature_list = []
    for ch in range(n_channels):
        ch_feats = extract_channel_features(window[:, ch], fs=fs)
        feature_list.append(ch_feats)
    return np.concatenate(feature_list)


def get_feature_names(n_channels: int = 8) -> List[str]:
    """Return descriptive names for all 128 features."""
    base_names = [
        "mav", "rms", "ssi", "var", "wl", "zc", "ssc", "wamp",
        "act", "mob", "com", "mnf", "mdf", "skew", "kurt", "peak"
    ]
    names = []
    for ch in range(n_channels):
        for b in base_names:
            names.append(f"ch{ch}_{b}")
    return names
