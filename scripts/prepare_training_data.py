"""
Terra_vault -- TrOCR Training Data Preparation Script
=====================================================
Runs locally (no GPU or Tesseract needed).

What this script does:
  1. Scans all images in data/pages/ and data/sample_ink_pages/
  2. Detects text line bounding boxes using OpenCV
  3. Crops each line to 384x64 (TrOCR canonical input size)
  4. Saves crops to data/trocr_train/images/
  5. Writes data/trocr_train/labels.jsonl with placeholder text
  6. Generates augmented variants of each crop (synthetic degradation)
  7. Saves a preview image of the first 12 crops for you to inspect

AFTER running this script:
  - Open data/trocr_train/preview_crops.png to see your crops
  - Open data/trocr_train/labels.jsonl in VS Code
  - Replace every "[NEEDS_LABEL]" with the correct text for that crop
    (only label crop_NNNNN.png lines; aug_* inherit the same label)
  - Run: python scripts/zip_for_colab.py

Usage:
    python scripts/prepare_training_data.py
"""

import os
import cv2
import json
import random
import numpy as np
from pathlib import Path
from tqdm import tqdm

# ── Config ────────────────────────────────────────────────────────────────────
ROOT          = Path(__file__).parent.parent
PAGES_DIRS    = [
    ROOT / "data" / "pages",
    ROOT / "data" / "sample_ink_pages",
]
OUT_IMAGES    = ROOT / "data" / "trocr_train" / "images"
LABELS_FILE   = ROOT / "data" / "trocr_train" / "labels.jsonl"
PREVIEW_FILE  = ROOT / "data" / "trocr_train" / "preview_crops.png"
TROCR_W, TROCR_H = 384, 64     # TrOCR canonical input size
MIN_LINE_W    = 60              # ignore very narrow blobs (likely noise)
MIN_LINE_H    = 10
MAX_LINE_H    = 100
MAX_CROPS_PER_PAGE = 20         # cap per page to avoid bloating
AUG_PER_CROP  = 3               # number of augmented variants per clean crop


# ── Line Detection ────────────────────────────────────────────────────────────

# Minimum ratio of dark pixels in a crop to accept it as real text
# (rejects blank lines, watermark-only crops, and border lines)
MIN_PIXEL_DENSITY = 0.01   # at least 1% of pixels must be dark
MAX_WIDTH_RATIO   = 0.90   # ignore blobs spanning >90% of page width (border rules)


def detect_text_line_boxes(gray: np.ndarray):
    """
    Detects real text line regions in Tamil land deed scans.
    Tuned for: beige/cream background, Tamil + English text,
    SPECIMEN watermarks, and horizontal border lines.

    Strategy:
      1. Crop away top/bottom 10% of page (usually blank or footer)
      2. Otsu threshold (works better than adaptive on uniform backgrounds)
      3. Dilate horizontally to merge characters into line blobs
      4. Filter out border rules (too wide) and noise (too narrow/short)
    """
    H, W = gray.shape

    # 1. Crop margins (top 10%, bottom 10%, left 5%, right 5%)
    y_start = int(H * 0.10)
    y_end   = int(H * 0.90)
    x_start = int(W * 0.05)
    x_end   = int(W * 0.95)
    roi = gray[y_start:y_end, x_start:x_end]

    # 2. Otsu global threshold (handles beige background well)
    _, binary = cv2.threshold(roi, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # 3. Remove very thin horizontal lines (border rules are 1-2px tall)
    h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, h_kernel)

    # 4. Dilate horizontally to join character strokes into word/line blobs
    d_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (45, 2))
    dilated = cv2.dilate(binary, d_kernel, iterations=2)

    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    boxes = []
    roi_w = x_end - x_start

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)

        # Re-map to original image coordinates
        abs_x = x + x_start
        abs_y = y + y_start

        # Filter by size
        if w < MIN_LINE_W or h < MIN_LINE_H or h > MAX_LINE_H:
            continue

        # Filter out page-spanning border lines
        if w / roi_w > MAX_WIDTH_RATIO:
            continue

        boxes.append((abs_x, abs_y, w, h))

    # Sort top-to-bottom
    boxes.sort(key=lambda b: b[1])
    return boxes


def crop_to_trocr(img_bgr: np.ndarray, x, y, w, h, pad=6) -> np.ndarray:
    """Crop a line region with padding and resize to TrOCR input (384x64).
    Returns None if the crop appears blank (watermark / border line).
    """
    H, W = img_bgr.shape[:2]
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(W, x + w + pad)
    y2 = min(H, y + h + pad)
    crop = img_bgr[y1:y2, x1:x2]
    if crop.size == 0:
        return None

    # Reject crops that are mostly blank (watermark, margin, or border rule)
    gray_crop = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    _, bin_crop = cv2.threshold(gray_crop, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    density = np.count_nonzero(bin_crop) / bin_crop.size
    if density < MIN_PIXEL_DENSITY:
        return None

    resized = cv2.resize(crop, (TROCR_W, TROCR_H), interpolation=cv2.INTER_LANCZOS4)
    return resized


# ── Augmentation ──────────────────────────────────────────────────────────────

def augment_crop(crop_bgr: np.ndarray, variant: int) -> np.ndarray:
    """Produces one synthetic degradation variant of a clean crop."""
    img = crop_bgr.copy()

    if variant == 0:
        # Gaussian noise (scanner noise)
        noise = np.random.normal(0, random.uniform(8, 20), img.shape).astype(np.int16)
        img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    elif variant == 1:
        # Ink bleed + brightness drop
        k = random.randint(1, 2)
        kernel = np.ones((k, k), np.uint8)
        img = cv2.dilate(img, kernel, iterations=1)
        img = cv2.convertScaleAbs(img, alpha=random.uniform(0.6, 0.85), beta=0)

    elif variant == 2:
        # JPEG artifacts + slight perspective warp
        _, buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, random.randint(30, 55)])
        img = cv2.imdecode(buf, cv2.IMREAD_COLOR)
        h, w = img.shape[:2]
        jitter = 5
        src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
        dst = np.float32([
            [random.uniform(0, jitter), random.uniform(0, jitter)],
            [w - random.uniform(0, jitter), random.uniform(0, jitter)],
            [w - random.uniform(0, jitter), h - random.uniform(0, jitter)],
            [random.uniform(0, jitter), h - random.uniform(0, jitter)],
        ])
        M = cv2.getPerspectiveTransform(src, dst)
        img = cv2.warpPerspective(img, M, (w, h), borderValue=(255, 255, 255))

    return img


