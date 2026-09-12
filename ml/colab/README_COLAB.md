# BoneTalk — Google Colab NVIDIA Tesla T4 GPU Training Guide

This guide walks you through training the **BoneTalk 1D Temporal Convolutional Neural Network (1D-CNN)** on **Google Colab** using a hardware-accelerated **NVIDIA Tesla T4 GPU** (with FP16 mixed precision and CUDA 12.x).

---

## 1. Quick Overview

The Colab pipeline includes:
- **`model_1dcnn.py`**: Multi-scale 1D Temporal CNN with Residual Blocks, BatchNorm, Dropout, and Global Average Pooling designed for 8-channel surface EMG signals.
- **`dataset_colab.py`**: PyTorch `Dataset` and dynamic padding `DataLoader` with real-time EMG data augmentation (sensor jitter, amplitude scaling, time roll, channel dropout).
- **`train_colab.py`**: Standalone training and evaluation script with auto CUDA detection, mixed precision (`torch.cuda.amp`), Stratified Group K-Fold split (zero session leakage), early stopping, confusion matrix plotting, and checkpoint export.
- **`bonetalk_mvp_data.npz` (1.57 MB)**: Preprocessed isolated vocabulary (`REST`, `YES`, `NO`, `THANK YOU`).
- **`bonetalk_days_data.npz` (23.04 MB)**: Preprocessed discrete benchmark (`MONDAY`–`SUNDAY` + `REST`).
- **`BoneTalk_Training_T4.ipynb`**: Interactive Jupyter Notebook ready to open directly in Colab.

---

## 2. Step-by-Step Instructions

### Step 1: Open Google Colab
1. Go to [Google Colab](https://colab.research.google.com).
2. Click **File** → **Upload notebook** and select:
   ```
   ml/colab/BoneTalk_Training_T4.ipynb
   ```

### Step 2: Enable NVIDIA Tesla T4 GPU
1. In Colab menu, navigate to:
   **Runtime** → **Change runtime type**
2. Under **Hardware accelerator**, select **T4 GPU**.
3. Under **GPU type**, ensure **Standard** (Tesla T4) is selected.
4. Click **Save**.

### Step 3: Upload the Packaged Dataset
You do **NOT** need to upload the full 3.9 GB raw Zenodo archive! We pre-packaged the targeted datasets into compact `.npz` files:
- **Core MVP (1.57 MB)**: `ml/colab/bonetalk_mvp_data.npz` (recommended for rapid training & highest accuracy)
- **Days Benchmark (23.04 MB)**: `ml/colab/bonetalk_days_data.npz`

In Colab's left sidebar, click the **Folder icon 📁** (Files) and drag & drop either `bonetalk_mvp_data.npz` or `bonetalk_days_data.npz` into the root directory.

### Step 4: Run the Notebook Cells
Execute the notebook cells sequentially:
1. **Cell 1: GPU Hardware Diagnostic**: Verifies that CUDA and the Tesla T4 GPU are active (`!nvidia-smi` and `torch.cuda.get_device_name(0)`).
2. **Cell 2: Load Dependencies & Model Architecture**: Defines the `BoneTalk1DCNN` network and EMG augmentations.
3. **Cell 3: Load Data & Verify Zero-Leakage Split**: Confirms that training, validation, and test splits have disjoint session IDs.
4. **Cell 4: Train with Mixed Precision (AMP)**: Runs the training loop using `torch.cuda.amp.autocast()` and `GradScaler`. Training takes ~15–45 seconds on T4!
5. **Cell 5: Held-Out Test Evaluation & Confusion Matrix**: Computes exact test accuracy, macro precision, macro recall, macro F1, and renders the confusion matrix heatmap.
6. **Cell 6: Export & Download Checkpoint**: Bundles:
   - `bonetalk_emg_model.pt` (PyTorch state dict)
   - `label_mapping.json`
   - `evaluation_report.json`
   - `confusion_matrix_test.png`
   - `training_curves.png`
   - `bonetalk_emg_model.onnx` (for embedded runtime / WebAssembly / FastAPI backend)

---

## 3. Transferring Trained Model to Local Project

Once downloaded from Colab:
1. Copy `bonetalk_emg_model.pt` and `label_mapping.json` into:
   ```
   Bonetalk/ml/models/
   ```
2. The BoneTalk backend API (`backend/inference.py`) automatically detects `bonetalk_emg_model.pt` and switches to deep learning inference with zero configuration changes required.

---

## 4. Troubleshooting & FAQ

- **Q: Colab says "CUDA out of memory"?**
  The 1D-CNN has only ~180k parameters and uses batch size 16 or 32; VRAM usage on T4 is < 1 GB (out of 15 GB available). If an OOM occurs, ensure previous sessions are restarted (**Runtime** → **Restart session**).
- **Q: Can I train on CPU instead?**
  Yes. Both `train_colab.py` and the notebook auto-detect hardware and seamlessly fall back to CPU if no GPU is found.
- **Q: Are these results fabricated?**
  No. All evaluations use strict `StratifiedGroupKFold` cross-session splitting with disjoint recording files, standard cross-entropy loss, and standard scikit-learn metric calculations.
