"""
tngis_session.py
================
Session manager for the TNGIS GI Viewer API.

Handles:
  - Fetching a fresh sessionKey / sessionId / csrfToken from /session-key
  - Auto-refreshing before 10-minute TTL expires
  - Thread-safe refresh with asyncio
"""

import asyncio
import time
import httpx
import json

SESSION_KEY_URL = "https://tngis.tn.gov.in/apps/gi_viewer_api/gi_mvc/api/v1/session-key"
GI_API_BASE     = "https://tngis.tn.gov.in/apps/gi_viewer_api/gi_mvc/api/v1"

# Public browser headers to mimic a real browser request
BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/127.0.0.0 Safari/537.36"
    ),
    "Referer": "https://tngis.tn.gov.in/apps/gi_viewer/map-viewer/index.html",
    "Origin":  "https://tngis.tn.gov.in",
    "Accept":  "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
}


class TNGISSession:
    """
    Manages a TNGIS API session with automatic key rotation.

    Usage (async):
        session = TNGISSession()
        await session.init()
        headers = session.auth_headers()   # Returns headers for API calls
    """

    def __init__(self, refresh_margin_s: int = 60):
        """
        Args:
            refresh_margin_s: Refresh the session this many seconds before expiry.
        """
        self.session_key:   str | None = None
        self.session_id:    str | None = None
        self.csrf_token:    str | None = None
        self.expires_at:    float      = 0.0
        self.refresh_margin = refresh_margin_s
        self._lock          = asyncio.Lock()

    async def init(self):
        """Fetch initial session credentials."""
        await self._refresh()

    async def ensure_valid(self):
        """Refresh session if it's about to expire."""
        if time.monotonic() >= (self.expires_at - self.refresh_margin):
            async with self._lock:
                # Double-check after acquiring lock
                if time.monotonic() >= (self.expires_at - self.refresh_margin):
                    await self._refresh()

    async def _refresh(self):
        """Fetch fresh session credentials from /session-key."""
        print("[Session] Refreshing session key...")
        async with httpx.AsyncClient(headers=BROWSER_HEADERS, timeout=15) as client:
            resp = await client.get(SESSION_KEY_URL)
            resp.raise_for_status()
            data = resp.json()

        self.session_key = data["sessionKey"]
        self.session_id  = data["sessionId"]
        self.csrf_token  = data["csrfToken"]
        expires_in       = int(data.get("expiresIn", 600))
        self.expires_at  = time.monotonic() + expires_in
        print(f"[Session] New session_id={self.session_id[:8]}... (expires in {expires_in}s)")

    def auth_headers(self) -> dict:
        """Return request headers required for authenticated API calls."""
        return {
            **BROWSER_HEADERS,
            "X-Secure-Request": "true",
            "X-Session-ID":     self.session_id or "",
            "X-CSRF-Token":     self.csrf_token or "",
            "Content-Type":     "application/json",
        }

    @property
    def key(self) -> str:
        """Current AES session key."""
        return self.session_key or ""

    def is_valid(self) -> bool:
        return (
            self.session_key is not None
            and time.monotonic() < self.expires_at
        )


# ---------------------------------------------------------------------------
# Quick test
# ---------------------------------------------------------------------------
async def _test():
    session = TNGISSession()
    await session.init()
    print(f"  session_key  = {session.session_key[:16]}...")
    print(f"  session_id   = {session.session_id}")
    print(f"  csrf_token   = {session.csrf_token[:16]}...")
    print(f"  valid        = {session.is_valid()}")
    print("OK Session init PASSED")


if __name__ == "__main__":
    asyncio.run(_test())
