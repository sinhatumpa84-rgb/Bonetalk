import os
import json
import numpy as np
from pathlib import Path

def main():
    base_dir = Path(__file__).resolve().parent.parent / 'data' / 'raw' / 'emg_data'
    metadata_dir = Path(__file__).resolve().parent.parent / 'data' / 'metadata'
    metadata_dir.mkdir(parents=True, exist_ok=True)
    
    if not base_dir.exists():
        print(f"Dataset directory {base_dir} does not exist.")
        return
        
    stats = {
        'total_recordings': 0,
        'silent_recordings': 0,
        'vocalized_recordings': 0,
        'reference_signals_skipped': 0,
        'total_duration_hours': 0.0,
        'channels': 0,
        'sampling_rate': 1000,
        'subjects': 1,
        'available_labels': 0,
        'samples_per_subdir': {}
    }
    
    unique_prompts = set()
    total_frames = 0
    checked_channels = False
    
    for subdir in base_dir.iterdir():
        if subdir.is_dir():
            stats['samples_per_subdir'][subdir.name] = 0
            
            for info_file in subdir.rglob('*_info.json'):
                with open(info_file, 'r') as f:
                    try:
                        info = json.load(f)
                    except json.JSONDecodeError:
                        continue
                
                if info.get('sentence_index', 0) == -1:
                    stats['reference_signals_skipped'] += 1
                    continue
                
                stats['total_recordings'] += 1
                stats['samples_per_subdir'][subdir.name] += 1
                
                if subdir.name == 'silent_parallel_data':
                    stats['silent_recordings'] += 1
                elif subdir.name in ('nonparallel_data', 'voiced_parallel_data'):
                    stats['vocalized_recordings'] += 1
                    
                prompt = info.get('text', '')
                if prompt:
                    unique_prompts.add(prompt)
                    
                emg_file = info_file.with_name(info_file.stem.replace('_info', '_emg.npy'))
                if emg_file.exists():
                    try:
                        emg_data = np.load(emg_file)
                        total_frames += emg_data.shape[0]
                        if not checked_channels:
                            stats['channels'] = emg_data.shape[1]
                            checked_channels = True
                    except Exception as e:
                        print(f"Error reading {emg_file}: {e}")
                        
    stats['available_labels'] = len(unique_prompts)
    stats['total_duration_hours'] = total_frames / stats['sampling_rate'] / 3600
    
    report_file = metadata_dir / 'dataset_report.json'
    with open(report_file, 'w') as f:
        json.dump(stats, f, indent=4)
        
    print(json.dumps(stats, indent=4))

if __name__ == '__main__':
    main()
