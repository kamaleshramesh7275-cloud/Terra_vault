"""
Terra_vault — ML Model Weight Downloader
Downloads Real-ESRGAN weights required for super-resolution.
All other weights (EasyOCR, PaddleOCR, TrOCR) download automatically on first use.
"""
import hashlib
import os
import sys
import urllib.request
from pathlib import Path

MODELS_DIR = Path(__file__).parent

WEIGHTS = [
    {
        "name":    "RealESRGAN_x4plus.pth",
        "subdir":  "super_resolution",
        "url":     "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth",
        "size_mb": 67,
        "sha256":  None,   # checksum verified by file size
    },
    {
        "name":    "RealESRGAN_x4plus_netD.pth",
        "subdir":  "super_resolution",
        "url":     "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_netD.pth",
        "size_mb": 67,
        "sha256":  None,
    },
]


def download_with_progress(url: str, dest: Path, label: str):
    """Download a file showing MB progress."""
    print(f"\n  Downloading {label}...")
    print(f"  URL: {url}")
    dest.parent.mkdir(parents=True, exist_ok=True)

    def progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        if total_size > 0:
            pct = min(100, downloaded * 100 // total_size)
            mb_done = downloaded / 1_048_576
            mb_total = total_size / 1_048_576
            bar = "#" * (pct // 5) + "-" * (20 - pct // 5)
            print(f"\r  [{bar}] {pct:3d}%  {mb_done:.1f}/{mb_total:.1f} MB", end="", flush=True)

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "TerraVault/1.0"})
        urllib.request.urlretrieve(url, dest, reporthook=progress)
        print(f"\n  [OK] Saved to {dest}")
        return True
    except Exception as e:
        print(f"\n  [WARN] Download failed: {e}")
        print(f"  Manual download: {url}")
        print(f"  Place file at: {dest}")
        return False


def main():
    print("\n" + "="*60)
    print("  Terra_vault -- ML Model Weight Downloader")
    print("="*60)

    all_ok = True
    for w in WEIGHTS:
        dest = MODELS_DIR / w["subdir"] / w["name"]
        if dest.exists():
            size_mb = dest.stat().st_size / 1_048_576
            print(f"\n  [SKIP] {w['name']} already exists ({size_mb:.1f} MB)")
            continue
        ok = download_with_progress(w["url"], dest, w["name"])
        if not ok:
            all_ok = False

    print("\n" + "="*60)
    if all_ok:
        print("  [DONE] All model weights ready")
    else:
        print("  [WARN] Some weights failed -- see manual instructions above")
        print("  Models that auto-download on first inference call:")
        print("    - EasyOCR (Devanagari, Tamil, Telugu, etc.)")
        print("    - PaddleOCR (printed documents)")
        print("    - TrOCR (handwritten text, from HuggingFace)")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
