"""
SmartCattle Net
services/stages/stage2_service.py

Purpose
-------
Stage 2 of the CCP-Chain: Milk Drop Prediction.

Algorithm : LightGBM Classifier
Model file: ai/models/stage2/model_s2_lgbm_drop.pkl
Threshold : ai/models/stage2/model_s2_threshold.pkl

Input features (notebook cell 17, in order)
--------------------------------------------
FEATURE_COLS (15 base features) + ['s1_daily_yield_pred']

Total: 16 features

FEATURE_COLS (exact order from notebook cell 13):
  DIM, parity, log_scc, thi, thi_stress_flag,
  yield_lag_1, yield_lag_2, yield_lag_3, yield_lag_7,
  yield_roll_7_mean, yield_roll_7_std, yield_cv_7,
  month, season, mastitis_risk_proxy

Outputs
-------
- s2_drop_probability : float  — probability of a milk drop event (0–1)
- s2_drop_flag        : int    — 1 if prob >= optimised threshold, else 0

Chain dependency
----------------
Requires Stage 1 output (s1_daily_yield_pred) as an input feature,
exactly as in notebook cell 17.

Dependencies
------------
- app.services.loaders.model_loader  (model_loader singleton)
- app.utils.helpers                  (safe_float, BASE_FEATURE_COLS)
- app.utils.logger
- numpy
"""

from __future__ import annotations

from typing import Dict, Union

import numpy as np

from app.services.loaders.model_loader import model_loader
from app.utils.helpers import BASE_FEATURE_COLS, safe_float
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Stage 2 feature list — mirrors notebook cell 17 exactly
# FEATURE_COLS + ['s1_daily_yield_pred']
# ---------------------------------------------------------------------------

S2_FEATURES: list[str] = BASE_FEATURE_COLS + ["s1_daily_yield_pred"]


class Stage2Service:
    """
    Stage 2: Milk Drop Prediction using LightGBM.

    Predicts whether the cow's next milking session will show a
    significant milk yield drop, and returns the calibrated probability.

    The optimised classification threshold is loaded from disk
    (``model_s2_threshold.pkl``) so inference matches the exact operating
    point chosen during training.

    Attributes
    ----------
    model : LGBMClassifier
        Loaded LightGBM classifier.
    threshold : float
        Optimised decision threshold (default 0.5 if not found on disk).
    """

    def __init__(self) -> None:
        self.model = model_loader.get("stage2")
        self.threshold: float = self._load_threshold()
        logger.info(
            "Stage2Service initialised — threshold=%.4f", self.threshold
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _load_threshold(self) -> float:
        """
        Load the optimised classification threshold from disk.

        Falls back to 0.5 if the threshold artifact is not present.

        Returns
        -------
        float
            Decision threshold in the range (0, 1).
        """
        raw = model_loader.get("stage2_threshold")
        if raw is None:
            logger.warning(
                "stage2_threshold not found in model_loader — using default 0.5"
            )
            return 0.5
        # The threshold is saved as a plain Python float via joblib
        return float(raw)

    def _build_feature_vector(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
    ) -> np.ndarray:
        """
        Assemble the 16-feature input vector for the LightGBM model.

        Feature order (notebook cell 17):
        FEATURE_COLS (15) + [s1_daily_yield_pred]

        Parameters
        ----------
        features : dict
            Mapping of feature name → value for the 15 base features.
        s1_daily_yield_pred : float
            Stage 1 predicted daily milk yield (litres).

        Returns
        -------
        np.ndarray
            Shape ``(1, 16)`` float32 array ready for model inference.
        """
        row: list[float] = [
            safe_float(features.get(col), default=0.0)
            for col in BASE_FEATURE_COLS
        ]
        row.append(safe_float(s1_daily_yield_pred))

        return np.array(row, dtype=np.float32).reshape(1, -1)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
    ) -> Dict[str, Union[float, int]]:
        """
        Run Stage 2 inference and return drop probability and binary flag.

        Parameters
        ----------
        features : dict
            Dictionary containing the 15 base ``FEATURE_COLS`` values.
            Keys must match the names in ``BASE_FEATURE_COLS``.
        s1_daily_yield_pred : float
            Stage 1 predicted daily milk yield (litres) — chained input.

        Returns
        -------
        dict with keys:
            - ``s2_drop_probability`` (float): probability of milk drop, 0–1
            - ``s2_drop_flag``        (int):   1 = drop predicted, 0 = normal

        Raises
        ------
        RuntimeError
            If the Stage 2 model is not loaded.
        """
        if self.model is None:
            raise RuntimeError(
                "Stage 2 model (LightGBM) is not loaded. "
                "Check ai/models/stage2/model_s2_lgbm_drop.pkl."
            )

        X = self._build_feature_vector(features, s1_daily_yield_pred)

        # LightGBM classifier: predict_proba returns shape (n_samples, 2)
        # Column 1 = probability of class 1 (drop event)
        proba: float = float(self.model.predict_proba(X)[0, 1])
        flag: int = 1 if proba >= self.threshold else 0

        logger.debug(
            "Stage2 — drop_probability=%.4f drop_flag=%d threshold=%.4f",
            proba, flag, self.threshold,
        )

        return {
            "s2_drop_probability": proba,
            "s2_drop_flag": flag,
        }


# ---------------------------------------------------------------------------
# Singleton instance — imported by the prediction pipeline
# ---------------------------------------------------------------------------

stage2_service = Stage2Service()
