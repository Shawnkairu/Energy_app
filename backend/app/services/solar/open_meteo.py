"""Open-Meteo solar radiation adapter — free, no key, hourly forecast."""
from __future__ import annotations

import logging

import httpx

from ...config import get_settings

logger = logging.getLogger(__name__)


class OpenMeteoAdapter:
    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = base_url or get_settings().open_meteo_base

    async def get_today_irradiance(self, *, lat: float, lon: float) -> list[float]:
        """Return 24 hourly W/m² values for today (local-day at the given lat/lon)."""
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "shortwave_radiation",
            "forecast_days": 1,
            "timezone": "auto",
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(self.base_url, params=params)
                resp.raise_for_status()
                payload = resp.json()
            radiation = payload.get("hourly", {}).get("shortwave_radiation", [])
            # Open-Meteo returns 24+ values per forecast_day; trim to 24
            return [float(v) for v in radiation[:24]]
        except Exception:
            logger.exception("Open-Meteo call failed")
            return [0.0] * 24
