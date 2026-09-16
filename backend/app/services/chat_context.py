"""
SmartCattle Net

services/chat_context.py

Retrieval layer for the farm-aware chatbot.

This service retrieves real SmartCattleNet data from PostgreSQL
and converts it into structured context that can later be passed
to LangChain / RAG / Ollama / Gemini.

No LLM is used here.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Cow, FarmSettings, PredictionRecord


# =============================================================
# SAFE CONVERSION HELPERS
# =============================================================


def _safe_float(value: Any) -> float | None:
    """Safely convert Decimal / numeric values to float."""

    if value is None:
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _safe_int(value: Any) -> int | None:
    """Safely convert a value to int."""

    if value is None:
        return None

    try:
        return int(value)
    except (TypeError, ValueError):
        return None


# =============================================================
# PREDICTION SERIALIZATION
# =============================================================


def prediction_to_context(
    record: PredictionRecord,
) -> dict[str, Any]:
    """
    Convert one PredictionRecord into a compact chatbot context.
    """

    return {
        "prediction_id": str(record.id),
        "cow_id": record.cow_label,
        "created_at": (
            record.created_at.isoformat()
            if record.created_at
            else None
        ),

        # -----------------------------------------------------
        # Milk production
        # -----------------------------------------------------

        "milk_production": {
            "daily_yield_l": _safe_float(
                record.stage1_daily_yield
            ),
            "drop_probability": _safe_float(
                record.stage2_drop_prob
            ),
            "drop_flag": _safe_int(
                record.stage2_drop_flag
            ),
            "next_milking_l": _safe_float(
                record.stage3_next_milking
            ),
            "milk_stability_index": _safe_float(
                record.stage4_msi
            ),
            "quantity_l": _safe_float(
                record.stage5_quantity
            ),
            "forecast_mean_l": _safe_float(
                record.stage6_forecast_mean
            ),
            "trend_slope": _safe_float(
                record.stage6_trend_slope
            ),
            "trend_direction": _safe_int(
                record.stage6_trend_dir
            ),
        },

        # -----------------------------------------------------
        # Productivity
        # -----------------------------------------------------

        "productivity": {
            "score": _safe_float(
                record.stage7_productivity
            ),
        },

        # -----------------------------------------------------
        # Heat stress
        # -----------------------------------------------------

        "heat_stress": {
            "probability": _safe_float(
                record.stage8_stress_prob
            ),
            "flag": _safe_int(
                record.stage8_stress_flag
            ),
        },

        # -----------------------------------------------------
        # Farm decision
        # -----------------------------------------------------

        "farm_decision": {
            "decision": record.stage9_decision,
            "attention": _safe_int(
                record.stage9_attention
            ),
        },

        # -----------------------------------------------------
        # Priority
        # -----------------------------------------------------

        "priority": {
            "score": _safe_float(
                record.stage10_priority_score
            ),
            "rank": _safe_int(
                record.stage10_priority_rank
            ),
        },

        # -----------------------------------------------------
        # Health
        # -----------------------------------------------------

        "health": {
            "score": _safe_float(
                record.stage11_health_score
            ),
        },

        # -----------------------------------------------------
        # Risk
        # -----------------------------------------------------

        "risk": {
            "score": _safe_float(
                record.stage12_risk_score
            ),
            "flag": _safe_int(
                record.stage12_risk_flag
            ),
            "level": record.stage12_risk_level,
        },
    }


# =============================================================
# COW CONTEXT
# =============================================================


def cow_to_context(cow: Cow) -> dict[str, Any]:
    """
    Convert a Cow model into chatbot context.
    """

    return {
        "cow_id": cow.cow_id,
        "breed": cow.breed,
        "parity": cow.parity,
        "days_in_milk": cow.days_in_milk,
        "notes": cow.notes,
        "is_active": cow.is_active,
    }


# =============================================================
# FARM SETTINGS CONTEXT
# =============================================================


def settings_to_context(
    settings: FarmSettings | None,
) -> dict[str, Any] | None:
    """
    Convert FarmSettings into chatbot context.
    """

    if settings is None:
        return None

    return {
        "farm_name": settings.farm_name,
        "farm_location": settings.farm_location,
        "timezone": settings.timezone,

        "thresholds": {
            "milk_drop_threshold": _safe_float(
                settings.milk_drop_threshold
            ),
            "heat_stress_thi": _safe_float(
                settings.heat_stress_thi
            ),
            "scc_mastitis_threshold": _safe_float(
                settings.scc_mastitis_threshold
            ),
            "priority_score_cutoff": _safe_float(
                settings.priority_score_cutoff
            ),
        },

        "notifications": {
            "critical_push": settings.critical_push,
            "critical_email": settings.critical_email,
            "critical_sms": settings.critical_sms,
            "daily_report_email": settings.daily_report_email,
            "heat_push": settings.heat_push,
            "heat_email": settings.heat_email,
            "heat_sms": settings.heat_sms,
        },
    }


# =============================================================
# RETRIEVE ALL ACTIVE COWS
# =============================================================


async def get_farm_cows(
    db: AsyncSession,
    user_id,
) -> list[Cow]:
    """
    Retrieve active cows belonging to the current user.
    """

    stmt = (
        select(Cow)
        .where(
            Cow.owner_id == user_id,
            Cow.is_active.is_(True),
        )
        .order_by(Cow.cow_id)
    )

    result = await db.execute(stmt)

    return list(result.scalars().all())


# =============================================================
# RETRIEVE FARM SETTINGS
# =============================================================


async def get_farm_settings(
    db: AsyncSession,
    user_id,
) -> FarmSettings | None:
    """
    Retrieve settings belonging to the current user.
    """

    stmt = select(FarmSettings).where(
        FarmSettings.user_id == user_id
    )

    result = await db.execute(stmt)

    return result.scalar_one_or_none()


# =============================================================
# RETRIEVE RECENT PREDICTIONS
# =============================================================


async def get_recent_predictions(
    db: AsyncSession,
    user_id,
    limit: int = 100,
) -> list[PredictionRecord]:
    """
    Retrieve recent prediction records for the current user.
    """

    stmt = (
        select(PredictionRecord)
        .where(
            PredictionRecord.user_id == user_id
        )
        .order_by(
            desc(PredictionRecord.created_at)
        )
        .limit(limit)
    )

    result = await db.execute(stmt)

    return list(result.scalars().all())


# =============================================================
# RETRIEVE LATEST PREDICTION FOR EACH COW
# =============================================================


async def get_latest_predictions_by_cow(
    db: AsyncSession,
    user_id,
) -> list[PredictionRecord]:
    """
    Retrieve the latest prediction record for every cow.

    This is important for questions such as:

        "Which cows are at risk?"

        "How is my herd doing?"

        "Which cows have heat stress?"

    We don't want to give the AI hundreds of old predictions
    for the same cow. We want the latest available prediction.
    """

    records = await get_recent_predictions(
        db=db,
        user_id=user_id,
        limit=500,
    )

    latest_by_cow: dict[str, PredictionRecord] = {}

    for record in records:

        cow_id = record.cow_label

        if cow_id not in latest_by_cow:
            latest_by_cow[cow_id] = record

    return list(latest_by_cow.values())


# =============================================================
# FIND ONE COW
# =============================================================


async def get_cow_prediction(
    db: AsyncSession,
    user_id,
    cow_id: str,
) -> PredictionRecord | None:
    """
    Retrieve the latest prediction for one cow.

    Cow IDs are matched case-insensitively.
    """

    normalized_cow_id = cow_id.strip()

    stmt = (
        select(PredictionRecord)
        .where(
            PredictionRecord.user_id == user_id,
            PredictionRecord.cow_label.ilike(
                normalized_cow_id
            ),
        )
        .order_by(
            desc(PredictionRecord.created_at)
        )
        .limit(1)
    )

    result = await db.execute(stmt)

    return result.scalar_one_or_none()
    """
    Retrieve the latest prediction for one specific cow.
    """

    stmt = (
        select(PredictionRecord)
        .where(
            PredictionRecord.user_id == user_id,
            PredictionRecord.cow_label == cow_id,
        )
        .order_by(
            desc(PredictionRecord.created_at)
        )
        .limit(1)
    )

    result = await db.execute(stmt)

    return result.scalar_one_or_none()


# =============================================================
# COMPLETE FARM CONTEXT
# =============================================================


async def build_farm_context(
    db: AsyncSession,
    user_id,
    prediction_limit: int = 100,
) -> dict[str, Any]:
    """
    Build the complete structured context available to the
    SmartCattleNet chatbot.

    This will later become the input to the RAG / LLM layer.
    """

    cows = await get_farm_cows(
        db=db,
        user_id=user_id,
    )

    settings = await get_farm_settings(
        db=db,
        user_id=user_id,
    )

    predictions = await get_latest_predictions_by_cow(
        db=db,
        user_id=user_id,
    )

    return {
        "farm": settings_to_context(settings),

        "herd": {
            "active_cow_count": len(cows),
            "cows": [
                cow_to_context(cow)
                for cow in cows
            ],
        },

        "latest_predictions": [
            prediction_to_context(record)
            for record in predictions[:prediction_limit]
        ],
    }


# =============================================================
# SINGLE COW CONTEXT
# =============================================================


async def build_cow_context(
    db: AsyncSession,
    user_id,
    cow_id: str,
) -> dict[str, Any] | None:
    """
    Build detailed context for one cow.

    The cow can be found either through:
      1. the registered Cow table, or
      2. PredictionRecord.cow_label.

    This is important because a prediction may exist for a cow
    even when that cow is not currently present in the active
    cow registry.
    """

    normalized_cow_id = cow_id.strip()

    # ---------------------------------------------------------
    # 1. Find registered cow
    # ---------------------------------------------------------

    cow_stmt = (
        select(Cow)
        .where(
            Cow.owner_id == user_id,
            Cow.cow_id == normalized_cow_id,
        )
        .limit(1)
    )

    cow_result = await db.execute(cow_stmt)

    cow = cow_result.scalar_one_or_none()

    # ---------------------------------------------------------
    # 2. Find latest prediction
    # ---------------------------------------------------------

    prediction = await get_cow_prediction(
        db=db,
        user_id=user_id,
        cow_id=normalized_cow_id,
    )

    # ---------------------------------------------------------
    # 3. Nothing found
    # ---------------------------------------------------------

    if cow is None and prediction is None:
        return None

    # ---------------------------------------------------------
    # 4. Build response
    # ---------------------------------------------------------

    return {
        "cow": (
            cow_to_context(cow)
            if cow is not None
            else {
                "cow_id": normalized_cow_id,
                "breed": None,
                "parity": None,
                "days_in_milk": None,
                "notes": None,
                "is_active": None,
            }
        ),
        "latest_prediction": (
            prediction_to_context(prediction)
            if prediction is not None
            else None
        ),
    }
    """
    Build detailed context for one cow.
    """

    normalized_cow_id = cow_id.strip()

    cow_stmt = (
        select(Cow)
        .where(
            Cow.owner_id == user_id,
            Cow.cow_id == normalized_cow_id,
        )
        .limit(1)
    )

    cow_result = await db.execute(cow_stmt)

    cow = cow_result.scalar_one_or_none()

    if cow is None:
        return None

    prediction = await get_cow_prediction(
        db=db,
        user_id=user_id,
        cow_id=normalized_cow_id,
    )

    return {
        "cow": cow_to_context(cow),
        "latest_prediction": (
            prediction_to_context(prediction)
            if prediction
            else None
        ),
    }