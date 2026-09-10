"""
tile_parser.py
==============
Track B Step 2: Parse downloaded PNG tiles to extract land parcel centroids.

Process:
  1. Load each tile PNG (256x256 pixels)
  2. Detect parcel boundary lines (thin dark lines on white/light background)
  3. Find contours = individual parcel polygons
  4. Compute centroid of each contour
  5. Convert pixel (x,y) → GPS (lat, lon)
  6. Return list of unique centroid coordinates to query /land-info

Expected tile visual:
  - White/light background
  - Thin red/black lines marking parcel boundaries
  - Each closed polygon = 1 land parcel
"""

import cv2
import numpy as np
import math
import json
from pathlib import Path
from tqdm import tqdm
from typing import Generator


# ------------------------------------------------------------------
# Tile math (must match tile_downloader.py)
# ------------------------------------------------------------------
def pixel_to_latlng(
    px: float, py: float, z: int, tile_x: int, tile_y: int
) -> tuple[float, float]:
    """Convert pixel position within a tile to WGS84 lat/lon."""
    n = 2 ** z
    global_px = tile_x * 256 + px
    global_py = tile_y * 256 + py
    lon = (global_px / (256 * n)) * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1.0 - 2.0 * global_py / (256 * n))))
    lat = math.degrees(lat_rad)
    return lat, lon


# ------------------------------------------------------------------
# Tile analysis
# ------------------------------------------------------------------
def extract_centroids_from_tile(
    img_path: Path, zoom: int, tile_x: int, tile_y: int,
    min_area_px: int = 50,
    max_area_px: int = 50000,
) -> list[tuple[float, float]]:
    """
    Parse a single cadastral tile PNG and extract parcel centroids.

    Args:
        img_path:     Path to the tile PNG file.
        zoom:         Zoom level (e.g., 16).
        tile_x:       Tile X coordinate.
        tile_y:       Tile Y coordinate.
        min_area_px:  Ignore contours smaller than this (noise).
        max_area_px:  Ignore contours larger than this (tile border).

    Returns:
        List of (lat, lon) centroid coordinates.
    """
    img = cv2.imread(str(img_path))
    if img is None:
        return []

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Strategy 1: Detect dark boundary lines on light background
    # Threshold: pixels darker than 180 = boundary lines
    _, binary_lines = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY_INV)

    # Dilate slightly to close small gaps in boundary lines
    kernel = np.ones((2, 2), np.uint8)
    dilated = cv2.dilate(binary_lines, kernel, iterations=1)

    # Flood-fill enclosed regions to find parcel interiors
    # Invert: boundary lines become walls, parcel interiors become blobs
    flooded = cv2.bitwise_not(dilated)

    # Find connected components (each = one parcel interior)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
        flooded, connectivity=8
    )

    results = []

    for i in range(1, num_labels):  # Skip label 0 = background
        area = stats[i, cv2.CC_STAT_AREA]

        # Filter by area: ignore tiny noise and giant tile-spanning regions
        if area < min_area_px or area > max_area_px:
            continue

        # Get centroid pixel position
        cx = centroids[i][0]
        cy = centroids[i][1]

        # Convert pixel to GPS
        lat, lon = pixel_to_latlng(cx, cy, zoom, tile_x, tile_y)
        results.append((lat, lon))

    return results


# ------------------------------------------------------------------
# Strategy 2: Contour-based (fallback for different tile styles)
# ------------------------------------------------------------------
def extract_centroids_contour(
    img_path: Path, zoom: int, tile_x: int, tile_y: int,
    min_area_px: int = 100,
) -> list[tuple[float, float]]:
    """Alternative contour-based parser (better for colored boundary lines)."""
    img = cv2.imread(str(img_path))
    if img is None:
        return []

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Edge detection
    edges = cv2.Canny(gray, 30, 100)
    kernel = np.ones((3, 3), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=1)

    contours, _ = cv2.findContours(edges, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)

    results = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < min_area_px:
            continue

        M = cv2.moments(cnt)
        if M["m00"] == 0:
            continue

        cx = M["m10"] / M["m00"]
        cy = M["m01"] / M["m00"]
        lat, lon = pixel_to_latlng(cx, cy, zoom, tile_x, tile_y)
        results.append((lat, lon))

    return results


