"""
SmartCattle Net
database/session.py

Purpose
-------
Creates and exposes:
- The async SQLAlchemy engine (``engine``)
- The async session factory (``AsyncSessionLocal``)
- ``get_db`` — an async FastAPI dependency that yields a database session
  and guarantees it is closed after the request, even on exception.
- ``init_db`` — called once on application startup to create all tables
  that are not yet present in the database (no-op in production after the
  first run; use Alembic migrations for schema changes).

Design decisions
----------------
- ``create_async_engine`` is used throughout so I/O never blocks the
  event loop.  The underlying driver is ``asyncpg``.
- ``expire_on_commit=False`` on the session factory prevents SQLAlchemy
  from issuing a SELECT after every commit when attributes are accessed
  later in the same request, which would require an open transaction.
- Connection pool settings are sensible defaults for a single-instance
  FastAPI deployment; they can be overridden via environment variables
  if needed.
- ``DATABASE_URL`` must begin with ``postgresql+asyncpg://``.  If a plain
  ``postgresql://`` or ``postgresql+psycopg2://`` URL is given, the
  driver prefix is corrected automatically with a warning.

Dependencies
------------
- sqlalchemy[asyncio] >= 2.0
- asyncpg
- app.core.config  (settings.DATABASE_URL)
- app.database.base  (Base, for create_all)
- app.utils.logger
"""

from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings
from app.database.base import Base
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Engine URL normalisation
# ---------------------------------------------------------------------------

_RAW_URL: str = settings.DATABASE_URL
print("DATABASE_URL =", repr(_RAW_URL))

def _normalise_db_url(url: str) -> str:
    """
    Ensure the database URL uses the ``postgresql+asyncpg://`` scheme.

    SQLAlchemy's async engine requires an async-compatible driver.
    This function transparently converts legacy URL schemes so the app
    starts even if the env variable contains a plain ``postgresql://``
    connection string.

    Parameters
    ----------
    url : str
        Raw connection string from settings.

    Returns
    -------
    str
        Connection string guaranteed to start with
        ``postgresql+asyncpg://``.
    """
    replacements = (
        ("postgresql+psycopg2://", "postgresql+asyncpg://"),
        ("postgres://", "postgresql+asyncpg://"),
        ("postgresql://", "postgresql+asyncpg://"),
    )
    for old, new in replacements:
        if url.startswith(old):
            logger.warning(
                "DATABASE_URL scheme corrected: %r → using asyncpg driver",
                old,
            )
            return url.replace(old, new, 1)
    return url


_ASYNC_DATABASE_URL: str = _normalise_db_url(_RAW_URL)

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

engine: AsyncEngine = create_async_engine(
    _ASYNC_DATABASE_URL,
    # ---- pool settings -------------------------------------------------------
    pool_size=10,          # base number of persistent connections
    max_overflow=20,       # extra connections allowed above pool_size
    pool_timeout=30,       # seconds to wait before raising OperationalError
    pool_recycle=1800,     # recycle connections every 30 min (avoids stale TCP)
    pool_pre_ping=True,    # test each connection before use; drops dead ones
    # ---- misc ----------------------------------------------------------------
    echo=False,            # set True only during local debugging
)

logger.info("Async database engine created for %s", _ASYNC_DATABASE_URL.split("@")[-1])

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # prevent lazy-load errors after commit
    autoflush=False,
    autocommit=False,
)

# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a transactional database session.

    Yields a fresh ``AsyncSession`` for the duration of a single HTTP
    request.  The session is always closed in the ``finally`` block,
    even if an unhandled exception propagates.

    Usage
    -----
    ::

        from fastapi import Depends
        from sqlalchemy.ext.asyncio import AsyncSession
        from app.database.session import get_db

        @router.get("/cows")
        async def list_cows(db: AsyncSession = Depends(get_db)):
            ...

    Yields
    ------
    AsyncSession
        A live, uncommitted SQLAlchemy async session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ---------------------------------------------------------------------------
# Table creation helper (startup)
# ---------------------------------------------------------------------------


async def init_db() -> None:
    """
    Create all databasFe tables defined in ``Base.metadata`` if they do
    not already exist.

    This is a convenience method for development and first-run deployment.
    In production, use Alembic migrations Finstead of calling this directly.

    Called from the FastAPI lifespan context in ``main.py``.
    """
    async with engine.begin() as conn:
        # Import all models so their metadata is registered on Base
        import app.database.models  # noqa: F401  — side-effect import

        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified / created successfully.")
