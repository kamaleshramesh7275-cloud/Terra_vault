"""
Terra_vault — Deploy Fine-Tuned TrOCR Weights
==============================================
Run this AFTER downloading trocr_land_deed_finetuned.zip from Colab.

Usage:
    python scripts/deploy_model.py --zip path/to/trocr_land_deed_finetuned.zip

What it does:
  1. Backs up the current model weights (model.safetensors.bak)
  2. Extracts the new fine-tuned weights into ml_models/trocr_land_deed/
  3. Verifies the required files are present
  4. Prints a reminder to restart the backend
"""

import argparse
import os
import shutil
import zipfile
from datetime import datetime
from pathlib import Path

ROOT       = Path(__file__).parent.parent
MODEL_DIR  = ROOT / "ml_models" / "trocr_land_deed"
BACKUP_DIR = ROOT / "ml_models" / "trocr_land_deed_backup"

REQUIRED_FILES = [
    "model.safetensors",
    "config.json",
    "tokenizer_config.json",
    "vocab.json",
    "merges.txt",
]


def main():
    parser = argparse.ArgumentParser(description="Deploy fine-tuned TrOCR weights")
    parser.add_argument("--zip", required=True, help="Path to trocr_land_deed_finetuned.zip")
    args = parser.parse_args()

    zip_path = Path(args.zip)
    if not zip_path.exists():
        print(f"[ERROR] Zip file not found: {zip_path}")
        return 1

    # Step 1: Backup current weights
    if MODEL_DIR.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup = BACKUP_DIR.parent / f"trocr_land_deed_backup_{timestamp}"
        shutil.copytree(MODEL_DIR, backup)
        print(f"[BACKUP] Current weights backed up to: {backup.name}")

    # Step 2: Extract new weights
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\nExtracting {zip_path.name} -> {MODEL_DIR}")
    with zipfile.ZipFile(zip_path, "r") as zf:
        for member in zf.namelist():
            fname = Path(member).name
            if fname:   # skip directory entries
                data = zf.read(member)
                out_path = MODEL_DIR / fname
                with open(out_path, "wb") as f:
                    f.write(data)
                size_mb = len(data) / 1e6
                print(f"   {fname:45s}  {size_mb:7.1f} MB")

    # Step 3: Verify required files
    print("\nVerifying required files:")
    all_ok = True
    for fname in REQUIRED_FILES:
        path = MODEL_DIR / fname
        if path.exists():
            size_mb = path.stat().st_size / 1e6
            print(f"   [OK] {fname:45s}  {size_mb:.1f} MB")
        else:
            print(f"   [MISSING] {fname}")
            all_ok = False

    if not all_ok:
        print("\n[WARNING] Some files are missing. The model may not load correctly.")
    else:
        print(f"\n[DONE] All files deployed to: {MODEL_DIR}")
        print("\nNext steps:")
        print("  1. Restart the backend:")
        print("       uvicorn backend.api.main:app --reload")
        print("  2. Check logs for:  trocr.loaded_custom_fine_tuned")
        print("  3. Upload a test document and verify field extraction improved")

    return 0


if __name__ == "__main__":
    main()
