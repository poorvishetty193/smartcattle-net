from pathlib import Path

# Backend directory
BACKEND_DIR = Path(__file__).resolve().parents[2]

# Project root
PROJECT_ROOT = BACKEND_DIR.parent

# AI folder
AI_DIR = PROJECT_ROOT / "ai"

# Models
MODELS_DIR = AI_DIR / "models"

# Stage folders
STAGE1_DIR = MODELS_DIR / "stage1"
STAGE2_DIR = MODELS_DIR / "stage2"
STAGE3_DIR = MODELS_DIR / "stage3"
STAGE4_DIR = MODELS_DIR / "stage4"
STAGE5_DIR = MODELS_DIR / "stage5"
STAGE6_DIR = MODELS_DIR / "stage6"
STAGE7_DIR = MODELS_DIR / "stage7"
STAGE8_DIR = MODELS_DIR / "stage8"
STAGE9_DIR = MODELS_DIR / "stage9"
STAGE10_DIR = MODELS_DIR / "stage10"
STAGE11_DIR = MODELS_DIR / "stage11"
STAGE12_DIR = MODELS_DIR / "stage12"

PREPROCESSING_DIR = MODELS_DIR / "preprocessing"
CONFIG_DIR = MODELS_DIR / "config"