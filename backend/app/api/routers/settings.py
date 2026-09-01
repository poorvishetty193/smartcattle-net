"""
SmartCattle Net

api/routers/settings.py

Settings Router
---------------
Handles farm profile, model thresholds, and notification preferences.
"""

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, SessionDep
from app.database.models import FarmSettings
from app.schemas.settings import (
    FarmProfile,
    FarmProfileUpdate,
    ModelThresholds,
    ModelThresholdsUpdate,
    NotificationSettings,
    NotificationSettingsUpdate,
    SettingsResponse,
)
from app.utils.logger import get_logger


logger = get_logger(__name__)

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
)


# ---------------------------------------------------------------------------
# Defaults
# ---------------------------------------------------------------------------

DEFAULT_MILK_DROP = 15.0
DEFAULT_HEAT_STRESS_THI = 72.0
DEFAULT_SCC = 200000.0
DEFAULT_PRIORITY_CUTOFF = 8.5


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------


async def _get_or_create_settings(
    db: SessionDep,
    current_user: CurrentUser,
) -> FarmSettings:
    """
    Get settings for the current user.

    If the user has no settings row yet, create one with defaults.
    """

    stmt = select(FarmSettings).where(
        FarmSettings.user_id == current_user.id
    )

    result = await db.execute(stmt)
    farm_settings = result.scalar_one_or_none()

    if farm_settings is not None:
        return farm_settings

    farm_settings = FarmSettings(
        user_id=current_user.id,
        farm_name=(
            current_user.full_name
            if current_user.full_name
            else "Green Valley Precision Dairy"
        ),
        farm_location="",
        timezone="CST (UTC -6)",
        milk_drop_threshold=DEFAULT_MILK_DROP,
        heat_stress_thi=DEFAULT_HEAT_STRESS_THI,
        scc_mastitis_threshold=DEFAULT_SCC,
        priority_score_cutoff=DEFAULT_PRIORITY_CUTOFF,
        critical_push=True,
        critical_email=True,
        critical_sms=True,
        daily_report_email=True,
        heat_push=True,
        heat_email=True,
        heat_sms=False,
    )

    db.add(farm_settings)
    await db.commit()
    await db.refresh(farm_settings)

    return farm_settings


# ---------------------------------------------------------------------------
# GET all settings
# ---------------------------------------------------------------------------


@router.get(
    "",
    response_model=SettingsResponse,
)
async def get_settings(
    db: SessionDep,
    current_user: CurrentUser,
) -> SettingsResponse:
    """
    Return all settings belonging to the authenticated user.
    """

    farm_settings = await _get_or_create_settings(
        db,
        current_user,
    )

    return SettingsResponse(
        farm=FarmProfile(
            farm_name=farm_settings.farm_name or "",
            farm_location=farm_settings.farm_location or "",
            timezone=farm_settings.timezone,
        ),
        thresholds=ModelThresholds(
            milk_drop_threshold=float(
                farm_settings.milk_drop_threshold
            ),
            heat_stress_thi=float(
                farm_settings.heat_stress_thi
            ),
            scc_mastitis_threshold=float(
                farm_settings.scc_mastitis_threshold
            ),
            priority_score_cutoff=float(
                farm_settings.priority_score_cutoff
            ),
        ),
        notifications=NotificationSettings(
            critical_push=farm_settings.critical_push,
            critical_email=farm_settings.critical_email,
            critical_sms=farm_settings.critical_sms,
            daily_report_email=farm_settings.daily_report_email,
            heat_push=farm_settings.heat_push,
            heat_email=farm_settings.heat_email,
            heat_sms=farm_settings.heat_sms,
        ),
    )


# ---------------------------------------------------------------------------
# Farm profile
# ---------------------------------------------------------------------------


