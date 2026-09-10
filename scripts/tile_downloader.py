"""
tile_downloader.py
==================
Track B Step 1: Download TNGIS cadastral XYZ map tiles for Coimbatore district.

Tile URL:
  https://tngis.tn.gov.in/data/xyz_tiles/cadastral_xyz/{z}/{x}/{y}.png

Coimbatore district bounding box (WGS84):
  North: 11.235  South: 10.260
  East:  77.585  West:  76.650

At zoom=16, ~1,600 tiles cover the entire district.
"""

import asyncio
import math
import os
import httpx
from pathlib import Path
from tqdm import tqdm

# ------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------
TILE_BASE_URL = "https://tngis.tn.gov.in/data/xyz_tiles/cadastral_xyz"
ZOOM          = 16

# Coimbatore district bounding box
CBE_NORTH = 11.235
CBE_SOUTH = 10.260
CBE_EAST  = 77.585
CBE_WEST  = 76.650

# Output directory
TILE_DIR = Path("data/tiles/z{z}".format(z=ZOOM))

# Polite rate limiting: 3 tiles/second to not hammer the server
MAX_CONCURRENT = 5
DELAY_BETWEEN  = 0.35   # seconds between requests per worker

BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/127.0.0.0 Safari/537.36"
    ),
    "Referer": "https://tngis.tn.gov.in/apps/gi_viewer/map-viewer/index.html",
    "Accept":  "image/png,image/*,*/*",
}


# ------------------------------------------------------------------
# Tile math (Web Mercator / Slippy Map)
# ------------------------------------------------------------------
def deg2tile(lat_deg: float, lon_deg: float, zoom: int) -> tuple[int, int]:
    """Convert WGS84 lat/lon to XYZ tile coordinates at the given zoom."""
    lat_rad = math.radians(lat_deg)
    n = 2 ** zoom
    x = int((lon_deg + 180.0) / 360.0 * n)
    y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return x, y


def tile2deg(tile_x: int, tile_y: int, zoom: int) -> tuple[float, float]:
    """Convert tile coordinates to the NW corner lat/lon."""
    n = 2 ** zoom
    lon = tile_x / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * tile_y / n)))
    lat = math.degrees(lat_rad)
    return lat, lon


def pixel_to_latlng(px: float, py: float, z: int, tile_x: int, tile_y: int) -> tuple[float, float]:
    """Convert pixel position within a tile to WGS84 lat/lon."""
    n = 2 ** z
    global_px = tile_x * 256 + px
    global_py = tile_y * 256 + py
    lon = (global_px / (256 * n)) * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1.0 - 2.0 * global_py / (256 * n))))
    lat = math.degrees(lat_rad)
    return lat, lon


def get_tile_range(north, south, east, west, zoom):
    """Get the X/Y tile range covering a bounding box."""
    x_min, y_max = deg2tile(south, west, zoom)
    x_max, y_min = deg2tile(north, east, zoom)
    return x_min, x_max, y_min, y_max


# ------------------------------------------------------------------
# Downloader
# ------------------------------------------------------------------
async def download_tile(
    client: httpx.AsyncClient,
    z: int,
    x: int,
    y: int,
    out_dir: Path,
    semaphore: asyncio.Semaphore,
    pbar: tqdm,
) -> bool:
    """Download a single tile, returns True if downloaded/cached."""
    tile_path = out_dir / f"{x}_{y}.png"
    if tile_path.exists():
        pbar.update(1)
        return True

    url = f"{TILE_BASE_URL}/{z}/{x}/{y}.png"

    async with semaphore:
        try:
            await asyncio.sleep(DELAY_BETWEEN)
            resp = await client.get(url, headers=BROWSER_HEADERS)

            if resp.status_code == 403:
                # Tile blocked — server requires auth for tiles
                return False
            if resp.status_code == 404:
                # No tile data (outside coverage) — skip silently
                pbar.update(1)
                return True
            if resp.status_code == 429:
                await asyncio.sleep(10)
                pbar.update(1)
                return False

            resp.raise_for_status()

            tile_path.write_bytes(resp.content)
            pbar.update(1)
            return True

        except Exception as e:
            print(f"[Tile] Error {z}/{x}/{y}: {e}")
            pbar.update(1)
            return False


async def download_all_tiles(zoom: int = ZOOM) -> dict:
    """
    Download all cadastral tiles for Coimbatore district.

    Returns stats dict with tile counts.
    """
    x_min, x_max, y_min, y_max = get_tile_range(
        CBE_NORTH, CBE_SOUTH, CBE_EAST, CBE_WEST, zoom
    )

    out_dir = Path(f"data/tiles/z{zoom}")
    out_dir.mkdir(parents=True, exist_ok=True)

    total = (x_max - x_min + 1) * (y_max - y_min + 1)

    print(f"\n[Tiles] Zoom={zoom}")
    print(f"[Tiles] X range: {x_min} -> {x_max}  ({x_max-x_min+1} tiles wide)")
    print(f"[Tiles] Y range: {y_min} -> {y_max}  ({y_max-y_min+1} tiles tall)")
    print(f"[Tiles] Total tiles: {total}")
    print(f"[Tiles] Output dir: {out_dir.resolve()}\n")

    # First test if tiles are accessible at all
    print("[Tiles] Testing tile accessibility...")
    test_x = (x_min + x_max) // 2
    test_y = (y_min + y_max) // 2
    test_url = f"{TILE_BASE_URL}/{zoom}/{test_x}/{test_y}.png"
    print(f"[Tiles] Test tile: {test_url}")

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(test_url, headers=BROWSER_HEADERS)
            print(f"[Tiles] Test response: HTTP {resp.status_code}, size={len(resp.content)} bytes")

            if resp.status_code == 403:
                print("[Tiles] BLOCKED (403) — tiles require browser session cookie")
                print("[Tiles] Switching to Track A (coordinate grid walk)...")
                return {"blocked": True, "total": total}

            if resp.status_code in (200, 404):
                print("[Tiles] ACCESSIBLE — proceeding with full download")
        except Exception as e:
            print(f"[Tiles] Connection test failed: {e}")
            return {"blocked": True, "error": str(e)}

    # Full download
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)
    downloaded = 0
    blocked    = 0

    tasks = [
        (zoom, x, y)
        for x in range(x_min, x_max + 1)
        for y in range(y_min, y_max + 1)
    ]

    with tqdm(total=total, desc="Downloading tiles", unit="tile") as pbar:
        async with httpx.AsyncClient(timeout=20) as client:
            coros = [
                download_tile(client, z, x, y, out_dir, semaphore, pbar)
                for z, x, y in tasks
            ]
            results = await asyncio.gather(*coros, return_exceptions=True)

    downloaded = sum(1 for r in results if r is True)
    errors     = sum(1 for r in results if r is False)

    print(f"\n[Tiles] Downloaded: {downloaded}/{total}")
    print(f"[Tiles] Errors/Blocked: {errors}")

    return {
        "blocked":    False,
        "total":      total,
        "downloaded": downloaded,
        "errors":     errors,
        "dir":        str(out_dir.resolve()),
    }


if __name__ == "__main__":
    import sys
    zoom = int(sys.argv[1]) if len(sys.argv) > 1 else ZOOM
    result = asyncio.run(download_all_tiles(zoom))
    print(f"\nResult: {result}")
