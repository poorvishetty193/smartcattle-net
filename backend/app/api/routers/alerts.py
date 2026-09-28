"""
SmartCattle Net

api/routers/alerts.py

Alert endpoints derived from the latest prediction record
for each active registered cow.

View Details returns the actual prediction evidence
that caused the alert.
"""

from typing import Any

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import and_, desc, func, select

from app.api.deps import CurrentUser, SessionDep
from app.database.models import Cow, FarmSettings, PredictionRecord
from app.schemas.alerts import AlertItem, AlertResponse


router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _to_float(value: Any) -> float | None:
    """
    Safely convert Decimal / int / float / string values to float.
    """
    if value is None:
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _format_number(value: Any, digits: int = 2) -> str:
    """
    Format a numeric value safely for display.
    """
    number = _to_float(value)

    if number is None:
        return "Not available"

    return f"{number:.{digits}f}"


async def _get_latest_predictions(
    db: SessionDep,
    current_user: CurrentUser,
):
    """
    Get only the latest prediction for each active cow belonging
    to the currently logged-in farmer.
    """

    latest_subquery = (
        select(
            PredictionRecord.cow_label.label("cow_label"),
            func.max(PredictionRecord.created_at).label("latest_created_at"),
        )
        .join(
            Cow,
            Cow.cow_id == PredictionRecord.cow_label,
        )
        .where(
            PredictionRecord.user_id == current_user.id,
            Cow.owner_id == current_user.id,
            Cow.is_active.is_(True),
            PredictionRecord.cow_label != "string",
            PredictionRecord.cow_label != "UNKNOWN",
        )
        .group_by(
            PredictionRecord.cow_label,
        )
        .subquery()
    )

    stmt = (
        select(PredictionRecord)
        .join(
            Cow,
            Cow.cow_id == PredictionRecord.cow_label,
        )
        .join(
            latest_subquery,
            and_(
                PredictionRecord.cow_label
                == latest_subquery.c.cow_label,
                PredictionRecord.created_at
                == latest_subquery.c.latest_created_at,
            ),
        )
        .where(
            PredictionRecord.user_id == current_user.id,
            Cow.owner_id == current_user.id,
            Cow.is_active.is_(True),
            PredictionRecord.cow_label != "string",
            PredictionRecord.cow_label != "UNKNOWN",
        )
        .order_by(
            PredictionRecord.cow_label,
        )
    )

    result = await db.execute(stmt)

    return result.scalars().all()


async def _get_latest_prediction_for_cow(
    db: SessionDep,
    current_user: CurrentUser,
    cow_id: str,
):
    """
    Get the latest prediction for one active cow belonging
    to the current farmer.
    """

    stmt = (
        select(PredictionRecord)
        .join(
            Cow,
            Cow.cow_id == PredictionRecord.cow_label,
        )
        .where(
            PredictionRecord.user_id == current_user.id,
            Cow.owner_id == current_user.id,
            Cow.cow_id == cow_id,
            Cow.is_active.is_(True),
            PredictionRecord.cow_label == cow_id,
        )
        .order_by(
            desc(PredictionRecord.created_at),
        )
        .limit(1)
    )

    result = await db.execute(stmt)

    return result.scalar_one_or_none()


async def _get_settings(
    db: SessionDep,
    current_user: CurrentUser,
):
    """
    Get the farmer's settings.

    Defaults are used only if the farmer does not have
    a FarmSettings row yet.
    """

    stmt = select(FarmSettings).where(
        FarmSettings.user_id == current_user.id,
    )

    result = await db.execute(stmt)

    return result.scalar_one_or_none()


# ---------------------------------------------------------------------------
# Build alert list
# ---------------------------------------------------------------------------

def _build_alerts(
    record: PredictionRecord,
) -> list[AlertItem]:

    alerts: list[AlertItem] = []

    cow_id = record.cow_label

    # -----------------------------------------------------------------------
    # Milk Drop
    # -----------------------------------------------------------------------

    if record.stage2_drop_flag == 1:

        drop_probability = _to_float(record.stage2_drop_prob)

        probability_text = (
            f"{drop_probability * 100:.2f}%"
            if drop_probability is not None
            else "not available"
        )

        alerts.append(
            AlertItem(
                cow_id=cow_id,
                alert_type="Milk Drop",
                message=(
                    "The latest model prediction indicates a possible "
                    f"milk-production drop. Estimated probability: "
                    f"{probability_text}."
                ),
                severity="High",
            )
        )

    # -----------------------------------------------------------------------
    # Stress
    # -----------------------------------------------------------------------

    if record.stage8_stress_flag == 1:

        stress_probability = _to_float(record.stage8_stress_prob)

        probability_text = (
            f"{stress_probability * 100:.2f}%"
            if stress_probability is not None
            else "not available"
        )

        alerts.append(
            AlertItem(
                cow_id=cow_id,
                alert_type="Stress",
                message=(
                    "The latest model prediction detected elevated "
                    f"heat/stress risk. Estimated stress probability: "
                    f"{probability_text}."
                ),
                severity="High",
            )
        )

    # -----------------------------------------------------------------------
    # Health
    # -----------------------------------------------------------------------

    health_score = _to_float(record.stage11_health_score)

    if health_score is not None and health_score < 70:

        alerts.append(
            AlertItem(
                cow_id=cow_id,
                alert_type="Health",
                message=(
                    "The latest model health score is "
                    f"{health_score:.2f}/100, which is below the "
                    "70-point safe threshold."
                ),
                severity="Medium",
            )
        )

    # -----------------------------------------------------------------------
    # Risk
    # -----------------------------------------------------------------------

    risk_level = (
        str(record.stage12_risk_level).lower()
        if record.stage12_risk_level
        else ""
    )

    if risk_level in ("medium", "high"):

        risk_score = _to_float(record.stage12_risk_score)

        risk_score_text = (
            f"{risk_score:.2f}/100"
            if risk_score is not None
            else "not available"
        )

        severity = (
            "High"
            if risk_level == "high"
            else "Medium"
        )

        alerts.append(
            AlertItem(
                cow_id=cow_id,
                alert_type="Risk",
                message=(
                    f"The latest model assigned this cow a "
                    f"{risk_level} risk level with a risk score of "
                    f"{risk_score_text}."
                ),
                severity=severity,
            )
        )

    return alerts


