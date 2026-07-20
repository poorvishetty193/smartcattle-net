"""
SmartCattle Net
tests/test_pipeline.py

Purpose
-------
Unit tests for the 12-stage prediction pipeline orchestrator.

Mocks the individual ML inference stages to test data flow, 
schema validation, and database persistence without requiring 
heavy .pkl or .keras files to be present on disk.
"""

import uuid
from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.prediction_pipeline import PredictionPipeline
from app.schemas.schemas.prediction import PredictionResponse

# Sample input features matching BASE_FEATURE_COLS
SAMPLE_FEATURES = {
    "DIM": 120,
    "parity": 2,
    "log_scc": 4.5,
    "thi": 68.0,
    "thi_stress_flag": 0,
    "yield_lag_1": 32.5,
    "yield_lag_2": 33.0,
    "yield_lag_3": 31.8,
    "yield_lag_7": 32.1,
    "yield_roll_7_mean": 32.4,
    "yield_roll_7_std": 1.1,
    "yield_cv_7": 3.4,
    "month": 6,
    "season": 2,
    "mastitis_risk_proxy": 0,
}


@pytest.mark.asyncio
@patch("app.services.prediction_pipeline.stage1_service")
@patch("app.services.prediction_pipeline.stage2_service")
@patch("app.services.prediction_pipeline.stage3_service")
@patch("app.services.prediction_pipeline.stage4_service")
@patch("app.services.prediction_pipeline.stage5_service")
@patch("app.services.prediction_pipeline.stage6_service")
@patch("app.services.prediction_pipeline.stage7_service")
@patch("app.services.prediction_pipeline.stage8_service")
@patch("app.services.prediction_pipeline.stage9_service")
@patch("app.services.prediction_pipeline.stage10_service")
@patch("app.services.prediction_pipeline.stage11_service")
@patch("app.services.prediction_pipeline.stage12_service")
async def test_prediction_pipeline_end_to_end(
    mock_stage12,
    mock_stage11,
    mock_stage10,
    mock_stage9,
    mock_stage8,
    mock_stage7,
    mock_stage6,
    mock_stage5,
    mock_stage4,
    mock_stage3,
    mock_stage2,
    mock_stage1,
) -> None:
    """
    Test that the orchestrator successfully passes data through all 12 stages, 
    assembles the response, and persists the record.
    """
    # 1. Setup Mock Returns for all stages
    mock_stage1.predict.return_value = {"s1_daily_yield_pred": 35.2}
    
    mock_stage2.predict.return_value = {
        "s2_drop_probability": 0.15, 
        "s2_drop_flag": 0
    }
    
    mock_stage3.predict.return_value = 34.8  # Returns float
    
    mock_stage4.predict.return_value = 85.5  # Returns float
    
    mock_stage5.predict.return_value = 34.0  # Returns float
    
    mock_stage6.predict.return_value = {
        "s6_forecast_7d_mean": 34.5,
        "s6_trend_slope": 0.02,
        "s6_trend_direction": 0,
    }
    
    mock_stage7.predict.return_value = 88.0  # Returns float
    
    mock_stage8.predict.return_value = {
        "s8_stress_probability": 0.1, 
        "s8_stress_flag": 0
    }
    
    mock_stage9.predict.return_value = {
        "s9_farm_decision": "NORMAL — maintain current protocol",
        "s9_needs_attention": 0
    }
    
    mock_stage10.predict.return_value = 25.0  # Returns float
    
    mock_stage11.predict.return_value = 92.5  # Returns float
    
    mock_stage12.predict.return_value = {
        "s12_anomaly_score": -0.4,
        "s12_risk_score": 10.0,
        "s12_risk_flag": 0,
        "s12_risk_level": "low",
    }

    # 2. Setup Database Mock
    mock_db = AsyncMock(spec=AsyncSession)
    user_id = uuid.uuid4()
    cow_label = "TEST_COW_01"

    # 3. Execute Pipeline
    response = await PredictionPipeline.run_pipeline(
        db=mock_db,
        user_id=user_id,
        cow_label=cow_label,
        features=SAMPLE_FEATURES,
        history_yields=[33.0, 32.5, 34.0],
        history_records=[SAMPLE_FEATURES, SAMPLE_FEATURES],
        cow_uuid=uuid.uuid4(),
    )

    # 4. Assertions
    # Ensure all stages were called
    mock_stage1.predict.assert_called_once_with(SAMPLE_FEATURES)
    mock_stage12.predict.assert_called_once()
    
    # Ensure DB interactions occurred
    mock_db.add.assert_called_once()
    mock_db.flush.assert_called_once()
    
    # Ensure response format is correct
    assert isinstance(response, PredictionResponse)
    assert response.s1_daily_yield_pred == 35.2
    assert response.s9_farm_decision == "NORMAL — maintain current protocol"
    assert response.s11_health_score == 92.5
