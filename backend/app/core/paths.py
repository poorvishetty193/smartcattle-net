from pathlib import Path

# Project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Main directories
MODEL_DIR = BASE_DIR.parent / "ai" / "models"
DATA_DIR = BASE_DIR / "data"
LOG_DIR = BASE_DIR / "logs"

# Model stage directories
STAGE1_DIR = MODEL_DIR / "stage1"
STAGE2_DIR = MODEL_DIR / "stage2"
STAGE3_DIR = MODEL_DIR / "stage3"
STAGE4_DIR = MODEL_DIR / "stage4"
STAGE5_DIR = MODEL_DIR / "stage5"
STAGE8_DIR = MODEL_DIR / "stage8"
STAGE11_DIR = MODEL_DIR / "stage11"
STAGE12_DIR = MODEL_DIR / "stage12"

# Other directories
PREPROCESSING_DIR = MODEL_DIR / "preprocessing"
CONFIG_DIR = MODEL_DIR / "config"

# Create directories if they don't exist
for folder in (
    MODEL_DIR,
    DATA_DIR,
    LOG_DIR,
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
):
    folder.mkdir(parents=True, exist_ok=True)