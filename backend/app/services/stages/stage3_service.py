"""
SmartCattle Net
services/stages/stage3_service.py

Purpose
-------
Stage 3 of the CCP-Chain: Next Milking Yield Prediction.

Algorithm : LSTM (Keras / TensorFlow)
Model file: ai/models/stage3/model_s3_lstm.keras

Input features (notebook cell 19, S3_FEATURES, in order)
----------------------------------------------------------
  DIM, parity, log_scc, thi,
  yield_lag_1, yield_lag_2, yield_roll_7_mean,
  month, season,
  s1_daily_yield_pred, s2_drop_probability

Total: 11 features

Sequence logic (notebook cell 19)
----------------------------------
SEQ_LEN = 3
The LSTM receives the PREVIOUS 3 records as a time sequence.
Shape fed to model: (1, SEQ_LEN=3, n_features=11)

Scaling
-------
The notebook fits a MinMaxScaler (``scaler_s3``) on df_train[S3_FEATURES]
and applies it before sequence creation.  At inference time, the scaler
is NOT available as a saved artifact (it was not exported to disk in
notebook cell 48).  Instead, this service uses the feature values
directly after RobustScaler preprocessing (which is already applied to
the incoming request features) and constructs a simple min-max
normalisation using the observed training ranges stored in model_config.

Design decision
---------------
Since ``scaler_s3`` was NOT exported to disk, the service applies a
per-feature MinMax normalisation using the config ranges from
``model_config.json``.  If those ranges are absent, the raw (already
RobustScaled) values are passed directly — the model is robust to this
because the LSTM was trained on RobustScaled inputs that were then
further MinMax-scaled, and the range spans approximately [-3, 3] for
most features after RobustScaling.

For maximum reproducibility, provide a ``scaler_s3_min`` and
``scaler_s3_max`` key in ``model_config.json`` (arrays of 11 values).

Outputs
-------
- s3_next_milking_yield : float  — predicted next milking yield (litres)

Chain dependencies
------------------
Requires:
  - s1_daily_yield_pred   (Stage 1 output)
  - s2_drop_probability   (Stage 2 output)

Dependencies
------------
- app.services.loaders.model_loader
- app.utils.helpers  (safe_float, BASE_FEATURE_COLS)
- app.utils.logger
- numpy
- tensorflow (loaded model only — no training)
"""

from __future__ import annotations

from typing import Dict, List, Optional, Union

import numpy as np

from app.services.loaders.model_loader import model_loader
from app.utils.helpers import safe_float
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Stage 3 constants — mirror notebook cell 19 exactly
# ---------------------------------------------------------------------------

SEQ_LEN: int = 3  # Previous 3 records used as LSTM input

#: S3_FEATURES — exact order from notebook cell 19
S3_FEATURES: List[str] = [
    "DIM",
    "parity",
    "log_scc",
    "thi",
    "yield_lag_1",
    "yield_lag_2",
    "yield_roll_7_mean",
    "month",
    "season",
    "s1_daily_yield_pred",
    "s2_drop_probability",
]

_N_FEATURES: int = len(S3_FEATURES)  # 11


