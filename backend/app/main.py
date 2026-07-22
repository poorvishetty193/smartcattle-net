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
from app.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Startup and shutdown events.
    """

    logger.info("Starting SmartCattle Net API...")

    # Models are automatically loaded when model_loader is imported
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
    allow_origins=["*"],  # Change this in production
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