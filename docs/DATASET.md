# UC Berkeley Silent Speech EMG Dataset

**Citation:** Gaddy, David. "Digital Voicing of Silent Speech." EMNLP 2020.
**DOI:** [10.5281/zenodo.4064409](https://doi.org/10.5281/zenodo.4064409)
**License:** CC BY 4.0

## Description
This dataset contains synchronized facial electromyography (EMG) and audio recordings during both silent and vocalized speech. It was designed to support research in digital voicing of silent speech.

## Specifications
*   **Subject:** 1 participant
*   **Channels:** 8
*   **Sampling Rate:** 1000 Hz
*   **Duration:** ~18.6 hours total
*   **Hardware:** OpenBCI Cyton board with gold-plated cup electrodes

## Directory Structure
The dataset is extracted to `emg_data/` with the following subdirectories:
*   `nonparallel_data/`
*   `silent_parallel_data/`
*   `voiced_parallel_data/`

## File Formats
Each sample consists of several files with a common numeric prefix `{i}`:
*   `{i}_emg.npy`: EMG data array of shape (T × 8)
*   `{i}_audio.flac`: Original audio recording
*   `{i}_audio_clean.flac`: Cleaned/processed audio
*   `{i}_info.json`: Metadata, including transcript and `sentence_index`
*   `{i}_button.npy`: Synchronization button press data

## Vocabularies
*   **Closed Vocabulary:** 67 words derived from date and time templates.
*   **Open Vocabulary:** 9,828 words from Project Gutenberg books.
*   *Note on Target Words:* Common target words for communication devices (e.g., YES, NO, HELP, WATER, STOP) are present as parts of continuous sentences, not as isolated recordings.

## Important Notes
*   `sentence_index == -1`: This indicates a reference signal or invalid trial and should be skipped during processing.

## Setup Instructions
1. Download `emg_data.tar.gz` (3.9 GB) from the Zenodo link above.
2. Extract the archive.
3. Place the `emg_data` folder in the appropriate raw data directory for preprocessing.
