from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # -------------------------------------------------
    # Application
    # -------------------------------------------------
    PROJECT_NAME: str = "SmartCattle Net"
    APP_NAME: str = PROJECT_NAME
    API_VERSION: str = "v1"

    # -------------------------------------------------
    # Database
    # -------------------------------------------------
    DATABASE_URL: str = ""

    # -------------------------------------------------
    # Security
    # -------------------------------------------------
    JWT_SECRET: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # -------------------------------------------------
    # External APIs
    # -------------------------------------------------
    GOOGLE_API_KEY: str = ""

    # -------------------------------------------------
    # Load environment variables
    # -------------------------------------------------
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()