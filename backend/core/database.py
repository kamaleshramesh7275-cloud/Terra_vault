import os
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from core.config import settings

# On Windows (local environment where port 5432 is often blocked) default to SQLite
# On Linux / Docker production (Render cloud), use Neon PostgreSQL
USE_LOCAL_SQLITE = (
    os.environ.get("USE_LOCAL_SQLITE", "").lower() in ("1", "true")
    or (os.name == "nt" and os.environ.get("USE_LOCAL_SQLITE", "").lower() != "false")
    or "sqlite" in settings.DATABASE_URL
)

if USE_LOCAL_SQLITE:
    db_url = "sqlite+aiosqlite:///./terravault_local.db"
    sync_db_url = "sqlite:///./terravault_local.db"
    _is_sqlite = True
    engine_kwargs = {"echo": False}
    sync_engine = create_engine(sync_db_url, echo=False)
else:
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if "?" in db_url and db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.split("?")[0]
    _is_sqlite = False
    engine_kwargs = {
        "echo": False,
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
        "connect_args": {"ssl": "require", "timeout": 10},
    }
    sync_engine = create_engine(settings.SYNC_DATABASE_URL)

engine = create_async_engine(db_url, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """FastAPI dependency: yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
