"""
SmartCattle Net
schemas/dashboard.py

Purpose
-------
Pydantic response schemas for Dashboard APIs.
"""

from datetime import datetime

from pydantic import BaseModel
from pydantic import BaseModel

class HeatmapItem(BaseModel):
    cow_id: str
    productivity_score: float


class HeatmapResponse(BaseModel):
    heatmap: list[HeatmapItem]

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