# ---------------------------------------------------------------------------
# GET ACTIVE ALERTS
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=AlertResponse,
)
async def get_alerts(
    db: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Return active alerts generated from the latest prediction
    of each active registered cow.
    """

    records = await _get_latest_predictions(
        db=db,
        current_user=current_user,
    )

    alerts: list[AlertItem] = []

    for record in records:
        alerts.extend(
            _build_alerts(record)
        )

    return AlertResponse(
        alerts=alerts,
    )


# ---------------------------------------------------------------------------
# GET ALERT SUMMARY
# ---------------------------------------------------------------------------

@router.get("/summary")
async def get_alert_summary(
    db: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Return summary statistics for the alert page.
    """

    records = await _get_latest_predictions(
        db=db,
        current_user=current_user,
    )

    total = 0
    high = 0
    medium = 0
    stress = 0
    health = 0
    risk = 0
    milk_drop = 0

    for record in records:

        generated_alerts = _build_alerts(record)

        for alert in generated_alerts:

            total += 1

            if alert.severity == "High":
                high += 1

            elif alert.severity == "Medium":
                medium += 1

            if alert.alert_type == "Stress":
                stress += 1

            elif alert.alert_type == "Health":
                health += 1

            elif alert.alert_type == "Risk":
                risk += 1

            elif alert.alert_type == "Milk Drop":
                milk_drop += 1

    return {
        "total": total,
        "high": high,
        "medium": medium,
        "stress": stress,
        "health": health,
        "risk": risk,
        "milk_drop": milk_drop,
    }


# ---------------------------------------------------------------------------
# VIEW ALERT DETAILS
# ---------------------------------------------------------------------------

@router.get("/{cow_id}/{alert_type}")
async def get_alert_details(
    cow_id: str,
    alert_type: str,
    db: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Return genuine prediction evidence for a specific alert.

    This endpoint does NOT create a fake explanation.

    The explanation is constructed from the actual latest
    prediction record and the original prediction input.
    """

    record = await _get_latest_prediction_for_cow(
        db=db,
        current_user=current_user,
        cow_id=cow_id,
    )

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active prediction found for cow '{cow_id}'.",
        )

    normalized_type = alert_type.strip().lower()

    # Check that this alert actually exists for the latest prediction.
    generated_alerts = _build_alerts(record)

    matching_alert = next(
        (
            alert
            for alert in generated_alerts
            if alert.alert_type.lower() == normalized_type
        ),
        None,
    )

    if matching_alert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"The latest prediction for cow '{cow_id}' "
                f"does not currently contain a '{alert_type}' alert."
            ),
        )

    # -----------------------------------------------------------------------
    # Original input used by the prediction pipeline
    # -----------------------------------------------------------------------

    raw_response = record.raw_response or {}

    input_data = raw_response.get("input") or {}

    # -----------------------------------------------------------------------
    # Farmer settings
    # -----------------------------------------------------------------------

    settings = await _get_settings(
        db=db,
        current_user=current_user,
    )

    milk_drop_threshold = (
        _to_float(settings.milk_drop_threshold)
        if settings
        else 15.0
    )

    heat_stress_thi = (
        _to_float(settings.heat_stress_thi)
        if settings
        else 72.0
    )

    scc_threshold = (
        _to_float(settings.scc_mastitis_threshold)
        if settings
        else 200000.0
    )

    # -----------------------------------------------------------------------
    # Actual model values
    # -----------------------------------------------------------------------

    drop_probability = _to_float(
        record.stage2_drop_prob
    )

    stress_probability = _to_float(
        record.stage8_stress_prob
    )

    health_score = _to_float(
        record.stage11_health_score
    )

    risk_score = _to_float(
        record.stage12_risk_score
    )

    priority_score = _to_float(
        record.stage10_priority_score
    )

    productivity_score = _to_float(
        record.stage7_productivity
    )

    msi = _to_float(
        record.stage4_msi
    )

    daily_yield = _to_float(
        record.stage1_daily_yield
    )

    forecast_mean = _to_float(
        record.stage6_forecast_mean
    )

    # -----------------------------------------------------------------------
    # Evidence
    # -----------------------------------------------------------------------

    evidence: list[str] = []

    if daily_yield is not None:
        evidence.append(
            f"Predicted daily milk yield: {daily_yield:.2f} L"
        )

    if drop_probability is not None:
        evidence.append(
            f"Milk-drop probability: {drop_probability * 100:.2f}%"
        )

    if stress_probability is not None:
        evidence.append(
            f"Stress probability: {stress_probability * 100:.2f}%"
        )

    if health_score is not None:
        evidence.append(
            f"Health score: {health_score:.2f}/100"
        )

    if risk_score is not None:
        evidence.append(
            f"Risk score: {risk_score:.2f}/100"
        )

    if priority_score is not None:
        evidence.append(
            f"Priority score: {priority_score:.2f}/100"
        )

    if productivity_score is not None:
        evidence.append(
            f"Productivity score: {productivity_score:.2f}/100"
        )

    if msi is not None:
        evidence.append(
            f"Milk Stability Index: {msi:.2f}/100"
        )

    if forecast_mean is not None:
        evidence.append(
            f"7-day forecast mean: {forecast_mean:.2f} L"
        )

    # -----------------------------------------------------------------------
    # Actual input measurements
    # -----------------------------------------------------------------------

    thi = _to_float(input_data.get("thi"))

    if thi is not None:
        evidence.append(
            f"THI at prediction time: {thi:.2f}"
        )

        if thi >= heat_stress_thi:
            evidence.append(
                f"THI is at/above the configured heat-stress "
                f"threshold of {heat_stress_thi:.2f}"
            )

    scc = _to_float(input_data.get("scc"))

    if scc is not None:
        evidence.append(
            f"SCC at prediction time: {scc:,.0f}"
        )

        if scc >= scc_threshold:
            evidence.append(
                f"SCC is at/above the configured threshold of "
                f"{scc_threshold:,.0f}"
            )

    body_temperature = _to_float(
        input_data.get("body_temperature")
    )

    if body_temperature is not None:
        evidence.append(
            f"Body temperature: {body_temperature:.2f} °C"
        )

    heart_rate = _to_float(
        input_data.get("heart_rate")
    )

    if heart_rate is not None:
        evidence.append(
            f"Heart rate: {heart_rate:.2f}"
        )

    respiration_rate = _to_float(
        input_data.get("respiration_rate")
    )

    if respiration_rate is not None:
        evidence.append(
            f"Respiration rate: {respiration_rate:.2f}"
        )

    water_intake = _to_float(
        input_data.get("water_intake")
    )

    if water_intake is not None:
        evidence.append(
            f"Water intake: {water_intake:.2f} L"
        )

    feed_intake = _to_float(
        input_data.get("feed_intake")
    )

    if feed_intake is not None:
        evidence.append(
            f"Feed intake: {feed_intake:.2f} kg"
        )

    # -----------------------------------------------------------------------
    # Recommendation generated by Stage 9
    # -----------------------------------------------------------------------

    recommendation = record.stage9_decision

    if recommendation:
        recommendation = str(recommendation).replace(
            "|",
            " • ",
        )
    else:
        recommendation = (
            "No separate recommendation was stored "
            "for this prediction."
        )

    # -----------------------------------------------------------------------
    # Reason
    # -----------------------------------------------------------------------

    if normalized_type == "risk":

        reason = (
            "The latest CCP-Chain prediction assigned this cow "
            f"a {record.stage12_risk_level} risk level."
        )

        if risk_score is not None:
            reason += (
                f" The model risk score is {risk_score:.2f}/100."
            )

    elif normalized_type == "health":

        reason = (
            "The latest CCP-Chain prediction produced a health "
            f"score of {health_score:.2f}/100, which is below "
            "the configured safe threshold of 70."
            if health_score is not None
            else
            "The latest CCP-Chain prediction produced a health "
            "score below the configured safe threshold."
        )

    elif normalized_type == "stress":

        if stress_probability is not None:
            reason = (
                "The latest CCP-Chain prediction detected "
                "elevated stress risk with an estimated "
                f"stress probability of "
                f"{stress_probability * 100:.2f}%."
            )
        else:
            reason = (
                "The latest CCP-Chain prediction marked this cow "
                "as stressed."
            )

    elif normalized_type == "milk drop":

        if drop_probability is not None:
            reason = (
                "The latest CCP-Chain prediction detected a "
                "possible milk-production drop with an estimated "
                f"probability of "
                f"{drop_probability * 100:.2f}%."
            )
        else:
            reason = (
                "The latest CCP-Chain prediction marked this cow "
                "for a possible milk-production drop."
            )

    else:

        reason = matching_alert.message

    return {
        "cow_id": cow_id,
        "alert_type": matching_alert.alert_type,
        "severity": matching_alert.severity,
        "reason": reason,
        "evidence": evidence,
        "recommendation": recommendation,
        "prediction_time": (
            record.created_at.isoformat()
            if record.created_at
            else None
        ),
    }