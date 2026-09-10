"""
Terra_vault — FastAPI Backend Entry Point
"""
from contextlib import asynccontextmanager
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from api import ingest, records, review, gis_sync, maturity, blockchain, auth, ocr, fraud, admin, geoai, graph_fraud, digital_twin, export, digilocker
from core.config import settings
from core.database import engine, Base
from core.elasticsearch_client import es_client
from core.minio_client import ensure_bucket

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    log.info("terra_vault.startup", env=settings.ENVIRONMENT)
    # Create all tables (safe fallback if remote DB port is blocked)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        log.warning("startup.db_tables_init_failed", error=str(e))
    # Ensure MinIO bucket exists
    try:
        await ensure_bucket(settings.MINIO_BUCKET)
    except Exception as e:
        log.warning("startup.minio_unavailable", error=str(e))
    # Ensure Elasticsearch index exists
    try:
        await es_client.ensure_indices()
    except Exception as e:
        log.warning("startup.elasticsearch_unavailable", error=str(e))
    yield
    log.info("terra_vault.shutdown")
    await engine.dispose()
    try:
        await es_client.close()
    except Exception:
        pass


app = FastAPI(
    title="Terra_vault API",
    description="AI-powered Indian land record digitization platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Serve static files locally for offline fallback
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import FileResponse, Response
from fastapi import HTTPException
import httpx

static_dir = Path(settings.DATA_DIR) / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/tiles/cadastral/{z}/{x}/{y}.png")
async def get_cadastral_tile(z: int, x: int, y: int):
    """Serve official TNGIS cadastral parcel tile (local cache or live fetch)."""
    # 1. Check local downloaded cache
    local_path = Path(__file__).resolve().parent.parent / "scripts" / "data" / "tiles" / f"z{z}" / f"{x}_{y}.png"
    if local_path.exists():
        return FileResponse(str(local_path), media_type="image/png")
    
    # 2. Fallback: proxy directly from TNGIS
    tngis_url = f"https://tngis.tn.gov.in/data/xyz_tiles/cadastral_xyz/{z}/{x}/{y}.png"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        "Referer": "https://tngis.tn.gov.in/apps/gi_viewer/map-viewer/index.html",
        "Accept": "image/png,image/*,*/*"
    }
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(tngis_url, headers=headers)
            if r.status_code == 200 and len(r.content) > 0:
                # Cache to disk for future fast access
                local_path.parent.mkdir(parents=True, exist_ok=True)
                local_path.write_bytes(r.content)
                return Response(content=r.content, media_type="image/png")
    except Exception:
        pass
    
    raise HTTPException(status_code=404, detail="Tile not found")


# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,       prefix="/api/auth",       tags=["auth"])
app.include_router(ingest.router,     prefix="/api/ingest",     tags=["ingest"])
app.include_router(records.router,    prefix="/api/records",    tags=["records"])
app.include_router(review.router,     prefix="/api/review",     tags=["review"])
app.include_router(ocr.router,        prefix="/api/ocr",        tags=["ocr"])
app.include_router(gis_sync.router,   prefix="/api/gis",        tags=["gis"])
app.include_router(maturity.router,   prefix="/api/maturity",   tags=["maturity"])
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["blockchain"])
app.include_router(fraud.router,      prefix="/api/fraud",      tags=["fraud"])
app.include_router(admin.router,      prefix="/api/admin",      tags=["admin"])
app.include_router(geoai.router,      prefix="/api/geoai",      tags=["geoai"])
app.include_router(graph_fraud.router,  prefix="/api/graph",        tags=["graph"])
app.include_router(digital_twin.router, prefix="/api/digital-twin", tags=["digital-twin"])
app.include_router(export.router,       prefix="/api/export",       tags=["export"])
app.include_router(digilocker.router,   prefix="/api/digilocker",   tags=["digilocker"])



@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "terra_vault"}