@router.put(
    "/farm",
    response_model=FarmProfile,
)
async def update_farm_profile(
    payload: FarmProfileUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> FarmProfile:
    """
    Update the authenticated user's farm profile.
    """

    farm_settings = await _get_or_create_settings(
        db,
        current_user,
    )

    if payload.farm_name is not None:
        farm_settings.farm_name = payload.farm_name.strip()

    if payload.farm_location is not None:
        farm_settings.farm_location = payload.farm_location.strip()

    if payload.timezone is not None:
        farm_settings.timezone = payload.timezone.strip()

    await db.commit()
    await db.refresh(farm_settings)

    logger.info(
        "Farm settings updated for user: %s",
        current_user.email,
    )

    return FarmProfile(
        farm_name=farm_settings.farm_name or "",
        farm_location=farm_settings.farm_location or "",
        timezone=farm_settings.timezone,
    )


# ---------------------------------------------------------------------------
# Model thresholds
# ---------------------------------------------------------------------------


@router.put(
    "/thresholds",
    response_model=ModelThresholds,
)
async def update_model_thresholds(
    payload: ModelThresholdsUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ModelThresholds:
    """
    Update AI model alert thresholds.
    """

    farm_settings = await _get_or_create_settings(
        db,
        current_user,
    )

    if payload.milk_drop_threshold is not None:
        farm_settings.milk_drop_threshold = payload.milk_drop_threshold

    if payload.heat_stress_thi is not None:
        farm_settings.heat_stress_thi = payload.heat_stress_thi

    if payload.scc_mastitis_threshold is not None:
        farm_settings.scc_mastitis_threshold = (
            payload.scc_mastitis_threshold
        )

    if payload.priority_score_cutoff is not None:
        farm_settings.priority_score_cutoff = (
            payload.priority_score_cutoff
        )

    await db.commit()
    await db.refresh(farm_settings)

    logger.info(
        "Model thresholds updated for user: %s",
        current_user.email,
    )

    return ModelThresholds(
        milk_drop_threshold=float(
            farm_settings.milk_drop_threshold
        ),
        heat_stress_thi=float(
            farm_settings.heat_stress_thi
        ),
        scc_mastitis_threshold=float(
            farm_settings.scc_mastitis_threshold
        ),
        priority_score_cutoff=float(
            farm_settings.priority_score_cutoff
        ),
    )


# ---------------------------------------------------------------------------
# Reset thresholds
# ---------------------------------------------------------------------------


@router.post(
    "/thresholds/reset",
    response_model=ModelThresholds,
)
async def reset_model_thresholds(
    db: SessionDep,
    current_user: CurrentUser,
) -> ModelThresholds:
    """
    Restore the default model thresholds.
    """

    farm_settings = await _get_or_create_settings(
        db,
        current_user,
    )

    farm_settings.milk_drop_threshold = DEFAULT_MILK_DROP
    farm_settings.heat_stress_thi = DEFAULT_HEAT_STRESS_THI
    farm_settings.scc_mastitis_threshold = DEFAULT_SCC
    farm_settings.priority_score_cutoff = DEFAULT_PRIORITY_CUTOFF

    await db.commit()
    await db.refresh(farm_settings)

    logger.info(
        "Model thresholds reset for user: %s",
        current_user.email,
    )

    return ModelThresholds(
        milk_drop_threshold=DEFAULT_MILK_DROP,
        heat_stress_thi=DEFAULT_HEAT_STRESS_THI,
        scc_mastitis_threshold=DEFAULT_SCC,
        priority_score_cutoff=DEFAULT_PRIORITY_CUTOFF,
    )


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------


@router.put(
    "/notifications",
    response_model=NotificationSettings,
)
async def update_notifications(
    payload: NotificationSettingsUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> NotificationSettings:
    """
    Update notification preferences.
    """

    farm_settings = await _get_or_create_settings(
        db,
        current_user,
    )

    fields = (
        "critical_push",
        "critical_email",
        "critical_sms",
        "daily_report_email",
        "heat_push",
        "heat_email",
        "heat_sms",
    )

    for field in fields:
        value = getattr(payload, field)

        if value is not None:
            setattr(farm_settings, field, value)

    await db.commit()
    await db.refresh(farm_settings)

    logger.info(
        "Notification settings updated for user: %s",
        current_user.email,
    )

    return NotificationSettings(
        critical_push=farm_settings.critical_push,
        critical_email=farm_settings.critical_email,
        critical_sms=farm_settings.critical_sms,
        daily_report_email=farm_settings.daily_report_email,
        heat_push=farm_settings.heat_push,
        heat_email=farm_settings.heat_email,
        heat_sms=farm_settings.heat_sms,
    )