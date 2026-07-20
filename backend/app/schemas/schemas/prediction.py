from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """
    Request schema for the complete CCP-Chain prediction pipeline.
    """

    cow_id: str = Field(..., description="Unique Cow ID")

    lactation_number: int
    days_in_milk: int
    parity: int

    milk_yield: float
    fat_percent: float
    protein_percent: float
    lactose_percent: float
    snf_percent: float
    scc: float

    body_temperature: float
    heart_rate: int
    respiration_rate: int

    feed_intake: float
    water_intake: float

    temperature: float
    humidity: float
    thi: float

    activity_level: float
    rumination: float

    class Config:
        from_attributes = True


class PredictionResponse(BaseModel):
    """
    Response schema returned after running the
    complete 12-stage CCP-Chain prediction pipeline.
    """

    cow_id: str

    stage1_daily_yield: Optional[float] = None
    stage2_drop_probability: Optional[float] = None
    stage3_next_milking: Optional[float] = None
    stage4_msi: Optional[float] = None
    stage5_quantity: Optional[float] = None

    stage6_forecast: Optional[Dict[str, Any]] = None

    stage7_productivity_score: Optional[float] = None

    stage8_stress_probability: Optional[float] = None

    stage9_recommendation: Optional[str] = None

    stage10_priority_rank: Optional[int] = None

    stage11_health_score: Optional[float] = None

    stage12_risk_level: Optional[str] = None

    class Config:
        from_attributes = True