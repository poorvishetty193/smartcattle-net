"""
SmartCattle Net
services/stages/stage2_service.py

Stage 2 : Milk Drop Prediction
"""

from __future__ import annotations

from typing import Dict, Union

import numpy as np

from app.services.loaders.model_loader import model_loader
from app.utils.helpers import BASE_FEATURE_COLS, safe_float
from app.utils.logger import get_logger

logger = get_logger(__name__)

S2_FEATURES = BASE_FEATURE_COLS + ["s1_daily_yield_pred"]


class Stage2Service:
    """
    Stage 2: Milk Drop Prediction using LightGBM.
    """

    def __init__(self) -> None:
        self.model = model_loader.get("stage2")
        self.threshold = self._load_threshold()

        logger.info(
            "Stage2Service initialised — threshold=%.4f",
            self.threshold,
        )

    # ------------------------------------------------------------
    # Load threshold
    # ------------------------------------------------------------
    def _load_threshold(self) -> float:

        raw = model_loader.get("stage2_threshold")

        if raw is None:
            logger.warning(
                "stage2_threshold not found. Using default threshold 0.5"
            )
            return 0.5

        # Already numeric
        if isinstance(raw, (int, float)):
            return float(raw)

        # Dictionary
        if isinstance(raw, dict):

            possible_keys = [
                "threshold",
                "best_threshold",
                "optimal_threshold",
                "decision_threshold",
                "value",
            ]

            for key in possible_keys:
                if key in raw:
                    logger.info(
                        "Loaded threshold from key '%s' = %s",
                        key,
                        raw[key],
                    )
                    return float(raw[key])

            # If dictionary has only one value
            if len(raw) == 1:
                value = list(raw.values())[0]
                logger.info(
                    "Loaded threshold from dictionary value = %s",
                    value,
                )
                return float(value)

            logger.warning(
                "Unknown threshold dictionary %s. Using default 0.5",
                raw,
            )
            return 0.5

        # List or tuple
        if isinstance(raw, (list, tuple)):
            return float(raw[0])

        logger.warning(
            "Unsupported threshold type %s. Using default 0.5",
            type(raw).__name__,
        )
        return 0.5

    # ------------------------------------------------------------
    # Build feature vector
    # ------------------------------------------------------------
    def _build_feature_vector(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
    ) -> np.ndarray:

        row = [
            safe_float(features.get(col), default=0.0)
            for col in BASE_FEATURE_COLS
        ]

        row.append(safe_float(s1_daily_yield_pred))

        return np.array(row, dtype=np.float32).reshape(1, -1)

    # ------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------
    def predict(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
    ) -> Dict[str, Union[float, int]]:

        if self.model is None:
            raise RuntimeError(
                "Stage 2 model is not loaded."
            )

        X = self._build_feature_vector(
            features,
            s1_daily_yield_pred,
        )

        probability = float(
            self.model.predict_proba(X)[0, 1]
        )

        flag = 1 if probability >= self.threshold else 0

        logger.debug(
            "Stage2 probability=%.4f threshold=%.4f flag=%d",
            probability,
            self.threshold,
            flag,
        )

        return {
            "s2_drop_probability": probability,
            "s2_drop_flag": flag,
        }


stage2_service = Stage2Service()