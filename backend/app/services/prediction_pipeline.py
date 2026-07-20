"""
SmartCattle Net
services/prediction_pipeline.py

Purpose
-------
The master orchestrator for the 12-stage CCP-Chain.

Receives raw features from the API, passes them through all 12 stages 
sequentially (feeding outputs of Stage N as inputs to Stage N+1), 
assembles the final unified response, and persists the run to the 
database as a ``PredictionRecord``.

Dependencies
------------
- app.services.stages.* (all 12 singleton services)
- app.database.models.PredictionRecord
- app.schemas.schemas.prediction.PredictionResponse
- app.utils.logger
- sqlalchemy.ext.asyncio.AsyncSession
"""

from __future__ import annotations

import uuid
from typing import Dict, List, Optional, Union

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import PredictionRecord
from app.schemas.schemas.prediction import PredictionResponse

# Import all 12 stage singletons
from app.services.stages.stage1_service import stage1_service
from app.services.stages.stage2_service import stage2_service
from app.services.stages.stage3_service import stage3_service
from app.services.stages.stage4_service import stage4_service
from app.services.stages.stage5_service import stage5_service
from app.services.stages.stage6_service import stage6_service
from app.services.stages.stage7_service import stage7_service
from app.services.stages.stage8_service import stage8_service
from app.services.stages.stage9_service import stage9_service
from app.services.stages.stage10_service import stage10_service
from app.services.stages.stage11_service import stage11_service
from app.services.stages.stage12_service import stage12_service

from app.utils.logger import get_logger

logger = get_logger(__name__)