# ------------------------------------------------------------------
# Analyze a tile to detect its style
# ------------------------------------------------------------------
def detect_tile_style(img_path: Path) -> str:
    """Detect whether tile uses red lines, black lines, or is empty."""
    img = cv2.imread(str(img_path))
    if img is None:
        return "empty"

    b, g, r = cv2.split(img)
    avg_r = float(np.mean(r))
    avg_g = float(np.mean(g))
    avg_b = float(np.mean(b))
    avg_brightness = float(np.mean(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)))

    if avg_brightness > 245:
        return "empty_white"
    if avg_r > avg_g + 20 and avg_r > avg_b + 20:
        return "red_lines"
    return "dark_lines"


# ------------------------------------------------------------------
# Batch process all tiles
# ------------------------------------------------------------------
def parse_all_tiles(
    tile_dir: Path,
    zoom: int,
    output_file: Path,
    sample_tile_path: Path | None = None,
) -> int:
    """
    Parse all tiles in tile_dir and save centroid coordinates to output_file.

    Returns total number of unique centroids found.
    """
    tile_files = list(tile_dir.glob("*.png"))
    print(f"\n[Parser] Found {len(tile_files)} tile files in {tile_dir}")

    if not tile_files:
        print("[Parser] No tiles found. Run tile_downloader.py first.")
        return 0

    # Detect tile style from first available tile
    style = detect_tile_style(tile_files[0])
    print(f"[Parser] Detected tile style: {style}")

    # Sample tile preview info
    if sample_tile_path and tile_files:
        sample = tile_files[0]
        img = cv2.imread(str(sample))
        if img is not None:
            print(f"[Parser] Sample tile size: {img.shape[1]}x{img.shape[0]} px")

    all_centroids: set[tuple[float, float]] = set()
    errors = 0

    with tqdm(total=len(tile_files), desc="Parsing tiles", unit="tile") as pbar:
        for tile_path in tile_files:
            # Parse filename to get tile_x, tile_y
            # Format: {tile_x}_{tile_y}.png
            try:
                parts = tile_path.stem.split("_")
                tile_x = int(parts[0])
                tile_y = int(parts[1])
            except (ValueError, IndexError):
                pbar.update(1)
                continue

            # Extract centroids
            try:
                if style == "red_lines":
                    centroids = extract_centroids_contour(tile_path, zoom, tile_x, tile_y)
                else:
                    centroids = extract_centroids_from_tile(tile_path, zoom, tile_x, tile_y)

                all_centroids.update(centroids)
            except Exception as e:
                errors += 1
                if errors < 5:
                    print(f"[Parser] Error on {tile_path.name}: {e}")

            pbar.update(1)

    print(f"\n[Parser] Total unique centroids found: {len(all_centroids)}")
    print(f"[Parser] Parse errors: {errors}")

    # Save centroids as JSON
    output_file.parent.mkdir(parents=True, exist_ok=True)
    centroid_list = [{"lat": lat, "lon": lon} for lat, lon in all_centroids]

    with open(output_file, "w") as f:
        json.dump(centroid_list, f)

    print(f"[Parser] Saved centroids to: {output_file}")
    return len(all_centroids)


# ------------------------------------------------------------------
# CLI
# ------------------------------------------------------------------
if __name__ == "__main__":
    import sys

    zoom     = int(sys.argv[1]) if len(sys.argv) > 1 else 16
    tile_dir = Path(f"data/tiles/z{zoom}")
    out_file = Path(f"data/centroids_z{zoom}.json")

    total = parse_all_tiles(tile_dir, zoom, out_file)
    print(f"\nResult: {total} parcel centroids extracted → {out_file}")
