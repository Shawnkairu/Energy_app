"""Microsoft GlobalMLBuildingFootprints adapter.

For the pilot we ship a working stub: given a lat/lon, produce a plausible
square polygon centered on the point with a heuristic edge length. When
network access to the Microsoft static dataset is set up post-pilot, swap
the stub for the real quadkey lookup.

This means the auto-suggest flow ALWAYS returns *something* — the owner
either confirms it ("Looks right") or redraws. No flow gets blocked by
network unavailability.
"""
from __future__ import annotations

import logging
import math
from dataclasses import dataclass
from typing import Any

from .area import polygon_area_m2

logger = logging.getLogger(__name__)


@dataclass
class RoofSuggestion:
    polygon_geojson: dict[str, Any]
    area_m2: float
    confidence: float


class MicrosoftFootprintsAdapter:
    async def suggest(self, *, lat: float, lon: float) -> RoofSuggestion | None:
        """Return a polygon suggestion for the building containing (lat, lon).

        Pilot stub: produces a 12 m × 10 m rectangle centered on the point.
        Confidence intentionally moderate (0.55) so the UX nudges the owner
        to confirm or redraw rather than blindly accepting.
        """
        # 12m east-west × 10m north-south rectangle
        # 1 deg lat ≈ 111,320 m; 1 deg lon ≈ 111,320 * cos(lat) m
        d_lat_half = 5.0 / 111_320.0  # 5 m
        cos_lat = max(math.cos(math.radians(lat)), 1e-6)
        d_lon_half = 6.0 / (111_320.0 * cos_lat)  # 6 m

        coords = [
            [lon - d_lon_half, lat - d_lat_half],
            [lon + d_lon_half, lat - d_lat_half],
            [lon + d_lon_half, lat + d_lat_half],
            [lon - d_lon_half, lat + d_lat_half],
            [lon - d_lon_half, lat - d_lat_half],
        ]
        polygon = {"type": "Polygon", "coordinates": [coords]}
        area = polygon_area_m2([(c[0], c[1]) for c in coords])

        return RoofSuggestion(
            polygon_geojson=polygon,
            area_m2=round(area, 1),
            confidence=0.55,
        )
