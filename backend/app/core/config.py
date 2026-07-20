from pydantic_settings import BaseSettings

class Settings(BaseSettings):

    APP_NAME: str = "SmartCattle Net"

    API_VERSION: str = "v1"

    DATABASE_URL: str = ""

    GOOGLE_API_KEY: str = ""

    JWT_SECRET: str = ""

    class Config:
        env_file = ".env"

settings = Settings()