# ── Preview Generator ─────────────────────────────────────────────────────────

def save_preview(crops: list, out_path: Path, max_crops: int = 12):
    """Saves a grid of the first N crops so you can visually inspect them."""
    crops = crops[:max_crops]
    if not crops:
        return
    rows = (len(crops) + 3) // 4
    grid_h = rows * (TROCR_H + 4)
    grid_w = 4 * (TROCR_W + 4)
    grid = np.ones((grid_h, grid_w, 3), dtype=np.uint8) * 200
    for i, crop in enumerate(crops):
        row = i // 4
        col = i % 4
        y0 = row * (TROCR_H + 4)
        x0 = col * (TROCR_W + 4)
        grid[y0:y0 + TROCR_H, x0:x0 + TROCR_W] = crop
    cv2.imwrite(str(out_path), grid)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    OUT_IMAGES.mkdir(parents=True, exist_ok=True)
    OUT_IMAGES.parent.mkdir(parents=True, exist_ok=True)

    records = []        # all {"file": ..., "text": ...} entries
    preview_crops = []  # first 12 crops for the preview image
    crop_idx = 0

    # Collect source images (prefer _inpainted / _ink_restored for clean training)
    source_images = []
    for src_dir in PAGES_DIRS:
        if src_dir.exists():
            for ext in ("*.png", "*.jpg", "*.jpeg"):
                source_images.extend(sorted(src_dir.glob(ext)))

    # Deduplicate: prefer enhanced versions
    seen = {}
    for p in source_images:
        stem = p.stem.replace("_inpainted", "").replace("_ink_restored", "")
        key  = (p.parent.name, stem)
        is_enhanced = "_inpainted" in p.name or "_ink_restored" in p.name
        if key not in seen or is_enhanced:
            seen[key] = p
    unique_images = sorted(seen.values())

    print(f"\n[OK] Found {len(unique_images)} unique document images")
    print(f"     Source dirs: {[str(d) for d in PAGES_DIRS if d.exists()]}")
    print(f"     Output    : {OUT_IMAGES}")
    print()

    total_detected = 0

    for img_path in tqdm(unique_images, desc="Detecting text lines"):
        img_bgr = cv2.imread(str(img_path))
        if img_bgr is None:
            continue

        # Convert to grayscale for detection (no CLAHE — it amplifies watermarks)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        boxes = detect_text_line_boxes(gray)
        boxes = boxes[:MAX_CROPS_PER_PAGE]   # cap per page

        for (x, y, w, h) in boxes:
            crop = crop_to_trocr(img_bgr, x, y, w, h)
            if crop is None:
                continue

            total_detected += 1

            # Save clean crop
            fname = f"crop_{crop_idx:05d}.png"
            cv2.imwrite(str(OUT_IMAGES / fname), crop)
            records.append({"file": fname, "text": "[NEEDS_LABEL]"})

            if len(preview_crops) < 12:
                preview_crops.append(crop)

            # Augmented variants — saved alongside clean crops in images/
            for v in range(AUG_PER_CROP):
                aug = augment_crop(crop, v)
                aug_fname = f"aug_{crop_idx:05d}_v{v}.png"
                cv2.imwrite(str(OUT_IMAGES / aug_fname), aug)
                # Augmented sample uses same placeholder label as the clean crop
                records.append({"file": aug_fname, "text": "[NEEDS_LABEL]"})

            crop_idx += 1

    # Write labels.jsonl
    with open(LABELS_FILE, "w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    # Save preview
    if preview_crops:
        save_preview(preview_crops, PREVIEW_FILE)

    clean_count = sum(1 for r in records if not r["file"].startswith("aug_"))
    aug_count   = len(records) - clean_count

    print(f"\n{'='*65}")
    print(f"[DONE] DATA PREPARATION COMPLETE")
    print(f"{'='*65}")
    print(f"  Pages processed   : {len(unique_images)}")
    print(f"  Text lines found  : {total_detected}")
    print(f"  Clean crops saved : {clean_count}")
    print(f"  Augmented crops   : {aug_count}")
    print(f"  Total samples     : {len(records)}")
    print(f"  Labels file       : {LABELS_FILE}")
    print(f"  Preview image     : {PREVIEW_FILE}")
    print(f"{'='*65}")
    print()
    print("[ACTION REQUIRED]")
    print(f"  1. Open {PREVIEW_FILE} to see your crops")
    print(f"  2. Open {LABELS_FILE} in VS Code")
    print(f"     Replace every \"[NEEDS_LABEL]\" with the correct text")
    print(f"     (you only need to label the crop_NNNNN.png lines,")
    print(f"      aug_* lines auto-inherit the same label)")
    print(f"  3. Run: python scripts/zip_for_colab.py")
    print()


if __name__ == "__main__":
    main()
