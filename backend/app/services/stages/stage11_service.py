"""
SmartCattle Net
services/stages/stage11_service.py

Purpose
-------
Stage 11 of the CCP-Chain: Health Score Prediction.

Algorithm : Stacking Ensemble (RF, XGBoost, GB + Ridge meta-learner)
Model file: ai/models/stage11/model_s11_stacking_health.pkl

Input features (notebook cell 40, S11_BASE, in order)
-------------------------------------------------------
  - s2_drop_probability    (Stage 2)
  - s4_msi                 (Stage 4)
  - s7_productivity_score  (Stage 7)
  - s8_stress_probability  (Stage 8)
  - log_scc                (Base feature)
  - s6_trend_slope         (Stage 6)

Total: 6 features

Outputs
-------
- s11_health_score : float  — predicted health score (0–100)
  Higher score = better health.

Chain dependencies
------------------
Requires outputs from Stages 2, 4, 6, 7, 8, and base feature log_scc.

Dependencies
------------
- app.services.loaders.model_loader
- app.utils.helpers (safe_float, clamp)
- app.utils.logger
- numpy
"""

from __future__ import annotations

from typing import Dict, List, Union

import numpy as np

from app.services.loaders.model_loader import model_loader
from app.utils.helpers import clamp, safe_float
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Stage 11 feature list — mirrors notebook cell 40 exactly
# ---------------------------------------------------------------------------

S11_FEATURES: List[str] = [
    "s2_drop_probability",
    "s4_msi",
    "s7_productivity_score",
    "s8_stress_probability",
    "log_scc",
    "s6_trend_slope",
]

_N_FEATURES: int = len(S11_FEATURES)  # 6


class Stage11Service:
    """
    Stage 11: Health Score Prediction using a Stacking Ensemble.

    A meta-learner (Ridge) combines predictions from Random Forest, 
    XGBoost, and Gradient Boosting models to predict a unified health 
    score from 0 to 100 based on upstream metrics.
    """

    def __init__(self) -> None:
        self.model = model_loader.get("stage11")
        logger.info("Stage11Service initialised — Health Score prediction ready.")

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_feature_vector(
        self,
        features: Dict[str, Union[int, float, None]],
        s2_drop_probability: float,
        s4_msi: float,
        s6_trend_slope: float,
        s7_productivity_score: float,
        s8_stress_probability: float,
    ) -> np.ndarray:
        """
        Assemble the 6-feature input vector for the Stacking model.
        Order must match S11_FEATURES exactly.
        """
        row: List[float] = [
            safe_float(s2_drop_probability),
            safe_float(s4_msi),
            safe_float(s7_productivity_score),
            safe_float(s8_stress_probability),
            safe_float(features.get("log_scc"), default=0.0),
            safe_float(s6_trend_slope),
        ]

        return np.array(row, dtype=np.float32).reshape(1, -1)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(
        self,
        features: Dict[str, Union[int, float, None]],
        s2_drop_probability: float,
        s4_msi: float,
        s6_trend_slope: float,
        s7_productivity_score: float,
        s8_stress_probability: float,
    ) -> float:
        """
        Run Stage 11 inference and return the predicted health score.

        Parameters
        ----------
        features : dict
            Dictionary containing the base features, specifically 'log_scc'.
        s2_drop_probability : float
            Stage 2 drop probability (0–1).
        s4_msi : float
            Stage 4 Milk Stability Index (0–100).
        s6_trend_slope : float
            Stage 6 trend slope.
        s7_productivity_score : float
            Stage 7 productivity score (0–100).
        s8_stress_probability : float
            Stage 8 heat stress probability (0–1).

        Returns
        -------
        float
            Health score in range [0, 100]. Higher = healthier.
        """
        if self.model is None:
            raise RuntimeError(
                "Stage 11 model (Stacking Ensemble) is not loaded. "
                "Check ai/models/stage11/model_s11_stacking_health.pkl."
            )

        X = self._build_feature_vector(
            features,
            s2_drop_probability,
            s4_msi,
            s6_trend_slope,
            s7_productivity_score,
            s8_stress_probability,
        )

        raw_score: float = float(self.model.predict(X)[0])
        score: float = clamp(raw_score, lo=0.0, hi=100.0)

        logger.debug(
            "Stage11 — health_score=%.4f (raw=%.4f)",
            score, raw_score
        )

        return score


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

stage11_service = Stage11Service()
