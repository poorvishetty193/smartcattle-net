"""
SmartCattle Net
api/routers/dashboard.py

Purpose
-------
Dashboard API endpoints.
"""

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.dashboard import (
    OverviewResponse,
    StatisticsResponse,
    HeatmapResponse,
    FarmDecisionResponse,
    PriorityRankingResponse,
    HealthRiskResponse,
    MilkYieldTrendResponse,
    AlertResponse,
)

from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
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
    "/farm-decisions",
    response_model=FarmDecisionResponse,
)
async def get_farm_decisions(
    db: SessionDep,
    current_user: CurrentUser,
):
    return await DashboardService.get_farm_decisions(
        db=db,
        current_user=current_user,
    )


@router.get(
    "/priority-ranking",
    response_model=PriorityRankingResponse,
)
async def get_priority_ranking(
    db: SessionDep,
    current_user: CurrentUser,
):
    return await DashboardService.get_priority_ranking(
        db=db,
        current_user=current_user,
    )
@router.get(
    "/health-risk",
    response_model=HealthRiskResponse,
)
async def get_health_risk(
    db: SessionDep,
    current_user: CurrentUser,
):
    return await DashboardService.get_health_risk_summary(
        db=db,
        current_user=current_user,
    )    
@router.get(
    "/milk-yield-trend",
    response_model=MilkYieldTrendResponse,
)
async def get_milk_yield_trend(
    db: SessionDep,
    current_user: CurrentUser,
):
    return await DashboardService.get_milk_yield_trend(
        db=db,
        current_user=current_user,
    )    
    
@router.get(
    "/alerts",
    response_model=AlertResponse,
)
async def get_alerts(
    db: SessionDep,
    current_user: CurrentUser,
):
    return await DashboardService.get_alerts(
        db=db,
        current_user=current_user,
    )    