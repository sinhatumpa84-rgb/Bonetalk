import json
from pathlib import Path
import numpy as np

def load_emg_sample(sample_path: Path) -> tuple[np.ndarray, dict]:
    """
    Loads an EMG sample array and its associated metadata.
    
    Args:
        sample_path: Path to the .npy file containing EMG data.
        
    Returns:
        Tuple of (emg_data, info_metadata).
    """
    emg_path = str(sample_path)
    info_path = emg_path.replace("_emg.npy", "_info.json")
    
    try:
        emg = np.load(emg_path)
        with open(info_path, 'r') as f:
            info = json.load(f)
        return emg, info
    except Exception as e:
        raise RuntimeError(f"Failed to load sample {sample_path}: {e}")

def load_dataset(data_dir: Path, subdirs: list[str]) -> list[dict]:
    """
    Loads the dataset from specified subdirectories.
    
    Args:
        data_dir: Base directory containing dataset subdirectories.
        subdirs: List of subdirectories to search for samples.
        
    Returns:
        List of dictionaries with sample details.
    """
    dataset = []
    for subdir in subdirs:
        subdir_path = data_dir / subdir
        if not subdir_path.exists():
            print(f"Warning: Directory {subdir_path} not found.")
            continue
            
        for emg_file in subdir_path.rglob("*_emg.npy"):
            try:
                emg, info = load_emg_sample(emg_file)
                
                # Skip reference signals
                if info.get('sentence_index') == -1:
                    continue
                    
                dataset.append({
                    'emg': emg,
                    'info': info,
                    'subdir': subdir,
                    'sample_id': emg_file.name.replace('_emg.npy', ''),
                    'file_path': str(emg_file)
                })
            except RuntimeError as e:
                print(f"Error loading {emg_file}: {e}")
                
    return dataset

def validate_emg(emg: np.ndarray, expected_channels: int) -> bool:
    """
    Validates that the EMG data has the correct number of channels.
    
    Args:
        emg: EMG data array.
        expected_channels: Number of expected channels.
        
    Returns:
        Boolean indicating validity.
    """
    if emg is None or not isinstance(emg, np.ndarray):
        return False
    if len(emg.shape) != 2:
        return False
    if emg.shape[1] != expected_channels:
        return False
    return True
