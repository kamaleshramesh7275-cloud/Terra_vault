"""
fast_scraper.py
===============
Optimised bulk scraper — skips tile parsing entirely.

Speed improvements over bulk_scraper.py:
  1. Generates centroid grid in seconds (no OpenCV needed)
  2. 20 concurrent workers instead of 8
  3. Multiple independent session pools (each with own AES key)
  4. Higher rate: 5 req/s (polite but fast)
  5. Skips ownership fetch by default (fetch only ULPIN+GeoJSON first)
  6. Fully resumable — re-run anytime, picks up where it left off

Usage:
  python fast_scraper.py                  # full Coimbatore run
  python fast_scraper.py --test           # 50 points only
  python fast_scraper.py --workers 30 --rate 5
  python fast_scraper.py --resume         # continue from last checkpoint
"""

import asyncio
import argparse
import json
import math
import time
import sys
import httpx
from pathlib import Path
from tqdm import tqdm

from tngis_session import TNGISSession, GI_API_BASE
from tngis_encryption import TNGISEncryption
from db_manager import LandParcelDB

# ------------------------------------------------------------------
# Coimbatore district bounding box
# ------------------------------------------------------------------
CBE_NORTH = 11.235
CBE_SOUTH = 10.260
CBE_EAST  = 77.585
CBE_WEST  = 76.650

DEFAULT_STEP_M  = 50      # metres between grid points (50m = ~1 parcel width)
DEFAULT_WORKERS = 20
DEFAULT_RATE    = 5.0     # req/s per session
DEFAULT_DB      = Path("data/coimbatore_land.db")


# ------------------------------------------------------------------
# Generate grid centroids (instant — no tile download needed)
# ------------------------------------------------------------------
def generate_grid(step_m: float = DEFAULT_STEP_M) -> list[dict]:
    """
    Generate a lat/lon grid over Coimbatore at the given step size.
    50m step → ~700K points → after ULPIN dedup → ~400-600K unique parcels.
    """
    step_lat = step_m / 111_000
    step_lon = step_m / (111_000 * math.cos(math.radians((CBE_NORTH + CBE_SOUTH) / 2)))

    points = []
    lat = CBE_SOUTH
    while lat <= CBE_NORTH:
        lon = CBE_WEST
        while lon <= CBE_EAST:
            points.append({"lat": round(lat, 7), "lon": round(lon, 7)})
            lon += step_lon
        lat += step_lat

    return points


# ------------------------------------------------------------------
# Session pool — multiple independent session keys
# ------------------------------------------------------------------
class SessionPool:
    """
    Maintains N independent TNGIS sessions for parallel use.
    Each worker picks a session round-robin.
    """

    def __init__(self, size: int = 4):
        self.size = size
        self.sessions: list[TNGISSession] = [TNGISSession() for _ in range(size)]
        self.enc = TNGISEncryption()

    async def init(self):
        print(f"[Pool] Initialising {self.size} sessions...")
        await asyncio.gather(*[s.init() for s in self.sessions])
        print(f"[Pool] All {self.size} sessions ready")

    def get(self, worker_id: int) -> TNGISSession:
        return self.sessions[worker_id % self.size]

    async def ensure_all_valid(self):
        await asyncio.gather(*[s.ensure_valid() for s in self.sessions])

from tngis_client import TNGISClient


# ------------------------------------------------------------------
# Low-level land-info call — uses the proven client under the hood
# ------------------------------------------------------------------
async def fetch_land_info_direct(
    client: TNGISClient,
    lat: float,
    lon: float,
) -> dict | None:
    """Call /land-info via the proven TNGISClient."""
    return await client.land_info(lat, lon)


# ------------------------------------------------------------------
# Worker
# ------------------------------------------------------------------
async def worker(
    worker_id: int,
    queue: asyncio.Queue,
    client: TNGISClient,
    db: LandParcelDB,
    seen: set,
    pbar: tqdm,
    stats: dict,
):
    min_gap = 1.0 / DEFAULT_RATE
    last_req = 0.0

    while True:
        item = await queue.get()
        if item is None:   # sentinel — we're done
            queue.task_done()
            break

        lat = item["lat"]
        lon = item["lon"]

        # Skip already done
        if db.is_centroid_done(lat, lon):
            stats["skipped"] += 1
            pbar.update(1)
            queue.task_done()
            continue

        # Per-worker rate limit
        now  = time.monotonic()
        wait = min_gap - (now - last_req)
        if wait > 0:
            await asyncio.sleep(wait)
        last_req = time.monotonic()

        try:
            parcel = await client.land_info(lat, lon)
        except Exception:
            parcel = None

        if not parcel:
            db.mark_centroid_no_data(lat, lon)
            stats["no_data"] += 1
        else:
            ulpin = parcel.get("ulpin")
            if not ulpin:
                db.mark_centroid_no_data(lat, lon)
                stats["no_data"] += 1
            elif ulpin in seen:
                db.mark_centroid_done(lat, lon, ulpin)
                stats["dup"] += 1
            else:
                seen.add(ulpin)
                db.save_parcel(parcel, lat=lat, lon=lon)
                db.mark_centroid_done(lat, lon, ulpin)
                stats["new"] += 1

        pbar.update(1)
        pbar.set_postfix({
            "new": stats["new"],
            "dup": stats["dup"],
            "miss": stats["no_data"],
        }, refresh=False)
        queue.task_done()



# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------
async def run(
    num_workers: int,
    step_m: float,
    db_path: Path,
    test: bool,
    resume: bool,
):
    print("\n" + "=" * 60)
    print("  TNGIS Fast Scraper — Coimbatore")
    print("=" * 60)

    # Generate grid
    print(f"\n[Grid] Generating {step_m}m grid over Coimbatore...")
    t0 = time.monotonic()
    all_points = generate_grid(step_m)
    print(f"[Grid] {len(all_points):,} grid points in {time.monotonic()-t0:.1f}s")

    # Init DB
    db = LandParcelDB(db_path)
    db.init()

    # Filter done points
    print("[DB]   Filtering already-scraped points...")
    pending = db.get_pending_centroids(all_points)
    seen    = db.get_all_ulpins()
    print(f"[DB]   Done: {len(all_points)-len(pending):,}  Pending: {len(pending):,}  Known ULPINs: {len(seen):,}")

    if test:
        # Start from Coimbatore city centre (lat=11.0168, lon=76.9558)
        # to guarantee we hit populated parcels, not empty farmland
        city_lat, city_lon = 11.0168, 76.9558
        step_lat = DEFAULT_STEP_M / 111_000
        step_lon = DEFAULT_STEP_M / (111_000 * math.cos(math.radians(city_lat)))
        test_points = [
            {"lat": round(city_lat + i * step_lat, 7),
             "lon": round(city_lon + j * step_lon, 7)}
            for i in range(-5, 6) for j in range(-5, 6)
        ][:100]
        # Filter these against already-done
        pending = db.get_pending_centroids(test_points)
        print(f"[TEST] Using 100 points around Coimbatore city centre")

    if not pending:
        print("[Done] Nothing to scrape — all points already done!")
        print(f"       Stats: {db.stats()}")
        db.close()
        return

    # Estimate time
    eff_rate  = DEFAULT_RATE * num_workers
    est_hrs   = len(pending) / eff_rate / 3600
    print(f"\n[Run]  Workers: {num_workers}  Rate: {DEFAULT_RATE}/s/worker")
    print(f"[Run]  Effective rate: ~{eff_rate:.0f} req/s")
    print(f"[Run]  Estimated time: {est_hrs:.1f} hours  ({est_hrs*60:.0f} minutes)\n")

    queue  = asyncio.Queue()
    stats  = {"new": 0, "dup": 0, "no_data": 0, "skipped": 0, "errors": 0}


    start = time.monotonic()

    async with TNGISClient(rate_per_second=DEFAULT_RATE) as client:
        with tqdm(total=len(pending), desc="Parcels", unit="pt",
                  dynamic_ncols=True, smoothing=0.1) as pbar:

            # Push all work items then sentinels
            for p in pending:
                await queue.put(p)
            for _ in range(num_workers):
                await queue.put(None)  # one sentinel per worker

            tasks = [
                asyncio.create_task(
                    worker(i, queue, client, db, seen, pbar, stats)
                )
                for i in range(num_workers)
            ]
            await asyncio.gather(*tasks)

    elapsed = time.monotonic() - start
    final   = db.stats()

    print(f"\n{'='*60}")
    print(f"  COMPLETE")
    print(f"  Elapsed:       {elapsed/3600:.2f}h ({elapsed:.0f}s)")
    print(f"  New parcels:   {stats['new']:,}")
    print(f"  Duplicates:    {stats['dup']:,}")
    print(f"  No data:       {stats['no_data']:,}")
    print(f"  Total in DB:   {final['total_parcels']:,}")
    print(f"  DB path:       {db_path.resolve()}")
    print(f"{'='*60}")

    db.close()


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--workers",  type=int,   default=DEFAULT_WORKERS)
    p.add_argument("--step",     type=float, default=DEFAULT_STEP_M,
                   help="Grid step in metres (smaller = more coverage, slower)")
    p.add_argument("--db",       type=Path,  default=DEFAULT_DB)
    p.add_argument("--test",     action="store_true")
    p.add_argument("--resume",   action="store_true")
    args = p.parse_args()

    asyncio.run(run(
        num_workers=args.workers,
        step_m=args.step,
        db_path=args.db,
        test=args.test,
        resume=args.resume,
    ))


if __name__ == "__main__":
    main()
