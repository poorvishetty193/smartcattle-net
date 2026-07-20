"""
SmartCattle Net
services/stages/stage7_service.py

Purpose
-------
Stage 7 of the CCP-Chain: Productivity Score (Climate-Gated Ensemble).

Algorithm : Rule-based weighted ensemble (No pre-trained weights from disk)
Type      : Novel Contribution (Research Paper Core)

Logic (from notebook cell 32)
-----------------------------
Weights change dynamically based on the current Temperature-Humidity 
Index (THI) tier. Under heat stress, stability and drop-risk are 
weighted more heavily than raw milk yield.

Weights (comfortable):
  Yield: 0.35 | Stability: 0.15 | Drop: 0.20 | Trend: 0.15 | Quantity: 0.15
Weights (severe_stress):
  Yield: 0.20 | Stability: 0.30 | Drop: 0.30 | Trend: 0.10 | Quantity: 0.10

Outputs
-------
- s7_productivity_score : float (0-100)

Chain dependencies
------------------
Requires:
  - s1_daily_yield_pred
  - s4_msi
  - s2_drop_probability
  - s6_trend_slope
  - s5_milk_quantity
  - 'thi' from base features (to determine climate tier)

Dependencies
------------
- app.utils.helpers (resolve_thi_tier, compute_productivity_score, safe_float)
- app.utils.logger
"""

from __future__ import annotations

from typing import Dict, Union

from app.utils.helpers import compute_productivity_score, resolve_thi_tier, safe_float
from app.utils.logger import get_logger

logger = get_logger(__name__)


class Stage7Service:
    """
    Stage 7: Productivity Score via Climate-Gated Ensemble.

    This service applies dynamic weighting based on the cow's current 
    climate environment (THI). The core logic is implemented in the 
    shared helpers utility.
    """

    def __init__(self) -> None:
        logger.info("Stage7Service initialised — Climate-Gated Ensemble ready.")

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
    ) -> float:
        """
        Run Stage 7 scoring and return the productivity score.

        Parameters
        ----------
        features : dict
            Dictionary containing the base features, specifically 'thi'.
        s1_daily_yield_pred : float
            Stage 1 predicted daily milk yield (litres).
        s2_drop_probability : float
            Stage 2 milk drop probability (0–1).
        s4_msi : float
            Stage 4 Milk Stability Index (0–100).
        s5_milk_quantity : float
            Stage 5 predicted milk quantity (litres).
        s6_trend_slope : float
            Stage 6 trend slope.

        Returns
        -------
        float
            Productivity score in range [0, 100].
        """
        thi_val = safe_float(features.get("thi"), default=60.0)
        thi_tier = resolve_thi_tier(thi_val)

        score = compute_productivity_score(
            daily_yield_pred=s1_daily_yield_pred,
            msi=s4_msi,
            drop_probability=s2_drop_probability,
            trend_slope=s6_trend_slope,
            milk_quantity=s5_milk_quantity,
            thi_tier=thi_tier,
        )

        logger.debug(
            "Stage7 — thi=%.1f tier=%s productivity_score=%.4f", 
            thi_val, thi_tier, score
        )
        return score


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

stage7_service = Stage7Service()
