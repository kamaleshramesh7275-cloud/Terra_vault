"""
Terra_vault — Zip Training Data for Colab Upload
=================================================
Run this AFTER prepare_training_data.py to create a single zip
ready to upload to Google Colab.

Usage:
    python scripts/zip_for_colab.py

Output:
    data/trocr_train_for_colab.zip   ← upload this to Colab
"""

import os
import zipfile
from pathlib import Path

ROOT      = Path(__file__).parent.parent
TRAIN_DIR = ROOT / "data" / "trocr_train"
AUG_DIR   = ROOT / "data" / "synthetic_degraded"
OUT_ZIP   = ROOT / "data" / "trocr_train_for_colab.zip"


def main():
    if not TRAIN_DIR.exists():
        print("❌ data/trocr_train/ not found.")
        print("   Run: python scripts/prepare_training_data.py first")
        return

    labels_file = TRAIN_DIR / "labels.jsonl"
    if not labels_file.exists():
        print("❌ labels.jsonl not found in data/trocr_train/")
        print("   Run: python scripts/prepare_training_data.py first")
        return

    # Count samples
    import json
    with open(labels_file, encoding="utf-8") as f:
        samples = [json.loads(l) for l in f if l.strip()]

    print(f"Zipping {len(samples)} training samples...")

    with zipfile.ZipFile(OUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zf:
        # labels.jsonl
        zf.write(labels_file, "trocr_train/labels.jsonl")
        print(f"  + trocr_train/labels.jsonl")

        # images/
        images_dir = TRAIN_DIR / "images"
        img_count = 0
        if images_dir.exists():
            for img_path in sorted(images_dir.glob("*.png")):
                zf.write(img_path, f"trocr_train/images/{img_path.name}")
                img_count += 1
        print(f"  + trocr_train/images/ ({img_count} files)")

        # synthetic_degraded/
        aug_count = 0
        if AUG_DIR.exists():
            for img_path in sorted(AUG_DIR.glob("*.png")):
                zf.write(img_path, f"synthetic_degraded/{img_path.name}")
                aug_count += 1
        print(f"  + synthetic_degraded/ ({aug_count} files)")

    zip_mb = OUT_ZIP.stat().st_size / 1e6
    print(f"\n[OK] Zip created: {OUT_ZIP}")
    print(f"   Size: {zip_mb:.1f} MB")
    print(f"\n[NEXT] Upload this zip to Google Colab:")
    print(f"   Open notebooks/terravault_model_training.ipynb on colab.research.google.com")
    print(f"   Run Cell 1 -> Cell 2 -> Cell 3 (upload trocr_train_for_colab.zip)")


if __name__ == "__main__":
    main()
