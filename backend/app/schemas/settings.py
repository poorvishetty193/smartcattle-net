"""
SmartCattle Net

schemas/settings.py

Purpose
-------
Pydantic schemas for farm settings, AI thresholds,
and notification preferences.
"""

from pydantic import BaseModel, Field


class FarmProfile(BaseModel):
    farm_name: str = Field(
        default="Green Valley Precision Dairy",
        max_length=256,
    )
    farm_location: str = Field(
        default="",
        max_length=512,
    )
    timezone: str = Field(
        default="CST (UTC -6)",
        max_length=64,
    )


class FarmProfileUpdate(BaseModel):
    farm_name: str | None = Field(
        default=None,
        max_length=256,
    )
    farm_location: str | None = Field(
        default=None,
        max_length=512,
    )
    timezone: str | None = Field(
        default=None,
        max_length=64,
    )


class ModelThresholds(BaseModel):
    milk_drop_threshold: float = Field(
        default=15.0,
        ge=0,
        le=100,
    )
    heat_stress_thi: float = Field(
        default=72.0,
        ge=0,
        le=100,
    )
    scc_mastitis_threshold: float = Field(
        default=200000.0,
        ge=0,
    )
    priority_score_cutoff: float = Field(
        default=8.5,
        ge=0,
        le=10,
    )


class ModelThresholdsUpdate(BaseModel):
    milk_drop_threshold: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )
    heat_stress_thi: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )
    scc_mastitis_threshold: float | None = Field(
        default=None,
        ge=0,
    )
    priority_score_cutoff: float | None = Field(
        default=None,
        ge=0,
        le=10,
    )


class NotificationSettings(BaseModel):
    critical_push: bool = True
    critical_email: bool = True
    critical_sms: bool = True

    daily_report_email: bool = True

    heat_push: bool = True
    heat_email: bool = True
    heat_sms: bool = False


class NotificationSettingsUpdate(BaseModel):
    critical_push: bool | None = None
    critical_email: bool | None = None
    critical_sms: bool | None = None

    daily_report_email: bool | None = None

    heat_push: bool | None = None
    heat_email: bool | None = None
    heat_sms: bool | None = None


class SettingsResponse(BaseModel):
    farm: FarmProfile
    thresholds: ModelThresholds
    notifications: NotificationSettings