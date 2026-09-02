"""Alembic env.py — Terra_vault (Neon PostgreSQL)"""
import os
import sys
from logging.config import fileConfig
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Make sure 'core' is importable from this script ──────────────────────
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load .env from repo root
load_dotenv(Path(__file__).parent.parent.parent / ".env")

# ── Alembic config object ─────────────────────────────────────────────────
config = context.config

# Inject the sync DB URL from env (psycopg2 driver, Neon needs sslmode=require)
sync_url = os.getenv("SYNC_DATABASE_URL", "")
if sync_url and not sync_url.endswith("sslmode=require"):
    sync_url = sync_url.split("?")[0] + "?sslmode=require"
config.set_main_option("sqlalchemy.url", sync_url)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Import all models so autogenerate can detect them ────────────────────
from core.database import Base  # noqa: E402
import core.models  # noqa: E402, F401  — registers all ORM models on Base.metadata

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (generates SQL script)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (applies to live DB)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args={"sslmode": "require"},
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
