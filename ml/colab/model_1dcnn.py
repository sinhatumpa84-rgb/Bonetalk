"""
BoneTalk — 1D Temporal Convolutional Neural Network (1D-CNN) for Surface EMG

Architected specifically for multi-channel surface EMG time series:
- Input shape: (Batch, in_channels=8, time_steps)
- Temporal residual blocks with multi-scale 1D convolutions
- Batch Normalization and Spatial Dropout to prevent overfitting on small datasets
- Adaptive Average Pooling for temporal-length invariance (handles variable length signals)
- Fully compatible with PyTorch 2.x, CUDA Tensor Cores, and mixed precision (torch.cuda.amp)
"""
import torch
import torch.nn as nn
import torch.nn.functional as F


class Conv1DBlock(nn.Module):
    """Residual 1D Convolutional block with Batch Normalization and Dropout."""

    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        kernel_size: int = 5,
        stride: int = 1,
        pool_size: int = 2,
        dropout: float = 0.25,
    ):
        super().__init__()
        padding = kernel_size // 2

        self.conv1 = nn.Conv1d(
            in_channels, out_channels, kernel_size=kernel_size,
            stride=stride, padding=padding, bias=False
        )
        self.bn1 = nn.BatchNorm1d(out_channels)
        self.act1 = nn.LeakyReLU(0.1, inplace=True)

        self.conv2 = nn.Conv1d(
            out_channels, out_channels, kernel_size=kernel_size,
            stride=1, padding=padding, bias=False
        )
        self.bn2 = nn.BatchNorm1d(out_channels)
        self.act2 = nn.LeakyReLU(0.1, inplace=True)

        self.pool = nn.MaxPool1d(kernel_size=pool_size) if pool_size > 1 else nn.Identity()
        self.dropout = nn.Dropout(dropout) if dropout > 0 else nn.Identity()

        # Residual shortcut
        total_downsample = stride * pool_size
        if in_channels != out_channels or total_downsample > 1:
            self.shortcut = nn.Sequential(
                nn.Conv1d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm1d(out_channels),
                nn.MaxPool1d(kernel_size=pool_size) if pool_size > 1 else nn.Identity(),
            )
        else:
            self.shortcut = nn.Identity()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = self.shortcut(x)
        out = self.act1(self.bn1(self.conv1(x)))
        out = self.act2(self.bn2(self.conv2(out)))
        out = self.pool(out)
        out = self.dropout(out + res)
        return out


class BoneTalk1DCNN(nn.Module):
    """
    BoneTalk Deep EMG Classifier.
    
    Accepts raw or filtered EMG time series of shape (Batch, Channels, Time)
    and predicts categorical word/intent classes.
    """

    def __init__(
        self,
        in_channels: int = 8,
        num_classes: int = 4,
        base_filters: int = 32,
        dropout: float = 0.3,
    ):
        super().__init__()
        self.in_channels = in_channels
        self.num_classes = num_classes

        # Initial feature projection
        self.stem = nn.Sequential(
            nn.Conv1d(in_channels, base_filters, kernel_size=7, stride=1, padding=3, bias=False),
            nn.BatchNorm1d(base_filters),
            nn.LeakyReLU(0.1, inplace=True),
        )

        # Residual Temporal Blocks
        # Block 1: base_filters -> base_filters (e.g. 32 -> 32)
        self.block1 = Conv1DBlock(base_filters, base_filters, kernel_size=7, stride=1, pool_size=2, dropout=dropout * 0.8)
        # Block 2: base_filters -> base_filters*2 (e.g. 32 -> 64)
        self.block2 = Conv1DBlock(base_filters, base_filters * 2, kernel_size=5, stride=1, pool_size=2, dropout=dropout)
        # Block 3: base_filters*2 -> base_filters*4 (e.g. 64 -> 128)
        self.block3 = Conv1DBlock(base_filters * 2, base_filters * 4, kernel_size=3, stride=1, pool_size=2, dropout=dropout)
        # Block 4: base_filters*4 -> base_filters*8 (e.g. 128 -> 256)
        self.block4 = Conv1DBlock(base_filters * 4, base_filters * 8, kernel_size=3, stride=1, pool_size=2, dropout=dropout * 1.2)

        # Global Average Pooling for time-invariance
        self.gap = nn.AdaptiveAvgPool1d(1)
        self.gmp = nn.AdaptiveMaxPool1d(1)

        # Dense Classifier Head: combines average and max pooled temporal features
        emb_dim = (base_filters * 8) * 2  # 256 * 2 = 512
        self.classifier = nn.Sequential(
            nn.Linear(emb_dim, 128),
            nn.BatchNorm1d(128),
            nn.LeakyReLU(0.1, inplace=True),
            nn.Dropout(dropout),
            nn.Linear(128, num_classes),
        )

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        """Extracts dense embedding representation before the linear head."""
        h = self.stem(x)
        h = self.block1(h)
        h = self.block2(h)
        h = self.block3(h)
        h = self.block4(h)
        
        gap = self.gap(h).squeeze(-1)
        gmp = self.gmp(h).squeeze(-1)
        emb = torch.cat([gap, gmp], dim=1)
        return emb

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.
        
        Args:
            x: Tensor of shape (Batch, in_channels, time_steps)
            
        Returns:
            Logits of shape (Batch, num_classes)
        """
        emb = self.extract_features(x)
        logits = self.classifier(emb)
        return logits


def count_parameters(model: nn.Module) -> int:
    """Returns total trainable parameter count."""
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


if __name__ == "__main__":
    net = BoneTalk1DCNN(in_channels=8, num_classes=4)
    print(f"BoneTalk1DCNN initialized with {count_parameters(net):,} trainable parameters.")
    dummy_input = torch.randn(16, 8, 800)  # Batch=16, 8 channels, 800 time samples (1 second at 800Hz)
    out = net(dummy_input)
    print(f"Forward test passed! Input shape: {dummy_input.shape} -> Output shape: {out.shape}")
