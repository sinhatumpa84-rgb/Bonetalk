import numpy as np

def rms(window: np.ndarray) -> np.ndarray:
    """Root Mean Square."""
    return np.sqrt(np.mean(window**2, axis=0))

def mean_absolute_value(window: np.ndarray) -> np.ndarray:
    """Mean Absolute Value (MAV)."""
    return np.mean(np.abs(window), axis=0)

def mean_value(window: np.ndarray) -> np.ndarray:
    """Mean value."""
    return np.mean(window, axis=0)

def std_value(window: np.ndarray) -> np.ndarray:
    """Standard deviation."""
    return np.std(window, axis=0)

def variance(window: np.ndarray) -> np.ndarray:
    """Variance."""
    return np.var(window, axis=0)

def waveform_length(window: np.ndarray) -> np.ndarray:
    """Waveform Length (sum of absolute differences between consecutive samples)."""
    return np.sum(np.abs(np.diff(window, axis=0)), axis=0)

def zero_crossings(window: np.ndarray, threshold: float = 0.0) -> np.ndarray:
    """Number of Zero Crossings considering a noise threshold."""
    signs = np.sign(window)
    sign_changes = np.abs(np.diff(signs, axis=0)) == 2
    
    diffs = np.abs(np.diff(window, axis=0))
    valid_crossings = np.logical_and(sign_changes, diffs > threshold)
    
    return np.sum(valid_crossings, axis=0)

def signal_energy(window: np.ndarray) -> np.ndarray:
    """Signal Energy (sum of squared values)."""
    return np.sum(window**2, axis=0)

def extract_features(window: np.ndarray) -> np.ndarray:
    """
    Extracts all features for all channels.
    
    Args:
        window: EMG window (samples x channels).
        
    Returns:
        1D feature vector of shape (num_features * channels,).
    """
    features = [
        rms(window),
        mean_absolute_value(window),
        mean_value(window),
        std_value(window),
        variance(window),
        waveform_length(window),
        zero_crossings(window),
        signal_energy(window)
    ]
    # Concatenate features into a single flat vector
    return np.concatenate(features)

def get_feature_names(n_channels: int = 8) -> list[str]:
    """
    Generates consistent feature names matching extract_features output.
    
    Args:
        n_channels: Number of EMG channels.
        
    Returns:
        List of strings with feature names.
    """
    base_features = ['rms', 'mav', 'mean', 'std', 'var', 'wl', 'zc', 'energy']
    feature_names = []
    
    for feature in base_features:
        for ch in range(n_channels):
            feature_names.append(f"ch{ch}_{feature}")
            
    return feature_names
