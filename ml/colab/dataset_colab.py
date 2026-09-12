"""
BoneTalk — PyTorch Dataset and DataLoader with EMG Data Augmentation

Provides:
- BoneTalkEMGDataset: PyTorch Dataset loading (Channels=8, Time) arrays
- Dynamic padding collator for variable-length speech utterances
- On-the-fly EMG Data Augmentation for robust generalization:
  * Additive Gaussian sensor noise (jitter)
  * Random amplitude scaling (muscle contraction force variation)
  * Time-axis shifting / roll
  * Channel dropout / masking (simulates electrode contact glitches)
"""
import random
import numpy as np
import torch
from torch.utils.data import Dataset


class EMGDataAugmentation:
    """EMG-specific data augmentation techniques."""

    def __init__(
        self,
        noise_std: float = 0.02,
        scale_range: tuple[float, float] = (0.85, 1.15),
        max_shift_ratio: float = 0.1,
        channel_dropout_prob: float = 0.15,
    ):
        self.noise_std = noise_std
        self.scale_range = scale_range
        self.max_shift_ratio = max_shift_ratio
        self.channel_dropout_prob = channel_dropout_prob

    def __call__(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Tensor of shape (channels, time)
        Returns:
            Augmented tensor of shape (channels, time)
        """
        # 1. Additive Gaussian noise (sensor thermal / baseline noise)
        if self.noise_std > 0 and random.random() < 0.7:
            noise = torch.randn_like(x) * self.noise_std
            x = x + noise

        # 2. Amplitude scaling (simulates varying vocal/muscle effort)
        if self.scale_range and random.random() < 0.7:
            scale = random.uniform(*self.scale_range)
            x = x * scale

        # 3. Temporal time shift
        if self.max_shift_ratio > 0 and random.random() < 0.5:
            shift_max = int(x.shape[1] * self.max_shift_ratio)
            if shift_max > 0:
                shift = random.randint(-shift_max, shift_max)
                x = torch.roll(x, shifts=shift, dims=1)

        # 4. Channel dropout (simulates intermittent electrode impedance changes)
        if self.channel_dropout_prob > 0 and random.random() < 0.3:
            n_ch = x.shape[0]
            drop_idx = random.randint(0, n_ch - 1)
            x = x.clone()
            x[drop_idx, :] = 0.0

        return x


class BoneTalkEMGDataset(Dataset):
    """
    BoneTalk EMG Dataset for PyTorch.
    
    Accepts:
        signals: List or array of 2D numpy arrays with shape (time, channels) or (channels, time)
        labels: 1D array/list of integer class targets
        groups: 1D array/list of recording/session identifiers (for group-kfold verification)
        is_train: If True, applies data augmentation
        target_length: Optional fixed target sample length (e.g. 800 samples = 1s at 800Hz)
    """

    def __init__(
        self,
        signals: list[np.ndarray],
        labels: np.ndarray,
        groups: np.ndarray | None = None,
        is_train: bool = False,
        target_length: int | None = None,
        augmenter: EMGDataAugmentation | None = None,
    ):
        self.signals = signals
        self.labels = np.asarray(labels, dtype=np.int64)
        self.groups = np.asarray(groups) if groups is not None else np.zeros(len(labels), dtype=object)
        self.is_train = is_train
        self.target_length = target_length
        self.augmenter = augmenter or (EMGDataAugmentation() if is_train else None)

    def __len__(self) -> int:
        return len(self.signals)

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, torch.Tensor, str]:
        sig = self.signals[idx]
        label = self.labels[idx]
        group = self.groups[idx]

        # Ensure shape is (channels, time)
        if sig.shape[0] > sig.shape[1] and sig.shape[1] == 8:
            sig = sig.T  # from (T, 8) to (8, T)

        # Normalize per-channel: Z-score along time axis
        mean = np.mean(sig, axis=1, keepdims=True)
        std = np.std(sig, axis=1, keepdims=True) + 1e-6
        sig = (sig - mean) / std

        # Convert to torch float32 tensor
        tensor_sig = torch.from_numpy(sig.astype(np.float32))

        # Adjust length if target_length is specified
        if self.target_length is not None:
            c, t = tensor_sig.shape
            if t > self.target_length:
                if self.is_train:
                    # Random crop during training
                    start = random.randint(0, t - self.target_length)
                    tensor_sig = tensor_sig[:, start : start + self.target_length]
                else:
                    # Center crop during eval
                    start = (t - self.target_length) // 2
                    tensor_sig = tensor_sig[:, start : start + self.target_length]
            elif t < self.target_length:
                # Zero-pad symmetrically
                pad_total = self.target_length - t
                pad_left = pad_total // 2
                pad_right = pad_total - pad_left
                tensor_sig = torch.nn.functional.pad(tensor_sig, (pad_left, pad_right), "constant", 0.0)

        # Apply augmentation if in training mode
        if self.is_train and self.augmenter is not None:
            tensor_sig = self.augmenter(tensor_sig)

        return tensor_sig, torch.tensor(label, dtype=torch.long), str(group)


def collate_emg_batch(batch: list[tuple[torch.Tensor, torch.Tensor, str]]) -> tuple[torch.Tensor, torch.Tensor, list[str]]:
    """
    Collate function that dynamically pads tensors to the max sequence length in the batch.
    
    Returns:
        batch_x: Tensor of shape (Batch, Channels, max_T)
        batch_y: Tensor of shape (Batch,)
        groups: List of group strings
    """
    tensors, labels, groups = zip(*batch)
    max_len = max(t.shape[1] for t in tensors)
    n_ch = tensors[0].shape[0]

    padded_tensors = []
    for t in tensors:
        pad_len = max_len - t.shape[1]
        if pad_len > 0:
            padded = torch.nn.functional.pad(t, (0, pad_len), "constant", 0.0)
        else:
            padded = t
        padded_tensors.append(padded)

    batch_x = torch.stack(padded_tensors, dim=0)
    batch_y = torch.stack(labels, dim=0)
    return batch_x, batch_y, list(groups)
