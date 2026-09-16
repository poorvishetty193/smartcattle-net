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

from app.api.routers import (
    auth,
    cows,
    predictions,
    system,
    dashboard,
    reports,
    alerts,
    settings,
    chatbot,
)

api_router = APIRouter()

# Dashboard
api_router.include_router(dashboard.router)

# Reports
api_router.include_router(reports.router)

# Authentication
api_router.include_router(auth.router)

# Cows
api_router.include_router(cows.router)

# Predictions
api_router.include_router(predictions.router)

# Alerts
api_router.include_router(alerts.router)

# Settings
api_router.include_router(settings.router)
# Chat
api_router.include_router(chatbot.router)
# System
api_router.include_router(system.router)