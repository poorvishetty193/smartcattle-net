"""
SmartCattle Net
services/stages/stage9_service.py

Purpose
-------
Stage 9 of the CCP-Chain: Farm Decision Support.

Algorithm : Rule Engine + Logistic Logic
Type      : Rule-based (No pre-trained weights from disk)

Logic (from notebook cell 36)
-----------------------------
Generates actionable string recommendations based on thresholds from 
previous stage predictions. 

Rules (applied in order):
1. Productivity < 40  → 'UNDERPERFORMING — review feeding plan'
2. Stress flag == 1   → 'HEAT STRESS — activate cooling measures'
3. Drop prob > 0.7    → 'DROP RISK — check for illness/mastitis'
4. MSI < 40           → 'UNSTABLE YIELD — vet inspection recommended'
5. Mastitis proxy ==1 → 'ELEVATED SCC — mastitis screening required'

Outputs
-------
- s9_farm_decision   : str  — Pipe-separated string of triggered rules, or 'NORMAL...'
- s9_needs_attention : int  — 1 if any rule triggered, else 0

Chain dependencies
------------------
Requires:
  - s7_productivity_score
  - s8_stress_flag
  - s2_drop_probability
  - s4_msi
  - mastitis_risk_proxy (from base features)

Dependencies
------------
- app.utils.helpers (build_farm_decision, needs_attention, safe_int)
- app.utils.logger
"""

from __future__ import annotations

from typing import Dict, Union

from app.utils.helpers import build_farm_decision, needs_attention, safe_int
from app.utils.logger import get_logger

logger = get_logger(__name__)


class Stage9Service:
    """
    Stage 9: Farm Decision Support.

    Evaluates outputs from all prior stages against a rule engine to 
    generate human-readable, actionable farm management alerts.
    """

    def __init__(self) -> None:
        logger.info("Stage9Service initialised — Rule Engine ready.")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(
        self,
        features: Dict[str, Union[int, float, None]],
        s2_drop_probability: float,
        s4_msi: float,
        s7_productivity_score: float,
        s8_stress_flag: int,
    ) -> Dict[str, Union[str, int]]:
        """
        Run Stage 9 decision engine and return recommendations.

        Parameters
        ----------
        features : dict
            Dictionary containing the base features, specifically 
            'mastitis_risk_proxy'.
        s2_drop_probability : float
            Stage 2 drop probability (0–1).
        s4_msi : float
            Stage 4 Milk Stability Index (0–100).
        s7_productivity_score : float
            Stage 7 productivity score (0–100).
        s8_stress_flag : int
            Stage 8 binary heat stress flag (0 or 1).

        Returns
        -------
        dict with keys:
            - s9_farm_decision : str
            - s9_needs_attention : int
        """
        mastitis_proxy = safe_int(features.get("mastitis_risk_proxy"), default=0)

        decision = build_farm_decision(
            productivity_score=s7_productivity_score,
            stress_flag=s8_stress_flag,
            drop_probability=s2_drop_probability,
            msi=s4_msi,
            mastitis_risk_proxy=mastitis_proxy,
        )
        
        attention_flag = needs_attention(decision)

        logger.debug(
            "Stage9 — needs_attention=%d decision=%r", 
            attention_flag, decision
        )

        return {
            "s9_farm_decision": decision,
            "s9_needs_attention": attention_flag,
        }


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

stage9_service = Stage9Service()
