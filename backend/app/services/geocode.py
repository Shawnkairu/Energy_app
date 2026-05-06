"""Address geocoding via Nominatim (OpenStreetMap).

Free public API, no key. Per Nominatim usage policy:
  - Set a descriptive User-Agent.
  - Max 1 req/sec from a single source (we don't batch; pilot volume is fine).

For production, consider self-hosting Nominatim or paying Mapbox/Google.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)

NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "emappa-pilot/0.1 (Kenya energy coordination)"


@dataclass
class GeocodeResult:
    lat: float
    lon: float
    formatted_address: str


async def geocode(query: str) -> GeocodeResult | None:
    """Return the best match for a free-form address, or None if no match found.

    Defaults to country=Kenya for the pilot to bias toward Kenyan addresses.
    """
    params = {
        "q": query,
        "format": "json",
        "limit": "1",
        "countrycodes": "ke",
    }
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(NOMINATIM_BASE, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        if not data:
            return None
        first = data[0]
        return GeocodeResult(
            lat=float(first["lat"]),
            lon=float(first["lon"]),
            formatted_address=first.get("display_name", query),
        )
    except Exception:
        logger.exception("geocode failed for query=%r", query)
        return None
