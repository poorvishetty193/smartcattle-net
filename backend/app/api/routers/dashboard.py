"""
SmartCattle Net
api/routers/dashboard.py

Purpose
-------
Dashboard API endpoints.
"""
from app.schemas.dashboard import HeatmapResponse
from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.dashboard import (
    OverviewResponse,
    StatisticsResponse,
)
from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)
@router.get(
    "/heatmap",
    response_model=HeatmapResponse,
    summary="Herd Productivity Heatmap",
)
async def get_heatmap(
    db: SessionDep,
    current_user: CurrentUser,
):
    return await DashboardService.get_productivity_heatmap(
        db=db,
        current_user=current_user,
    )

@router.get(
    "/overview",
    response_model=OverviewResponse,
    summary="Get Dashboard Overview",
)
async def get_dashboard_overview():
    """
    Returns dashboard overview information.
    """
    return DashboardService.get_dashboard_overview()


@router.get(
    "/statistics",
    response_model=StatisticsResponse,
    summary="Get Dashboard Statistics",
)
async def get_dashboard_statistics(
    db: SessionDep,
    current_user: CurrentUser,
):
    """
    Returns dashboard statistics.
    """
    return await DashboardService.get_dashboard_statistics(
        db=db,
        current_user=current_user,
    )