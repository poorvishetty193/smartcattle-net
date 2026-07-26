"""
SmartCattle Net
services/dashboard_service.py

Purpose
-------
Business logic for Dashboard APIs.
"""

from datetime import datetime

from sqlalchemy import func, select

from app.database.models import PredictionRecord
from app.schemas.dashboard import (
    OverviewResponse,
    StatisticsResponse,
    HeatmapItem,
    HeatmapResponse,
)


class DashboardService:
    """
    Dashboard business logic.
    """

    @staticmethod
    def get_dashboard_overview() -> OverviewResponse:
        """
        Returns overview information for dashboard.
        """

        return OverviewResponse(
            farm_name="Satola Farm",
            welcome_message="Welcome to SmartCattleNet Dashboard",
            last_sync=datetime.now(),
            thi=68.0,
            status="Live",
        )

    @staticmethod
    async def get_dashboard_statistics(
        db,
        current_user,
    ) -> StatisticsResponse:
        """
        Returns dashboard statistics for the current user.
        """

        stmt = (
            select(
                func.avg(PredictionRecord.stage1_daily_yield),
                func.avg(PredictionRecord.stage11_health_score),
                func.count().filter(
                    PredictionRecord.stage12_risk_level == "high"
                ),
                func.count().filter(
                    PredictionRecord.stage8_stress_flag == 1
                ),
            )
            .where(PredictionRecord.user_id == current_user.id)
        )

        result = await db.execute(stmt)

        (
            avg_daily_yield,
            avg_health_score,
            at_risk_cows,
            stress_alerts,
        ) = result.one()

        return StatisticsResponse(
            avg_daily_yield=round(float(avg_daily_yield or 0), 2),
            at_risk_cows=at_risk_cows or 0,
            avg_health_score=round(float(avg_health_score or 0), 2),
            stress_alerts=stress_alerts or 0,
        )

    @staticmethod
    async def get_productivity_heatmap(
        db,
        current_user,
    ) -> HeatmapResponse:
        """
        Returns productivity scores of all cows.
        """

        stmt = (
            select(
                PredictionRecord.cow_label,
               PredictionRecord.stage7_productivity,
            )
            .where(PredictionRecord.user_id == current_user.id)
            .order_by(PredictionRecord.cow_label)
        )

        result = await db.execute(stmt)

        rows = result.all()

        heatmap = [
            HeatmapItem(
                cow_id=row.cow_label,
                productivity_score=round(
    float(row.stage7_productivity or 0),
    2,
),
            )
            for row in rows
        ]

        return HeatmapResponse(
            heatmap=heatmap
        )