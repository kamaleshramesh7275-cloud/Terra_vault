"""
db_manager.py
=============
SQLite database manager for storing scraped TNGIS land parcel data.

Features:
  - Full schema for all parcel fields
  - ULPIN-based deduplication
  - Resume support (checkpoint tracking)
  - Batch inserts for performance
"""

import sqlite3
import json
from pathlib import Path
from datetime import datetime, timezone


DB_PATH = Path("data/coimbatore_land.db")


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


class LandParcelDB:
    """
    SQLite wrapper for land parcel storage.

    Usage:
        db = LandParcelDB()
        db.init()
        db.save_parcel(parcel_dict)
        db.save_checkpoint(lat, lon)
        ulpins = db.get_all_ulpins()
    """

    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn: sqlite3.Connection | None = None

    def init(self):
        """Create tables if they don't exist."""
        self._conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        self._conn.execute("PRAGMA journal_mode=WAL")
        self._conn.execute("PRAGMA synchronous=NORMAL")
        self._create_tables()
        print(f"[DB] Initialized: {self.db_path.resolve()}")

    def _create_tables(self):
        """Create all schema tables."""
        cur = self._conn.cursor()

        # Core land parcels
        cur.execute("""
        CREATE TABLE IF NOT EXISTS land_parcels (
            ulpin                TEXT PRIMARY KEY,
            district_code        INTEGER,
            district_name        TEXT,
            taluk_code           INTEGER,
            taluk_name           TEXT,
            village_code         INTEGER,
            village_name         TEXT,
            survey_number        TEXT,
            sub_division_number  TEXT,
            rural_urban          TEXT,
            area_sqm             REAL,
            revenue_town_code    TEXT,
            firka_ward_number    TEXT,
            urban_block_number   TEXT,
            geojson_geom         TEXT,
            centroid_lat         REAL,
            centroid_lon         REAL,
            fetched_at           TEXT
        )
        """)

        # Ownership / Patta
        cur.execute("""
        CREATE TABLE IF NOT EXISTS ownership (
            ulpin              TEXT PRIMARY KEY,
            patta_number       TEXT,
            owner_name         TEXT,
            owner_count        INTEGER,
            land_type          TEXT,
            land_category      TEXT,
            extent_sqft        REAL,
            extent_hectares    REAL,
            raw_json           TEXT,
            fetched_at         TEXT
        )
        """)

        # FMB sketches
        cur.execute("""
        CREATE TABLE IF NOT EXISTS fmb_sketches (
            ulpin              TEXT PRIMARY KEY,
            sketch_url         TEXT,
            sketch_geom        TEXT,
            raw_json           TEXT,
            fetched_at         TEXT
        )
        """)

        # Guideline values
        cur.execute("""
        CREATE TABLE IF NOT EXISTS guideline_values (
            ulpin              TEXT PRIMARY KEY,
            value_per_sqft     REAL,
            zone               TEXT,
            raw_json           TEXT,
            fetched_at         TEXT
        )
        """)

        # Buildings / property tax
        cur.execute("""
        CREATE TABLE IF NOT EXISTS buildings (
            id                 INTEGER PRIMARY KEY AUTOINCREMENT,
            ulpin              TEXT,
            building_id        TEXT,
            floor_count        INTEGER,
            area_sqft          REAL,
            geojson_geom       TEXT,
            fetched_at         TEXT
        )
        """)

        # Resume checkpoints
        cur.execute("""
        CREATE TABLE IF NOT EXISTS checkpoints (
            id                 INTEGER PRIMARY KEY AUTOINCREMENT,
            checkpoint_key     TEXT UNIQUE,
            value              TEXT,
            updated_at         TEXT
        )
        """)

        # Scrape progress per centroid
        cur.execute("""
        CREATE TABLE IF NOT EXISTS centroid_status (
            lat        REAL,
            lon        REAL,
            status     TEXT,   -- 'done', 'no_data', 'error', 'pending'
            ulpin      TEXT,
            PRIMARY KEY (lat, lon)
        )
        """)

        # Index for fast lookups
        cur.execute("CREATE INDEX IF NOT EXISTS idx_parcels_district ON land_parcels(district_code)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_parcels_village  ON land_parcels(village_code)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_centroid_status  ON centroid_status(status)")

        self._conn.commit()

    # ------------------------------------------------------------------
    # Core parcel operations
    # ------------------------------------------------------------------
    def save_parcel(self, parcel: dict, lat: float = None, lon: float = None):
        """Insert or replace a land parcel record."""
        ulpin = parcel.get("ulpin")
        if not ulpin:
            return

        geojson = parcel.get("geojson_geom")
        if isinstance(geojson, dict):
            geojson = json.dumps(geojson)

        self._conn.execute("""
        INSERT OR REPLACE INTO land_parcels
            (ulpin, district_code, district_name, taluk_code, taluk_name,
             village_code, village_name, survey_number, sub_division_number,
             rural_urban, area_sqm, revenue_town_code, firka_ward_number,
             urban_block_number, geojson_geom, centroid_lat, centroid_lon, fetched_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            ulpin,
            parcel.get("district_code"),
            parcel.get("district_name"),
            parcel.get("taluk_code"),
            parcel.get("taluk_name"),
            parcel.get("village_code"),
            parcel.get("village_name"),
            parcel.get("survey_number"),
            parcel.get("sub_division_number"),
            parcel.get("rural_urban"),
            parcel.get("area_sqm") or parcel.get("area"),
            parcel.get("revenue_town_code"),
            parcel.get("firka_ward_number"),
            parcel.get("urban_block_number"),
            geojson,
            lat,
            lon,
            utcnow(),
        ))
        self._conn.commit()

    def save_ownership(self, ulpin: str, ownership: dict):
        """Save ownership/patta details for a parcel."""
        if not ulpin or not ownership:
            return
        self._conn.execute("""
        INSERT OR REPLACE INTO ownership
            (ulpin, patta_number, owner_name, owner_count, land_type,
             land_category, extent_sqft, extent_hectares, raw_json, fetched_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)
        """, (
            ulpin,
            ownership.get("patta_number"),
            ownership.get("owner_name") or ownership.get("owners"),
            ownership.get("owner_count"),
            ownership.get("land_type"),
            ownership.get("land_category"),
            ownership.get("extent_sqft"),
            ownership.get("extent_hectares"),
            json.dumps(ownership),
            utcnow(),
        ))
        self._conn.commit()

    def save_guideline_value(self, ulpin: str, data: dict):
        """Save guideline land value."""
        if not ulpin or not data:
            return
        self._conn.execute("""
        INSERT OR REPLACE INTO guideline_values
            (ulpin, value_per_sqft, zone, raw_json, fetched_at)
        VALUES (?,?,?,?,?)
        """, (
            ulpin,
            data.get("value_per_sqft") or data.get("guideline_value"),
            data.get("zone"),
            json.dumps(data),
            utcnow(),
        ))
        self._conn.commit()

    # ------------------------------------------------------------------
    # Centroid status tracking
    # ------------------------------------------------------------------
    def mark_centroid_done(self, lat: float, lon: float, ulpin: str | None = None):
        self._conn.execute("""
        INSERT OR REPLACE INTO centroid_status (lat, lon, status, ulpin)
        VALUES (?, ?, 'done', ?)
        """, (round(lat, 6), round(lon, 6), ulpin))
        self._conn.commit()

    def mark_centroid_no_data(self, lat: float, lon: float):
        self._conn.execute("""
        INSERT OR REPLACE INTO centroid_status (lat, lon, status, ulpin)
        VALUES (?, ?, 'no_data', NULL)
        """, (round(lat, 6), round(lon, 6)))
        self._conn.commit()

    def mark_centroid_error(self, lat: float, lon: float):
        self._conn.execute("""
        INSERT OR REPLACE INTO centroid_status (lat, lon, status, ulpin)
        VALUES (?, ?, 'error', NULL)
        """, (round(lat, 6), round(lon, 6)))
        self._conn.commit()

    def is_centroid_done(self, lat: float, lon: float) -> bool:
        cur = self._conn.execute(
            "SELECT status FROM centroid_status WHERE lat=? AND lon=?",
            (round(lat, 6), round(lon, 6))
        )
        row = cur.fetchone()
        return row is not None and row[0] == "done"

    def get_pending_centroids(self, centroid_list: list[dict]) -> list[dict]:
        """Filter centroid list to only those not yet done."""
        done_cur = self._conn.execute(
            "SELECT lat, lon FROM centroid_status WHERE status='done'"
        )
        done_set = {(round(r[0], 6), round(r[1], 6)) for r in done_cur.fetchall()}
        return [
            c for c in centroid_list
            if (round(c["lat"], 6), round(c["lon"], 6)) not in done_set
        ]

    # ------------------------------------------------------------------
    # Deduplication
    # ------------------------------------------------------------------
    def get_all_ulpins(self) -> set[str]:
        """Return set of all already-collected ULPINs."""
        cur = self._conn.execute("SELECT ulpin FROM land_parcels")
        return {row[0] for row in cur.fetchall()}

    def ulpin_exists(self, ulpin: str) -> bool:
        cur = self._conn.execute(
            "SELECT 1 FROM land_parcels WHERE ulpin=?", (ulpin,)
        )
        return cur.fetchone() is not None

    # ------------------------------------------------------------------
    # Checkpoints (resume support)
    # ------------------------------------------------------------------
    def save_checkpoint(self, key: str, value: str):
        self._conn.execute("""
        INSERT OR REPLACE INTO checkpoints (checkpoint_key, value, updated_at)
        VALUES (?, ?, ?)
        """, (key, value, utcnow()))
        self._conn.commit()

    def load_checkpoint(self, key: str) -> str | None:
        cur = self._conn.execute(
            "SELECT value FROM checkpoints WHERE checkpoint_key=?", (key,)
        )
        row = cur.fetchone()
        return row[0] if row else None

    # ------------------------------------------------------------------
    # Stats
    # ------------------------------------------------------------------
    def stats(self) -> dict:
        return {
            "total_parcels":   self._conn.execute("SELECT COUNT(*) FROM land_parcels").fetchone()[0],
            "with_ownership":  self._conn.execute("SELECT COUNT(*) FROM ownership").fetchone()[0],
            "with_guideline":  self._conn.execute("SELECT COUNT(*) FROM guideline_values").fetchone()[0],
            "centroids_done":  self._conn.execute("SELECT COUNT(*) FROM centroid_status WHERE status='done'").fetchone()[0],
            "centroids_error": self._conn.execute("SELECT COUNT(*) FROM centroid_status WHERE status='error'").fetchone()[0],
        }

    def close(self):
        if self._conn:
            self._conn.close()

    def __del__(self):
        self.close()


# ------------------------------------------------------------------
# Quick test
# ------------------------------------------------------------------
if __name__ == "__main__":
    import tempfile
    tmp = Path(tempfile.mkdtemp()) / "test.db"
    db = LandParcelDB(tmp)
    db.init()

    # Insert a test parcel
    test_parcel = {
        "ulpin": "33110001234567890",
        "district_code": 11,
        "district_name": "Coimbatore",
        "taluk_code": 1,
        "taluk_name": "Coimbatore North",
        "village_code": 100,
        "village_name": "Test Village",
        "survey_number": "123",
        "sub_division_number": "4",
        "rural_urban": "rural",
        "geojson_geom": {"type": "Polygon", "coordinates": [[[76.9, 11.0]]]},
    }
    db.save_parcel(test_parcel, lat=11.0, lon=76.9)

    s = db.stats()
    print(f"Stats: {s}")
    assert s["total_parcels"] == 1
    assert db.ulpin_exists("33110001234567890")

    db.mark_centroid_done(11.0, 76.9, "33110001234567890")
    assert db.is_centroid_done(11.0, 76.9)

    print("OK All DB tests PASSED")
    db.close()
