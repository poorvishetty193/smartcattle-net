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

    # ---------------------------------------------------------
    # OVERVIEW
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # STATISTICS
    # ---------------------------------------------------------
        
    @staticmethod
    async def get_dashboard_statistics(
        db,
        current_user,
    ) -> StatisticsResponse:
        """
        Returns dashboard statistics using only
        the latest prediction for each cow.
        """

        latest_predictions = (
            select(
                PredictionRecord.id,
                PredictionRecord.cow_label,
                PredictionRecord.stage1_daily_yield,
                PredictionRecord.stage11_health_score,
                PredictionRecord.stage12_risk_level,
                PredictionRecord.stage8_stress_flag,
                func.row_number()
                .over(
                    partition_by=PredictionRecord.cow_label,
                    order_by=PredictionRecord.created_at.desc(),
                )
                .label("row_num"),
            )
            .where(
                PredictionRecord.user_id == current_user.id,
                PredictionRecord.cow_label != "string",
                PredictionRecord.cow_label != "UNKNOWN",
            )
            .subquery()
        )

        stmt = select(
            func.avg(
                latest_predictions.c.stage1_daily_yield
            ),
            func.avg(
                latest_predictions.c.stage11_health_score
            ),
            func.count().filter(
                func.lower(
                    latest_predictions.c.stage12_risk_level
                ).in_(["high", "critical"])
            ),
            func.count().filter(
                latest_predictions.c.stage8_stress_flag == 1
            ),
        ).where(
            latest_predictions.c.row_num == 1
        )

        result = await db.execute(stmt)

        (
            avg_daily_yield,
            avg_health_score,
            at_risk_cows,
            stress_alerts,
        ) = result.one()

        return StatisticsResponse(
            avg_daily_yield=round(
                float(avg_daily_yield or 0),
                2,
            ),
            at_risk_cows=at_risk_cows or 0,
            avg_health_score=round(
                float(avg_health_score or 0),
                2,
            ),
            stress_alerts=stress_alerts or 0,
        )
    # ---------------------------------------------------------
    # PRODUCTIVITY HEATMAP
    # ---------------------------------------------------------

    @staticmethod
    async def get_productivity_heatmap(
        db,
        current_user,
    ) -> HeatmapResponse:
        """
        Returns the latest productivity score for each cow.
        """

        stmt = (
            select(
                PredictionRecord.cow_label,
                PredictionRecord.stage7_productivity,
            )
            .where(
                PredictionRecord.user_id == current_user.id,
                PredictionRecord.cow_label != "string",
                PredictionRecord.cow_label != "UNKNOWN",
            )
            .order_by(
                PredictionRecord.cow_label,
                PredictionRecord.created_at.desc(),
            )
            .distinct(PredictionRecord.cow_label)
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

    # ---------------------------------------------------------
    # FARM DECISIONS
    # ---------------------------------------------------------

    @staticmethod
    async def get_farm_decisions(
        db,
        current_user,
    ) -> FarmDecisionResponse:
        """
        Returns the latest farm recommendation for each cow.
        """

        stmt = (
            select(
                PredictionRecord.cow_label,
                PredictionRecord.stage9_decision,
            )
            .where(
                PredictionRecord.user_id == current_user.id,
                PredictionRecord.cow_label != "string",
                PredictionRecord.cow_label != "UNKNOWN",
            )
            .order_by(
                PredictionRecord.cow_label,
                PredictionRecord.created_at.desc(),
            )
            .distinct(PredictionRecord.cow_label)
        )

        result = await db.execute(stmt)

        rows = result.all()

        decisions = [
            FarmDecisionItem(
                cow_id=row.cow_label,
                recommendation=(
                    row.stage9_decision
                    or "No recommendation available"
                ),
            )
            for row in rows
        ]

        return FarmDecisionResponse(
            decisions=decisions
        )

    # ---------------------------------------------------------
    # PRIORITY RANKING
    # ---------------------------------------------------------
        # ---------------------------------------------------------
    # PRIORITY RANKING
    # ---------------------------------------------------------

    @staticmethod
    async def get_priority_ranking(
        db,
        current_user,
    ) -> PriorityRankingResponse:
        """
        Returns priority ranking for all cows.

        Highest priority score gets rank #1.
        """

        stmt = (
            select(
                PredictionRecord.cow_label,
                PredictionRecord.stage10_priority_score,
                PredictionRecord.created_at,
            )
            .where(
                PredictionRecord.user_id == current_user.id,
                PredictionRecord.cow_label != "string",
                PredictionRecord.cow_label != "UNKNOWN",
            )
            .order_by(
                PredictionRecord.cow_label,
                PredictionRecord.created_at.desc(),
            )
        )

        result = await db.execute(stmt)
        rows = result.all()

        # Keep only the latest prediction for each cow
        latest_by_cow = {}

        for row in rows:
            if row.cow_label not in latest_by_cow:
                latest_by_cow[row.cow_label] = row

        # Sort cows by priority score: highest first
        sorted_rows = sorted(
            latest_by_cow.values(),
            key=lambda row: float(
                row.stage10_priority_score or 0
            ),
            reverse=True,
        )

        rankings = []

        for rank, row in enumerate(sorted_rows, start=1):
            rankings.append(
                PriorityRankingItem(
                    cow_id=row.cow_label,
                    priority_score=round(
                        float(row.stage10_priority_score or 0),
                        2,
                    ),
                    priority_rank=rank,
                )
            )

        return PriorityRankingResponse(
            rankings=rankings
        )
    
    # ---------------------------------------------------------
    # HEALTH + RISK
    # ---------------------------------------------------------

    @staticmethod
    async def get_health_risk_summary(
        db,
        current_user,
    ) -> HealthRiskResponse:
        """
        Returns health and risk summary for each cow.
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
                PredictionRecord.cow_label != "UNKNOWN",
            )
            .order_by(
                PredictionRecord.cow_label,
                PredictionRecord.created_at.desc(),
            )
            .distinct(PredictionRecord.cow_label)
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
                risk_level=(
                    row.stage12_risk_level
                    or "Unknown"
                ),
                risk_flag=row.stage12_risk_flag or 0,
            )
            for row in rows
        ]

        return HealthRiskResponse(
            cows=cows
        )

    # ---------------------------------------------------------
    # MILK YIELD TREND
    # ---------------------------------------------------------

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
                PredictionRecord.cow_label != "UNKNOWN",
            )
            .order_by(
                PredictionRecord.cow_label,
                PredictionRecord.created_at.desc(),
            )
            .distinct(PredictionRecord.cow_label)
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

    # ---------------------------------------------------------
    # ALERTS
    # ---------------------------------------------------------

    @staticmethod
    async def get_alerts(
        db,
        current_user,
    ) -> AlertResponse:
        """
        Returns alerts based on the latest prediction
        for each cow.
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
                PredictionRecord.cow_label != "UNKNOWN",
            )
            .order_by(
                PredictionRecord.cow_label,
                PredictionRecord.created_at.desc(),
            )
            .distinct(PredictionRecord.cow_label)
        )

        result = await db.execute(stmt)

        rows = result.all()

        alerts = []

        for row in rows:

            # Stress alert
            if row.stage8_stress_flag == 1:
                alerts.append(
                    AlertItem(
                        cow_id=row.cow_label,
                        alert_type="Stress",
                        message="High stress probability detected",
                        severity="High",
                    )
                )

            # Health alert
            if (row.stage11_health_score or 0) < 70:
                alerts.append(
                    AlertItem(
                        cow_id=row.cow_label,
                        alert_type="Health",
                        message="Health score below safe threshold",
                        severity="Medium",
                    )
                )

            # Risk alert
            if row.stage12_risk_flag == 1:
                alerts.append(
                    AlertItem(
                        cow_id=row.cow_label,
                        alert_type="Risk",
                        message=(
                            f"Risk level: "
                            f"{row.stage12_risk_level}"
                        ),
                        severity="High",
                    )
                )

        return AlertResponse(
            alerts=alerts
        )