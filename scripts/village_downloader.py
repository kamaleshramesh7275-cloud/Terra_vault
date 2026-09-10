"""
village_downloader.py
=====================
FASTEST approach: Download ALL land parcels for Coimbatore
by exploiting the /downloads/generate endpoint.

This downloads complete Shapefile+KML ZIP archives PER VILLAGE
instead of hitting /land-info per coordinate.

Speed comparison:
  Coordinate grid: 4.4M API calls, ~8+ hours
  This script:     ~600 villages × 1 ZIP each = done in minutes

Pipeline:
  1. Get Coimbatore district code from admin_master_district
  2. Get all taluks in Coimbatore
  3. For each taluk: get all villages
  4. POST /downloads/generate with all village_codes at once
  5. Poll /downloads/status until ready
  6. GET /downloads/file?id=... → download ZIP
  7. Unzip → parse Shapefile/KML → save to DB

NOTE: The download endpoint requires "Official" role.
     If it returns 403, we'll know and fall back.
     If it works, we get ALL Coimbatore parcels as GeoSpatial data.

Usage:
  python village_downloader.py --test    # test with 1 taluk
  python village_downloader.py           # full Coimbatore run
  python village_downloader.py --format KML
"""

import asyncio
import argparse
import json
import time
import zipfile
import io
import re
from pathlib import Path

import httpx

from tngis_session import TNGISSession, GI_BASE_URL
from tngis_encryption import TNGISEncryption

# ------------------------------------------------------------------
# Config
# ------------------------------------------------------------------
GI_API_BASE  = f"{GI_BASE_URL}/gi_api"
BASE_URL     = f"{GI_BASE_URL}/gi_api"   # admin master uses same base
CBE_DISTRICT = "Coimbatore"
POLL_INTERVAL = 2.0   # seconds between status polls
OUT_DIR      = Path("data/village_downloads")
DB_PATH      = Path("data/coimbatore_land.db")


# ------------------------------------------------------------------
# Admin master API helpers (no auth needed, just X-APP-NAME)
# ------------------------------------------------------------------
ADMIN_HEADERS = {"X-APP-NAME": "demo"}


async def get_districts(http: httpx.AsyncClient) -> list[dict]:
    r = await http.get(
        f"{GI_API_BASE}/v2/admin_master_district",
        params={"request_type": "district"},
        headers=ADMIN_HEADERS
    )
    data = r.json()
    if isinstance(data, dict) and data.get("success") == 1:
        return data["data"]
    # Some endpoints return the list directly
    if isinstance(data, list):
        return data
    return []


async def get_taluks(http: httpx.AsyncClient, district_code: str) -> list[dict]:
    r = await http.get(
        f"{GI_API_BASE}/v2/admin_master_taluk",
        params={"district_code": district_code, "request_type": "taluk"},
        headers=ADMIN_HEADERS
    )
    data = r.json()
    if isinstance(data, dict) and (data.get("success") in (1, 2)):
        return data.get("data", [])
    if isinstance(data, list):
        return data
    return []


async def get_villages(http: httpx.AsyncClient, district_code: str, taluk_code: str) -> list[dict]:
    r = await http.get(
        f"{GI_API_BASE}/v2/admin_master_village",
        params={
            "district_code": district_code,
            "taluk_code": taluk_code,
            "request_type": "revenue_village"
        },
        headers=ADMIN_HEADERS
    )
    data = r.json()
    if isinstance(data, dict) and (data.get("success") in (1, 2)):
        return data.get("data", [])
    if isinstance(data, list):
        return data
    return []


# ------------------------------------------------------------------
# Download API helpers (authenticated, encrypted)
# ------------------------------------------------------------------
def make_secure_headers(session: TNGISSession) -> dict:
    return {
        "X-Secure-Request": "true",
        "X-Session-ID":     session.session_id,
        "X-CSRF-Token":     session.csrf_token,
        "Content-Type":     "application/json",
    }


