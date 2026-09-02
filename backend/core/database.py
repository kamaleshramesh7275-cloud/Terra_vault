"""Terra_vault — SQLAlchemy Async Database Engine + Base"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from core.config import settings

db_url = settings.DATABASE_URL

# Normalise scheme so asyncpg driver is always used for postgres
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Strip any query params that asyncpg does not understand
# (sslmode, channel_binding) — SSL is passed via connect_args instead
if "?" in db_url and db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.split("?")[0]

_is_sqlite = db_url.startswith("sqlite")

engine_kwargs: dict = {
    "echo": False,
}

if not _is_sqlite:
    engine_kwargs.update({
        "pool_pre_ping": True,
        # Neon's PgBouncer pooler manages its own pool — keep SA pool small
        "pool_size": 5,
        "max_overflow": 10,
        # Neon requires SSL — pass via connect_args (asyncpg style)
        "connect_args": {"ssl": "require"},
    })

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
