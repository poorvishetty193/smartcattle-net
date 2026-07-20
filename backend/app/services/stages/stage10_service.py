"""
SmartCattle Net
services/stages/stage10_service.py

Purpose
-------
Stage 10 of the CCP-Chain: Priority Ranking.

Algorithm : Composite Weighted Scoring
Type      : Rule-based formula (No pre-trained weights from disk)

Logic (from notebook cell 38)
-----------------------------
Calculates a 0–100 priority score where higher values mean the cow 
requires more urgent attention.

Formula weights:
- 35% Heat Stress probability (s8)
- 35% Low Productivity (100 - s7)
- 20% Milk Drop probability (s2)
- 10% Low Stability (100 - s4)

Outputs
-------
- s10_priority_score : float (0-100)

Note on Ranking:
The actual herd-wide ranking (s10_priority_rank) requires evaluating all 
cows simultaneously. This service computes the absolute score for a 
single cow. The rank would be determined at the database/API level by 
sorting scores across the herd.

Chain dependencies
------------------
Requires:
  - s8_stress_probability
  - s7_productivity_score
  - s2_drop_probability
  - s4_msi

Dependencies
------------
- app.utils.helpers (compute_priority_score)
- app.utils.logger
"""

from __future__ import annotations

from typing import Dict, Union

from app.utils.helpers import compute_priority_score
from app.utils.logger import get_logger

logger = get_logger(__name__)


class Stage10Service:
    """
    Stage 10: Priority Ranking Score.

    Generates a composite severity score based on physiological stress,
    productivity loss, drop risk, and yield instability. 
    """

    def __init__(self) -> None:
        logger.info("Stage10Service initialised — Priority Scoring ready.")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(
        self,
        s2_drop_probability: float,
        s4_msi: float,
        s7_productivity_score: float,
        s8_stress_probability: float,
    ) -> float:
        """
        Run Stage 10 composite scoring and return the priority score.

        Parameters
        ----------
        s2_drop_probability : float
            Stage 2 drop probability (0–1).
        s4_msi : float
            Stage 4 Milk Stability Index (0–100).
        s7_productivity_score : float
            Stage 7 productivity score (0–100).
        s8_stress_probability : float
            Stage 8 heat stress probability (0–1).

        Returns
        -------
        float
            Priority score in range [0, 100]. Higher = more urgent.
        """
        score = compute_priority_score(
            stress_probability=s8_stress_probability,
            productivity_score=s7_productivity_score,
            drop_probability=s2_drop_probability,
            msi=s4_msi,
        )
        
        logger.debug(
            "Stage10 — priority_score=%.4f (stress=%.2f prod=%.2f drop=%.2f msi=%.2f)", 
            score, s8_stress_probability, s7_productivity_score, 
            s2_drop_probability, s4_msi
        )

        return score


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

stage10_service = Stage10Service()
