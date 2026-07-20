"""
SmartCattle Net
database/base.py

Purpose
-------
Defines the SQLAlchemy DeclarativeBase that every ORM model inherits from,
plus a TimestampMixin that automatically manages ``created_at`` and
``updated_at`` columns.

Design decisions
----------------
- Uses SQLAlchemy 2.x ``DeclarativeBase`` (not the legacy
  ``declarative_base()`` factory) for full type-hint support and
  compatibility with ``MappedColumn``.
- ``TimestampMixin`` stores all timestamps in UTC with timezone awareness
  (``TIMESTAMP(timezone=True)``).
- ``server_default`` is used for ``created_at`` so the database itself
  sets the value — avoiding clock-skew issues between app servers.
- ``onupdate`` on ``updated_at`` is handled at the SQLAlchemy level so it
  works regardless of the underlying PostgreSQL version.

Dependencies
------------
- sqlalchemy >= 2.0
- app.utils.logger
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import TIMESTAMP, func
from sqlalchemy.orm import DeclarativeBase, Mapped, MappedColumn, mapped_column

from app.utils.logger import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Declarative base
# ---------------------------------------------------------------------------


class Base(DeclarativeBase):
    """
    Project-wide SQLAlchemy declarative base.

    All ORM model classes must inherit from this class directly or
    indirectly (via a mixin that also inherits from it).

    Example
    -------
    ::

        from app.database.base import Base

        class Cow(Base):
            __tablename__ = "cows"
            id: Mapped[int] = mapped_column(primary_key=True)
    """


# ---------------------------------------------------------------------------
# Timestamp mixin
# ---------------------------------------------------------------------------


class TimestampMixin:
    """
    Mixin that adds ``created_at`` and ``updated_at`` audit columns.

    Both columns are timezone-aware UTC timestamps.

    Columns
    -------
    created_at : datetime
        Set once at INSERT time by the database server.
    updated_at : datetime
        Updated automatically by SQLAlchemy on every UPDATE.

    Usage
    -----
    ::

        class PredictionRecord(TimestampMixin, Base):
            __tablename__ = "prediction_records"
            ...
    """

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
        doc="UTC timestamp when the row was first inserted.",
    )

    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=lambda: datetime.now(tz=timezone.utc),
        nullable=False,
        doc="UTC timestamp of the last UPDATE on this row.",
    )
