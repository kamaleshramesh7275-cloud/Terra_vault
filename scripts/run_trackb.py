"""
run_trackb.py
=============
Master runner for Track B — one command to run the entire pipeline.

Steps:
  1. Test tile accessibility
  2. Download tiles (or use existing)
  3. Parse tiles → extract centroids
  4. Run bulk scraper
  5. Print final stats

Usage:
  python run_trackb.py               # Full run
  python run_trackb.py --test        # Test mode (20 parcels only)
  python run_trackb.py --skip-tiles  # Skip download/parse, use existing centroids
"""

import asyncio
import argparse
import json
import sys
from pathlib import Path

from tile_downloader import download_all_tiles
from tile_parser import parse_all_tiles
from bulk_scraper import run_scraper
from tngis_client import TNGISClient

ZOOM           = 16
TILE_DIR       = Path(f"data/tiles/z{ZOOM}")
CENTROIDS_FILE = Path(f"data/centroids_z{ZOOM}.json")
DB_PATH        = Path("data/coimbatore_land.db")


async def test_session():
    """Quick sanity check: can we hit the API?"""
    print("\n[Step 0] Testing API connectivity...")
    async with TNGISClient(rate_per_second=1.0) as client:
        parcel = await client.land_info(lat=11.0168, lon=76.9558)
        if parcel and parcel.get("ulpin"):
            print(f"  OK API works! Test ULPIN: {parcel['ulpin']}")
            print(f"     District: {parcel.get('district_name')}")
            print(f"     Village:  {parcel.get('village_name')}")
            return True
        else:
            print("  WARN /land-info returned no data — encryption may need adjustment")
            return False


async def main():
    parser = argparse.ArgumentParser(description="Track B: Full TNGIS Coimbatore Scraper")
    parser.add_argument("--test",       action="store_true", help="Process only 20 centroids")
    parser.add_argument("--skip-tiles", action="store_true", help="Skip tile download/parse step")
    parser.add_argument("--workers",    type=int,   default=8,   help="Async worker count")
    parser.add_argument("--rate",       type=float, default=2.0, help="Requests/second")
    parser.add_argument("--zoom",       type=int,   default=ZOOM, help="Tile zoom level")
    parser.add_argument("--no-ownership", action="store_true", help="Skip ownership fetch")
    args = parser.parse_args()

    print("=" * 60)
    print("  TNGIS Coimbatore Land Data Scraper — Track B")
    print("=" * 60)

    # Step 0: Test API
    api_ok = await test_session()
    if not api_ok:
        print("\n[!] API test failed. Check encryption. Continuing anyway...")

    # Step 1 & 2: Tiles
    if not args.skip_tiles:
        print(f"\n[Step 1] Downloading cadastral tiles (zoom={args.zoom})...")
        result = await download_all_tiles(zoom=args.zoom)

        if result.get("blocked"):
            print("\n[!] Tiles are BLOCKED (403). Falling back to coordinate grid walk.")
            print("[!] For now, generating a grid-based centroid list instead...")
            centroids = generate_grid_centroids()
            CENTROIDS_FILE.parent.mkdir(parents=True, exist_ok=True)
            with open(CENTROIDS_FILE, "w") as f:
                json.dump(centroids, f)
            print(f"[Fallback] Generated {len(centroids):,} grid centroids → {CENTROIDS_FILE}")
        else:
            print(f"\n[Step 2] Parsing tiles → extracting centroids...")
            tile_dir = Path(f"data/tiles/z{args.zoom}")
            count = parse_all_tiles(tile_dir, args.zoom, CENTROIDS_FILE)
            print(f"[Step 2] Extracted {count:,} centroids")
    else:
        print(f"\n[Skip] Using existing centroids: {CENTROIDS_FILE}")

    # Step 3: Bulk scrape
    if not CENTROIDS_FILE.exists():
        print(f"\n[!] Centroids file not found: {CENTROIDS_FILE}")
        sys.exit(1)

    with open(CENTROIDS_FILE) as f:
        centroids = json.load(f)

    print(f"\n[Step 3] Starting bulk scraper...")
    print(f"         Centroids: {len(centroids):,}")
    print(f"         Workers:   {args.workers}")
    print(f"         Rate:      {args.rate} req/s")

    await run_scraper(
        centroids_file=CENTROIDS_FILE,
        db_path=DB_PATH,
        num_workers=args.workers,
        rate_per_second=args.rate,
        test_mode=args.test,
        fetch_ownership=not args.no_ownership,
    )


def generate_grid_centroids(step_m: float = 60.0) -> list[dict]:
    """
    Fallback: Generate lat/lon grid points for Coimbatore if tiles are blocked.
    step_m: grid spacing in meters (~60m = every other parcel)
    """
    import math

    # Coimbatore district bbox
    lat_min, lat_max = 10.260, 11.235
    lon_min, lon_max = 76.650, 77.585

    # Convert step to degrees (approximate)
    step_lat = step_m / 111_000
    step_lon = step_m / (111_000 * math.cos(math.radians((lat_min + lat_max) / 2)))

    points = []
    lat = lat_min
    while lat <= lat_max:
        lon = lon_min
        while lon <= lon_max:
            points.append({"lat": round(lat, 6), "lon": round(lon, 6)})
            lon += step_lon
        lat += step_lat

    return points


if __name__ == "__main__":
    asyncio.run(main())
