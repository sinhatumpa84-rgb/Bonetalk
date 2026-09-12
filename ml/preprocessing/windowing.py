import numpy as np

def create_windows(emg: np.ndarray, fs: float, window_ms: float = 200.0, overlap_ms: float = 100.0) -> list[np.ndarray]:
    """
    Creates overlapping windows from continuous EMG data.
    
    Args:
        emg: Continuous EMG data array (samples x channels).
        fs: Sampling frequency in Hz.
        window_ms: Window size in milliseconds.
        overlap_ms: Overlap between consecutive windows in milliseconds.
        
    Returns:
        List of windowed EMG arrays.
    """
    window_size = int((window_ms / 1000.0) * fs)
    step_size = int(((window_ms - overlap_ms) / 1000.0) * fs)
    
    if step_size <= 0:
        raise ValueError("Overlap must be strictly less than window size.")
        
    windows = []
    n_samples = emg.shape[0]
    
    for start in range(0, n_samples - window_size + 1, step_size):
        windows.append(emg[start:start + window_size, :])
        
    return windows

def create_labeled_windows(emg: np.ndarray, label: str, recording_id: str, fs: float, window_ms: float = 200.0, overlap_ms: float = 100.0) -> list[dict]:
    """
    Creates overlapping windows and attaches labels and metadata.
    
    Args:
        emg: Continuous EMG data array.
        label: The label for the signal segment.
        recording_id: Origin recording identifier for metadata tracking.
        fs: Sampling frequency in Hz.
        window_ms: Window size in milliseconds.
        overlap_ms: Overlap between windows in milliseconds.
        
    Returns:
        List of dictionaries containing the window, label, and metadata.
    """
    windows = create_windows(emg, fs, window_ms, overlap_ms)
    labeled_windows = []
    
    for w in windows:
        labeled_windows.append({
            'window': w,
            'label': label,
            'recording_id': recording_id
        })
        
    return labeled_windows
