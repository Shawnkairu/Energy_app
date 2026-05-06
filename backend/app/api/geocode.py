"""Geocoding endpoint — address → lat/lon via Nominatim (OpenStreetMap)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from ..middleware.jwt import get_current_user
from ..models.user import User
from ..services.geocode import geocode

router = APIRouter(prefix="/geocode", tags=["geocode"])


@router.get("")
async def geocode_address(
    q: str,
    _: User = Depends(get_current_user),
):
    if not q or len(q.strip()) < 3:
        raise HTTPException(status_code=400, detail="query_too_short")
    result = await geocode(q.strip())
    if result is None:
        raise HTTPException(status_code=404, detail="no_match")
    return {
        "lat": result.lat,
        "lon": result.lon,
        "formattedAddress": result.formatted_address,
    }
