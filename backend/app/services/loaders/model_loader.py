"""
SmartCattle Net
Model Loader

Loads all trained ML models during application startup.
"""

from pathlib import Path
import joblib
import tensorflow as tf

from app.core.paths import (
    STAGE1_DIR,
    STAGE2_DIR,
    STAGE3_DIR,
    STAGE4_DIR,
    STAGE5_DIR,
    STAGE8_DIR,
    STAGE11_DIR,
    STAGE12_DIR,
    PREPROCESSING_DIR,
    CONFIG_DIR,
)

import json


class ModelLoader:
    """
    Singleton class that loads every trained model once.
    """

    def __init__(self):

        self.models = {}

        self.load_models()

    def load_models(self):

        print("Loading SmartCattle models...")

        # ---------- Stage 1 ----------
        self.models["stage1"] = joblib.load(
            STAGE1_DIR / "model_s1_xgboost_daily_yield.pkl"
        )

        # ---------- Stage 2 ----------
        self.models["stage2"] = joblib.load(
            STAGE2_DIR / "model_s2_lgbm_drop.pkl"
        )

        self.models["stage2_threshold"] = joblib.load(
            STAGE2_DIR / "model_s2_threshold.pkl"
        )

        # ---------- Stage 3 ----------
        self.models["stage3"] = tf.keras.models.load_model(
            STAGE3_DIR / "model_s3_lstm.keras"
        )

        # ---------- Stage 4 ----------
        self.models["stage4"] = joblib.load(
            STAGE4_DIR / "model_s4_rf_msi.pkl"
        )

        # ---------- Stage 5 ----------
        self.models["stage5"] = joblib.load(
            STAGE5_DIR / "model_s5_ridge_quantity.pkl"
        )

        # ---------- Stage 8 ----------
        self.models["stage8"] = joblib.load(
            STAGE8_DIR / "model_s8_gbc_stress.pkl"
        )

        # ---------- Stage 11 ----------
        self.models["stage11"] = joblib.load(
            STAGE11_DIR / "model_s11_stacking_health.pkl"
        )

        # ---------- Stage 12 ----------
        self.models["stage12"] = joblib.load(
            STAGE12_DIR / "model_s12_isolation_forest_risk.pkl"
        )

        # ---------- Preprocessing ----------
        self.models["scaler"] = joblib.load(
            PREPROCESSING_DIR / "robust_scaler.pkl"
        )

        self.models["imputer"] = joblib.load(
            PREPROCESSING_DIR / "knn_imputer.pkl"
        )

        self.models["poly"] = joblib.load(
            PREPROCESSING_DIR / "poly_features_s5.pkl"
        )

        # ---------- Config ----------
        with open(CONFIG_DIR / "model_config.json", "r") as f:
            self.models["config"] = json.load(f)

        print("All SmartCattle models loaded successfully.")

    def get(self, name):

        return self.models.get(name)


# Singleton Instance
model_loader = ModelLoader()