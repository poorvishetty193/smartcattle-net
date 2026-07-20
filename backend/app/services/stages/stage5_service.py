"""
SmartCattle Net
services/stages/stage5_service.py

Purpose
-------
Stage 5 of the CCP-Chain: Milk Quantity Prediction.

Algorithm : Ridge Regression (RidgeCV) + Polynomial Features (degree=2)
Models    : ai/models/stage5/model_s5_ridge_quantity.pkl
            ai/models/preprocessing/poly_features_s5.pkl

Input features (notebook cell 28, S5_FEATURES, in order)
----------------------------------------------------------
FEATURE_COLS (15 base features) + [
    's1_daily_yield_pred',    # Stage 1 output
    's2_drop_probability',    # Stage 2 output
    's3_next_milking_yield',  # Stage 3 output
    's4_msi'                  # Stage 4 output
]
Total raw features: 19

After polynomial expansion (degree=2, interaction_only=False,
include_bias=False):
  n_poly_features = (19 + 1) * 19 / 2 = 209 features
  (exact count depends on sklearn version but the loaded poly transformer
   handles this automatically)

Transform pipeline (notebook cell 28):
  X_raw (19) → poly.transform(X_raw) → ridge.predict(X_poly)

Why Ridge + Poly?
-----------------
Lactation curves follow a smooth parabolic shape (rise to peak, then
gradual decline).  Polynomial features capture the curvature; Ridge
regularisation prevents overfitting from the expanded feature space.

Outputs
-------
- s5_milk_quantity : float  — predicted session milk quantity (litres)

Chain dependencies
------------------
Requires:
  - s1_daily_yield_pred    (Stage 1)
  - s2_drop_probability    (Stage 2)
  - s3_next_milking_yield  (Stage 3)
  - s4_msi                 (Stage 4)

Dependencies
------------
- app.services.loaders.model_loader  (stage5 + poly)
- app.utils.helpers  (safe_float, BASE_FEATURE_COLS)
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
# Stage 5 feature list — mirrors notebook cell 28 exactly
# FEATURE_COLS (15) + s1 + s2 + s3 + s4 = 19 features
# ---------------------------------------------------------------------------

S5_FEATURES: List[str] = BASE_FEATURE_COLS + [
    "s1_daily_yield_pred",
    "s2_drop_probability",
    "s3_next_milking_yield",
    "s4_msi",
]

_N_RAW_FEATURES: int = len(S5_FEATURES)  # 19


class Stage5Service:
    """
    Stage 5: Milk Quantity Prediction using Ridge + Polynomial Features.

    The polynomial transformer expands the 19 raw features into quadratic
    interaction terms, capturing the non-linear lactation curve shape.
    The Ridge regression then fits a regularised linear model on this
    expanded space.

    Transform order (must exactly match the notebook):
      1. Build 19-feature raw vector
      2. Apply ``poly.transform(X_raw)``  → expanded features
      3. Apply ``ridge.predict(X_poly)``  → predicted quantity

    Attributes
    ----------
    model : RidgeCV
        Loaded Ridge regression model.
    poly : PolynomialFeatures
        Loaded polynomial feature transformer (degree=2).
    """

    def __init__(self) -> None:
        self.model = model_loader.get("stage5")
        self.poly = model_loader.get("poly")
        logger.info("Stage5Service initialised — Ridge+Poly quantity prediction ready.")

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_raw_feature_vector(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
        s2_drop_probability: float,
        s3_next_milking_yield: float,
        s4_msi: float,
    ) -> np.ndarray:
        """
        Assemble the 19-feature raw input vector.

        Feature order (notebook cell 28):
        BASE_FEATURE_COLS (15) + [s1, s2, s3, s4]

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
        s4_msi : float
            Stage 4 Milk Stability Index (0–100).

        Returns
        -------
        np.ndarray
            Shape ``(1, 19)`` float32 array.
        """
        row: List[float] = [
            safe_float(features.get(col), default=0.0)
            for col in BASE_FEATURE_COLS
        ]
        row.append(safe_float(s1_daily_yield_pred))
        row.append(safe_float(s2_drop_probability))
        row.append(safe_float(s3_next_milking_yield))
        row.append(safe_float(s4_msi))

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
        s4_msi: float,
    ) -> float:
        """
        Run Stage 5 inference and return the predicted milk quantity.

        Transform pipeline:
          raw_features → poly.transform() → ridge.predict()

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
        s4_msi : float
            Stage 4 Milk Stability Index (0–100).

        Returns
        -------
        float
            Predicted milk quantity (litres).  Clipped to ≥ 0.

        Raises
        ------
        RuntimeError
            If the Stage 5 model or polynomial transformer is not loaded.
        """
        if self.model is None:
            raise RuntimeError(
                "Stage 5 model (Ridge) is not loaded. "
                "Check ai/models/stage5/model_s5_ridge_quantity.pkl."
            )
        if self.poly is None:
            raise RuntimeError(
                "Stage 5 polynomial transformer is not loaded. "
                "Check ai/models/preprocessing/poly_features_s5.pkl."
            )

        # Step 1 — raw 19-feature vector
        X_raw = self._build_raw_feature_vector(
            features,
            s1_daily_yield_pred,
            s2_drop_probability,
            s3_next_milking_yield,
            s4_msi,
        )

        # Step 2 — polynomial expansion (degree=2)
        # Mirror: poly.transform(X5_test)  — notebook cell 28
        X_poly = self.poly.transform(X_raw)

        # Step 3 — Ridge regression prediction
        raw_quantity: float = float(self.model.predict(X_poly)[0])

        # Yield cannot be negative
        quantity: float = max(0.0, raw_quantity)

        logger.debug(
            "Stage5 — milk_quantity=%.4f litres (raw=%.4f)",
            quantity, raw_quantity,
        )
        return quantity


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

stage5_service = Stage5Service()
