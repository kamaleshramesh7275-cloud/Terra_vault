"""
tngis_client.py
===============
Full async API client for the TNGIS Tamil Nilam GI Viewer.

Wraps all 11 endpoints with:
  - Automatic AES payload encryption
  - Session key rotation
  - Rate limiting (polite: 2 req/s by default)
  - Retry on transient errors
"""

import asyncio
import json
import time
import httpx
from tngis_session import TNGISSession, GI_API_BASE
from tngis_encryption import TNGISEncryption


class RateLimiter:
    """Simple token-bucket rate limiter."""

    def __init__(self, rate_per_second: float = 2.0):
        self.rate     = rate_per_second
        self.min_gap  = 1.0 / rate_per_second
        self._last    = 0.0
        self._lock    = asyncio.Lock()

    async def wait(self):
        async with self._lock:
            now  = time.monotonic()
            wait = self.min_gap - (now - self._last)
            if wait > 0:
                await asyncio.sleep(wait)
            self._last = time.monotonic()


class TNGISClient:
    """
    Async TNGIS API client.

    Usage:
        async with TNGISClient() as client:
            parcel = await client.land_info(lat=10.95, lon=76.96)
    """

    def __init__(self, rate_per_second: float = 2.0, max_retries: int = 3):
        self.session    = TNGISSession()
        self.enc        = TNGISEncryption()
        self.limiter    = RateLimiter(rate_per_second)
        self.max_retries = max_retries
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self):
        self._client = httpx.AsyncClient(timeout=30, follow_redirects=True)
        await self.session.init()
        return self

    async def __aexit__(self, *args):
        if self._client:
            await self._client.aclose()

    # ------------------------------------------------------------------
    # Core POST helper
    # ------------------------------------------------------------------
    async def _post(self, endpoint: str, payload: dict) -> dict | None:
        """
        Encrypt payload and POST to the given endpoint.
        Handles retries, rate limiting, and session refresh.
        """
        for attempt in range(self.max_retries):
            try:
                await self.limiter.wait()
                await self.session.ensure_valid()

                raw_payload = json.dumps(payload)
                encrypted   = self.enc.encrypt(raw_payload, self.session.key)

                if not encrypted:
                    print(f"[Client] Encryption failed for {endpoint}")
                    return None

                body    = json.dumps({"payload": encrypted})
                headers = self.session.auth_headers()

                resp = await self._client.post(
                    f"{GI_API_BASE}/{endpoint}",
                    content=body,
                    headers=headers,
                )

                if resp.status_code == 429:
                    wait = 2 ** attempt * 5  # 5s, 10s, 20s
                    print(f"[Client] 429 Rate limited — waiting {wait}s")
                    await asyncio.sleep(wait)
                    continue

                if resp.status_code >= 500:
                    print(f"[Client] Server error {resp.status_code} on {endpoint}, retry {attempt+1}")
                    await asyncio.sleep(2 ** attempt)
                    continue

                resp.raise_for_status()
                raw = resp.json()

                # Decrypt response if it has a payload envelope
                if isinstance(raw, dict) and "payload" in raw:
                    decrypted = self.enc.decrypt(raw["payload"], self.session.key)
                    if decrypted:
                        return json.loads(decrypted)
                    else:
                        return None

                return raw

            except httpx.TimeoutException:
                print(f"[Client] Timeout on {endpoint}, retry {attempt+1}")
                await asyncio.sleep(2 ** attempt)
            except Exception as e:
                print(f"[Client] Error on {endpoint}: {e}, retry {attempt+1}")
                await asyncio.sleep(2 ** attempt)

        return None

    # ------------------------------------------------------------------
    # API Endpoints
    # ------------------------------------------------------------------

    async def land_info(self, lat: float, lon: float) -> dict | None:
        """
        Core parcel lookup by GPS coordinate.
        Returns: ULPIN, survey_no, village_code, rural_urban, geojson_geom
        """
        result = await self._post("land-info", {
            "latitude":  lat,
            "longitude": lon,
        })
        if result and result.get("success") == 1:
            return result.get("data")
        return None

    async def ownership_details(self, parcel: dict) -> dict | None:
        """
        Rural land ownership (Patta details).
        Parcel must contain district_code, taluk_code, village_code,
        survey_number, sub_division_number from land_info().
        """
        payload = {
            "district_code":      parcel.get("district_code"),
            "taluk_code":         parcel.get("taluk_code"),
            "village_code":       parcel.get("village_code"),
            "survey_number":      parcel.get("survey_number"),
            "sub_division_number": parcel.get("sub_division_number"),
        }
        result = await self._post("land/ownership-details", payload)
        if result and result.get("success") == 1:
            return result.get("data")
        return None

    async def urban_ownership_details(self, parcel: dict) -> dict | None:
        """Urban TSLR land ownership details."""
        payload = {
            "district_code": parcel.get("district_code"),
            "taluk_code":    parcel.get("taluk_code"),
            "town_code":     parcel.get("revenue_town_code"),
            "ward_code":     parcel.get("firka_ward_number"),
            "block_code":    parcel.get("urban_block_number"),
            "survey_number": parcel.get("survey_number"),
        }
        result = await self._post("land/urban-ownership-details", payload)
        if result and result.get("success") == 1:
            return result.get("data")
        return None

    async def fmb_sketch(self, parcel: dict) -> dict | None:
        """FMB sketch image and geometry."""
        payload = {
            "district_code":      parcel.get("district_code"),
            "taluk_code":         parcel.get("taluk_code"),
            "village_code":       parcel.get("village_code"),
            "survey_number":      parcel.get("survey_number"),
            "sub_division_number": parcel.get("sub_division_number"),
        }
        result = await self._post("land/fmb-sketch", payload)
        if result and result.get("success") == 1:
            return result.get("data")
        return None

    async def guideline_value(self, lat: float, lon: float) -> dict | None:
        """IGR Registration Department guideline land value."""
        result = await self._post("land/guideline-value", {
            "latitude":  lat,
            "longitude": lon,
        })
        if result and result.get("success") == 1:
            return result.get("data")
        return None

    async def property_intersection(self, geojson: dict) -> list | None:
        """Building footprints intersecting the parcel polygon."""
        result = await self._post("land/property-intersection", {
            "type":            "buildings",
            "geojson":         geojson,
            "return_geometry": True,
        })
        if result and result.get("success") == 1:
            return result.get("data")
        return None

    async def master_plan(self, lat: float, lon: float) -> dict | None:
        """Master plan land use classification."""
        result = await self._post("master_plan_feature_extract", {
            "latitude":  lat,
            "longitude": lon,
        })
        if result and result.get("success") == 1:
            return result.get("data")
        return None

    async def full_parcel(self, lat: float, lon: float) -> dict | None:
        """
        Convenience method: fetches land_info + ownership in one call.
        Returns a merged dict with all basic parcel data.
        """
        parcel = await self.land_info(lat, lon)
        if not parcel:
            return None

        is_urban = parcel.get("rural_urban") == "urban"

        if is_urban:
            ownership = await self.urban_ownership_details(parcel)
        else:
            ownership = await self.ownership_details(parcel)

        return {**parcel, "ownership": ownership}


