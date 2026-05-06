"""NREL PVWatts v8 adapter — hourly AC generation per array.

Returns 8,760 hourly kWh values for a typical meteorological year (TMY) given
location + array parameters. Falls back to a deterministic synthetic curve if
the NREL API is unreachable so dev work is never blocked.
"""
from __future__ import annotations

import logging
import math
from typing import Any

import httpx

from ...config import get_settings

logger = logging.getLogger(__name__)


class PVWattsAdapter:
    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        settings = get_settings()
        self.api_key = api_key or settings.nrel_api_key
        self.base_url = base_url or settings.nrel_pvwatts_base

    async def get_hourly_kwh(
        self,
        *,
        lat: float,
        lon: float,
        kw: float,
        tilt_deg: float | None = None,
        azimuth_deg: float = 180.0,
    ) -> list[float]:
        """Return 8760 hourly AC kWh values."""
        # Default tilt to latitude if not provided.
        tilt = tilt_deg if tilt_deg is not None else abs(lat)

        params: dict[str, Any] = {
            "api_key": self.api_key,
            "lat": lat,
            "lon": lon,
            "system_capacity": kw,
            "module_type": 0,           # standard
            "losses": 14,               # default total losses %
            "array_type": 1,            # fixed roof-mount
            "tilt": tilt,
            "azimuth": azimuth_deg,
            "timeframe": "hourly",
            "dataset": "intl",          # international dataset (covers Kenya)
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(self.base_url, params=params)
                resp.raise_for_status()
                data = resp.json()
            ac_wh = data.get("outputs", {}).get("ac", [])
            if not ac_wh or len(ac_wh) < 8000:
                logger.warning(
                    "PVWatts returned %d hours; falling back to synthetic", len(ac_wh)
                )
                return _synthetic_hourly(lat, kw)
            return [float(v) / 1000.0 for v in ac_wh]
        except Exception:
            logger.exception("PVWatts call failed; using synthetic fallback")
            return _synthetic_hourly(lat, kw)


def _synthetic_hourly(lat: float, kw: float) -> list[float]:
    """Deterministic fallback curve: sine-of-sun-elevation approximation.

    Produces 8760 hours assuming year starts at hour 0 of Jan 1. The curve is
    crude (no seasonal tilt, no clouds) but matches the order of magnitude an
    8 kWp Kenyan rooftop produces (~12 MWh/year for typical sites).
    """
    out: list[float] = []
    # Very rough sun-elevation proxy by hour-of-day.
    for hour in range(8760):
        hod = hour % 24
        # 0 at night (0-6, 18-24), peak at noon
        if hod < 6 or hod >= 18:
            out.append(0.0)
            continue
        # bell shape from 6 to 18
        x = (hod - 6) / 12.0  # 0..1
        intensity = math.sin(x * math.pi)  # peak at noon
        # Scale by capacity. Kenya's NSRDB equivalent is ~5.5 kWh/kW/day baseline.
        # Daily total target: kw * 5.5 kWh; integral of sin over [0,pi] = 2.
        # So scale = kw * 5.5 / (12 hours * mean(sin)). mean(sin) over [0,pi] = 2/pi.
        # Per-hour value at intensity i: i * (kw * 5.5 / (12 * (2/pi))) = i * kw * 5.5 * pi / 24
        per_hour = intensity * kw * 5.5 * math.pi / 24.0
        out.append(round(per_hour, 4))
    return out
