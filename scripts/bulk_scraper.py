"""
bulk_scraper.py
===============
Main orchestrator for Track B land data extraction.

Pipeline:
  1. Load centroid list (from tile_parser.py output JSON)
  2. Filter out already-scraped centroids (resume support)
  3. For each centroid: call /land-info → dedupe by ULPIN → save to DB
  4. Optionally fetch ownership, guideline value per unique parcel
  5. Print live progress stats

Usage:
  python bulk_scraper.py                         # Run full scrape
  python bulk_scraper.py --centroids-file data/centroids_z16.json
  python bulk_scraper.py --workers 10 --rate 3
  python bulk_scraper.py --test                  # Test with 5 centroids only
"""

import asyncio
import argparse
import json
import time
import sys
from pathlib import Path
from tqdm import tqdm

from tngis_client import TNGISClient
from db_manager import LandParcelDB

# ------------------------------------------------------------------
# Defaults
# ------------------------------------------------------------------
DEFAULT_CENTROIDS_FILE = Path("data/centroids_z16.json")
DEFAULT_WORKERS        = 8     # concurrent async workers
DEFAULT_RATE           = 2.0   # requests/second (polite)
DEFAULT_DB             = Path("data/coimbatore_land.db")


# ------------------------------------------------------------------
# Worker
# ------------------------------------------------------------------
async def worker(
    worker_id: int,
    queue: asyncio.Queue,
    client: TNGISClient,
    db: LandParcelDB,
    seen_ulpins: set,
    pbar: tqdm,
    stats: dict,
    fetch_ownership: bool = True,
    fetch_guideline: bool = False,
):
    """Process centroids from queue until empty."""
    while True:
        try:
            item = queue.get_nowait()
        except asyncio.QueueEmpty:
            break

        lat = item["lat"]
        lon = item["lon"]

        try:
            # Skip if already done
            if db.is_centroid_done(lat, lon):
                pbar.update(1)
                stats["skipped"] += 1
                queue.task_done()
                continue

            # Fetch land info
            parcel = await client.land_info(lat, lon)

            if not parcel:
                db.mark_centroid_no_data(lat, lon)
                stats["no_data"] += 1
                pbar.update(1)
                queue.task_done()
                continue

            ulpin = parcel.get("ulpin")

            if not ulpin:
                db.mark_centroid_no_data(lat, lon)
                stats["no_data"] += 1
                pbar.update(1)
                queue.task_done()
                continue

            # Deduplicate by ULPIN
            if ulpin in seen_ulpins:
                db.mark_centroid_done(lat, lon, ulpin)
                stats["duplicate"] += 1
                pbar.update(1)
                queue.task_done()
                continue

            seen_ulpins.add(ulpin)

            # Save parcel
            db.save_parcel(parcel, lat=lat, lon=lon)
            stats["new_parcels"] += 1

            # Optionally fetch supplementary data
            if fetch_ownership:
                is_urban = parcel.get("rural_urban") == "urban"
                if is_urban:
                    ownership = await client.urban_ownership_details(parcel)
                else:
                    ownership = await client.ownership_details(parcel)
                if ownership:
                    db.save_ownership(ulpin, ownership)
                    stats["ownership_saved"] += 1

            if fetch_guideline:
                gv = await client.guideline_value(lat, lon)
                if gv:
                    db.save_guideline_value(ulpin, gv)

            db.mark_centroid_done(lat, lon, ulpin)

        except Exception as e:
            stats["errors"] += 1
            if stats["errors"] < 10:
                print(f"\n[Worker {worker_id}] Error at ({lat},{lon}): {e}")
            db.mark_centroid_error(lat, lon)

        pbar.update(1)
        queue.task_done()


