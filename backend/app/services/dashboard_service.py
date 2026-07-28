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
    FarmDecisionItem,
    FarmDecisionResponse,
    PriorityRankingItem,
    PriorityRankingResponse,
    HealthRiskItem,
HealthRiskResponse,
MilkYieldTrendItem,
MilkYieldTrendResponse,
AlertItem,
AlertResponse,
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

    @staticmethod
    async def get_farm_decisions(
        db,
        current_user,
    ) -> FarmDecisionResponse:
        """
        Returns today's farm recommendations.
        """

        stmt = (
    select(
        PredictionRecord.cow_label,
        PredictionRecord.stage9_decision,
    )
    .where(
        PredictionRecord.user_id == current_user.id,
        PredictionRecord.cow_label != "string",
    )
    .distinct(PredictionRecord.cow_label)
    .order_by(
        PredictionRecord.cow_label,
        PredictionRecord.created_at.desc(),
    )
)

        result = await db.execute(stmt)

        rows = result.all()

        decisions = [
            FarmDecisionItem(
                cow_id=row.cow_label,
                recommendation=row.stage9_decision or "No recommendation available",
            )
            for row in rows
        ]

        return FarmDecisionResponse(
            decisions=decisions
        )
    @staticmethod
    async def get_priority_ranking(
        db,
        current_user,
    ) -> PriorityRankingResponse:
        """
        Returns priority ranking for all cows.
        """

        stmt = (
            select(
                PredictionRecord.cow_label,
                PredictionRecord.stage10_priority_score,
                PredictionRecord.stage10_priority_rank,
            )
            .where(
                PredictionRecord.user_id == current_user.id,
                PredictionRecord.cow_label != "string",
            )
            .distinct(PredictionRecord.cow_label)
            .order_by(
                PredictionRecord.cow_label,
                PredictionRecord.created_at.desc(),
            )
        )

        result = await db.execute(stmt)

        rows = result.all()

        rankings = [
            PriorityRankingItem(
                cow_id=row.cow_label,
                priority_score=round(
                    float(row.stage10_priority_score or 0),
                    2,
                ),
                priority_rank=row.stage10_priority_rank or 0,
            )
            for row in rows
        ]

        rankings.sort(key=lambda x: x.priority_rank)

        return PriorityRankingResponse(
            rankings=rankings
        )
    @staticmethod
    async def get_health_risk_summary(
        db,
        current_user,
    ) -> HealthRiskResponse:
        """
        Returns health and risk summary for all cows.
        """

        stmt = (
            select(
                PredictionRecord.cow_label,
                PredictionRecord.stage11_health_score,
                PredictionRecord.stage12_risk_score,
                PredictionRecord.stage12_risk_level,
                PredictionRecord.stage12_risk_flag,
            )
            .where(
                PredictionRecord.user_id == current_user.id,
                PredictionRecord.cow_label != "string",
            )
            .distinct(PredictionRecord.cow_label)
            .order_by(
                PredictionRecord.cow_label,
                PredictionRecord.created_at.desc(),
            )
        )

        result = await db.execute(stmt)

        rows = result.all()

        cows = [
            HealthRiskItem(
                cow_id=row.cow_label,
                health_score=round(
                    float(row.stage11_health_score or 0),
                    2,
                ),
                risk_score=round(
                    float(row.stage12_risk_score or 0),
                    2,
                ),
                risk_level=row.stage12_risk_level or "Unknown",
                risk_flag=row.stage12_risk_flag or 0,
            )
            for row in rows
        ]

        return HealthRiskResponse(
            cows=cows
        )
    @staticmethod
    async def get_milk_yield_trend(
        db,
        current_user,
    ) -> MilkYieldTrendResponse:
        """
        Returns the latest milk yield prediction for each cow.
        """

        stmt = (
            select(
                PredictionRecord.cow_label,
                PredictionRecord.stage1_daily_yield,
            )
            .where(
                PredictionRecord.user_id == current_user.id,
                PredictionRecord.cow_label != "string",
            )
            .distinct(PredictionRecord.cow_label)
            .order_by(
                PredictionRecord.cow_label,
                PredictionRecord.created_at.desc(),
            )
        )

        result = await db.execute(stmt)

        rows = result.all()

        trends = [
            MilkYieldTrendItem(
                cow_id=row.cow_label,
                daily_yield=round(
                    float(row.stage1_daily_yield or 0),
                    2,
                ),
            )
            for row in rows
        ]

        return MilkYieldTrendResponse(
            trends=trends
        )
    @staticmethod
    async def get_alerts(
        db,
        current_user,
    ) -> AlertResponse:
        """
        Returns dashboard alerts.
        """

        stmt = (
            select(
                PredictionRecord.cow_label,
                PredictionRecord.stage8_stress_flag,
                PredictionRecord.stage11_health_score,
                PredictionRecord.stage12_risk_flag,
                PredictionRecord.stage12_risk_level,
            )
            .where(
                PredictionRecord.user_id == current_user.id,
                PredictionRecord.cow_label != "string",
            )
            .distinct(PredictionRecord.cow_label)
            .order_by(
                PredictionRecord.cow_label,
                PredictionRecord.created_at.desc(),
            )
        )

        result = await db.execute(stmt)
        rows = result.all()

        alerts = []

        for row in rows:

            if row.stage8_stress_flag == 1:
                alerts.append(
                    AlertItem(
                        cow_id=row.cow_label,
                        alert_type="Stress",
                        message="High stress probability detected",
                        severity="High",
                    )
                )

            if (row.stage11_health_score or 0) < 70:
                alerts.append(
                    AlertItem(
                        cow_id=row.cow_label,
                        alert_type="Health",
                        message="Health score below safe threshold",
                        severity="Medium",
                    )
                )

            if row.stage12_risk_flag == 1:
                alerts.append(
                    AlertItem(
                        cow_id=row.cow_label,
                        alert_type="Risk",
                        message=f"Risk level: {row.stage12_risk_level}",
                        severity="High",
                    )
                )

        return AlertResponse(
            alerts=alerts
        )        