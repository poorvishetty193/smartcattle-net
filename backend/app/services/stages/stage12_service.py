"""
SmartCattle Net
services/stages/stage12_service.py

Purpose
-------
Stage 12 of the CCP-Chain: Early Risk Detection.

Algorithm : Isolation Forest (Anomaly Detection)
Model file: ai/models/stage12/model_s12_isolation_forest_risk.pkl

Input features (notebook cell 42, S12_FEATURES, in order)
-----------------------------------------------------------
S11_BASE (6 features) + [
    's1_daily_yield_pred',
    's5_milk_quantity'
]

Total: 8 features

Outputs
-------
- s12_anomaly_score : float  — raw Isolation Forest score (more negative = anomalous)
- s12_risk_score    : float  — normalised risk (0–100)
- s12_risk_flag     : int    — 1 if anomaly detected, else 0
- s12_risk_level    : str    — "low", "medium", or "high"

Normalisation Note
------------------
The raw score is mapped to a 0–100 scale using the minimum and maximum 
scores observed during training. These bounds should be in ``model_config.json``
as ``s12_score_min`` and ``s12_score_max``.

Chain dependencies
------------------
Requires outputs from Stages 1, 2, 4, 5, 6, 7, 8, and base feature log_scc.

Dependencies
------------
- app.services.loaders.model_loader
- app.utils.helpers (safe_float, normalise_anomaly_score, risk_label)
- app.utils.logger
- numpy
"""

from __future__ import annotations

from typing import Dict, List, Optional, Union

import numpy as np

from app.services.loaders.model_loader import model_loader
from app.utils.helpers import normalise_anomaly_score, risk_label, safe_float
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Stage 12 feature list — mirrors notebook cell 42 exactly
# S11_BASE (6) + s1 + s5 = 8 features
# ---------------------------------------------------------------------------

S12_FEATURES: List[str] = [
    "s2_drop_probability",
    "s4_msi",
    "s7_productivity_score",
    "s8_stress_probability",
    "log_scc",
    "s6_trend_slope",
    "s1_daily_yield_pred",
    "s5_milk_quantity",
]

_N_FEATURES: int = len(S12_FEATURES)  # 8


class Stage12Service:
    """
    Stage 12: Early Risk Detection using Isolation Forest.

    Identifies anomalous cow states that deviate from normal herd behavior.
    """

    def __init__(self) -> None:
        self.model = model_loader.get("stage12")
        config: Optional[dict] = model_loader.get("config")
        self.score_min, self.score_max = self._load_score_bounds(config)
        
        logger.info(
            "Stage12Service initialised — Isolation Forest ready "
            "(min=%.4f, max=%.4f)", self.score_min, self.score_max
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _load_score_bounds(config: Optional[dict]) -> tuple[float, float]:
        """
        Extract Isolation Forest score bounds from model_config.json.
        Defaults to arbitrary reasonable bounds if missing.
        """
        if config is None:
            return -1.0, 0.0

        raw_min = config.get("s12_score_min", -1.0)
        raw_max = config.get("s12_score_max", 0.0)

        return float(raw_min), float(raw_max)

    def _build_feature_vector(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
        s2_drop_probability: float,
        s4_msi: float,
        s5_milk_quantity: float,
        s6_trend_slope: float,
        s7_productivity_score: float,
        s8_stress_probability: float,
    ) -> np.ndarray:
        """
        Assemble the 8-feature input vector for the Isolation Forest model.
        Order must match S12_FEATURES exactly.
        """
        row: List[float] = [
            safe_float(s2_drop_probability),
            safe_float(s4_msi),
            safe_float(s7_productivity_score),
            safe_float(s8_stress_probability),
            safe_float(features.get("log_scc"), default=0.0),
            safe_float(s6_trend_slope),
            safe_float(s1_daily_yield_pred),
            safe_float(s5_milk_quantity),
        ]

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
        s8_stress_probability: float,
    ) -> Dict[str, Union[float, int, str]]:
        """
        Run Stage 12 inference and return anomaly risk metrics.

        Returns
        -------
        dict with keys:
            - s12_anomaly_score : float (raw score)
            - s12_risk_score    : float (0-100)
            - s12_risk_flag     : int (0 or 1)
            - s12_risk_level    : str ('low', 'medium', 'high')
        """
        if self.model is None:
            raise RuntimeError(
                "Stage 12 model (Isolation Forest) is not loaded. "
                "Check ai/models/stage12/model_s12_isolation_forest_risk.pkl."
            )

        X = self._build_feature_vector(
            features,
            s1_daily_yield_pred,
            s2_drop_probability,
            s4_msi,
            s5_milk_quantity,
            s6_trend_slope,
            s7_productivity_score,
            s8_stress_probability,
        )

        # Isolation Forest specific methods:
        # score_samples() returns anomaly score of input samples
        raw_score: float = float(self.model.score_samples(X)[0])
        
        # predict() returns -1 for outliers and 1 for inliers
        prediction: int = int(self.model.predict(X)[0])
        flag: int = 1 if prediction == -1 else 0

        # Normalise to 0-100 risk score
        risk_score = normalise_anomaly_score(
            raw_score=raw_score,
            score_min=self.score_min,
            score_max=self.score_max,
        )
        
        level = risk_label(risk_score)

        logger.debug(
            "Stage12 — anomaly=%.4f risk_score=%.2f flag=%d level=%s",
            raw_score, risk_score, flag, level
        )

        return {
            "s12_anomaly_score": raw_score,
            "s12_risk_score": risk_score,
            "s12_risk_flag": flag,
            "s12_risk_level": level,
        }


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

stage12_service = Stage12Service()