# ------------------------------------------------------------------
# Quick test
# ------------------------------------------------------------------
async def _test():
    """Test with a known Coimbatore coordinate (Coimbatore city center)."""
    print("[Test] Testing TNGIS API client...")
    print("[Test] Coordinate: Coimbatore city (11.0168, 76.9558)")

    async with TNGISClient(rate_per_second=1.0) as client:
        parcel = await client.land_info(lat=11.0168, lon=76.9558)

        if parcel:
            print(f"\n  ULPIN         : {parcel.get('ulpin', 'N/A')}")
            print(f"  District      : {parcel.get('district_name', 'N/A')}")
            print(f"  Taluk         : {parcel.get('taluk_name', 'N/A')}")
            print(f"  Village       : {parcel.get('village_name', 'N/A')}")
            print(f"  Survey No     : {parcel.get('survey_number', 'N/A')}")
            print(f"  Subdivision   : {parcel.get('sub_division_number', 'N/A')}")
            print(f"  Rural/Urban   : {parcel.get('rural_urban', 'N/A')}")
            print(f"  Has GeoJSON   : {'Yes' if parcel.get('geojson_geom') else 'No'}")
            print("\nOK land_info test PASSED")
        else:
            print("\nWARN land_info returned None — check encryption or session")

if __name__ == "__main__":
    asyncio.run(_test())
