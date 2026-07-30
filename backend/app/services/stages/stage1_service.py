"""
SmartCattle Net
Stage 1 - Daily Milk Yield Prediction

Algorithm:
XGBoost Regressor
"""

import numpy as np

from app.services.loaders.model_loader import model_loader


class Stage1Service:
    """
    Stage 1:
    Predict daily milk yield.
    """

    def __init__(self):
        self.model = model_loader.get("stage1")

    def predict(self, features):
        """
        Parameters
        ----------
        features : dict
            Dictionary containing the Stage 1 input features.

        Returns
        -------
        dict
            {
                "s1_daily_yield_pred": float
            }
        """

        if not isinstance(features, dict):
            raise TypeError(
                f"Expected features to be dict, got {type(features).__name__}"
            )

        # Convert dictionary values into a feature vector
        feature_vector = list(features.values())

        # Convert to NumPy array with shape (1, n_features)
        X = np.array(feature_vector, dtype=float).reshape(1, -1)

        # Predict
        prediction = self.model.predict(X)

        return {
            "s1_daily_yield_pred": float(prediction[0])
        }


# Singleton instance
stage1_service = Stage1Service()