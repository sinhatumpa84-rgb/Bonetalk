import os
import time
import json
import uuid
import numpy as np
from pathlib import Path
import sys

# Add parent directory to path to import hardware
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from hardware.esp32_interface import ESP32Interface

MVP_WORDS = ["REST", "YES", "NO", "HELP", "WATER"]
USER_RECORDINGS_DIR = Path(__file__).resolve().parent.parent / "data" / "user_recordings"

def main():
    print("BoneTalk EMG Recorder")
    
    config_path = Path(__file__).resolve().parent.parent / "hardware" / "hardware_config.json"
    
    mode = input("Select mode (1: Serial, 2: Simulation): ").strip()
    if mode == "2":
        print("WARNING: RUNNING IN SIMULATED MODE (NOT FOR REAL TRAINING)")
        # For simulation we will use the MockESP32 provided in esp32_interface
        # But here we'll just instantiate ESP32Interface with a mock flag if implemented,
        # or we will handle simulation logic internally.
    
    try:
        esp32 = ESP32Interface(str(config_path))
        if mode == "2":
            esp32.is_simulation = True
        esp32.connect()
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    session_id = str(uuid.uuid4())
    subject_id = "user_1"
    
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    sampling_rate = config["device"]["sampling_rate"]
    channels = config["device"]["num_channels"]
    
    while True:
        print("\nAvailable Labels:")
        for i, word in enumerate(MVP_WORDS):
            print(f"{i+1}. {word}")
        print("c. Add Custom Label")
        print("q. Quit")
        
        choice = input("Select an option: ").strip()
        if choice.lower() == 'q':
            break
        elif choice.lower() == 'c':
            custom = input("Enter custom label: ").strip().upper()
            if custom not in MVP_WORDS:
                MVP_WORDS.append(custom)
            label = custom
        else:
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(MVP_WORDS):
                    label = MVP_WORDS[idx]
                else:
                    print("Invalid selection.")
                    continue
            except ValueError:
                print("Invalid input.")
                continue
                
        input(f"Ready to record label '{label}'. Press Enter to start...")
        print("Recording... Press Enter to stop.")
        
        recording_data = []
        is_recording = True
        
        def callback(sample):
            if is_recording:
                recording_data.append(sample)
                
        esp32.stream(callback)
        input()
        is_recording = False
        esp32.stop_stream()
        
        data_array = np.array(recording_data)
        if len(data_array) == 0:
            print("No data recorded.")
            continue
            
        print(f"Recorded {len(data_array)} samples.")
        
        save_dir = USER_RECORDINGS_DIR / label
        save_dir.mkdir(parents=True, exist_ok=True)
        
        rec_id = str(uuid.uuid4())
        
        np.save(save_dir / f"{rec_id}_emg.npy", data_array)
        
        meta = {
            "subject_id": subject_id,
            "session_id": session_id,
            "label": label,
            "timestamp": time.time(),
            "sampling_rate": sampling_rate,
            "channel_count": channels,
            "recording_id": rec_id,
            "duration_seconds": len(data_array) / sampling_rate,
            "is_synthetic": mode == "2"
        }
        
        with open(save_dir / f"{rec_id}_meta.json", "w") as f:
            json.dump(meta, f, indent=4)
            
        print(f"Saved recording {rec_id} to {save_dir}")

    esp32.disconnect()
    
if __name__ == "__main__":
    main()
