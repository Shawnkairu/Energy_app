"""Resident load profile generator — deterministic per resident_id.

Four archetypes from Simulation/files/customers.py, lifted into the backend.
Each archetype has a 24-hour shape vector (sums to 1.0). Daily kWh totals are
randomized at sigma=15% but seeded by resident_id+day so simulations are
reproducible.
"""
from __future__ import annotations

import hashlib
import math
import random
from typing import TypedDict


class LoadArchetype(TypedDict):
    name: str
    daily_kwh_mean: float
    shape: list[float]  # 24 values, sums to 1.0


def _morning_evening_shape(morning_peak: float, evening_peak: float) -> list[float]:
    """Build a 24-element shape vector with two gaussian peaks."""
    raw = []
    for h in range(24):
        morning = math.exp(-((h - 7.0) ** 2) / 4.0) * morning_peak
        evening = math.exp(-((h - 20.0) ** 2) / 6.0) * evening_peak
        baseline = 0.05  # always-on idle
        raw.append(morning + evening + baseline)
    total = sum(raw)
    return [v / total for v in raw]


def _daytime_shape() -> list[float]:
    """Microbiz shape: daytime + evening."""
    raw = []
    for h in range(24):
        daytime = math.exp(-((h - 13.0) ** 2) / 14.0) * 1.2 if 7 <= h <= 19 else 0.0
        evening = math.exp(-((h - 20.0) ** 2) / 5.0) * 0.6
        baseline = 0.1
        raw.append(daytime + evening + baseline)
    total = sum(raw)
    return [v / total for v in raw]


RESIDENT_LOAD_ARCHETYPES: dict[str, LoadArchetype] = {
    "basic_lighting": {
        "name": "basic_lighting",
        "daily_kwh_mean": 2.2,
        "shape": _morning_evening_shape(0.2, 1.0),
    },
    "lighting_tv": {
        "name": "lighting_tv",
        "daily_kwh_mean": 4.5,
        "shape": _morning_evening_shape(0.4, 1.0),
    },
    "emerging_appliance": {
        "name": "emerging_appliance",
        "daily_kwh_mean": 9.0,
        "shape": _morning_evening_shape(1.0, 1.0),
    },
    "microbiz_kiosk": {
        "name": "microbiz_kiosk",
        "daily_kwh_mean": 16.0,
        "shape": _daytime_shape(),
    },
}


def generate_load_profile(
    *, archetype: str, resident_id: str, day_index: int, sigma: float = 0.15
) -> list[float]:
    """Return 24 hourly kWh values for one day for one resident.

    Deterministic given (archetype, resident_id, day_index) — same inputs
    produce same outputs. Used in seeding and any time we need a synthetic
    load curve.
    """
    arc = RESIDENT_LOAD_ARCHETYPES[archetype]
    seed_str = f"{archetype}:{resident_id}:{day_index}"
    seed_int = int(hashlib.sha256(seed_str.encode()).hexdigest()[:16], 16)
    rng = random.Random(seed_int)
    daily_total = arc["daily_kwh_mean"] * (1.0 + rng.gauss(0, sigma))
    daily_total = max(daily_total, 0.0)
    return [round(daily_total * frac, 4) for frac in arc["shape"]]