class PredictionPipeline:
    """
    Executes the CCP-Chain inference pipeline end-to-end.
    """

    @classmethod
    async def run_pipeline(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        cow_label: str,
        features: Dict[str, Union[int, float, None]],
        history_yields: List[float],
        history_records: Optional[List[Dict[str, Union[int, float, None]]]] = None,
        cow_uuid: Optional[uuid.UUID] = None,
    ) -> PredictionResponse:
        """
        Execute all 12 stages, save to DB, and return the response.

        Parameters
        ----------
        db : AsyncSession
            Database session for persisting the PredictionRecord.
        user_id : uuid.UUID
            ID of the user initiating the prediction.
        cow_label : str
            Farm-assigned cow ID (e.g. 'C04').
        features : dict
            The 15 base feature columns for the current time step.
        history_yields : list of float
            Historical milk yields for Stage 6 forecasting.
        history_records : list of dict, optional
            Historical feature dicts for Stage 3 LSTM sequences.
        cow_uuid : uuid.UUID, optional
            The system UUID of the Cow if registered in the database.

        Returns
        -------
        PredictionResponse
            The complete 12-stage result payload.
        """
        logger.info(
            "Starting CCP-Chain pipeline for cow=%s user=%s", 
            cow_label, user_id
        )

        # --------------------------------------------------------------
        # Execution Chain
        # --------------------------------------------------------------

        # Stage 1: Daily Yield (XGBoost)
        s1 = stage1_service.predict(features)
        
        # Stage 2: Milk Drop (LightGBM)
        s2 = stage2_service.predict(
            features=features,
            s1_daily_yield_pred=s1["s1_daily_yield_pred"],
        )
        
        # Stage 3: Next Milking Yield (LSTM)
        s3_yield = stage3_service.predict(
            features=features,
            s1_daily_yield_pred=s1["s1_daily_yield_pred"],
            s2_drop_probability=s2["s2_drop_probability"],
            history=history_records,
        )
        s3 = {"s3_next_milking_yield": s3_yield}
        
        # Stage 4: Milk Stability Index (Random Forest)
        s4_val = stage4_service.predict(
            features=features,
            s1_daily_yield_pred=s1["s1_daily_yield_pred"],
            s2_drop_probability=s2["s2_drop_probability"],
            s3_next_milking_yield=s3["s3_next_milking_yield"],
        )
        s4 = {"s4_msi": s4_val}

        # Stage 5: Milk Quantity (Ridge + Poly)
        s5_qty = stage5_service.predict(
            features=features,
            s1_daily_yield_pred=s1["s1_daily_yield_pred"],
            s2_drop_probability=s2["s2_drop_probability"],
            s3_next_milking_yield=s3["s3_next_milking_yield"],
            s4_msi=s4["s4_msi"],
        )
        s5 = {"s5_milk_quantity": s5_qty}

        # Stage 6: Forecast (ARIMA+Prophet)
        s6 = stage6_service.predict(
            history_yields=history_yields,
            current_yield=s1["s1_daily_yield_pred"],
        )

        # Stage 7: Productivity (Climate-Gated)
        s7_val = stage7_service.predict(
            features=features,
            s1_daily_yield_pred=s1["s1_daily_yield_pred"],
            s2_drop_probability=s2["s2_drop_probability"],
            s4_msi=s4["s4_msi"],
            s5_milk_quantity=s5["s5_milk_quantity"],
            s6_trend_slope=s6["s6_trend_slope"],
        )
        s7 = {"s7_productivity_score": s7_val}

        # Stage 8: Heat Stress (Gradient Boosting)
        s8 = stage8_service.predict(
            features=features,
            s1_daily_yield_pred=s1["s1_daily_yield_pred"],
            s2_drop_probability=s2["s2_drop_probability"],
            s4_msi=s4["s4_msi"],
            s5_milk_quantity=s5["s5_milk_quantity"],
            s6_trend_slope=s6["s6_trend_slope"],
            s7_productivity_score=s7["s7_productivity_score"],
        )

        # Stage 9: Farm Decision (Rule Engine)
        s9 = stage9_service.predict(
            features=features,
            s2_drop_probability=s2["s2_drop_probability"],
            s4_msi=s4["s4_msi"],
            s7_productivity_score=s7["s7_productivity_score"],
            s8_stress_flag=s8["s8_stress_flag"],
        )

        # Stage 10: Priority Rank (Composite)
        s10_score = stage10_service.predict(
            s2_drop_probability=s2["s2_drop_probability"],
            s4_msi=s4["s4_msi"],
            s7_productivity_score=s7["s7_productivity_score"],
            s8_stress_probability=s8["s8_stress_probability"],
        )
        s10 = {"s10_priority_score": s10_score}

        # Stage 11: Health Score (Stacking)
        s11_val = stage11_service.predict(
            features=features,
            s2_drop_probability=s2["s2_drop_probability"],
            s4_msi=s4["s4_msi"],
            s6_trend_slope=s6["s6_trend_slope"],
            s7_productivity_score=s7["s7_productivity_score"],
            s8_stress_probability=s8["s8_stress_probability"],
        )
        s11 = {"s11_health_score": s11_val}

        # Stage 12: Risk Detection (Isolation Forest)
        s12 = stage12_service.predict(
            features=features,
            s1_daily_yield_pred=s1["s1_daily_yield_pred"],
            s2_drop_probability=s2["s2_drop_probability"],
            s4_msi=s4["s4_msi"],
            s5_milk_quantity=s5["s5_milk_quantity"],
            s6_trend_slope=s6["s6_trend_slope"],
            s7_productivity_score=s7["s7_productivity_score"],
            s8_stress_probability=s8["s8_stress_probability"],
        )

        # --------------------------------------------------------------
        # Assemble Response
        # --------------------------------------------------------------

        # Combine all dicts into one master payload
        master_payload: Dict[str, Union[float, int, str]] = {
            "cow_id": cow_label,
            **s1,
            **s2,
            **s3,
            **s4,
            **s5,
            **s6,
            **s7,
            **s8,
            **s9,
            **s10,
            **s11,
            **s12,
        }

        # Validate with Pydantic
        response_model = PredictionResponse(**master_payload)  # type: ignore

        # --------------------------------------------------------------
        # Database Persistence
        # --------------------------------------------------------------
        
        record = PredictionRecord(
            user_id=user_id,
            cow_id=cow_uuid,
            cow_label=cow_label,
            
            stage1_daily_yield=s1["s1_daily_yield_pred"],
            stage2_drop_prob=s2["s2_drop_probability"],
            stage2_drop_flag=s2["s2_drop_flag"],
            stage3_next_milking=s3["s3_next_milking_yield"],
            stage4_msi=s4["s4_msi"],
            stage5_quantity=s5["s5_milk_quantity"],
            stage6_forecast_mean=s6["s6_forecast_7d_mean"],
            stage6_trend_slope=s6["s6_trend_slope"],
            stage6_trend_dir=s6["s6_trend_direction"],
            stage7_productivity=s7["s7_productivity_score"],
            stage8_stress_prob=s8["s8_stress_probability"],
            stage8_stress_flag=s8["s8_stress_flag"],
            stage9_decision=s9["s9_farm_decision"],
            stage9_attention=s9["s9_needs_attention"],
            stage10_priority_score=s10["s10_priority_score"],
            stage11_health_score=s11["s11_health_score"],
            stage12_risk_score=s12["s12_risk_score"],
            stage12_risk_flag=s12["s12_risk_flag"],
            stage12_risk_level=s12["s12_risk_level"],
            
            # Store the complete JSON-serialisable payload
            raw_response=response_model.model_dump(),
        )

        db.add(record)
        # We flush to get the UUID, but the session commit happens 
        # in the FastAPI Depends(get_db) block on request exit.
        await db.flush()

        logger.info(
            "CCP-Chain complete for cow=%s. Record persisted: %s", 
            cow_label, record.id
        )

        return response_model
