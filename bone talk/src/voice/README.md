# BoneTalk Voice AI Module

## Purpose
This module is the dedicated subsystem for BoneTalk's future AI voice, dataset, and neural model architecture. It is designed to house and structure clean voice datasets, speaker profiles, audio preprocessing pipelines, voice synthesis/generation models, and deployment artifacts.

> **IMPORTANT NOTICE:**
> Dataset and model files will be provided separately and must not be invented or downloaded automatically.

---

## Dataset Structure

The `data/` directory is strictly organized into four tiers to ensure raw data integrity and reproducible processing:

```
src/voice/data/
├── raw/         # Original, unmodified datasets exactly as provided (clean speech, speaker recordings)
├── processed/   # Normalized, resampled, denoised, or framed audio ready for training/inference
├── metadata/    # Manifests, speaker demographics, sampling rates, splits (train/val/test), SNR logs
└── labels/      # Phoneme maps, word alignment transcripts, vocabulary IDs, and intent targets
```

### Dataset Organization Guidelines
- **`raw/`**: Preserves original files without renaming or compression artifacts.
- **`processed/`**: Output of reproducible transformation scripts (e.g. 16 kHz / 24 kHz mono standard, silence-trimmed).
- **`metadata/`**: JSON/CSV manifests containing file paths, durations, speaker IDs, languages, and quality annotations.
- **`labels/`**: Token mappings, vocabulary dictionaries, and transcription alignments.

---

## Model Structure

The `models/` directory provides a clear lifecycle separation for neural weights and checkpoints:

```
src/voice/models/
├── pretrained/  # Externally provided base models, acoustic encoders, or foundation checkpoints
├── trained/     # Custom checkpoints trained specifically on BoneTalk voice/EMG-alignment data
└── exported/    # Optimized, deployment-ready formats for client runtime or edge inference
```

### Supported Future Formats
- **ONNX (`.onnx`)**: Cross-platform runtime for web and native inference.
- **TensorFlow Lite (`.tflite`)**: Quantized models for microcontroller/edge execution.
- **PyTorch (`.pt`, `.pth`)**: Research checkpoints, state dictionaries, and torchscript models.
- **Binary/Weights (`.bin`)**: Quantized weight matrices for specialized audio engines.

---

## Training Data Workflow

```
Raw Audio / Speech Data
         │
         ▼
Inspection & Integrity Check (Sample Rate, Channels, Duration, SNR)
         │
         ▼
Metadata Manifest Registration (`data/metadata/`)
         │
         ▼
Preprocessing & Normalization (`data/processed/`)
         │
         ▼
Train / Validation / Test Splitting
```

---

## Processing Workflow

1. **Intake**: Place original audio archives into `src/voice/data/raw/<dataset-name>/`.
2. **Analysis**: Extract metadata (sampling rate, bit depth, channel configuration, speaker identities).
3. **Conditioning**:
   - Resample to target sampling rate (e.g., 16000 Hz or 24000 Hz).
   - Convert to single-channel (mono) floating point PCM.
   - Apply spectral gating / background noise reduction if specified.
4. **Target Alignment**: Generate phoneme/text label mappings under `data/labels/`.

---

## Deployment Workflow

1. **Model Validation**: Benchmark candidate checkpoint in `models/trained/` on held-out test evaluation set.
2. **Optimization**: Export model to target format (e.g. ONNX INT8 or FP16) into `models/exported/`.
3. **Configuration**: Register model paths, inference hyperparameters, and vocabulary in `config/voiceConfig.ts`.
4. **Integration**: Connect exported models to the voice inference services.

---

## Integration Notes

- **Isolation**: This module is intentionally decoupled from the existing marketing website, Model Control dashboard, and MQTT services.
- **Zero Mocking**: No mock audio or synthetic prediction pipelines should be placed here.
- **Web Speech vs. Neural Voice**: Native Web Speech synthesis remains in `src/lib/speechService.ts` for browser playback, while `src/voice/` is reserved for specialized AI neural voice models and dataset pipelines.
