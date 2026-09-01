"""
Terra_vault — FastAPI Backend Entry Point
"""
from contextlib import asynccontextmanager
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from api import ingest, records, review, gis_sync, maturity, blockchain, auth, ocr, fraud, admin, geoai, graph_fraud, digital_twin
from core.config import settings
from core.database import engine, Base
from core.elasticsearch_client import es_client
from core.minio_client import ensure_bucket

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    log.info("terra_vault.startup", env=settings.ENVIRONMENT)
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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
static_dir = Path(settings.DATA_DIR) / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:80"],
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


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "service": "terra_vault"}
