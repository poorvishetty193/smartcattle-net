"""
SmartCattle Net
schemas/alerts.py

Response schemas for the alerts API.
"""

from pydantic import BaseModel


class AlertItem(BaseModel):
    cow_id: str
    alert_type: str
    message: str
    severity: str


class AlertResponse(BaseModel):
    alerts: list[AlertItem]