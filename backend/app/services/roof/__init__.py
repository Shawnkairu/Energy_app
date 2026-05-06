"""Roof footprint adapters — Microsoft GlobalMLBuildingFootprints (auto-suggest)
plus shoelace area calc helpers. See docs/PILOT_SCOPE.md §4.
"""
from .microsoft_footprints import MicrosoftFootprintsAdapter, RoofSuggestion
from .area import polygon_area_m2

__all__ = ["MicrosoftFootprintsAdapter", "RoofSuggestion", "polygon_area_m2"]
