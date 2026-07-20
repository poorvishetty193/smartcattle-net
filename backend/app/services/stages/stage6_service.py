"""
SmartCattle Net
services/stages/stage6_service.py

Purpose
-------
Stage 6 of the CCP-Chain: Trend Analysis & Forecasting.

Algorithm : Ensemble of ARIMA(1,1,1) + Prophet (if available)
Type      : Rule-based / Statistical (No pre-trained weights from disk)

Logic (from notebook cell 30)
-----------------------------
1. Forecast horizon = 7 days.
2. Fit ARIMA(1, 1, 1) on historical daily yields.
3. Fit Prophet (if installed) on historical daily yields.
4. Final forecast = 0.5 * ARIMA + 0.5 * Prophet (if Prophet successful)
   else fallback to 1.0 * ARIMA.
5. Compute mean of the 7-day forecast.
6. Calculate trend slope via linear regression (np.polyfit degree 1)
   on the 7-day forecast array.
7. Classify trend direction:
   - slope > 0.05  → 1  (increasing)
   - slope < -0.05 → -1 (decreasing)
   - otherwise     → 0  (stable)

Outputs
-------
- s6_forecast_7d_mean : float
- s6_trend_slope      : float
- s6_trend_direction  : int

Dependencies
------------
- statsmodels
- prophet (optional)
- numpy, pandas
- app.utils.logger
"""

from __future__ import annotations

import warnings
from typing import Dict, List, Union

import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tools.sm_exceptions import ConvergenceWarning

from app.utils.logger import get_logger

logger = get_logger(__name__)

# Attempt to import Prophet
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    logger.info("Prophet is not installed. Stage 6 will use ARIMA only.")

FORECAST_HORIZON: int = 7


class Stage6Service:
    """
    Stage 6: Trend Analysis & Forecasting.
    
    Dynamically fits statistical models (ARIMA and optionally Prophet) 
    on the cow's historical yield sequence to project the next 7 days.
    """

    def __init__(self) -> None:
        logger.info(
            "Stage6Service initialised — ensemble ARIMA+Prophet (Prophet=%s).",
            PROPHET_AVAILABLE,
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _run_arima(self, yield_series: np.ndarray) -> np.ndarray:
        """Fit ARIMA(1,1,1) and forecast 7 days."""
        try:
            # Suppress statsmodels warnings for short/flat series
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", ConvergenceWarning)
                warnings.filterwarnings("ignore", message="Non-stationary")
                warnings.filterwarnings("ignore", message="Non-invertible")
                
                model = ARIMA(yield_series, order=(1, 1, 1))
                fit_model = model.fit()
                forecast = fit_model.forecast(steps=FORECAST_HORIZON)
            return forecast
        except Exception as exc:
            logger.warning("ARIMA failed: %s. Using naive fallback.", exc)
            last_val = yield_series[-1] if len(yield_series) > 0 else 0.0
            return np.full(FORECAST_HORIZON, last_val)

    def _run_prophet(self, yield_series: np.ndarray) -> Union[np.ndarray, None]:
        """Fit Prophet and forecast 7 days."""
        if not PROPHET_AVAILABLE or len(yield_series) < 4:
            return None

        try:
            # Prophet requires a 'ds' date column. We generate dummy dates 
            # ending at today, just to satisfy the API.
            today = pd.Timestamp.today()
            dates = pd.date_range(end=today, periods=len(yield_series), freq="D")
            
            df = pd.DataFrame({
                "ds": dates,
                "y": yield_series
            })
            
            # Notebook settings
            m = Prophet(
                daily_seasonality=False,
                weekly_seasonality=True,
                yearly_seasonality=False,
            )
            # Suppress cmdstanpy output if possible
            import logging
            logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
            
            m.fit(df)
            future = m.make_future_dataframe(periods=FORECAST_HORIZON)
            forecast_df = m.predict(future)
            
            forecast = forecast_df["yhat"].values[-FORECAST_HORIZON:]
            return forecast
        except Exception as exc:
            logger.warning("Prophet failed: %s.", exc)
            return None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(
        self,
        history_yields: List[float],
        current_yield: float,
    ) -> Dict[str, Union[float, int]]:
        """
        Run Stage 6 forecasting and trend analysis.

        Parameters
        ----------
        history_yields : list of float
            Historical daily yields (older to newer) prior to the current session.
        current_yield : float
            The most recent/current daily yield.

        Returns
        -------
        dict with keys:
            - s6_forecast_7d_mean : float
            - s6_trend_slope      : float
            - s6_trend_direction  : int (-1, 0, or 1)
        """
        # Combine history with current yield
        full_series = history_yields + [current_yield]
        yield_arr = np.array(full_series, dtype=np.float64)

        if len(yield_arr) == 0:
            yield_arr = np.array([0.0])

        # 1. ARIMA forecast
        arima_forecast = self._run_arima(yield_arr)
        
        # 2. Prophet forecast
        prophet_forecast = self._run_prophet(yield_arr)

        # 3. Ensemble
        if prophet_forecast is not None:
            final_forecast = 0.5 * arima_forecast + 0.5 * prophet_forecast
        else:
            final_forecast = arima_forecast

        # 4. Metrics
        forecast_mean = float(np.mean(final_forecast))
        
        # Trend slope using linear regression (polyfit degree 1)
        # polyfit returns [slope, intercept]
        slope = np.polyfit(range(len(final_forecast)), final_forecast, 1)[0]
        
        # Trend direction
        if slope > 0.05:
            direction = 1
        elif slope < -0.05:
            direction = -1
        else:
            direction = 0

        logger.debug(
            "Stage6 — mean=%.4f slope=%.4f dir=%d", 
            forecast_mean, slope, direction
        )
        
        return {
            "s6_forecast_7d_mean": forecast_mean,
            "s6_trend_slope": float(slope),
            "s6_trend_direction": direction,
        }


# ---------------------------------------------------------------------------
# Singleton instance
# ---------------------------------------------------------------------------

stage6_service = Stage6Service()
