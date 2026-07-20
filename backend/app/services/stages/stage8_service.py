"""
SmartCattle Net
services/stages/stage8_service.py

Purpose
-------
Stage 8 of the CCP-Chain: Heat Stress Prediction.

Algorithm : Gradient Boosting Classifier
Model file: ai/models/stage8/model_s8_gb_stress.pkl
Threshold : ai/models/stage8/model_s8_threshold.pkl

Input features (notebook cell 34, S8_FEATURES, in order)
----------------------------------------------------------
FEATURE_COLS (15 base features) + [
    's1_daily_yield_pred',    # Stage 1 output
    's2_drop_probability',    # Stage 2 output
    's4_msi',                 # Stage 4 output
    's5_milk_quantity',       # Stage 5 output
    's6_trend_slope',         # Stage 6 output
    's7_productivity_score'   # Stage 7 output
]
Total: 21 features

Outputs
-------
- s8_stress_probability : float  — probability of heat stress (0–1)
- s8_stress_flag        : int    — 1 if prob >= optimised threshold, else 0

Chain dependencies
------------------
Requires outputs from Stages 1, 2, 4, 5, 6, 7.

Dependencies
------------
- app.services.loaders.model_loader
- app.utils.helpers (safe_float, BASE_FEATURE_COLS)
- app.utils.logger
- numpy
"""

from __future__ import annotations

from typing import Dict, List, Union

import numpy as np

from app.services.loaders.model_loader import model_loader
from app.utils.helpers import BASE_FEATURE_COLS, safe_float
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Stage 8 feature list — mirrors notebook cell 34 exactly
# ---------------------------------------------------------------------------

S8_FEATURES: List[str] = BASE_FEATURE_COLS + [
    "s1_daily_yield_pred",
    "s2_drop_probability",
    "s4_msi",
    "s5_milk_quantity",
    "s6_trend_slope",
    "s7_productivity_score",
]

_N_FEATURES: int = len(S8_FEATURES)  # 21


class Stage8Service:
    """
    Stage 8: Heat Stress Prediction using Gradient Boosting.

    Predicts whether a cow is experiencing physiological heat stress 
    based on environmental factors (THI) combined with milk production 
    metrics.
    """

    def __init__(self) -> None:
        self.model = model_loader.get("stage8")
        self.threshold: float = self._load_threshold()
        logger.info(
            "Stage8Service initialised — threshold=%.4f", self.threshold
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _load_threshold(self) -> float:
        """
        Load the optimised classification threshold from disk.
        Falls back to 0.5 if not found.
        """
        raw = model_loader.get("stage8_threshold")
        if raw is None:
            logger.warning(
                "stage8_threshold not found in model_loader — using default 0.5"
            )
            return 0.5
        return float(raw)

    def _build_feature_vector(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
        s2_drop_probability: float,
        s4_msi: float,
        s5_milk_quantity: float,
        s6_trend_slope: float,
        s7_productivity_score: float,
    ) -> np.ndarray:
        """
        Assemble the 21-feature input vector for the GB model.
        """
        row: List[float] = [
            safe_float(features.get(col), default=0.0)
            for col in BASE_FEATURE_COLS
        ]
        row.append(safe_float(s1_daily_yield_pred))
        row.append(safe_float(s2_drop_probability))
        row.append(safe_float(s4_msi))
        row.append(safe_float(s5_milk_quantity))
        row.append(safe_float(s6_trend_slope))
        row.append(safe_float(s7_productivity_score))

        return np.array(row, dtype=np.float32).reshape(1, -1)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
        s2_drop_probability: float,
        s4_msi: float,
        s5_milk_quantity: float,
        s6_trend_slope: float,
        s7_productivity_score: float,
    ) -> Dict[str, Union[float, int]]:
        """
        Run Stage 8 inference and return heat stress probability and flag.

        Returns
        -------
        dict with keys:
            - s8_stress_probability : float (0-1)
            - s8_stress_flag : int (0 or 1)
        """
        if self.model is None:
            raise RuntimeError(
                "Stage 8 model (Gradient Boosting) is not loaded. "
                "Check ai/models/stage8/model_s8_gb_stress.pkl."
            )

        X = self._build_feature_vector(
            features,
            s1_daily_yield_pred,
            s2_drop_probability,
            s4_msi,
            s5_milk_quantity,
            s6_trend_slope,
            s7_productivity_score,
        )

        proba: float = float(self.model.predict_proba(X)[0, 1])
        flag: int = 1 if proba >= self.threshold else 0

        logger.debug(
            "Stage8 — stress_probability=%.4f stress_flag=%d threshold=%.4f",
            proba, flag, self.threshold,
        )

        return {
            "s8_stress_probability": proba,
            "s8_stress_flag": flag,
        }


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

stage8_service = Stage8Service()
