"""
SmartCattle Net
schemas/dashboard.py

Purpose
-------
Pydantic response schemas for Dashboard APIs.
"""

from datetime import datetime

from pydantic import BaseModel


class OverviewResponse(BaseModel):
    """
    Dashboard overview response.
    """

    farm_name: str
    welcome_message: str
    last_sync: datetime
    thi: float
    status: str

    class Config:
        from_attributes = True
        
class StatisticsResponse(BaseModel):
    avg_daily_yield: float
    at_risk_cows: int
    avg_health_score: float
    stress_alerts: int

    class Config:
        from_attributes = True        