# ------------------------------------------------------------------
# Main orchestrator
# ------------------------------------------------------------------
async def run_scraper(
    centroids_file: Path,
    db_path: Path,
    num_workers: int,
    rate_per_second: float,
    test_mode: bool = False,
    fetch_ownership: bool = True,
    fetch_guideline: bool = False,
):
    """Run the full async scraping pipeline."""

    # Load centroids
    print(f"\n[Scraper] Loading centroids from: {centroids_file}")
    if not centroids_file.exists():
        print(f"[Scraper] ERROR: {centroids_file} not found.")
        print("[Scraper] Run tile_downloader.py + tile_parser.py first.")
        sys.exit(1)

    with open(centroids_file) as f:
        all_centroids = json.load(f)

    print(f"[Scraper] Total centroids: {len(all_centroids):,}")

    # Init DB
    db = LandParcelDB(db_path)
    db.init()

    # Resume: filter already-done centroids
    pending = db.get_pending_centroids(all_centroids)
    seen_ulpins = db.get_all_ulpins()

    print(f"[Scraper] Already done: {len(all_centroids) - len(pending):,}")
    print(f"[Scraper] Pending:      {len(pending):,}")
    print(f"[Scraper] Known ULPINs: {len(seen_ulpins):,}")

    if test_mode:
        pending = pending[:20]
        print(f"[Scraper] TEST MODE: only processing {len(pending)} centroids")

    if not pending:
        print("[Scraper] Nothing to do — all centroids already scraped!")
        print(f"[Scraper] Final stats: {db.stats()}")
        return

    # Build queue
    queue = asyncio.Queue()
    for c in pending:
        await queue.put(c)

    # Shared stats
    stats = {
        "new_parcels":    0,
        "duplicate":      0,
        "no_data":        0,
        "errors":         0,
        "skipped":        0,
        "ownership_saved": 0,
    }

    start_time = time.monotonic()

    print(f"\n[Scraper] Starting {num_workers} workers at {rate_per_second} req/s")
    print(f"[Scraper] Estimated time: {len(pending) / (rate_per_second * num_workers / 2) / 3600:.1f} hours\n")

    with tqdm(total=len(pending), desc="Scraping parcels", unit="point",
              dynamic_ncols=True) as pbar:

        async with TNGISClient(rate_per_second=rate_per_second) as client:
            workers = [
                asyncio.create_task(
                    worker(
                        i, queue, client, db, seen_ulpins,
                        pbar, stats, fetch_ownership, fetch_guideline
                    )
                )
                for i in range(num_workers)
            ]
            await asyncio.gather(*workers)

    elapsed = time.monotonic() - start_time

    # Final report
    final_stats = db.stats()
    print(f"\n{'='*50}")
    print(f"  SCRAPE COMPLETE")
    print(f"{'='*50}")
    print(f"  Elapsed time:     {elapsed/3600:.2f} hours ({elapsed:.0f}s)")
    print(f"  New parcels:      {stats['new_parcels']:,}")
    print(f"  Duplicates:       {stats['duplicate']:,}")
    print(f"  No data:          {stats['no_data']:,}")
    print(f"  Errors:           {stats['errors']:,}")
    print(f"  Total in DB:      {final_stats['total_parcels']:,}")
    print(f"  With ownership:   {final_stats['with_ownership']:,}")
    print(f"{'='*50}")
    print(f"  DB saved to: {db_path.resolve()}")

    db.close()


# ------------------------------------------------------------------
# CLI
# ------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="TNGIS Coimbatore Land Data Scraper")
    parser.add_argument(
        "--centroids-file", type=Path, default=DEFAULT_CENTROIDS_FILE,
        help="Path to centroids JSON from tile_parser.py"
    )
    parser.add_argument(
        "--db", type=Path, default=DEFAULT_DB,
        help="Path to SQLite output database"
    )
    parser.add_argument(
        "--workers", type=int, default=DEFAULT_WORKERS,
        help="Number of concurrent async workers"
    )
    parser.add_argument(
        "--rate", type=float, default=DEFAULT_RATE,
        help="API requests per second (per worker)"
    )
    parser.add_argument(
        "--test", action="store_true",
        help="Test mode: only scrape 20 centroids"
    )
    parser.add_argument(
        "--no-ownership", action="store_true",
        help="Skip ownership/patta fetching (faster)"
    )
    parser.add_argument(
        "--guideline", action="store_true",
        help="Also fetch guideline land values (slower)"
    )

    args = parser.parse_args()

    asyncio.run(run_scraper(
        centroids_file=args.centroids_file,
        db_path=args.db,
        num_workers=args.workers,
        rate_per_second=args.rate,
        test_mode=args.test,
        fetch_ownership=not args.no_ownership,
        fetch_guideline=args.guideline,
    ))


if __name__ == "__main__":
    main()
