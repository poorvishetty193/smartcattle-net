"""
SmartCattle Net
database/models.py

Purpose
-------
Defines all SQLAlchemy ORM models for the application.

Models
------
- User            — authenticated platform users (farmers / admins)
- Cow             — individual dairy cow registry (belongs to a User)
- PredictionRecord — one complete CCP-Chain run result per cow per session

Design decisions
----------------
- Primary keys use server-generated UUIDs (``gen_random_uuid()``) so
  records can be created across multiple application instances without
  coordination.  Python-side UUIDs (``uuid4()``) are used as the
  ``default`` so the ORM can reference the PK before flushing.
- Passwords are stored as bcrypt hashes only — never plain text.
- ``PredictionRecord`` stores every stage output as individual nullable
  columns for easy querying and dashboard aggregation, plus a
  ``raw_response`` JSONB column for the complete pipeline result.
- All money/measurement values use ``Numeric`` with explicit precision to
  avoid floating-point accumulation errors in PostgreSQL.
- Foreign keys use ``ON DELETE CASCADE`` so deleting a ``User`` removes
  all their cows and prediction history automatically.
- The ``__repr__`` on each model is concise and safe (no passwords).

Dependencies
------------
- sqlalchemy >= 2.0
- app.database.base  (Base, TimestampMixin)
- app.utils.logger
"""

from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin
from app.utils.logger import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------


