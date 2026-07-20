"""
SmartCattle Net
schemas/PredictionResponse.py

Purpose
-------
Backward-compatibility re-export shim.

The canonical schema definition lives in
``app.schemas.schemas.prediction``.  This module re-exports
``PredictionResponse`` from that location so any existing import path
(``from app.schemas.PredictionResponse import PredictionResponse``) keeps
working without modification.

Usage
-----
::

    from app.schemas.PredictionResponse import PredictionResponse
"""

from app.schemas.schemas.prediction import PredictionResponse  # noqa: F401

__all__ = ["PredictionResponse"]
