"""
SmartCattle Net
api/routers/reports.py

Reports API built from existing PredictionRecord data.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Query
from sqlalchemy import desc, func, select

from app.api.deps import CurrentUser, SessionDep
from app.database.models import PredictionRecord

router = APIRouter(prefix="/reports", tags=["reports"])


def _direction_label(direction: int | None) -> str:
    if direction == 1:
        return "Increasing"
    if direction == -1:
        return "Decreasing"
    if direction == 0:
        return "Stable"
    return "Unknown"


def _risk_label(risk: str | None) -> str:
    return risk or "Unknown"


@router.get("/history")
async def get_report_history(
    db: SessionDep,
    current_user: CurrentUser,
    limit: int = Query(default=50, ge=1, le=100),
) -> list[dict[str, Any]]:
    """
    Return recent report entries derived from prediction records.
    """

    stmt = (
        select(PredictionRecord)
        .where(PredictionRecord.user_id == current_user.id)
        .order_by(desc(PredictionRecord.created_at))
        .limit(limit)
    )

    result = await db.execute(stmt)
    records = result.scalars().all()

    history = []

    for record in records:
        history.append(
            {
                "name": f"Herd Report - {record.cow_label}",
                "timestamp": record.created_at.isoformat(),
                "period": "Prediction",
                "status": "Generated",
                "cow_id": record.cow_label,
            }
        )

    return history


@router.get("/summary/daily")
async def get_daily_report(
    db: SessionDep,
    current_user: CurrentUser,
) -> dict[str, Any]:
    """
    Generate a daily herd summary from today's prediction records.
    """

    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    stmt = (
        select(PredictionRecord)
        .where(
            PredictionRecord.user_id == current_user.id,
            PredictionRecord.created_at >= start,
        )
        .order_by(desc(PredictionRecord.created_at))
    )

    result = await db.execute(stmt)
    records = result.scalars().all()

    if not records:
        return {
            "period": "daily",
            "date": start.date().isoformat(),
            "total_predictions": 0,
            "cows": 0,
            "average_daily_yield": 0,
            "average_health_score": 0,
            "average_productivity_score": 0,
            "high_risk_count": 0,
            "stress_count": 0,
            "attention_required": 0,
        }

    cow_ids = {record.cow_label for record in records}

    yields = [
        float(record.stage1_daily_yield)
        for record in records
        if record.stage1_daily_yield is not None
    ]

    health = [
        float(record.stage11_health_score)
        for record in records
        if record.stage11_health_score is not None
    ]

    productivity = [
        float(record.stage7_productivity)
        for record in records
        if record.stage7_productivity is not None
    ]

    return {
        "period": "daily",
        "date": start.date().isoformat(),
        "total_predictions": len(records),
        "cows": len(cow_ids),
        "average_daily_yield": (
            round(sum(yields) / len(yields), 2) if yields else 0
        ),
        "average_health_score": (
            round(sum(health) / len(health), 2) if health else 0
        ),
        "average_productivity_score": (
            round(sum(productivity) / len(productivity), 2)
            if productivity
            else 0
        ),
        "high_risk_count": sum(
            1 for r in records if (r.stage12_risk_level or "").lower() == "high"
        ),
        "stress_count": sum(
            1 for r in records if r.stage8_stress_flag == 1
        ),
        "attention_required": sum(
            1 for r in records if r.stage9_attention == 1
        ),
    }


@router.get("/summary/weekly")
async def get_weekly_report(
    db: SessionDep,
    current_user: CurrentUser,
) -> dict[str, Any]:
    """
    Generate a seven-day herd and veterinary summary.
    """

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=7)

    stmt = (
        select(PredictionRecord)
        .where(
            PredictionRecord.user_id == current_user.id,
            PredictionRecord.created_at >= start,
        )
        .order_by(desc(PredictionRecord.created_at))
    )

    result = await db.execute(stmt)
    records = result.scalars().all()

    yields = [
        float(r.stage1_daily_yield)
        for r in records
        if r.stage1_daily_yield is not None
    ]

    health = [
        float(r.stage11_health_score)
        for r in records
        if r.stage11_health_score is not None
    ]

    stress = [
        float(r.stage8_stress_prob)
        for r in records
        if r.stage8_stress_prob is not None
    ]

    return {
        "period": "weekly",
        "start_date": start.date().isoformat(),
        "end_date": end.date().isoformat(),
        "total_predictions": len(records),
        "cows": len({r.cow_label for r in records}),
        "average_daily_yield": (
            round(sum(yields) / len(yields), 2) if yields else 0
        ),
        "average_health_score": (
            round(sum(health) / len(health), 2) if health else 0
        ),
        "average_stress_probability": (
            round((sum(stress) / len(stress)) * 100, 2)
            if stress
            else 0
        ),
        "high_risk_count": sum(
            1 for r in records if (r.stage12_risk_level or "").lower() == "high"
        ),
        "medium_risk_count": sum(
            1
            for r in records
            if (r.stage12_risk_level or "").lower() == "medium"
        ),
        "stress_alerts": sum(
            1 for r in records if r.stage8_stress_flag == 1
        ),
        "attention_required": sum(
            1 for r in records if r.stage9_attention == 1
        ),
    }


@router.get("/summary/monthly")
async def get_monthly_report(
    db: SessionDep,
    current_user: CurrentUser,
) -> dict[str, Any]:
    """
    Generate a thirty-day productivity summary.
    """

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=30)

    stmt = (
        select(PredictionRecord)
        .where(
            PredictionRecord.user_id == current_user.id,
            PredictionRecord.created_at >= start,
        )
        .order_by(desc(PredictionRecord.created_at))
    )

    result = await db.execute(stmt)
    records = result.scalars().all()

    yields = [
        float(r.stage1_daily_yield)
        for r in records
        if r.stage1_daily_yield is not None
    ]

    productivity = [
        float(r.stage7_productivity)
        for r in records
        if r.stage7_productivity is not None
    ]

    forecast = [
        float(r.stage6_forecast_mean)
        for r in records
        if r.stage6_forecast_mean is not None
    ]

    return {
        "period": "monthly",
        "start_date": start.date().isoformat(),
        "end_date": end.date().isoformat(),
        "total_predictions": len(records),
        "cows": len({r.cow_label for r in records}),
        "average_daily_yield": (
            round(sum(yields) / len(yields), 2) if yields else 0
        ),
        "average_productivity_score": (
            round(sum(productivity) / len(productivity), 2)
            if productivity
            else 0
        ),
        "average_7_day_forecast": (
            round(sum(forecast) / len(forecast), 2)
            if forecast
            else 0
        ),
        "increasing_trend_count": sum(
            1 for r in records if r.stage6_trend_dir == 1
        ),
        "decreasing_trend_count": sum(
            1 for r in records if r.stage6_trend_dir == -1
        ),
        "stable_trend_count": sum(
            1 for r in records if r.stage6_trend_dir == 0
        ),
        "high_risk_count": sum(
            1 for r in records if (r.stage12_risk_level or "").lower() == "high"
        ),
    }
