"""NASA POWER adapter — historical hourly irradiance for any lat/lon."""
from __future__ import annotations

import logging
from datetime import date

import httpx

from ...config import get_settings

logger = logging.getLogger(__name__)


class NasaPowerAdapter:
    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = base_url or get_settings().nasa_power_base

    async def get_hourly_ghi(
        self,
        *,
        lat: float,
        lon: float,
        start: date,
        end: date,
    ) -> list[float]:
        """Hourly Global Horizontal Irradiance (W/m²). Returns flat list ordered by time."""
        params = {
            "parameters": "ALLSKY_SFC_SW_DWN",
            "community": "RE",
            "longitude": lon,
            "latitude": lat,
            "start": start.strftime("%Y%m%d"),
            "end": end.strftime("%Y%m%d"),
            "format": "JSON",
        }
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.get(self.base_url, params=params)
                resp.raise_for_status()
                payload = resp.json()
            series = (
                payload.get("properties", {})
                .get("parameter", {})
                .get("ALLSKY_SFC_SW_DWN", {})
            )
            return [float(v) for v in series.values() if isinstance(v, (int, float))]
        except Exception:
            logger.exception("NASA POWER call failed")
            return []
