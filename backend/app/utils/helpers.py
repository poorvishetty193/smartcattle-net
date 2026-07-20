"""
SmartCattle Net
utils/helpers.py

Purpose
-------
Shared pure utility functions.
Every function here is stateless, side-effect free, and fully typed.
No imports from other app modules except the logger.

Sections
--------
1. Safe numeric coercions   — safe_float, safe_int
2. THI tier resolution      — resolve_thi_tier
3. Risk label mapping       — risk_label, risk_flag_label
4. Stage 9 recommendation   — build_farm_decision (mirrors notebook cell 36)
5. Stage 10 priority score  — compute_priority_score (mirrors notebook cell 38)
6. Stage 7 productivity     — compute_productivity_score (mirrors notebook cell 32)
7. Stage 12 risk normalise  — normalise_anomaly_score (mirrors notebook cell 42)
8. Timestamp helpers        — utcnow_iso

Dependencies
------------
- app.utils.logger
- Standard library: math, datetime, typing
"""

from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional, Union

from app.utils.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Type aliases
# ---------------------------------------------------------------------------

NumericInput = Union[int, float, str, None]
THITier = Literal["comfortable", "heat_stress", "severe_stress"]

# ---------------------------------------------------------------------------
# 1. Safe numeric coercions
# ---------------------------------------------------------------------------


def safe_float(value: NumericInput, default: float = 0.0) -> float:
    """
    Safely convert *value* to float.

    Returns *default* if the value is ``None``, ``NaN``, infinite,
    or cannot be parsed.

    Parameters
    ----------
    value : int | float | str | None
        Input to coerce.
    default : float
        Fallback value.  Defaults to ``0.0``.

    Returns
    -------
    float
    """
    if value is None:
        return default
    try:
        result = float(value)
        if math.isnan(result) or math.isinf(result):
            return default
        return result
    except (TypeError, ValueError):
        logger.debug("safe_float: cannot convert %r — using default %s", value, default)
        return default


def safe_int(value: NumericInput, default: int = 0) -> int:
    """
    Safely convert *value* to int.

    Internally converts to float first so strings like ``"3.7"`` are
    handled via truncation rather than raising ``ValueError``.

    Parameters
    ----------
    value : int | float | str | None
        Input to coerce.
    default : int
        Fallback value.  Defaults to ``0``.

    Returns
    -------
    int
    """
    float_val = safe_float(value, default=float(default))
    return int(float_val)


def clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    """
    Clamp *value* to the closed interval [*lo*, *hi*].

    Parameters
    ----------
    value : float
    lo : float
        Lower bound.  Defaults to ``0.0``.
    hi : float
        Upper bound.  Defaults to ``100.0``.

    Returns
    -------
    float
    """
    return max(lo, min(hi, value))


# ---------------------------------------------------------------------------
# 2. THI tier resolution
#    Mirrors notebook cell 12:
#      bins = [-inf, 72, 80, +inf]
#      labels = ['comfortable', 'heat_stress', 'severe_stress']
# ---------------------------------------------------------------------------

_THI_COMFORTABLE_MAX: float = 72.0
_THI_HEAT_STRESS_MAX: float = 80.0


def resolve_thi_tier(thi: float) -> THITier:
    """
    Map a raw Temperature-Humidity Index (THI) value to its named tier.

    Thresholds match the notebook preprocessing cell exactly:
    - comfortable   : THI ≤ 72
    - heat_stress   : 72 < THI ≤ 80
    - severe_stress : THI > 80

    Parameters
    ----------
    thi : float
        Raw THI value.

    Returns
    -------
    THITier
        One of ``"comfortable"``, ``"heat_stress"``, ``"severe_stress"``.
    """
    if thi <= _THI_COMFORTABLE_MAX:
        return "comfortable"
    if thi <= _THI_HEAT_STRESS_MAX:
        return "heat_stress"
    return "severe_stress"


def thi_stress_flag(thi: float) -> int:
    """
    Return binary THI stress flag.

    Mirrors notebook cell 12: ``(df['thi'] > 72).astype(int)``

    Parameters
    ----------
    thi : float

    Returns
    -------
    int
        ``1`` if stressed, ``0`` otherwise.
    """
    return 1 if thi > _THI_COMFORTABLE_MAX else 0


# ---------------------------------------------------------------------------
# 3. Risk label mapping (Stage 12)
# ---------------------------------------------------------------------------

_RISK_THRESHOLDS: Dict[str, float] = {
    "low": 33.0,
    "medium": 66.0,
}


def risk_label(risk_score: float) -> str:
    """
    Convert a numeric risk score (0–100) to a human-readable label.

    Thresholds
    ----------
    - 0–33   → ``"low"``
    - 34–66  → ``"medium"``
    - 67–100 → ``"high"``

    Parameters
    ----------
    risk_score : float
        Stage 12 risk score, expected range 0–100.

    Returns
    -------
    str
    """
    score = clamp(safe_float(risk_score))
    if score <= _RISK_THRESHOLDS["low"]:
        return "low"
    if score <= _RISK_THRESHOLDS["medium"]:
        return "medium"
    return "high"


