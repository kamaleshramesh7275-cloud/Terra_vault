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

    # Check if host is internal (Render private networking e.g. terravault-db or docker container)
    # Internal Render connections do NOT support SSL and will fail if SSL is required
    is_internal_host = (
        "localhost" in db_url
        or "127.0.0.1" in db_url
        or "terravault-db" in db_url
        or ("@" in db_url and "." not in db_url.split("@")[1].split("/")[0].split(":")[0])
    )

    connect_args = {"timeout": 10}
    if not is_internal_host:
        connect_args["ssl"] = "require"

    engine_kwargs = {
        "echo": False,
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
        "connect_args": connect_args,
    }
    sync_url = settings.SYNC_DATABASE_URL
    if sync_url.startswith("postgres://"):
        sync_url = sync_url.replace("postgres://", "postgresql://", 1)
    try:
        sync_engine = create_engine(sync_url)
    except Exception:
        sync_engine = create_engine("sqlite:///./terravault_local.db", echo=False)

try:
    engine = create_async_engine(db_url, **engine_kwargs)
except Exception:
    engine = create_async_engine("sqlite+aiosqlite:///./terravault_local.db", echo=False)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


async def _init_sqlite_fallback():
    global engine, AsyncSessionLocal
    fallback_engine = create_async_engine("sqlite+aiosqlite:///./terravault_local.db", echo=False)
    async with fallback_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    engine = fallback_engine
    AsyncSessionLocal = async_sessionmaker(
        fallback_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )
    return AsyncSessionLocal


async def get_db():
    """FastAPI dependency: yields an async DB session with automatic SQLite fallback."""
    global AsyncSessionLocal, engine
    try:
        async with AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception as e:
                await session.rollback()
                err_msg = str(e).lower()
                # Check for network/connection/auth errors with remote database
                if any(k in err_msg for k in ("connection", "timeout", "refused", "closed", "ssl", "cannot connect", "authenticat")):
                    import structlog
                    structlog.get_logger().warning("database.failover_to_sqlite", error=str(e))
                    fallback_maker = await _init_sqlite_fallback()
                    async with fallback_maker() as fb_session:
                        yield fb_session
                        await fb_session.commit()
                else:
                    raise
            finally:
                await session.close()
    except Exception as outer_err:
        outer_msg = str(outer_err).lower()
        if any(k in outer_msg for k in ("connection", "timeout", "refused", "closed", "ssl", "cannot connect", "authenticat")):
            import structlog
            structlog.get_logger().warning("database.failover_to_sqlite_outer", error=str(outer_err))
            fallback_maker = await _init_sqlite_fallback()
            async with fallback_maker() as fb_session:
                yield fb_session
                await fb_session.commit()
        else:
            raise
