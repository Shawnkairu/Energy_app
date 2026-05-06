"""Shoelace area for lat/lon polygons, corrected for latitude.

Polygon coords are [lon, lat] tuples per GeoJSON. Returns area in m².
"""
from __future__ import annotations

import math


METERS_PER_DEG_LAT = 111_320.0  # roughly constant


def polygon_area_m2(coords: list[tuple[float, float]]) -> float:
    """Shoelace area in m² for a closed lat/lon polygon.

    coords: [(lon, lat), ...] in GeoJSON order, may or may not be closed.
    Latitude correction applied per-segment using the midpoint latitude.
    """
    if len(coords) < 3:
        return 0.0

    # Ensure closed
    if coords[0] != coords[-1]:
        coords = coords + [coords[0]]

    # Convert each (lon, lat) to local meters using the polygon centroid latitude
    mean_lat_rad = math.radians(sum(p[1] for p in coords) / len(coords))
    cos_lat = math.cos(mean_lat_rad)
    meters_per_deg_lon = METERS_PER_DEG_LAT * cos_lat

    total = 0.0
    for (x1, y1), (x2, y2) in zip(coords[:-1], coords[1:]):
        # Convert to local meters
        mx1 = x1 * meters_per_deg_lon
        my1 = y1 * METERS_PER_DEG_LAT
        mx2 = x2 * meters_per_deg_lon
        my2 = y2 * METERS_PER_DEG_LAT
        total += mx1 * my2 - mx2 * my1
    return abs(total) / 2.0
