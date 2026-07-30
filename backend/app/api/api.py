"""
SmartCattle Net
api/api.py

Purpose
-------
API Router Aggregator.

Bundles all individual domain routers into a single `api_router` 
that the main FastAPI application can mount.
"""

from fastapi import APIRouter

from app.api.routers import auth, cows, predictions, system, dashboard, herd

api_router = APIRouter()
api_router.include_router(dashboard.router)

# Attach individual routers
api_router.include_router(herd.router)
api_router.include_router(auth.router)
api_router.include_router(cows.router)
api_router.include_router(predictions.router)
api_router.include_router(system.router)
