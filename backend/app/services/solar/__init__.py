"""Solar data adapters — PVWatts (generation), NASA POWER (irradiance history),
Open-Meteo (irradiance forecast), and load-profile generator (residents).

Each adapter is gated behind a small interface so a real meter feed can replace
it post-pilot. See docs/PILOT_SCOPE.md §3.
"""
from .pvwatts import PVWattsAdapter
from .nasa_power import NasaPowerAdapter
from .open_meteo import OpenMeteoAdapter
from .load_profiles import generate_load_profile, RESIDENT_LOAD_ARCHETYPES

__all__ = [
    "PVWattsAdapter",
    "NasaPowerAdapter",
    "OpenMeteoAdapter",
    "generate_load_profile",
    "RESIDENT_LOAD_ARCHETYPES",
]
