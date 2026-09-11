import numpy as np
from scipy import signal

def notch_filter(emg_signal: np.ndarray, fs: float, freq: float = 60.0, harmonics: int = 3, Q: float = 30.0) -> np.ndarray:
    """
    Applies a notch filter to remove powerline noise and its harmonics.
    
    Args:
        emg_signal: Numpy array of EMG data (samples x channels).
        fs: Sampling frequency in Hz.
        freq: Frequency to remove (default 60Hz).
        harmonics: Number of harmonics to filter.
        Q: Quality factor.
        
    Returns:
        Filtered EMG signal.
    """
    filtered = emg_signal.copy()
    for i in range(1, harmonics + 1):
        f0 = freq * i
        if f0 >= fs / 2:
            break
        b, a = signal.iirnotch(f0, Q, fs)
        filtered = signal.filtfilt(b, a, filtered, axis=0)
    return filtered

def highpass_filter(emg_signal: np.ndarray, fs: float, cutoff: float = 2.0, order: int = 4) -> np.ndarray:
    """
    Applies a highpass filter to remove DC drift and low-frequency noise.
    
    Args:
        emg_signal: Numpy array of EMG data (samples x channels).
        fs: Sampling frequency in Hz.
        cutoff: Cutoff frequency in Hz.
        order: Filter order.
        
    Returns:
        Filtered EMG signal.
    """
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = signal.butter(order, normal_cutoff, btype='high', analog=False)
    return signal.filtfilt(b, a, emg_signal, axis=0)

def preprocess_emg(emg_signal: np.ndarray, fs: float = 1000.0, target_fs: float = 800.0) -> np.ndarray:
    """
    Runs the full preprocessing pipeline: notch filter, highpass filter, and resampling.
    
    Args:
        emg_signal: Raw EMG data (samples x channels).
        fs: Original sampling frequency.
        target_fs: Target sampling frequency.
        
    Returns:
        Preprocessed EMG signal.
    """
    filtered = notch_filter(emg_signal, fs)
    filtered = highpass_filter(filtered, fs)
    
    if fs != target_fs:
        num_samples = int(len(filtered) * float(target_fs) / fs)
        filtered = signal.resample(filtered, num_samples, axis=0)
        
    return filtered
