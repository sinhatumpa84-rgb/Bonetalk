import os
import hashlib
import tarfile
import sys

DATASET_URL = "https://zenodo.org/records/4064409/files/emg_data.tar.gz?download=1"
EXPECTED_MD5 = "7f97d2182b896652999b1b2d0c69fd7b"
FILE_SIZE = "3.9 GB"
RAW_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "raw"))
TAR_FILE_PATH = os.path.join(RAW_DATA_DIR, "emg_data.tar.gz")

def print_instructions():
    print(f"--- BoneTalk Dataset Download Instructions ---")
    print(f"1. Download the file manually from: {DATASET_URL}")
    print(f"2. File size is approximately {FILE_SIZE}.")
    print(f"3. Place the downloaded 'emg_data.tar.gz' in this directory:")
    print(f"   {RAW_DATA_DIR}")
    print(f"4. Run this script again to verify MD5 checksum and extract.")
    print(f"Expected MD5: {EXPECTED_MD5}")
    print("-" * 46)

def calculate_md5(file_path: str) -> str:
    """Calculates the MD5 checksum of a file."""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def extract_tarfile(file_path: str, extract_path: str):
    """Extracts a tar.gz file with progress display."""
    print(f"Extracting {file_path} to {extract_path}...")
    with tarfile.open(file_path, "r:gz") as tar:
        members = tar.getmembers()
        total_members = len(members)
        for i, member in enumerate(members, 1):
            tar.extract(member, path=extract_path)
            # Simple progress reporting
            if i % 100 == 0 or i == total_members:
                sys.stdout.write(f"\rExtracted {i}/{total_members} files ({(i/total_members)*100:.1f}%)")
                sys.stdout.flush()
    print("\nExtraction complete.")

def main():
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    
    if not os.path.exists(TAR_FILE_PATH):
        print(f"Dataset file not found at: {TAR_FILE_PATH}")
        print_instructions()
        return

    print(f"Found dataset at: {TAR_FILE_PATH}")
    print(f"Verifying MD5 checksum... this may take a minute.")
    
    actual_md5 = calculate_md5(TAR_FILE_PATH)
    if actual_md5 != EXPECTED_MD5:
        print(f"ERROR: MD5 mismatch!")
        print(f"Expected: {EXPECTED_MD5}")
        print(f"Actual:   {actual_md5}")
        print("Please redownload the file.")
        return
        
    print("MD5 checksum verified successfully.")
    
    extracted_dir = os.path.join(RAW_DATA_DIR, "emg_data")
    if os.path.exists(extracted_dir):
        print(f"Dataset already appears to be extracted at {extracted_dir}.")
        choice = input("Do you want to re-extract? (y/n): ").strip().lower()
        if choice != 'y':
            print("Skipping extraction.")
            return

    extract_tarfile(TAR_FILE_PATH, RAW_DATA_DIR)
    
    print("\nSummary of extracted directory:")
    if os.path.exists(extracted_dir):
        subdirs = [d for d in os.listdir(extracted_dir) if os.path.isdir(os.path.join(extracted_dir, d))]
        print(f"Found subdirectories: {', '.join(subdirs)}")
    else:
        print("Extraction finished but expected 'emg_data' directory was not found. Please check contents manually.")

if __name__ == "__main__":
    main()
