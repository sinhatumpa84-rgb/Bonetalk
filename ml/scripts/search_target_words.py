import os
import json
import re
from pathlib import Path

def main():
    target_words = ["REST", "YES", "NO", "HELP", "WATER", "STOP", "PAIN", "PLEASE", "THANK YOU", "COME", "GO"]
    base_dir = Path(__file__).resolve().parent.parent / 'data' / 'raw' / 'emg_data'
    metadata_dir = Path(__file__).resolve().parent.parent / 'data' / 'metadata'
    metadata_dir.mkdir(parents=True, exist_ok=True)
    
    report = {word: {'available': False, 'count': 0, 'examples': [], 'subdirs': set(), 'files': []} for word in target_words}
    
    # REST is special baseline
    report["REST"]["available"] = True
    report["REST"]["count"] = -1
    report["REST"]["examples"] = ["(Silence/Baseline)"]
    
    if not base_dir.exists():
        print(f"Dataset directory {base_dir} does not exist.")
        return

    for subdir in base_dir.iterdir():
        if subdir.is_dir():
            for info_file in subdir.rglob('*_info.json'):
                with open(info_file, 'r') as f:
                    try:
                        info = json.load(f)
                    except json.JSONDecodeError:
                        continue
                
                if info.get('sentence_index', 0) == -1:
                    continue
                    
                text = info.get('text', '').upper()
                for word in target_words:
                    if word == "REST":
                        continue
                    # Regex for whole word match
                    if re.search(r'\b' + re.escape(word) + r'\b', text):
                        report[word]['available'] = True
                        report[word]['count'] += 1
                        if len(report[word]['examples']) < 3:
                            report[word]['examples'].append(text)
                        report[word]['subdirs'].add(subdir.name)
                        if len(report[word]['files']) < 10: # limit stored files
                            report[word]['files'].append(str(info_file))
                            
    # Convert sets to lists for JSON serialization
    for word in report:
        if isinstance(report[word].get('subdirs'), set):
            report[word]['subdirs'] = list(report[word]['subdirs'])
            
    report_file = metadata_dir / 'target_word_report.json'
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=4)
        
    print(json.dumps(report, indent=4))

if __name__ == '__main__':
    main()
