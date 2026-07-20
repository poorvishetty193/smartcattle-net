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
        features : list | numpy.ndarray

        Returns
        -------
        float
            Predicted daily milk yield.
        """

        features = np.array(features).reshape(1, -1)

        prediction = self.model.predict(features)

        return float(prediction[0])


# Singleton instance
stage1_service = Stage1Service()