async def generate_download(
    http: httpx.AsyncClient,
    session: TNGISSession,
    enc: TNGISEncryption,
    params: dict,
) -> dict:
    """POST /downloads/generate — returns {success, data: {id, ...}}"""
    payload_str = json.dumps(params)
    encrypted   = enc.encrypt(payload_str, session.key)

    r = await http.post(
        f"{GI_API_BASE}/downloads/generate",
        content=json.dumps({"payload": encrypted}),
        headers=make_secure_headers(session),
    )

    if r.status_code == 403:
        return {"success": 0, "message": "FORBIDDEN — Officials only. This endpoint requires special access."}
    if r.status_code >= 400:
        return {"success": 0, "message": f"HTTP {r.status_code}"}

    raw = r.json()
    if not raw.get("payload"):
        return raw

    decrypted = enc.decrypt(raw["payload"], session.key)
    if not decrypted:
        return {"success": 0, "message": "Decrypt failed"}
    return json.loads(decrypted)


async def check_status(
    http: httpx.AsyncClient,
    session: TNGISSession,
    enc: TNGISEncryption,
    job_id: str,
) -> dict:
    """GET /downloads/status?id=... — returns {success, data: {status, progress, ...}}"""
    r = await http.get(
        f"{GI_API_BASE}/downloads/status",
        params={"id": job_id},
        headers=make_secure_headers(session),
    )
    if r.status_code >= 400:
        return {"success": 0}

    raw = r.json()
    if not raw.get("payload"):
        return raw
    decrypted = enc.decrypt(raw["payload"], session.key)
    if not decrypted:
        return {"success": 0}
    return json.loads(decrypted)


async def download_zip(
    http: httpx.AsyncClient,
    session: TNGISSession,
    job_id: str,
    out_path: Path,
) -> bool:
    """GET /downloads/file?id=... — stream ZIP to disk"""
    url = f"{GI_API_BASE}/downloads/file"
    params = {"id": job_id}
    headers = make_secure_headers(session)

    async with http.stream("GET", url, params=params, headers=headers) as r:
        if r.status_code >= 400:
            print(f"  [DL] HTTP {r.status_code} on file download")
            return False
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "wb") as f:
            async for chunk in r.aiter_bytes(chunk_size=65536):
                f.write(chunk)
    return True


# ------------------------------------------------------------------
# Poll until done
# ------------------------------------------------------------------
async def poll_until_done(
    http: httpx.AsyncClient,
    session: TNGISSession,
    enc: TNGISEncryption,
    job_id: str,
    label: str,
) -> dict | None:
    """Poll status every POLL_INTERVAL seconds until completed/failed."""
    while True:
        res = await check_status(http, session, enc, job_id)
        if res.get("success") != 1:
            print(f"  [Poll] Status check failed for {label}")
            return None

        status   = res["data"]["status"]
        progress = res["data"].get("progress", 0)

        if status == "completed":
            print(f"  [Poll] {label} — DONE")
            return res["data"]
        elif status == "failed":
            print(f"  [Poll] {label} — FAILED: {res['data'].get('error', '?')}")
            return None
        else:
            print(f"  [Poll] {label} — {status} {progress}%", end="\r")
            await asyncio.sleep(POLL_INTERVAL)


# ------------------------------------------------------------------
# Parse downloaded ZIP
# ------------------------------------------------------------------
def parse_zip(zip_path: Path) -> list[dict]:
    """
    Extract parcels from the downloaded ZIP.
    ZIP contains: Shapefile (.shp/.dbf/.prj) + KML
    We'll try KML first (simpler), then Shapefile fallback.
    """
    parcels = []
    try:
        with zipfile.ZipFile(zip_path) as z:
            names = z.namelist()
            print(f"  [ZIP] Contents: {names}")

            # Try KML
            kml_files = [n for n in names if n.endswith(".kml")]
            if kml_files:
                kml_data = z.read(kml_files[0]).decode("utf-8")
                parcels = _parse_kml(kml_data)
                print(f"  [ZIP] KML parcels: {len(parcels)}")

            # Fallback: try DBF (shapefile attribute table)
            if not parcels:
                dbf_files = [n for n in names if n.endswith(".dbf")]
                if dbf_files:
                    dbf_data = z.read(dbf_files[0])
                    parcels = _parse_dbf(dbf_data)
                    print(f"  [ZIP] DBF parcels: {len(parcels)}")

    except Exception as e:
        print(f"  [ZIP] Parse error: {e}")

    return parcels


