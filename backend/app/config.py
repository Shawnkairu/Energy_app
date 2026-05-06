from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "e.mappa API"
    database_url: str = "postgresql+asyncpg://emappa:emappa@localhost:5432/emappa"
    jwt_secret: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:8081", "http://localhost:19006"]

    model_config = SettingsConfigDict(env_file=".env", env_prefix="EMAPPA_")


@lru_cache
def get_settings() -> Settings:
    return Settings()
