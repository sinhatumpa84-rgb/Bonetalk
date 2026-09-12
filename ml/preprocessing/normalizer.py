import numpy as np
import joblib
from pathlib import Path

class EMGNormalizer:
    """Applies per-channel z-score normalization to EMG data."""
    
    def __init__(self):
        self.mean = None
        self.std = None

    def fit(self, data: np.ndarray):
        """
        Computes the mean and standard deviation per channel across all data.
        
        Args:
            data: Data array of shape (samples, channels) to fit on.
        """
        self.mean = np.mean(data, axis=0)
        self.std = np.std(data, axis=0)
        # Avoid division by zero
        self.std[self.std == 0] = 1e-8

    def transform(self, data: np.ndarray) -> np.ndarray:
        """
        Scales the data using computed mean and std.
        
        Args:
            data: Data array to transform.
            
        Returns:
            Z-score normalized array.
        """
        if self.mean is None or self.std is None:
            raise ValueError("Normalizer has not been fitted yet.")
        return (data - self.mean) / self.std

    def fit_transform(self, data: np.ndarray) -> np.ndarray:
        """
        Fits the normalizer and transforms the data.
        
        Args:
            data: Data array to fit and transform.
            
        Returns:
            Normalized array.
        """
        self.fit(data)
        return self.transform(data)

    def save(self, path: Path):
        """
        Saves the normalizer state to disk.
        
        Args:
            path: Target file path to save the state (.pkl).
        """
        joblib.dump({'mean': self.mean, 'std': self.std}, path)

    def load(self, path: Path):
        """
        Loads the normalizer state from disk.
        
        Args:
            path: File path to load the state from (.pkl).
        """
        params = joblib.load(path)
        self.mean = params['mean']
        self.std = params['std']