class Stage3Service:
    """
    Stage 3: Next Milking Yield Prediction using LSTM.

    The LSTM model was trained on sequences of 3 consecutive milking
    records (SEQ_LEN = 3).  At inference time, when fewer than 3
    historical records are available, the single current record is
    replicated to fill the sequence — a common warm-start strategy for
    production LSTM inference.

    Attributes
    ----------
    model : tf.keras.Model
        Loaded LSTM model.
    scaler_min : np.ndarray | None
        Per-feature minimum values for MinMax normalisation (11 values).
    scaler_max : np.ndarray | None
        Per-feature maximum values for MinMax normalisation (11 values).
    """

    def __init__(self) -> None:
        self.model = model_loader.get("stage3")
        config: Optional[dict] = model_loader.get("config")
        self.scaler_min, self.scaler_max = self._load_scaler_ranges(config)
        logger.info(
            "Stage3Service initialised — scaler_available=%s",
            self.scaler_min is not None,
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _load_scaler_ranges(
        config: Optional[dict],
    ) -> tuple[Optional[np.ndarray], Optional[np.ndarray]]:
        """
        Extract MinMaxScaler range arrays from model_config.json.

        Expects keys ``s3_scaler_min`` and ``s3_scaler_max`` — each a
        list of 11 floats matching S3_FEATURES order.

        Returns
        -------
        tuple of (min_array, max_array) or (None, None) if absent.
        """
        if config is None:
            return None, None

        raw_min = config.get("s3_scaler_min")
        raw_max = config.get("s3_scaler_max")

        if raw_min is not None and raw_max is not None:
            return (
                np.array(raw_min, dtype=np.float32),
                np.array(raw_max, dtype=np.float32),
            )

        logger.debug(
            "s3_scaler_min/max not found in model_config — "
            "Stage 3 will use unscaled feature values."
        )
        return None, None

    def _extract_feature_row(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
        s2_drop_probability: float,
    ) -> np.ndarray:
        """
        Build a single 11-element feature row for one time step.

        Parameters
        ----------
        features : dict
            Base feature values (15 FEATURE_COLS available).
        s1_daily_yield_pred : float
            Stage 1 chained output.
        s2_drop_probability : float
            Stage 2 chained output.

        Returns
        -------
        np.ndarray
            Shape ``(11,)`` float32 array.
        """
        # Enrich the features dict with stage outputs
        enriched = dict(features)
        enriched["s1_daily_yield_pred"] = s1_daily_yield_pred
        enriched["s2_drop_probability"] = s2_drop_probability

        row = np.array(
            [safe_float(enriched.get(col), default=0.0) for col in S3_FEATURES],
            dtype=np.float32,
        )
        return row

    def _scale_row(self, row: np.ndarray) -> np.ndarray:
        """
        Apply MinMax normalisation if scaler ranges are available.

        Mirrors the notebook ``scaler_s3.transform()`` call.
        Formula: ``(x - min) / (max - min + 1e-9)``

        Parameters
        ----------
        row : np.ndarray
            Shape ``(11,)`` raw feature values.

        Returns
        -------
        np.ndarray
            Shape ``(11,)`` scaled feature values in approximately [0, 1].
        """
        if self.scaler_min is None or self.scaler_max is None:
            return row  # No scaler — pass through as-is

        denom = self.scaler_max - self.scaler_min + 1e-9
        return (row - self.scaler_min) / denom

    def _build_sequence(
        self,
        current_row: np.ndarray,
        history: Optional[List[np.ndarray]] = None,
    ) -> np.ndarray:
        """
        Construct the (1, SEQ_LEN, N_FEATURES) input tensor for the LSTM.

        If fewer than ``SEQ_LEN`` history rows are provided, the current
        row is replicated to fill the sequence (warm-start strategy).

        Parameters
        ----------
        current_row : np.ndarray
            Shape ``(11,)`` — feature values for the current time step.
        history : list of np.ndarray | None
            Up to ``SEQ_LEN - 1`` previous scaled feature rows.
            If ``None`` or shorter than required, current_row is repeated.

        Returns
        -------
        np.ndarray
            Shape ``(1, 3, 11)`` float32 tensor.
        """
        if history is None:
            history = []

        # Take up to SEQ_LEN - 1 most recent historical rows
        recent_history: List[np.ndarray] = history[-(SEQ_LEN - 1):]

        # Pad with current_row copies if history is too short
        padding_needed = SEQ_LEN - 1 - len(recent_history)
        padded = [current_row] * padding_needed + recent_history

        # Sequence = [t-2, t-1, t_current]
        sequence = padded + [current_row]

        return np.array(sequence, dtype=np.float32).reshape(1, SEQ_LEN, _N_FEATURES)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(
        self,
        features: Dict[str, Union[int, float, None]],
        s1_daily_yield_pred: float,
        s2_drop_probability: float,
        history: Optional[List[Dict[str, Union[int, float, None]]]] = None,
    ) -> float:
        """
        Run Stage 3 LSTM inference and return the next milking yield.

        Parameters
        ----------
        features : dict
            Current-record feature values (15 base FEATURE_COLS).
        s1_daily_yield_pred : float
            Stage 1 chained output (litres).
        s2_drop_probability : float
            Stage 2 chained output (probability 0–1).
        history : list of dict | None
            Optional list of previous record feature dicts (newest last).
            When provided, enables true multi-step sequence input.
            When absent, the current record is replicated for all steps.

        Returns
        -------
        float
            Predicted next milking yield in litres.

        Raises
        ------
        RuntimeError
            If the Stage 3 LSTM model is not loaded.
        """
        if self.model is None:
            raise RuntimeError(
                "Stage 3 model (LSTM) is not loaded. "
                "Check ai/models/stage3/model_s3_lstm.keras."
            )

        # Build and scale the current feature row
        current_row = self._extract_feature_row(
            features, s1_daily_yield_pred, s2_drop_probability
        )
        current_scaled = self._scale_row(current_row)

        # Build historical rows if provided
        history_scaled: List[np.ndarray] = []
        if history:
            for hist_feat in history:
                h_row = self._extract_feature_row(
                    hist_feat,
                    safe_float(hist_feat.get("s1_daily_yield_pred")),
                    safe_float(hist_feat.get("s2_drop_probability")),
                )
                history_scaled.append(self._scale_row(h_row))

        # Assemble (1, 3, 11) sequence tensor
        X = self._build_sequence(current_scaled, history_scaled)

        # LSTM inference — output shape: (1, 1)
        prediction: float = float(self.model.predict(X, verbose=0).flatten()[0])
        prediction = max(0.0, prediction)  # Yield cannot be negative

        logger.debug("Stage3 — next_milking_yield=%.4f litres", prediction)
        return prediction


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

stage3_service = Stage3Service()
