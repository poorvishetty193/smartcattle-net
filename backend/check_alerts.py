import asyncio
from sqlalchemy import select
from app.database.session import AsyncSessionLocal
from app.database.models import PredictionRecord

async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(
                PredictionRecord.cow_label,
                PredictionRecord.stage8_stress_prob,
                PredictionRecord.stage8_stress_flag,
                PredictionRecord.stage11_health_score,
                PredictionRecord.stage12_risk_score,
                PredictionRecord.stage12_risk_flag,
                PredictionRecord.stage12_risk_level,
                PredictionRecord.created_at,
            )
            .order_by(PredictionRecord.created_at.desc())
            .limit(10)
        )

        for row in result.all():
            print(row)

asyncio.run(main())