def _parse_kml(kml_text: str) -> list[dict]:
    """
    Extract placemark data from KML.
    Each Placemark has ExtendedData with ULPIN, survey_no, etc.
    """
    parcels = []
    # Find all Placemark blocks
    placemarks = re.findall(r"<Placemark>(.*?)</Placemark>", kml_text, re.DOTALL)
    for pm in placemarks:
        parcel = {}
        # Extract SimpleData elements
        fields = re.findall(r'<SimpleData name="([^"]+)">(.*?)</SimpleData>', pm)
        for name, value in fields:
            parcel[name.lower()] = value.strip()
        # Extract coordinates
        coords_match = re.search(r"<coordinates>(.*?)</coordinates>", pm, re.DOTALL)
        if coords_match:
            parcel["_kml_coords"] = coords_match.group(1).strip()
        if parcel:
            parcels.append(parcel)
    return parcels


def _parse_dbf(dbf_bytes: bytes) -> list[dict]:
    """Minimal DBF reader — extracts field names + records."""
    try:
        if len(dbf_bytes) < 32:
            return []

        num_records = int.from_bytes(dbf_bytes[4:8], "little")
        header_size = int.from_bytes(dbf_bytes[8:10], "little")
        record_size = int.from_bytes(dbf_bytes[10:12], "little")

        # Parse field descriptors (32 bytes each, starting at byte 32)
        fields = []
        offset = 32
        while offset < header_size - 1:
            name_raw = dbf_bytes[offset:offset+11]
            name = name_raw.split(b"\x00")[0].decode("ascii", errors="ignore")
            if not name:
                break
            ftype = chr(dbf_bytes[offset + 11])
            flen  = dbf_bytes[offset + 16]
            fields.append((name, ftype, flen))
            offset += 32

        # Parse records
        parcels = []
        pos = header_size
        for _ in range(num_records):
            if pos + record_size > len(dbf_bytes):
                break
            rec_bytes = dbf_bytes[pos:pos + record_size]
            if rec_bytes[0] == 0x2A:  # deleted record
                pos += record_size
                continue
            parcel = {}
            roff = 1
            for fname, ftype, flen in fields:
                val = rec_bytes[roff:roff + flen].decode("ascii", errors="ignore").strip()
                parcel[fname.lower()] = val
                roff += flen
            parcels.append(parcel)
            pos += record_size

        return parcels
    except Exception:
        return []


# ------------------------------------------------------------------
# Save parsed parcels to JSON
# ------------------------------------------------------------------
def save_parcels(parcels: list[dict], out_json: Path):
    out_json.parent.mkdir(parents=True, exist_ok=True)
    with open(out_json, "w") as f:
        json.dump(parcels, f, indent=2, ensure_ascii=False)


