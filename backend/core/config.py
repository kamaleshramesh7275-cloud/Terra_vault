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

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://terravault:terravault_secret@localhost:5432/terravault"
    SYNC_DATABASE_URL: str = "postgresql://terravault:terravault_secret@localhost:5432/terravault"

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
    POLYGON_PRIVATE_KEY: str = ""
    CONTRACT_ADDRESS: str = ""
    POLYGON_CHAIN_ID: int = 80002  # Amoy testnet

    # ML Models
    ML_MODELS_DIR: str = "/app/ml_models"
    DATA_DIR: str = "/app/data"

    # OCR Confidence threshold for review queue
    CONFIDENCE_THRESHOLD: float = 0.75


settings = Settings()
