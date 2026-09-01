"""
SmartCattle Net
api/routers/alerts.py

Alert endpoints derived from the latest prediction record
for each cow.
"""

from typing import Any

from fastapi import APIRouter
from sqlalchemy import desc, select

from app.api.deps import CurrentUser, SessionDep
from app.database.models import PredictionRecord
from app.schemas.alerts import AlertItem, AlertResponse


router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
)


@router.get("", response_model=AlertResponse)
async def get_alerts(
    db: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Return active alerts generated from the latest prediction
    of each cow.
    """

    stmt = (
        select(
            PredictionRecord.cow_label,
            PredictionRecord.stage8_stress_flag,
            PredictionRecord.stage11_health_score,
            PredictionRecord.stage12_risk_flag,
            PredictionRecord.stage12_risk_level,
        )
        .where(
            PredictionRecord.user_id == current_user.id,
            PredictionRecord.cow_label != "string",
            PredictionRecord.cow_label != "UNKNOWN",
        )
        .order_by(
            PredictionRecord.cow_label,
            desc(PredictionRecord.created_at),
        )
        .distinct(PredictionRecord.cow_label)
    )

    result = await db.execute(stmt)
    rows = result.all()

    alerts = []

    for row in rows:

        # -----------------------------------------
        # Stress alert
        # -----------------------------------------
        if row.stage8_stress_flag == 1:
            alerts.append(
                AlertItem(
                    cow_id=row.cow_label,
                    alert_type="Stress",
                    message="High stress probability detected",
                    severity="High",
                )
            )

        # -----------------------------------------
        # Health alert
        # -----------------------------------------
        if (row.stage11_health_score or 0) < 70:
            alerts.append(
                AlertItem(
                    cow_id=row.cow_label,
                    alert_type="Health",
                    message="Health score below safe threshold",
                    severity="Medium",
                )
            )

        # -----------------------------------------
        # Risk alert
        # -----------------------------------------
        if row.stage12_risk_level in ("medium", "high"):

            severity = (
                "High"
                if row.stage12_risk_level == "high"
                else "Medium"
            )

            alerts.append(
                AlertItem(
                    cow_id=row.cow_label,
                    alert_type="Risk",
                    message=f"Risk level: {row.stage12_risk_level}",
                    severity=severity,
                )
            )

    return AlertResponse(alerts=alerts)


@router.get("/summary")
async def get_alert_summary(
    db: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Return summary statistics for the alert page.
    """

    stmt = (
        select(
            PredictionRecord.cow_label,
            PredictionRecord.stage8_stress_flag,
            PredictionRecord.stage11_health_score,
            PredictionRecord.stage12_risk_flag,
            PredictionRecord.stage12_risk_level,
        )
        .where(
            PredictionRecord.user_id == current_user.id,
            PredictionRecord.cow_label != "string",
            PredictionRecord.cow_label != "UNKNOWN",
        )
        .order_by(
            PredictionRecord.cow_label,
            desc(PredictionRecord.created_at),
        )
        .distinct(PredictionRecord.cow_label)
    )

    result = await db.execute(stmt)
    rows = result.all()

    total = 0
    high = 0
    medium = 0
    stress = 0
    health = 0
    risk = 0

    for row in rows:

        # -----------------------------------------
        # Stress
        # -----------------------------------------
        if row.stage8_stress_flag == 1:
            total += 1
            high += 1
            stress += 1

        # -----------------------------------------
        # Health
        # -----------------------------------------
        if (row.stage11_health_score or 0) < 70:
            total += 1
            medium += 1
            health += 1

        # -----------------------------------------
        # Risk
        # -----------------------------------------
        if row.stage12_risk_level in ("medium", "high"):
            total += 1
            risk += 1

            if row.stage12_risk_level == "high":
                high += 1
            else:
                medium += 1

    return {
        "total": total,
        "high": high,
        "medium": medium,
        "stress": stress,
        "health": health,
        "risk": risk,
    }