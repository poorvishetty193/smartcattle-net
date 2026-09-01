"""
SmartCattle Net
api/routers/alerts.py

Alert API derived from existing PredictionRecord data.
"""

from typing import Any

from fastapi import APIRouter, Query
from sqlalchemy import desc, select

from app.api.deps import CurrentUser, SessionDep
from app.database.models import PredictionRecord

router = APIRouter(prefix="/alerts", tags=["alerts"])


def _build_alerts(record: PredictionRecord) -> list[dict[str, Any]]:
    """
    Convert one prediction record into one or more farm alerts.
    """

    alerts: list[dict[str, Any]] = []

    timestamp = (
        record.created_at.isoformat()
        if record.created_at
        else None
    )

    cow_id = record.cow_label

    # ---------------------------------------------------------
    # HIGH RISK
    # ---------------------------------------------------------

    if (record.stage12_risk_level or "").lower() == "high":
        alerts.append(
            {
                "id": f"{record.id}-risk",
                "cow_id": cow_id,
                "type": "critical",
                "category": "Risk",
                "title": "High Risk Detected",
                "message": (
                    f"Cow {cow_id} has been classified as high risk."
                ),
                "timestamp": timestamp,
                "status": "active",
                "risk_score": (
                    float(record.stage12_risk_score)
                    if record.stage12_risk_score is not None
                    else None
                ),
            }
        )

    # ---------------------------------------------------------
    # HEAT STRESS
    # ---------------------------------------------------------

    if record.stage8_stress_flag == 1:
        stress_probability = (
            float(record.stage8_stress_prob)
            if record.stage8_stress_prob is not None
            else None
        )

        alerts.append(
            {
                "id": f"{record.id}-stress",
                "cow_id": cow_id,
                "type": "critical",
                "category": "Heat Stress",
                "title": "Heat Stress Detected",
                "message": (
                    f"Cow {cow_id} shows signs of heat stress."
                ),
                "timestamp": timestamp,
                "status": "active",
                "probability": stress_probability,
            }
        )

    # ---------------------------------------------------------
    # MILK DROP
    # ---------------------------------------------------------

    if record.stage2_drop_flag == 1:
        drop_probability = (
            float(record.stage2_drop_prob)
            if record.stage2_drop_prob is not None
            else None
        )

        alerts.append(
            {
                "id": f"{record.id}-drop",
                "cow_id": cow_id,
                "type": "warning",
                "category": "Milk Production",
                "title": "Milk Drop Predicted",
                "message": (
                    f"A possible milk production drop was predicted "
                    f"for cow {cow_id}."
                ),
                "timestamp": timestamp,
                "status": "active",
                "probability": drop_probability,
            }
        )

    # ---------------------------------------------------------
    # FARM ATTENTION
    # ---------------------------------------------------------

    if record.stage9_attention == 1:
        alerts.append(
            {
                "id": f"{record.id}-attention",
                "cow_id": cow_id,
                "type": "warning",
                "category": "Farm Decision",
                "title": "Attention Required",
                "message": (
                    f"Cow {cow_id} requires farm attention."
                ),
                "timestamp": timestamp,
                "status": "active",
            }
        )

    # ---------------------------------------------------------
    # LOW HEALTH SCORE
    # ---------------------------------------------------------

    if (
        record.stage11_health_score is not None
        and float(record.stage11_health_score) < 50
    ):
        alerts.append(
            {
                "id": f"{record.id}-health",
                "cow_id": cow_id,
                "type": "critical",
                "category": "Health",
                "title": "Low Health Score",
                "message": (
                    f"Cow {cow_id} has a low health score."
                ),
                "timestamp": timestamp,
                "status": "active",
                "health_score": float(record.stage11_health_score),
            }
        )

    return alerts


# =============================================================
# GET ALL ALERTS
# =============================================================

@router.get("")
async def get_alerts(
    db: SessionDep,
    current_user: CurrentUser,
    limit: int = Query(default=100, ge=1, le=500),
) -> list[dict[str, Any]]:
    """
    Return alerts derived from recent prediction records.
    """

    stmt = (
        select(PredictionRecord)
        .where(
            PredictionRecord.user_id == current_user.id
        )
        .order_by(desc(PredictionRecord.created_at))
        .limit(limit)
    )

    result = await db.execute(stmt)
    records = result.scalars().all()

    alerts: list[dict[str, Any]] = []

    for record in records:
        alerts.extend(_build_alerts(record))

    return alerts


# =============================================================
# ALERT SUMMARY
# =============================================================

@router.get("/summary")
async def get_alert_summary(
    db: SessionDep,
    current_user: CurrentUser,
) -> dict[str, int]:
    """
    Return alert counts for the Alerts dashboard.
    """

    stmt = (
        select(PredictionRecord)
        .where(
            PredictionRecord.user_id == current_user.id
        )
        .order_by(desc(PredictionRecord.created_at))
        .limit(500)
    )

    result = await db.execute(stmt)
    records = result.scalars().all()

    alerts: list[dict[str, Any]] = []

    for record in records:
        alerts.extend(_build_alerts(record))

    critical = sum(
        1
        for alert in alerts
        if alert["type"] == "critical"
    )

    warnings = sum(
        1
        for alert in alerts
        if alert["type"] == "warning"
    )

    return {
        "critical": critical,
        "warnings": warnings,
        "active": len(alerts),
        "resolved_today": 0,
    }