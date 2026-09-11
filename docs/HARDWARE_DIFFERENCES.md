# Hardware Differences: Research vs. Production

This document outlines the key hardware differences between the UC Berkeley EMG research dataset setup and the target BoneTalk consumer hardware, and discusses the implications for model transfer.

## Hardware Comparison

| Feature | Research Setup (Dataset) | BoneTalk Target Hardware |
| :--- | :--- | :--- |
| **Sensor System** | OpenBCI Cyton | Custom EMG AFE (e.g., AD8232 or similar) |
| **Microcontroller** | N/A (Direct to PC) | ESP32-S3 |
| **Electrodes** | Gold-plated cup electrodes | Dry conductive polymer or Ag/AgCl snaps |
| **Channels** | 8 | Variable (e.g., 2, 4, or 8 depending on design) |
| **Sampling Rate** | 1000 Hz | Configurable (e.g., 500 Hz - 1000 Hz) |
| **ADC Resolution** | 24-bit (Cyton) | 12-bit (ESP32-S3 internal) or external 16/24-bit |
| **Communication** | USB/Proprietary Wireless | Wi-Fi / Bluetooth Low Energy (BLE) |
| **Placement** | Precise lab placement | User-applied wearable form factor |

## Implications for Model Transfer

The significant differences in hardware necessitate careful consideration when deploying models trained on the research dataset to the BoneTalk device.

### 1. Signal Quality and ADC Resolution
The research dataset uses a high-end 24-bit ADC, resulting in very low quantization noise. If the ESP32-S3's internal 12-bit ADC is used, the signal will have significantly higher quantization noise. 
*   **Requirement:** Stronger filtering (e.g., digital low-pass and notch filters) and potentially robust features that are less sensitive to fine amplitude variations.

### 2. Sampling Rate Adaptation
While the research dataset is at 1000 Hz, power and bandwidth constraints on the ESP32-S3 might dictate a lower sampling rate (e.g., 500 Hz).
*   **Requirement:** If a lower sampling rate is used on the device, the training data must be downsampled to match before feature extraction, or the feature extraction pipeline must be completely scale-invariant regarding the sampling frequency.

### 3. Channel Mapping and Count
A wearable device may not support 8 channels or may place them differently than the lab setup.
*   **Requirement:** The model needs to be retrained on a subset of channels if the wearable uses fewer channels. A channel selection study is needed to find the most informative channels.

### 4. Electrode Differences
Dry electrodes have higher impedance and are more prone to motion artifacts compared to gold-plated cup electrodes with conductive paste.
*   **Requirement:** The preprocessing pipeline must include robust artifact rejection or correction mechanisms.

### 5. Calibration and Retraining
Given these differences, a model trained *purely* on the Zenodo dataset will likely perform poorly out-of-the-box on the BoneTalk hardware.
*   **Requirement:** A calibration phase is necessary. This could involve:
    *   **Transfer Learning:** Fine-tuning the base model with a small amount of data collected from the user on the BoneTalk hardware.
    *   **Domain Adaptation:** Techniques to align the feature distributions of the research hardware and the BoneTalk hardware.
