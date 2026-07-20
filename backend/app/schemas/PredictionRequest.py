"""
SmartCattle Net
schemas/PredictionRequest.py

Purpose
-------
Backward-compatibility re-export shim.

The canonical schema definition lives in
``app.schemas.schemas.prediction``.  This module re-exports
``PredictionRequest`` from that location so any existing import path
(``from app.schemas.PredictionRequest import PredictionRequest``) keeps
working without modification.

Usage
-----
::

    from app.schemas.PredictionRequest import PredictionRequest
"""

from app.schemas.schemas.prediction import PredictionRequest  # noqa: F401

__all__ = ["PredictionRequest"]
