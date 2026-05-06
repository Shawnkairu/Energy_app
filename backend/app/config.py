from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "e.mappa API"
    database_url: str = "postgresql+asyncpg://emappa:emappa@localhost:5432/emappa"
    jwt_secret: str = "dev-only-change-me"
    jwt_algorithm: str = "HS256"
    jwt_ttl_hours: int = 24
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:8081", "http://localhost:19006"]

    # Email OTP (Resend)
    resend_api_key: str = ""
    resend_from: str = "auth@emappa.test"
    allow_dev_otp_console: bool = True

    # Admin allowlist — only these emails may be granted admin via grant_admin.py
    admin_emails: str = "admin@emappa.test"

    # External data adapters
    nrel_pvwatts_base: str = "https://developer.nrel.gov/api/pvwatts/v8.json"
    nrel_api_key: str = "DEMO_KEY"
    nasa_power_base: str = "https://power.larc.nasa.gov/api/temporal/hourly/point"
    open_meteo_base: str = "https://api.open-meteo.com/v1/forecast"
    ms_footprints_base: str = "https://minedbuildings.z5.web.core.windows.net"
    google_maps_static_key: str = ""

    # Dev-only seed switch
    dev_seed: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_prefix="EMAPPA_")


@lru_cache
def get_settings() -> Settings:
    return Settings()
