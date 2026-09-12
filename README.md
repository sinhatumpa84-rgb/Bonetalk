# BoneTalk

An assistive communication system leveraging facial Electromyography (EMG) to enable silent speech recognition. BoneTalk translates subtle muscle movements into text or synthesized speech, providing a communication channel for individuals with vocal impairments.

## Architecture

```text
[ User / ESP32-S3 Hardware ] ---> (EMG Signals over WiFi/BLE) ---> [ Backend (FastAPI) ]
                                                                       |
                                                                       v
                                                           [ ML Inference Pipeline ]
                                                           (Preprocess -> Features -> Predict)
                                                                       |
                                                                       v
[ Frontend (React/Vite) ] <--- (Predictions via REST/WebSocket) <------/
```

## Prerequisites
*   Python 3.10+
*   Node.js (v16+)
*   npm or yarn

## Installation

1.  **Clone the repository**
2.  **Backend & ML Requirements:**
    ```bash
    pip install -r backend/requirements.txt
    pip install -r ml/requirements.txt
    ```
3.  **Frontend Requirements:**
    ```bash
    cd "bone talk"
    npm install
    ```

## Dataset Setup

This project uses the UC Berkeley Silent Speech EMG Dataset.

1.  Download `emg_data.tar.gz` from [Zenodo (DOI: 10.5281/zenodo.4064409)](https://doi.org/10.5281/zenodo.4064409).
2.  Extract the archive.
3.  Place the extracted `emg_data` folder in `ml/data/raw/`.

## Commands

All commands run from the `Bonetalk/` directory:

```bash
# 1. Download & verify dataset (prints instructions if file missing)
python ml/scripts/download_dataset.py

# 2. Inspect dataset structure
python ml/scripts/inspect_dataset.py

# 3. Search for target words in dataset
python ml/scripts/search_target_words.py

# 4. Train the model
python ml/train.py

# 5. Evaluate on held-out test set
python ml/evaluate.py

# 6. Run a prediction on a single sample
python ml/predict.py --random-test

# 7. Record your own EMG data
python -m ml.collection.recorder

# 8. Start the backend API
cd backend && uvicorn main:app --reload --port 8000

# 9. Start the frontend
cd "bone talk" && npm run dev
```

## Project Structure
```
Bonetalk/
├── backend/            # FastAPI server and inference code
├── bone talk/          # React frontend application
├── docs/               # Documentation (Dataset, Hardware, Splitting)
├── ml/                 # Machine learning pipeline (preprocessing, features, training)
│   ├── data/           # Raw and processed datasets (ignored in git)
│   ├── models/         # Trained models and normalizers (ignored in git)
│   ├── src/            # Source code for ML logic
│   └── scripts/        # Entry points for ML tasks
├── README.md           # Project documentation
└── .gitignore          # Ignored files
```

## Hardware Setup (ESP32-S3)
*Instructions for the custom ESP32-S3 hardware will be added here once finalized. Refer to `docs/HARDWARE_DIFFERENCES.md` for current constraints.*

## User Data Collection
To calibrate the model for a specific user on the BoneTalk hardware:
1. Ensure the device is properly fitted.
2. Run the calibration script (to be implemented) which will prompt the user to silently articulate specific target words.
3. Use the resulting data to fine-tune the base model.

## Limitations
*   **Single-Subject Dataset:** The base model is trained on a single subject from the research dataset. It will require calibration/fine-tuning for new users.
*   **Continuous Speech:** The target vocabulary words in the research dataset are extracted from continuous sentences, not isolated recordings. This makes word boundary detection and classification challenging.
*   **Hardware Gap:** There is a significant difference between the clinical-grade 24-bit 1000Hz research hardware and the target consumer ESP32-S3 hardware (see `docs/HARDWARE_DIFFERENCES.md`).

## License
MIT License. 

**Dataset Citation:** Gaddy, David. "Digital Voicing of Silent Speech." EMNLP 2020. [DOI: 10.5281/zenodo.4064409](https://doi.org/10.5281/zenodo.4064409). Dataset licensed under CC BY 4.0.