def risk_flag_label(risk_flag: int) -> str:
    """
    Convert Stage 12 binary risk flag to a label.

    Parameters
    ----------
    risk_flag : int
        ``1`` = anomaly detected, ``0`` = normal.

    Returns
    -------
    str
        ``"anomaly_detected"`` or ``"normal"``.
    """
    return "anomaly_detected" if risk_flag == 1 else "normal"


# ---------------------------------------------------------------------------
# 4. Stage 9 — Farm Decision Rule Engine
#    Mirrors notebook cell 36 exactly.
# ---------------------------------------------------------------------------

_NORMAL_DECISION: str = "NORMAL — no action required"


def build_farm_decision(
    productivity_score: float,
    stress_flag: int,
    drop_probability: float,
    msi: float,
    mastitis_risk_proxy: int,
) -> str:
    """
    Apply the Stage 9 rule engine to generate a farm decision string.

    Rules (from notebook cell 36, in priority order):
    1. Productivity < 40  → ``"UNDERPERFORMING — review feeding plan"``
    2. Stress flag == 1   → ``"HEAT STRESS — activate cooling measures"``
    3. Drop prob > 0.7    → ``"DROP RISK — check for illness/mastitis"``
    4. MSI < 40           → ``"UNSTABLE YIELD — vet inspection recommended"``
    5. Mastitis proxy ==1 → ``"ELEVATED SCC — mastitis screening required"``

    Multiple rules can fire simultaneously; decisions are joined with
    ``" | "``.  If no rule fires the result is
    ``"NORMAL — no action required"``.

    Parameters
    ----------
    productivity_score : float
        Stage 7 output, range 0–100.
    stress_flag : int
        Stage 8 binary prediction (0 or 1).
    drop_probability : float
        Stage 2 probability, range 0–1.
    msi : float
        Stage 4 Milk Stability Index, range 0–100.
    mastitis_risk_proxy : int
        Engineered feature: 1 if SCC > 200 000.

    Returns
    -------
    str
        Pipe-separated decision string or the normal message.
    """
    decisions: List[str] = []

    if safe_float(productivity_score, 100.0) < 40.0:
        decisions.append("UNDERPERFORMING — review feeding plan")

    if safe_int(stress_flag) == 1:
        decisions.append("HEAT STRESS — activate cooling measures")

    if safe_float(drop_probability) > 0.7:
        decisions.append("DROP RISK — check for illness/mastitis")

    if safe_float(msi, 100.0) < 40.0:
        decisions.append("UNSTABLE YIELD — vet inspection recommended")

    if safe_int(mastitis_risk_proxy) == 1:
        decisions.append("ELEVATED SCC — mastitis screening required")

    return " | ".join(decisions) if decisions else _NORMAL_DECISION


def needs_attention(decision: str) -> int:
    """
    Return ``1`` if a farm decision requires intervention.

    Parameters
    ----------
    decision : str
        Output of :func:`build_farm_decision`.

    Returns
    -------
    int
        ``1`` = attention required, ``0`` = normal.
    """
    return 0 if decision == _NORMAL_DECISION else 1


# ---------------------------------------------------------------------------
# 5. Stage 10 — Priority Score
#    Mirrors notebook cell 38 exactly.
#    Formula:
#      0.35 * stress_prob * 100
#      + 0.35 * (100 - productivity_score)
#      + 0.20 * drop_probability * 100
#      + 0.10 * (100 - msi)
#    Clipped to [0, 100].
# ---------------------------------------------------------------------------


def compute_priority_score(
    stress_probability: float,
    productivity_score: float,
    drop_probability: float,
    msi: float,
) -> float:
    """
    Compute the Stage 10 composite priority score.

    Weights (from notebook cell 38)
    --------------------------------
    - 35 % stress component
    - 35 % low-productivity component
    - 20 % drop-risk component
    - 10 % low-stability component

    Parameters
    ----------
    stress_probability : float
        Stage 8 probability, range 0–1.
    productivity_score : float
        Stage 7 score, range 0–100.
    drop_probability : float
        Stage 2 probability, range 0–1.
    msi : float
        Stage 4 Milk Stability Index, range 0–100.

    Returns
    -------
    float
        Priority score in range [0, 100].
    """
    score = (
        0.35 * safe_float(stress_probability) * 100.0
        + 0.35 * (100.0 - clamp(safe_float(productivity_score, 50.0)))
        + 0.20 * safe_float(drop_probability) * 100.0
        + 0.10 * (100.0 - clamp(safe_float(msi, 50.0)))
    )
    return clamp(score)


# ---------------------------------------------------------------------------
# 6. Stage 7 — Climate-Gated Productivity Score
#    Mirrors notebook cell 32 exactly.
# ---------------------------------------------------------------------------

