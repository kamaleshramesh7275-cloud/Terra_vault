"""Terra_vault — Application Settings (Pydantic v2)"""
from pydantic_settings import BaseSettings, SettingsConfigDict


import os
from pathlib import Path
root_env = Path(__file__).parent.parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(root_env), extra="ignore")
    # App
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "change_me"
    LOG_LEVEL: str = "INFO"

    # Database (Defaults to SQLite; will use PostgreSQL if DATABASE_URL env var is provided)
    DATABASE_URL: str = "sqlite+aiosqlite:////app/data/terravault.db"
    SYNC_DATABASE_URL: str = "sqlite:////app/data/terravault.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "terravault"
    MINIO_SECRET_KEY: str = "terravault_minio_secret"
    MINIO_BUCKET: str = "terravault-docs"
    MINIO_SECURE: bool = False

    # Elasticsearch
    ELASTICSEARCH_URL: str = "http://localhost:9200"

    # Neo4j
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "terravault_neo4j"

    # Blockchain — Polygon Amoy Testnet
    POLYGON_RPC_URL: str = "https://rpc-amoy.polygon.technology"
    POLYGON_RPC_FALLBACK_1: str = "https://polygon-amoy.drpc.org"
    POLYGON_RPC_FALLBACK_2: str = "https://80002.rpc.thirdweb.com"
    POLYGON_PRIVATE_KEY: str = ""
    CONTRACT_ADDRESS: str = ""
    POLYGON_CHAIN_ID: int = 80002  # Amoy testnet

    # ML Models
    ML_MODELS_DIR: str = "/app/ml_models"
    DATA_DIR: str = "/app/data"

    # OCR Confidence threshold for review queue
    CONFIDENCE_THRESHOLD: float = 0.75

    # Copernicus Sentinel-2 Open Data API Credentials
    SENTINEL_CLIENT_ID: str = "sh-c12a8e15-7f09-49d7-9498-d173d535885a"
    SENTINEL_CLIENT_SECRET: str = "5Oww1esEWM4vZyln7vhF6vZxkC2YLTfV"

    # ── Fine-Tuning Thresholds: OCR Engine ────────────────────────────────────
    OCR_LGD_FUZZY_THRESHOLD: float = 0.75       # Adaptive: 0.70 (low-conf) – 0.90 (high-conf)
    OCR_CRITICAL_FIELD_CONF_THRESHOLD: float = 0.95  # Khasra/Owner fields need 95% for green
    OCR_STANDARD_FIELD_CONF_THRESHOLD: float = 0.90  # Standard fields ≥90% = green
    OCR_HEATMAP_AMBER_THRESHOLD: float = 0.70   # Below this = red
    ENSEMBLE_TROCR_WEIGHT: float = 1.5          # TrOCR weight multiplier for printed text

    # ── Fine-Tuning Thresholds: Upload Quality Gatekeeper ─────────────────────
    IQA_BLUR_THRESHOLD_96DPI: float = 60.0      # Laplacian variance threshold at 96dpi
    IQA_BLUR_THRESHOLD_300DPI: float = 200.0    # Laplacian variance threshold at 300dpi
    IQA_SKEW_ANGLE_LIMIT: float = 1.5           # Degrees — flag if skew exceeds this
    IQA_GLARE_OVEREXPOSED_PCT: float = 0.08     # Fraction of pixels >240 intensity
    IQA_DPI_MINIMUM: int = 150                  # Below this = low_resolution flag
    IQA_TORN_BORDER_THRESHOLD: float = 1.5      # % of white pixels = torn border
    # Health score weights (must sum to 1.0)
    IQA_WEIGHT_BLUR: float = 0.30
    IQA_WEIGHT_SKEW: float = 0.20
    IQA_WEIGHT_DPI: float = 0.20
    IQA_WEIGHT_GLARE: float = 0.15
    IQA_WEIGHT_TORN: float = 0.15

    # ── Fine-Tuning Thresholds: Inpainting & Self-Learning ────────────────────
    INPAINT_TEXT_REGION_CONFIDENCE: float = 0.90   # Minimum confidence for text region inpainting
    INPAINT_TORN_BORDER_CONFIDENCE: float = 0.80   # Lower bar for border reconstruction
    INPAINT_NAVIER_STOKES_FALLBACK: float = 0.60   # If Telea < this → use Navier-Stokes
    SELF_LEARNING_RETRAIN_THRESHOLD_DEV: int = 10
    SELF_LEARNING_RETRAIN_THRESHOLD_STAGING: int = 100
    SELF_LEARNING_RETRAIN_THRESHOLD_PROD: int = 500
    SELF_LEARNING_HF_TRAIN_SPLIT: float = 0.80
    SELF_LEARNING_HF_VAL_SPLIT: float = 0.10
    SELF_LEARNING_HF_TEST_SPLIT: float = 0.10
    SELF_LEARNING_HIGH_CONF_WEIGHT: float = 2.0    # Weight for high-confidence corrections

    # ── Fine-Tuning Thresholds: GeoAI Satellite ───────────────────────────────
    NDVI_KHARIF_THRESHOLD: float = 0.30         # Jun–Oct crop cover threshold
    NDVI_RABI_THRESHOLD: float = 0.20           # Nov–Mar crop cover threshold
    NDVI_DEFAULT_THRESHOLD: float = 0.35        # Off-season default
    NDBI_BUILDUP_THRESHOLD: float = 0.25        # Built-up land detection threshold
    GEO_IOU_MATCHED: float = 0.95              # ≥95% = MATCHED
    GEO_IOU_PARTIAL: float = 0.80              # 80–95% = PARTIAL_MATCH, <80% = MISMATCH
    SENTINEL_TOKEN_CACHE_BUFFER_SEC: int = 60   # Refresh token if expiry < 60s

    # ── Fine-Tuning Thresholds: ZK Blockchain ─────────────────────────────────
    ZK_PROOF_TTL_HOURS: int = 24               # Proof validity period
    ZK_TITLE_CLEANLINESS_MIN: float = 80.0     # Minimum cleanliness score for valid proof

    # ── Fine-Tuning Thresholds: Temporal Graph AI ─────────────────────────────
    GRAPH_CIRCULAR_FLIP_MONTHS_CRITICAL: int = 6    # ≤6 months = CRITICAL
    GRAPH_CIRCULAR_FLIP_MONTHS_HIGH: int = 12       # ≤12 months = HIGH
    GRAPH_CIRCULAR_FLIP_MONTHS_MEDIUM: int = 24     # ≤24 months = MEDIUM
    GRAPH_VALUATION_CRITICAL_PCT: float = 100.0     # >100% inflation = CRITICAL
    GRAPH_VALUATION_HIGH_PCT: float = 50.0          # 50–100% = HIGH
    GRAPH_VALUATION_MEDIUM_PCT: float = 20.0        # 20–50% = MEDIUM
    GRAPH_WITNESS_FUZZY_THRESHOLD: float = 0.85     # ≥85% name similarity = same witness
    GRAPH_DORMANT_HIJACK_YEARS: int = 15            # Years of zero activity = hijack window

    # ── Fine-Tuning Thresholds: Digital Twin ──────────────────────────────────
    TWIN_DEM_GRID_SIZE_SMALL: int = 8          # For parcels ≤2000 sq.m
    TWIN_DEM_GRID_SIZE_LARGE: int = 16         # For parcels >2000 sq.m
    TWIN_ENCROACHMENT_MIN_SQM: float = 5.0     # Minimum overlap to flag encroachment
    TWIN_ENCROACHMENT_PROB: float = 0.35       # Simulation probability

    # ── Fine-Tuning Thresholds: Signature Authenticator ───────────────────────
    SIG_HAMMING_DEFINITE_FORGERY: int = 5      # Hamming distance < 5 = definite forgery
    SIG_HAMMING_PROBABLE_FORGERY: int = 12     # 5–12 = probable forgery
    SIG_HAMMING_SIMILAR: int = 20             # 12–20 = similar

    # ── Fine-Tuning Thresholds: Ink Tampering Detector ────────────────────────
    TAMPER_MULTI_INK_STD_THRESHOLD: float = 55.0   # Pixel std dev > this = bimodal inks
    TAMPER_WHITENER_LUMINANCE: float = 230.0        # Pixel brightness threshold for whitener
    TAMPER_WHITENER_MIN_AREA_PX: int = 200          # Min blob area for whitener detection
    TAMPER_RISK_MULTI_INK: float = 30.0
    TAMPER_RISK_WHITENER: float = 45.0
    TAMPER_RISK_CLONE: float = 50.0

    # ── Fine-Tuning Thresholds: Handwriting Clusterer ─────────────────────────
    HW_FEATURE_DIMS: int = 6                   # Feature vector dimensions
    HW_KMEANS_ITERATIONS: int = 15             # K-Means max iterations
    HW_KMEANS_CONVERGENCE_DELTA: float = 0.001 # Centroid delta for convergence
    HW_SUSPICIOUS_CLUSTER_MIN_PAGES: int = 3   # Pages sharing style = suspicious
    HW_SUSPICIOUS_CLUSTER_MIN_STRICT: int = 2  # Strict mode threshold

    # ── Fine-Tuning Thresholds: Cross-Validator ───────────────────────────────
    CROSSVAL_STAMP_DUTY_TN: float = 0.07       # Tamil Nadu
    CROSSVAL_STAMP_DUTY_MH: float = 0.06       # Maharashtra
    CROSSVAL_STAMP_DUTY_UP: float = 0.05       # Uttar Pradesh
    CROSSVAL_STAMP_DUTY_KA: float = 0.056      # Karnataka
    CROSSVAL_OWNER_FUZZY_SHORT: float = 0.85   # Names ≤5 chars
    CROSSVAL_OWNER_FUZZY_LONG: float = 0.75    # Names >5 chars
    CROSSVAL_AREA_SMALL_DEVIATION: float = 0.08  # ≤1000 sq.m → 8% tolerance
    CROSSVAL_AREA_LARGE_DEVIATION: float = 0.03  # >1000 sq.m → 3% tolerance


settings = Settings()