# ------------------------------------------------------------------
# Main downloader
# ------------------------------------------------------------------
async def run(test_mode: bool = False, fmt: str = "KML"):
    print("\n" + "=" * 60)
    print("  TNGIS Village Bulk Downloader — Coimbatore")
    print("=" * 60)

    session = TNGISSession()
    await session.init()
    enc = TNGISEncryption()

    print(f"\n[Session] {session.session_id[:16]}... OK")

    async with httpx.AsyncClient(timeout=120, follow_redirects=True) as http:

        # Step 1: Get districts
        print("\n[Step 1] Fetching districts...")
        districts = await get_districts(http)
        print(f"  Found {len(districts)} districts")

        cbe = next(
            (d for d in districts if "coimbatore" in d.get("district_english_name", "").lower()),
            None
        )
        if not cbe:
            print("  ERROR: Coimbatore district not found!")
            print(f"  Available: {[d.get('district_english_name') for d in districts[:5]]}")
            return

        district_code = cbe.get("district_code") or cbe.get("id")
        district_name = cbe.get("district_english_name", "Coimbatore")
        print(f"  Coimbatore: code={district_code}, name={district_name}")

        # Step 2: Get taluks
        print("\n[Step 2] Fetching taluks...")
        taluks = await get_taluks(http, district_code)
        print(f"  Found {len(taluks)} taluks in Coimbatore")

        if test_mode:
            taluks = taluks[:1]
            print(f"  [TEST] Using only first taluk: {taluks[0].get('taluk_english_name')}")

        all_parcels_total = 0

        for taluk in taluks:
            taluk_code = taluk.get("taluk_code") or taluk.get("id")
            taluk_name = taluk.get("taluk_english_name", "?")

            print(f"\n[Taluk] {taluk_name} (code={taluk_code})")

            # Step 3: Get villages for this taluk
            villages = await get_villages(http, district_code, taluk_code)
            print(f"  Villages: {len(villages)}")

            if not villages:
                print("  SKIP — no villages")
                continue

            village_codes = [v.get("village_code") or v.get("id") for v in villages]
            village_names = [v.get("village_english_name", "?") for v in villages]

            # Step 4: Generate download
            print(f"  Generating download for {len(village_codes)} villages...")
            res = await generate_download(http, session, enc, {
                "district_code":  district_code,
                "district_name":  district_name,
                "taluk_code":     taluk_code,
                "taluk_name":     taluk_name,
                "village_codes":  village_codes,
                "village_names":  village_names,
                "format":         fmt,
            })

            print(f"  Response: {json.dumps(res)[:200]}")

            if res.get("success") != 1:
                msg = res.get("message", "?")
                print(f"  FAILED: {msg}")
                if "FORBIDDEN" in msg or "Officials" in msg:
                    print("\n  ⚠ This endpoint requires OFFICIAL role.")
                    print("  The download feature is restricted to govt officials.")
                    print("  Falling back to coordinate grid approach is necessary.")
                    return
                continue

            job_id = res.get("data", {}).get("id")
            if not job_id:
                print("  FAILED: No job ID in response")
                continue

            # Step 5: Poll until complete
            label    = f"{taluk_name}/{len(village_codes)} villages"
            job_data = await poll_until_done(http, session, enc, job_id, label)

            if not job_data:
                print(f"  FAILED: Job {job_id} did not complete")
                continue

            # Step 6: Download ZIP
            zip_path = OUT_DIR / f"{taluk_name.replace(' ', '_')}.zip"
            print(f"  Downloading ZIP to {zip_path}...")
            ok = await download_zip(http, session, job_id, zip_path)

            if not ok:
                print("  FAILED: Could not download ZIP")
                continue

            # Step 7: Parse
            parcels = parse_zip(zip_path)
            print(f"  Parsed {len(parcels)} parcels from ZIP")

            # Save JSON
            json_path = OUT_DIR / f"{taluk_name.replace(' ', '_')}.json"
            save_parcels(parcels, json_path)

            all_parcels_total += len(parcels)

        print(f"\n{'='*60}")
        print(f"  DONE — Total parcels downloaded: {all_parcels_total:,}")
        print(f"  Output: {OUT_DIR.resolve()}")
        print(f"{'='*60}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--test",   action="store_true", help="Only process first taluk")
    p.add_argument("--format", default="KML",       help="KML or Shapefile")
    args = p.parse_args()
    asyncio.run(run(test_mode=args.test, fmt=args.format))


if __name__ == "__main__":
    main()
