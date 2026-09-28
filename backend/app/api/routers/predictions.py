"""
SmartCattle Net

api/routers/predictions.py

Purpose
-------
Core inference router.

Endpoints
---------
- POST /predict         : Submit features and run inference.
- GET  /predict/history : Get paginated prediction history.
- GET  /predict/export  : Export prediction history as CSV.
- POST /predict/rerun   : Re-run the latest prediction for a cow.
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

    The cow must belong to the logged-in farmer and must be active.
    """

    # -----------------------------------------------------------------------
    # 1. Resolve and validate Cow UUID
    # -----------------------------------------------------------------------

    cow_uuid = None

    if request_in.cow_id:
        stmt = select(Cow).where(
            Cow.owner_id == current_user.id,
            Cow.cow_id == request_in.cow_id,
            Cow.is_active.is_(True),
        )

        result = await db.execute(stmt)
        cow_obj = result.scalar_one_or_none()

        if cow_obj is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Cow '{request_in.cow_id}' was not found in "
                    "your active registered herd."
                ),
            )

        cow_uuid = cow_obj.id

    # -----------------------------------------------------------------------
    # 2. Extract features into dictionary
    # -----------------------------------------------------------------------

    features: Dict[str, Any] = {
        col: getattr(request_in, col, None)
        for col in BASE_FEATURE_COLS
    }

    # -----------------------------------------------------------------------
    # 3. Fetch history for time-series stages
    # -----------------------------------------------------------------------

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

            # ---------------------------------------------------------------
            # Stage 6 history
            # ---------------------------------------------------------------

            if rec.stage1_daily_yield is not None:
                history_yields.append(
                    float(rec.stage1_daily_yield)
                )

            # ---------------------------------------------------------------
            # Historical feature record
            # ---------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # 4. Run Master Pipeline
    # -----------------------------------------------------------------------

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
    cow_id: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Retrieve prediction history for the logged-in farmer.

    Only predictions belonging to the farmer's currently active
    registered cows are returned.

    If cow_id is supplied, only that active registered cow is returned.

    The complete saved prediction response is returned, including
    the Stage 6 7-day forecast.
    """

    # -----------------------------------------------------------------------
    # Build query
    # -----------------------------------------------------------------------

    stmt = (
        select(PredictionRecord)
        .join(
            Cow,
            Cow.cow_id == PredictionRecord.cow_label,
        )
        .where(
            PredictionRecord.user_id == current_user.id,
            Cow.owner_id == current_user.id,
            Cow.is_active.is_(True),
        )
    )

    # -----------------------------------------------------------------------
    # Optional cow filter
    # -----------------------------------------------------------------------

    if cow_id:
        stmt = stmt.where(
            PredictionRecord.cow_label == cow_id
        )

    # -----------------------------------------------------------------------
    # Pagination
    # -----------------------------------------------------------------------

    stmt = (
        stmt
        .order_by(desc(PredictionRecord.created_at))
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(stmt)
    records = result.scalars().all()

    # -----------------------------------------------------------------------
    # Build normalized prediction responses
    # -----------------------------------------------------------------------

    responses: List[Dict[str, Any]] = []

    for record in records:
        raw = record.raw_response or {}

        if not isinstance(raw, dict):
            continue

        # Make a copy so we never mutate the database object.
        prediction: Dict[str, Any] = dict(raw)

        # ---------------------------------------------------------------
        # Guarantee cow_id
        # ---------------------------------------------------------------

        prediction["cow_id"] = record.cow_label

        # ---------------------------------------------------------------
        # Guarantee Stage 6 structure
        # ---------------------------------------------------------------

        stage6 = prediction.get("stage6_forecast")

        if not isinstance(stage6, dict):
            stage6 = {}

        # ---------------------------------------------------------------
        # If the raw prediction already contains the full 7-day forecast,
        # preserve it exactly.
        #
        # Otherwise use the values stored directly in PredictionRecord.
        # ---------------------------------------------------------------

        forecast_7d = stage6.get("s6_forecast_7d")

        if not isinstance(forecast_7d, list):
            forecast_7d = []

        forecast_7d_mean = stage6.get(
            "s6_forecast_7d_mean"
        )

        if forecast_7d_mean is None:
            forecast_7d_mean = record.stage6_forecast_mean

        trend_slope = stage6.get(
            "s6_trend_slope"
        )

        if trend_slope is None:
            trend_slope = record.stage6_trend_slope

        trend_direction = stage6.get(
            "s6_trend_direction"
        )

        if trend_direction is None:
            trend_direction = record.stage6_trend_dir

        # ---------------------------------------------------------------
        # Put normalized Stage 6 response back into prediction
        # ---------------------------------------------------------------

        prediction["stage6_forecast"] = {
            "s6_forecast_7d": forecast_7d,
            "s6_forecast_7d_mean": (
                float(forecast_7d_mean)
                if forecast_7d_mean is not None
                else None
            ),
            "s6_trend_slope": (
                float(trend_slope)
                if trend_slope is not None
                else None
            ),
            "s6_trend_direction": (
                int(trend_direction)
                if trend_direction is not None
                else None
            ),
        }

        # ---------------------------------------------------------------
        # Guarantee important prediction fields
        # ---------------------------------------------------------------

        if (
            prediction.get("stage1_daily_yield") is None
            and record.stage1_daily_yield is not None
        ):
            prediction["stage1_daily_yield"] = float(
                record.stage1_daily_yield
            )

        if (
            prediction.get("stage11_health_score") is None
            and record.stage11_health_score is not None
        ):
            prediction["stage11_health_score"] = float(
                record.stage11_health_score
            )

        if (
            prediction.get("stage12_risk_level") is None
            and record.stage12_risk_level is not None
        ):
            prediction["stage12_risk_level"] = (
                record.stage12_risk_level
            )

        responses.append(prediction)

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
        .join(
            Cow,
            Cow.cow_id == PredictionRecord.cow_label,
        )
        .where(
            PredictionRecord.user_id == current_user.id,
            Cow.owner_id == current_user.id,
            Cow.is_active.is_(True),
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
        if isinstance(raw, dict):
            for key, value in raw.items():
                if isinstance(value, (dict, list)):
                    row[key] = json.dumps(
                        value,
                        ensure_ascii=False,
                    )
                else:
                    row[key] = value

        rows.append(row)

    # -----------------------------------------------------------------------
    # Collect every possible column
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # 1. Verify that the cow belongs to the current user's active herd
    # -----------------------------------------------------------------------

    cow_stmt = select(Cow).where(
        Cow.owner_id == current_user.id,
        Cow.cow_id == cow_id,
        Cow.is_active.is_(True),
    )

    cow_result = await db.execute(cow_stmt)
    cow_obj = cow_result.scalar_one_or_none()

    if cow_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Cow '{cow_id}' was not found in "
                "your active registered herd."
            ),
        )

    # -----------------------------------------------------------------------
    # 2. Find latest prediction for this user + cow
    # -----------------------------------------------------------------------

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
            detail=(
                f"No previous prediction found for cow '{cow_id}'."
            ),
        )

    # -----------------------------------------------------------------------
    # 3. Get original request data stored by the pipeline
    # -----------------------------------------------------------------------

    raw = record.raw_response or {}

    stored_input = (
        raw.get("input")
        if isinstance(raw, dict)
        else None
    )

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

    # -----------------------------------------------------------------------
    # 4. Validate the stored request
    # -----------------------------------------------------------------------

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

    # -----------------------------------------------------------------------
    # 5. Run the exact same prediction pipeline
    # -----------------------------------------------------------------------

    return await create_prediction(
        db=db,
        current_user=current_user,
        request_in=request_in,
    )