_WEIGHT_SCHEMES: Dict[str, Dict[str, float]] = {
    "comfortable": {
        "yield": 0.35,
        "stability": 0.15,
        "drop": 0.20,
        "trend": 0.15,
        "quantity": 0.15,
    },
    "heat_stress": {
        "yield": 0.25,
        "stability": 0.25,
        "drop": 0.25,
        "trend": 0.15,
        "quantity": 0.10,
    },
    "severe_stress": {
        "yield": 0.20,
        "stability": 0.30,
        "drop": 0.30,
        "trend": 0.10,
        "quantity": 0.10,
    },
}


def compute_productivity_score(
    daily_yield_pred: float,
    msi: float,
    drop_probability: float,
    trend_slope: float,
    milk_quantity: float,
    thi_tier: THITier = "comfortable",
) -> float:
    """
    Stage 7 Climate-Gated Ensemble productivity score.

    Normalisation rules (from notebook cell 32)
    --------------------------------------------
    - ``yield_norm``    = clip(s1_daily_yield_pred / 40 * 100, 0, 100)
    - ``stability``     = clip(s4_msi, 0, 100)
    - ``drop_penalty``  = clip((1 - s2_drop_probability) * 100, 0, 100)
    - ``trend_score``   = clip(50 + s6_trend_slope * 10, 0, 100)
    - ``quantity_norm`` = clip(s5_milk_quantity / 40 * 100, 0, 100)

    Parameters
    ----------
    daily_yield_pred : float
        Stage 1 predicted daily yield (litres).
    msi : float
        Stage 4 Milk Stability Index (0–100).
    drop_probability : float
        Stage 2 drop probability (0–1).
    trend_slope : float
        Stage 6 trend slope.
    milk_quantity : float
        Stage 5 predicted quantity (litres).
    thi_tier : THITier
        Climate category used to select weight scheme.

    Returns
    -------
    float
        Productivity score in range [0, 100].
    """
    w = _WEIGHT_SCHEMES.get(thi_tier, _WEIGHT_SCHEMES["comfortable"])

    yield_norm = clamp(safe_float(daily_yield_pred) / 40.0 * 100.0)
    stability = clamp(safe_float(msi, 50.0))
    drop_penalty = clamp((1.0 - safe_float(drop_probability)) * 100.0)
    trend_score = clamp(50.0 + safe_float(trend_slope) * 10.0)
    quantity_norm = clamp(safe_float(milk_quantity) / 40.0 * 100.0)

    score = (
        w["yield"] * yield_norm
        + w["stability"] * stability
        + w["drop"] * drop_penalty
        + w["trend"] * trend_score
        + w["quantity"] * quantity_norm
    )
    return clamp(score)


# ---------------------------------------------------------------------------
# 7. Stage 12 — Anomaly score normalisation
#    Mirrors notebook cell 42:
#      risk = 100 * (1 - (score - min) / (max - min + 1e-9))
# ---------------------------------------------------------------------------


def normalise_anomaly_score(
    raw_score: float,
    score_min: float,
    score_max: float,
) -> float:
    """
    Convert an Isolation Forest raw anomaly score to a 0–100 risk value.

    More-negative raw scores = more anomalous → higher risk.
    Formula (notebook cell 42):
    ``risk = 100 * (1 - (score - min) / (max - min + 1e-9))``

    Parameters
    ----------
    raw_score : float
        Output of ``IsolationForest.score_samples()`` for one sample.
    score_min : float
        Minimum raw score across the reference population.
    score_max : float
        Maximum raw score across the reference population.

    Returns
    -------
    float
        Risk score in range [0, 100].
    """
    denom = (score_max - score_min) + 1e-9
    risk = 100.0 * (1.0 - (raw_score - score_min) / denom)
    return clamp(risk)


# ---------------------------------------------------------------------------
# 8. Timestamp helper
# ---------------------------------------------------------------------------


def utcnow_iso() -> str:
    """
    Return the current UTC time as an ISO-8601 string.

    Returns
    -------
    str
        Example: ``"2025-07-20T17:00:00+00:00"``
    """
    return datetime.now(tz=timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# 9. Feature-list helpers
# ---------------------------------------------------------------------------

#: Base feature column order — must match the notebook preprocessing cell
#: exactly (cell 12 / cell 13).
BASE_FEATURE_COLS: List[str] = [
    "DIM",
    "parity",
    "log_scc",
    "thi",
    "thi_stress_flag",
    "yield_lag_1",
    "yield_lag_2",
    "yield_lag_3",
    "yield_lag_7",
    "yield_roll_7_mean",
    "yield_roll_7_std",
    "yield_cv_7",
    "month",
    "season",
    "mastitis_risk_proxy",
]


def validate_feature_dict(
    features: Dict[str, Any],
    required: List[str],
) -> List[str]:
    """
    Return a list of column names that are missing from *features*.

    Parameters
    ----------
    features : dict
        Mapping of feature name → value.
    required : list of str
        Expected feature names.

    Returns
    -------
    list of str
        Missing feature names (empty list = all present).
    """
    return [col for col in required if col not in features]
