"""
SmartCattle Net
main.py

Purpose
-------
The main FastAPI application entrypoint.

Handles application lifespan (loading ML models on startup), configures 
CORS middleware, and mounts the aggregated API router.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.core.config import settings
from app.services.loaders.model_loader import model_loader
from app.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.
    
    Startup:
      - Trigger the ModelLoader to preload all ML artifacts (.pkl/.keras)
        from disk into memory so that the first inference request is fast.
    
    Shutdown:
      - Perform any necessary cleanup.
    """
    logger.info("Starting up SmartCattle Net API...")
    
    try:
        # Pre-load all ML models into memory
        model_loader.load_all()
        logger.info("All ML models successfully loaded into memory.")
    except Exception as exc:
        logger.error("Critical failure during model loading: %s", exc)
        # We allow the app to start even if some models fail, but log heavily.
        # The individual stage services will raise RuntimeErrors when called.
        
    yield
    
    logger.info("Shutting down SmartCattle Net API...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SmartCattle Net CCP-Chain Inference API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount the consolidated API router
app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    # Local dev entrypoint
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)