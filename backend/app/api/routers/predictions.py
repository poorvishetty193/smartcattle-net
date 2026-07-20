"""
SmartCattle Net
api/routers/predictions.py

Purpose
-------
Core inference router.

Exposes the main `/predict` endpoint that triggers the 12-stage 
CCP-Chain pipeline. Also provides endpoints to query prediction history.

Endpoints
---------
- POST /predict : Submit features and run inference.
- GET  /history : Get paginated prediction history.
"""

from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import desc, select

from app.api.deps import CurrentUser, SessionDep
from app.database.models import Cow, PredictionRecord
from app.schemas.PredictionRequest import PredictionRequest
from app.schemas.PredictionResponse import PredictionResponse
from app.services.prediction_pipeline import PredictionPipeline
from app.utils.helpers import BASE_FEATURE_COLS, safe_float
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/predict", tags=["predictions"])


@router.post("", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def create_prediction(
    db: SessionDep,
    current_user: CurrentUser,
    request_in: PredictionRequest,
) -> Any:
    """
    Execute the 12-stage CCP-Chain inference pipeline.
    
    This endpoint fetches the cow's recent history to feed time-series 
    models (Stage 3 LSTM, Stage 6 ARIMA/Prophet) before triggering the 
    master pipeline.
    """
    # 1. Resolve Cow UUID if it exists
    cow_uuid = None
    if request_in.cow_id:
        stmt = select(Cow).where(
            Cow.user_id == current_user.id, 
            Cow.label == request_in.cow_id
        )
        result = await db.execute(stmt)
        cow_obj = result.scalar_one_or_none()
        if cow_obj:
            cow_uuid = cow_obj.id

    # 2. Extract features into dictionary
    features: Dict[str, Any] = {
        col: getattr(request_in, col, None)
        for col in BASE_FEATURE_COLS
    }

    # 3. Fetch History for Time-Series stages
    # We fetch up to 10 previous records for this cow
    history_yields: List[float] = []
    history_records: List[Dict[str, Any]] = []

    if request_in.cow_id:
        hist_stmt = (
            select(PredictionRecord)
            .where(
                PredictionRecord.user_id == current_user.id,
                PredictionRecord.cow_label == request_in.cow_id,
            )
            .order_by(desc(PredictionRecord.created_at))
            .limit(10)
        )
        hist_result = await db.execute(hist_stmt)
        records = hist_result.scalars().all()
        
        # SQLAlchemy returns them newest first (desc). 
        # Time-series usually wants chronological order (oldest -> newest).
        records.reverse()

        for rec in records:
            # For Stage 6 (ARIMA/Prophet)
            if rec.stage1_daily_yield is not None:
                history_yields.append(float(rec.stage1_daily_yield))
            
            # For Stage 3 (LSTM)
            # The raw_response JSON contains all inputs and outputs
            raw = rec.raw_response or {}
            hist_feat = {
                col: safe_float(raw.get(col)) 
                for col in BASE_FEATURE_COLS
            }
            hist_feat["s1_daily_yield_pred"] = safe_float(rec.stage1_daily_yield)
            hist_feat["s2_drop_probability"] = safe_float(rec.stage2_drop_prob)
            history_records.append(hist_feat)

    # 4. Run Master Pipeline
    try:
        response = await PredictionPipeline.run_pipeline(
            db=db,
            user_id=current_user.id,
            cow_label=request_in.cow_id or "UNKNOWN",
            features=features,
            history_yields=history_yields,
            history_records=history_records,
            cow_uuid=cow_uuid,
        )
        return response
    except Exception as exc:
        logger.exception("Pipeline failed for cow: %s", request_in.cow_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline error: {str(exc)}",
        )


@router.get("/history", response_model=List[PredictionResponse])
async def get_prediction_history(
    db: SessionDep,
    current_user: CurrentUser,
    cow_id: str = None,
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Retrieve past predictions for the farm.
    Optionally filter by a specific cow_id (label).
    """
    stmt = select(PredictionRecord).where(PredictionRecord.user_id == current_user.id)
    
    if cow_id:
        stmt = stmt.where(PredictionRecord.cow_label == cow_id)
        
    stmt = stmt.order_by(desc(PredictionRecord.created_at)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    records = result.scalars().all()
    
    # Return the structured raw_response JSON blocks directly
    responses = [rec.raw_response for rec in records if rec.raw_response]
    return responses
