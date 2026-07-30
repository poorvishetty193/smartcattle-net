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
from pydantic import BaseModel
class FarmDecisionItem(BaseModel):
    cow_id: str
    recommendation: str


class FarmDecisionResponse(BaseModel):
    decisions: list[FarmDecisionItem]
class HeatmapItem(BaseModel):
    cow_id: str
    productivity_score: float
class PriorityRankingItem(BaseModel):
    cow_id: str
    priority_score: float
    priority_rank: int


class PriorityRankingResponse(BaseModel):
    rankings: list[PriorityRankingItem]
class HealthRiskItem(BaseModel):
    cow_id: str
    health_score: float
    risk_score: float
    risk_level: str
    risk_flag: int

class MilkYieldTrendItem(BaseModel):
    cow_id: str
    daily_yield: float

class AlertItem(BaseModel):
    cow_id: str
    alert_type: str
    message: str
    severity: str


class AlertResponse(BaseModel):
    alerts: list[AlertItem]
class MilkYieldTrendResponse(BaseModel):
    trends: list[MilkYieldTrendItem]
class HealthRiskResponse(BaseModel):
    cows: list[HealthRiskItem]

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