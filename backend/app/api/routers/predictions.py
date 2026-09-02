"""
SmartCattle Net

api/routers/predictions.py

Purpose
-------
Core inference router.

Endpoints
---------
- POST /predict        : Submit features and run inference.
- GET  /predict/history: Get paginated prediction history.
- GET  /predict/export : Export prediction history as CSV.
- POST /predict/rerun  : Re-run the latest prediction for a cow.
"""

import csv
import io
import json
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import desc, select

from app.api.deps import CurrentUser, SessionDep
from app.database.models import Cow, PredictionRecord
from app.schemas.PredictionRequest import PredictionRequest
from app.schemas.PredictionResponse import PredictionResponse
from app.services.prediction_pipeline import PredictionPipeline
from app.utils.helpers import BASE_FEATURE_COLS, safe_float
from app.utils.logger import get_logger


logger = get_logger(__name__)

router = APIRouter(
    prefix="/predict",
    tags=["predictions"],
)


# ---------------------------------------------------------------------------
# CREATE PREDICTION
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=PredictionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_prediction(
    db: SessionDep,
    current_user: CurrentUser,
    request_in: PredictionRequest,
) -> Any:
    """
    Execute the 12-stage CCP-Chain inference pipeline.

    This endpoint fetches the cow's recent history to feed time-series
    models before triggering the master pipeline.
    """

    # 1. Resolve Cow UUID if it exists
    cow_uuid = None

    if request_in.cow_id:
        stmt = select(Cow).where(
            Cow.owner_id == current_user.id,
            Cow.cow_id == request_in.cow_id,
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

    # 3. Fetch history for time-series stages
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

        # Newest -> oldest from DB.
        # Reverse so time-series models receive oldest -> newest.
        records.reverse()

        for rec in records:

            # Stage 6 history
            if rec.stage1_daily_yield is not None:
                history_yields.append(
                    float(rec.stage1_daily_yield)
                )

            # Stage 3 history
            raw = rec.raw_response or {}

            hist_feat = {
                col: safe_float(raw.get(col))
                for col in BASE_FEATURE_COLS
            }

            hist_feat["s1_daily_yield_pred"] = safe_float(
                rec.stage1_daily_yield
            )

            hist_feat["s2_drop_probability"] = safe_float(
                rec.stage2_drop_prob
            )

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
    input_data=request_in.model_dump(),
)

        return response

    except Exception as exc:
        logger.exception(
            "Pipeline failed for cow: %s",
            request_in.cow_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline error: {str(exc)}",
        )


# ---------------------------------------------------------------------------
# PREDICTION HISTORY
# ---------------------------------------------------------------------------

@router.get(
    "/history",
    response_model=List[PredictionResponse],
)
async def get_prediction_history(
    db: SessionDep,
    current_user: CurrentUser,
    cow_id: str = None,
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Retrieve past predictions for the farm.

    Optionally filter by a specific cow_id.
    """

    stmt = select(PredictionRecord).where(
        PredictionRecord.user_id == current_user.id
    )

    if cow_id:
        stmt = stmt.where(
            PredictionRecord.cow_label == cow_id
        )

    stmt = (
        stmt
        .order_by(desc(PredictionRecord.created_at))
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(stmt)
    records = result.scalars().all()

    responses = [
        rec.raw_response
        for rec in records
        if rec.raw_response
    ]

    return responses


# ---------------------------------------------------------------------------
# EXPORT CSV
# ---------------------------------------------------------------------------

@router.get("/export")
async def export_predictions_csv(
    db: SessionDep,
    current_user: CurrentUser,
) -> StreamingResponse:
    """
    Export the current user's prediction history as a CSV file.

    Each prediction becomes one CSV row.
    Nested JSON values are serialized into JSON strings.
    """

    stmt = (
        select(PredictionRecord)
        .where(
            PredictionRecord.user_id == current_user.id
        )
        .order_by(desc(PredictionRecord.created_at))
    )

    result = await db.execute(stmt)
    records = result.scalars().all()

    if not records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No prediction records available for export.",
        )

    rows: List[Dict[str, Any]] = []

    for record in records:
        raw = record.raw_response or {}

        row: Dict[str, Any] = {
            "prediction_id": str(record.id),
            "cow_id": record.cow_label,
            "created_at": (
                record.created_at.isoformat()
                if record.created_at
                else ""
            ),
        }

        # Add all values from the stored prediction response.
        for key, value in raw.items():

            if isinstance(value, (dict, list)):
                row[key] = json.dumps(
                    value,
                    ensure_ascii=False,
                )
            else:
                row[key] = value

        rows.append(row)

    # Collect every possible column.
    fieldnames: List[str] = []

    for row in rows:
        for key in row.keys():
            if key not in fieldnames:
                fieldnames.append(key)

    output = io.StringIO()

    writer = csv.DictWriter(
        output,
        fieldnames=fieldnames,
        extrasaction="ignore",
    )

    writer.writeheader()

    for row in rows:
        writer.writerow(row)

    output.seek(0)

    headers = {
        "Content-Disposition": (
            'attachment; filename="smartcattlenet_predictions.csv"'
        )
    }

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers=headers,
    )


# ---------------------------------------------------------------------------
# RE-RUN LATEST PREDICTION
# ---------------------------------------------------------------------------

@router.post(
    "/rerun",
    response_model=PredictionResponse,
)
async def rerun_latest_prediction(
    db: SessionDep,
    current_user: CurrentUser,
    cow_id: str,
) -> Any:
    """
    Re-run the latest prediction for a cow using the original
    PredictionRequest that was stored with the previous run.
    """

    # 1. Find latest prediction for this user + cow.
    stmt = (
        select(PredictionRecord)
        .where(
            PredictionRecord.user_id == current_user.id,
            PredictionRecord.cow_label == cow_id,
        )
        .order_by(desc(PredictionRecord.created_at))
        .limit(1)
    )

    result = await db.execute(stmt)
    record = result.scalar_one_or_none()

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No previous prediction found for cow '{cow_id}'.",
        )

    # 2. Get the original request data stored by the pipeline.
    raw = record.raw_response or {}
    stored_input = raw.get("input")

    if not isinstance(stored_input, dict):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Cannot re-run prediction for cow '{cow_id}'. "
                "The previous prediction does not contain the original "
                "input data. Run a new prediction once to enable re-run."
            ),
        )

    # Always use the cow_id from the endpoint.
    stored_input["cow_id"] = cow_id

    # 3. Validate the stored request.
    try:
        request_in = PredictionRequest(**stored_input)
    except Exception as exc:
        logger.exception(
            "Failed to reconstruct prediction request for cow: %s",
            cow_id,
        )

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Stored prediction data for cow '{cow_id}' "
                f"cannot be reused: {str(exc)}"
            ),
        )

    # 4. Run the exact same prediction pipeline.
    return await create_prediction(
        db=db,
        current_user=current_user,
        request_in=request_in,
    )