class User(TimestampMixin, Base):
    """
    Platform user — a farmer or administrator account.

    Columns
    -------
    id : UUID
        Server-generated primary key.
    email : str
        Unique login email.  Max 320 chars (RFC 5321).
    hashed_password : str
        bcrypt hash of the user's password.
    full_name : str | None
        Optional display name.
    is_active : bool
        Soft-delete / account suspension flag.
    is_admin : bool
        Grants access to admin-only endpoints.

    Relationships
    -------------
    cows : list[Cow]
        All cows registered under this user.
    prediction_records : list[PredictionRecord]
        All prediction runs initiated by this user.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
        doc="Unique user identifier.",
    )
    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        nullable=False,
        index=True,
        doc="Unique login email address.",
    )
    hashed_password: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        doc="bcrypt-hashed password — never store plain text.",
    )
    full_name: Mapped[Optional[str]] = mapped_column(
        String(256),
        nullable=True,
        doc="Optional display name.",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
        doc="False = account suspended / soft-deleted.",
    )
    is_admin: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        doc="True = admin privileges.",
    )

    # Relationships
    cows: Mapped[list["Cow"]] = relationship(
        "Cow",
        back_populates="owner",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    prediction_records: Mapped[list["PredictionRecord"]] = relationship(
        "PredictionRecord",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="noload",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} active={self.is_active}>"
    settings: Mapped[Optional["FarmSettings"]] = relationship(
    "FarmSettings",
    back_populates="user",
    uselist=False,
    cascade="all, delete-orphan",
    lazy="selectin",
)

# ---------------------------------------------------------------------------
# FarmSettings
# ---------------------------------------------------------------------------


class FarmSettings(TimestampMixin, Base):
    """
    Per-user SmartCattle Net farm and AI configuration settings.
    """

    __tablename__ = "farm_settings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
        doc="Unique settings identifier.",
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
        doc="The user who owns these settings.",
    )

    # -----------------------------------------------------------------------
    # Farm profile
    # -----------------------------------------------------------------------

    farm_name: Mapped[Optional[str]] = mapped_column(
        String(256),
        nullable=True,
        default="Green Valley Precision Dairy",
    )

    farm_location: Mapped[Optional[str]] = mapped_column(
        String(512),
        nullable=True,
        default="4428 County Road 12, Spring Valley, WI 54767",
    )

    timezone: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="CST (UTC -6)",
    )

    # -----------------------------------------------------------------------
    # Model thresholds
    # -----------------------------------------------------------------------

    milk_drop_threshold: Mapped[float] = mapped_column(
        Numeric(6, 2),
        nullable=False,
        default=15.0,
        doc="Milk drop percentage threshold.",
    )

    heat_stress_thi: Mapped[float] = mapped_column(
        Numeric(6, 2),
        nullable=False,
        default=72.0,
        doc="Heat stress THI threshold.",
    )

    scc_mastitis_threshold: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=200000.0,
        doc="Somatic cell count threshold for mastitis alerts.",
    )

    priority_score_cutoff: Mapped[float] = mapped_column(
        Numeric(6, 2),
        nullable=False,
        default=8.5,
        doc="Priority score cutoff out of 10.",
    )

    # -----------------------------------------------------------------------
    # Notifications
    # -----------------------------------------------------------------------

    critical_push: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    critical_email: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    critical_sms: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    daily_report_email: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    heat_push: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    heat_email: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    heat_sms: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )

    # -----------------------------------------------------------------------
    # Relationship
    # -----------------------------------------------------------------------

    user: Mapped["User"] = relationship(
        "User",
        back_populates="settings",
    )

    def __repr__(self) -> str:
        return (
            f"<FarmSettings id={self.id} "
            f"user_id={self.user_id} "
            f"farm_name={self.farm_name!r}>"
        )
# ---------------------------------------------------------------------------
# Cow
# ---------------------------------------------------------------------------


class Cow(TimestampMixin, Base):
    """
    Individual dairy cow registered on the platform.

    Columns
    -------
    id : UUID
        Server-generated primary key.
    cow_id : str
        Farm-assigned ID (e.g. ``"C04"``).  Unique per owner.
    owner_id : UUID
        Foreign key → User.id.
    breed : str | None
        Optional breed name (e.g. ``"Holstein"``).
    parity : int | None
        Current lactation number (matches feature ``parity`` in model).
    days_in_milk : int | None
        Current DIM at time of registration.
    notes : str | None
        Free-text field for farm notes.
    is_active : bool
        Soft-delete flag.

    Relationships
    -------------
    owner : User
    prediction_records : list[PredictionRecord]
    """

    __tablename__ = "cows"
    __table_args__ = (
        UniqueConstraint("owner_id", "cow_id", name="uq_cow_owner_cow_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4,
    server_default=text("gen_random_uuid()"),
    doc="Unique user identifier.",
)
    cow_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
        doc="Farm-assigned cow identifier (e.g. 'C04').",
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="FK → users.id — the farmer who owns this cow.",
    )
    breed: Mapped[Optional[str]] = mapped_column(
        String(128),
        nullable=True,
        doc="Breed name, e.g. 'Holstein', 'Jersey'.",
    )
    parity: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="Current lactation number (1 = first calf).",
    )
    days_in_milk: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="Days since last calving (DIM).",
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Free-text farm notes.",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true",
        nullable=False,
        doc="False = cow removed from active roster.",
    )

    # Relationships
    owner: Mapped["User"] = relationship(
        "User",
        back_populates="cows",
    )
    prediction_records: Mapped[list["PredictionRecord"]] = relationship(
        "PredictionRecord",
        back_populates="cow",
        cascade="all, delete-orphan",
        lazy="noload",
    )

    def __repr__(self) -> str:
        return (
            f"<Cow id={self.id} cow_id={self.cow_id!r} "
            f"parity={self.parity} dim={self.days_in_milk}>"
        )


# ---------------------------------------------------------------------------
# PredictionRecord
# ---------------------------------------------------------------------------


class PredictionRecord(TimestampMixin, Base):
    """
    One complete CCP-Chain inference run for a single cow session.

    Stores every stage output as a dedicated column for fast analytics,
    plus the full pipeline response as JSONB for flexible downstream use.

    Columns — Stage outputs
    -----------------------
    stage1_daily_yield    : float | None   S1 XGBoost daily yield (L)
    stage2_drop_prob      : float | None   S2 LightGBM drop probability
    stage2_drop_flag      : int | None     S2 binary drop alert
    stage3_next_milking   : float | None   S3 LSTM next milking yield (L)
    stage4_msi            : float | None   S4 Milk Stability Index (0–100)
    stage5_quantity       : float | None   S5 Ridge milk quantity (L)
    stage6_forecast_mean  : float | None   S6 7-day forecast mean (L)
    stage6_trend_slope    : float | None   S6 trend slope
    stage6_trend_dir      : int | None     S6 trend direction (-1/0/1)
    stage7_productivity   : float | None   S7 productivity score (0–100)
    stage8_stress_prob    : float | None   S8 stress probability
    stage8_stress_flag    : int | None     S8 binary stress label
    stage9_decision       : str | None     S9 farm decision string
    stage9_attention      : int | None     S9 needs-attention flag
    stage10_priority_score: float | None   S10 priority score (0–100)
    stage10_priority_rank : int | None     S10 rank within herd
    stage11_health_score  : float | None   S11 health score (0–100)
    stage12_risk_score    : float | None   S12 risk score (0–100)
    stage12_risk_flag     : int | None     S12 anomaly flag
    stage12_risk_level    : str | None     S12 risk label (low/medium/high)
    raw_response          : dict | None    Complete pipeline JSON
    """

    __tablename__ = "prediction_records"

    id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid.uuid4,
    server_default=text("gen_random_uuid()"),
    doc="Unique cow record identifier.",
)

    # ---------- Foreign keys --------------------------------------------------
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="FK → users.id — who triggered this prediction.",
    )
    cow_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cows.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="FK → cows.id — optional link to registered cow.",
    )

    # ---------- Request identifiers -------------------------------------------
    cow_label: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        doc="Farm cow ID string from the prediction request (e.g. 'C04').",
    )

    # ---------- Stage 1 -------------------------------------------------------
    stage1_daily_yield: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 4),
        nullable=True,
        doc="S1 XGBoost — predicted daily milk yield (litres).",
    )

    # ---------- Stage 2 -------------------------------------------------------
    stage2_drop_prob: Mapped[Optional[float]] = mapped_column(
        Numeric(6, 4),
        nullable=True,
        doc="S2 LightGBM — milk drop probability (0–1).",
    )
    stage2_drop_flag: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="S2 binary drop alert (0 = normal, 1 = drop predicted).",
    )

    # ---------- Stage 3 -------------------------------------------------------
    stage3_next_milking: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 4),
        nullable=True,
        doc="S3 LSTM — predicted next milking yield (litres).",
    )

    # ---------- Stage 4 -------------------------------------------------------
    stage4_msi: Mapped[Optional[float]] = mapped_column(
        Numeric(7, 4),
        nullable=True,
        doc="S4 Random Forest — Milk Stability Index (0–100).",
    )

    # ---------- Stage 5 -------------------------------------------------------
    stage5_quantity: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 4),
        nullable=True,
        doc="S5 Ridge+Poly — predicted session milk quantity (litres).",
    )

    # ---------- Stage 6 -------------------------------------------------------
    stage6_forecast_mean: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 4),
        nullable=True,
        doc="S6 — 7-day forecast mean yield (litres).",
    )
    stage6_trend_slope: Mapped[Optional[float]] = mapped_column(
        Numeric(10, 6),
        nullable=True,
        doc="S6 — trend slope (positive = increasing yield).",
    )
    stage6_trend_dir: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="S6 — trend direction: -1 decreasing, 0 stable, 1 increasing.",
    )

    # ---------- Stage 7 -------------------------------------------------------
    stage7_productivity: Mapped[Optional[float]] = mapped_column(
        Numeric(7, 4),
        nullable=True,
        doc="S7 Climate-Gated Ensemble — productivity score (0–100).",
    )

    # ---------- Stage 8 -------------------------------------------------------
    stage8_stress_prob: Mapped[Optional[float]] = mapped_column(
        Numeric(6, 4),
        nullable=True,
        doc="S8 GradientBoosting — heat stress probability (0–1).",
    )
    stage8_stress_flag: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="S8 binary stress label (0 = normal, 1 = stressed).",
    )

    # ---------- Stage 9 -------------------------------------------------------
    stage9_decision: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="S9 Rule Engine — pipe-separated farm recommendations.",
    )
    stage9_attention: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="S9 — 1 if any intervention is needed, 0 otherwise.",
    )

    # ---------- Stage 10 ------------------------------------------------------
    stage10_priority_score: Mapped[Optional[float]] = mapped_column(
        Numeric(7, 4),
        nullable=True,
        doc="S10 — composite priority score (0–100).",
    )
    stage10_priority_rank: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="S10 — rank within herd (1 = highest risk).",
    )

    # ---------- Stage 11 ------------------------------------------------------
    stage11_health_score: Mapped[Optional[float]] = mapped_column(
        Numeric(7, 4),
        nullable=True,
        doc="S11 Stacking Ensemble — health score (0–100).",
    )

    # ---------- Stage 12 ------------------------------------------------------
    stage12_risk_score: Mapped[Optional[float]] = mapped_column(
        Numeric(7, 4),
        nullable=True,
        doc="S12 Isolation Forest — normalised risk score (0–100).",
    )
    stage12_risk_flag: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="S12 — 1 if anomaly detected, 0 = normal.",
    )
    stage12_risk_level: Mapped[Optional[str]] = mapped_column(
        String(16),
        nullable=True,
        doc="S12 risk label: 'low', 'medium', or 'high'.",
    )

    # ---------- Full response -------------------------------------------------
    raw_response: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        doc="Complete pipeline PredictionResponse serialised as JSONB.",
    )

    # ---------- Relationships -------------------------------------------------
    user: Mapped["User"] = relationship(
        "User",
        back_populates="prediction_records",
    )
    cow: Mapped[Optional["Cow"]] = relationship(
        "Cow",
        back_populates="prediction_records",
    )

    def __repr__(self) -> str:
        return (
            f"<PredictionRecord id={self.id} cow={self.cow_label!r} "
            f"health={self.stage11_health_score} risk={self.stage12_risk_level!r}>"
        )
