"""
SmartCattle Net
main.py

Purpose
-------
Main FastAPI application entrypoint.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.core.config import settings
from app.database.base import Base
from app.database.models import User, Cow, PredictionRecord
from app.database.session import engine
from app.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Startup and shutdown events.
    """

    logger.info("Starting SmartCattle Net API...")

    # Create all database tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Database tables created successfully.")
    logger.info("SmartCattle services initialized successfully.")

    yield

    logger.info("Shutting down SmartCattle Net API...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    description="SmartCattle Net CCP-Chain Inference API",
    lifespan=lifespan,
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )