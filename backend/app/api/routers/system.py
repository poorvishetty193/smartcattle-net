"""
SmartCattle Net
api/routers/system.py

Purpose
-------
System and infrastructure router.

Provides endpoints for infrastructure health checks, monitoring, 
and inspecting the internal state of the ModelLoader.

Endpoints
---------
- GET /system/health : Standard ping/health check
- GET /system/models : Return the list of loaded ML models/artifacts
"""

from typing import Any, Dict, List

from fastapi import APIRouter

from app.core.config import settings
from app.services.loaders.model_loader import model_loader
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/health", response_model=Dict[str, str])
async def health_check() -> Any:
    """
    Standard health check endpoint for load balancers.
    """
    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


@router.get("/models", response_model=Dict[str, List[str]])
async def list_loaded_models() -> Any:
    """
    Inspect the internal ModelLoader registry to verify which ML models 
    are currently resident in memory.
    """
    loaded_keys = list(model_loader.registry.keys())
    return {
        "loaded_models": loaded_keys
    }
