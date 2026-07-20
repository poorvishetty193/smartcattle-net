"""
SmartCattle Net
services/stages/stage4_service.py

Purpose
-------
Stage 4 of the CCP-Chain: Milk Stability Index (MSI) Prediction.

Algorithm : Random Forest Regressor
Model file: ai/models/stage4/model_s4_rf_msi.pkl

Input features (notebook cell 26, S4_FEATURES, in order)
----------------------------------------------------------
FEATURE_COLS (15 base features) + [
    's1_daily_yield_pred',    # Stage 1 output
    's2_drop_probability',    # Stage 2 output
    's3_next_milking_yield'   # Stage 3 output
]
Total: 18 features

What is MSI?
-----------
The Milk Stability Index is a novel metric introduced in the SmartCattle
research (notebook cell 26).  It measures how consistently a cow
produces milk over time, computed from:
  - Coefficient of variation (CV) of yield over a 7-day rolling window
  - Frequency of sudden yield drops (>15% below rolling mean)
  - Lag-1 autocorrelation of yield (sequential stability)

MSI ranges from 0 (completely unstable) to 100 (perfectly stable).

The Random Forest model learns to predict this derived target from the
combined features of the previous stages.

Outputs
-------
- s4_msi : float  — Milk Stability Index (0–100)

Chain dependencies
------------------
Requires:
  - s1_daily_yield_pred   (Stage 1)
  - s2_drop_probability   (Stage 2)
  - s3_next_milking_yield (Stage 3)

Dependencies
------------
- app.services.loaders.model_loader
- app.utils.helpers  (safe_float, BASE_FEATURE_COLS, clamp)
- app.utils.logger
- numpy
"""

from __future__ import annotations

from typing import Dict, List, Union

import numpy as np

from app.services.loaders.model_loader import model_loader
from app.utils.helpers import BASE_FEATURE_COLS, clamp, safe_float
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Stage 4 feature list — mirrors notebook cell 26 exactly
# FEATURE_COLS (15) + s1 + s2 + s3 = 18 features
# ---------------------------------------------------------------------------

S4_FEATURES: List[str] = BASE_FEATURE_COLS + [
    "s1_daily_yield_pred",
    "s2_drop_probability",
    "s3_next_milking_yield",
]

_N_FEATURES: int = len(S4_FEATURES)  # 18


class Stage4Service:
    """
    Stage 4: Milk Stability Index (MSI) Prediction using Random Forest.

    The MSI captures yield consistency — high MSI means the cow is
    producing stable, predictable amounts.  Low MSI signals volatility
    that warrants attention.

    Attributes
    ----------
    model : RandomForestRegressor
        Loaded sklearn Random Forest model.
    """

    def __init__(self) -> None:
        self.model = model_loader.get("stage4")
        logger.info("Stage4Service initialised — MSI prediction ready.")

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_feature_vector(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
        s2_drop_probability: float,
        s3_next_milking_yield: float,
    ) -> np.ndarray:
        """
        Assemble the 18-feature input vector for the Random Forest model.

        Feature order (notebook cell 26):
        FEATURE_COLS (15) + [s1_daily_yield_pred, s2_drop_probability,
                              s3_next_milking_yield]

        Parameters
        ----------
        features : dict
            Base feature values keyed by column name.
        s1_daily_yield_pred : float
            Stage 1 chained output (litres).
        s2_drop_probability : float
            Stage 2 chained output (0–1).
        s3_next_milking_yield : float
            Stage 3 chained output (litres).

        Returns
        -------
        np.ndarray
            Shape ``(1, 18)`` float32 array.
        """
        row: List[float] = [
            safe_float(features.get(col), default=0.0)
            for col in BASE_FEATURE_COLS
        ]
        row.append(safe_float(s1_daily_yield_pred))
        row.append(safe_float(s2_drop_probability))
        row.append(safe_float(s3_next_milking_yield))

        return np.array(row, dtype=np.float32).reshape(1, -1)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
        s2_drop_probability: float,
        s3_next_milking_yield: float,
    ) -> float:
        """
        Run Stage 4 inference and return the Milk Stability Index.

        The raw prediction is clipped to [0, 100] to match the notebook
        training target range.

        Parameters
        ----------
        features : dict
            Dictionary containing the 15 base ``FEATURE_COLS`` values.
        s1_daily_yield_pred : float
            Stage 1 predicted daily milk yield (litres).
        s2_drop_probability : float
            Stage 2 milk drop probability (0–1).
        s3_next_milking_yield : float
            Stage 3 predicted next milking yield (litres).

        Returns
        -------
        float
            MSI score in range [0, 100].
            Higher = more stable milk production.

        Raises
        ------
        RuntimeError
            If the Stage 4 model is not loaded.
        """
        if self.model is None:
            raise RuntimeError(
                "Stage 4 model (Random Forest) is not loaded. "
                "Check ai/models/stage4/model_s4_rf_msi.pkl."
            )

        X = self._build_feature_vector(
            features,
            s1_daily_yield_pred,
            s2_drop_probability,
            s3_next_milking_yield,
        )

        raw_msi: float = float(self.model.predict(X)[0])

        # Mirror notebook: np.clip(pred_s4_test, 0, 100) — cell 26 implicit
        msi: float = clamp(raw_msi, lo=0.0, hi=100.0)

        logger.debug("Stage4 — msi=%.4f (raw=%.4f)", msi, raw_msi)
        return msi


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

stage4_service = Stage4Service()
