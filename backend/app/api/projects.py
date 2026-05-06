"""Projects endpoints — list and detail.

Returns ProjectedBuilding-shape rows. Pilot: data is sourced from the buildings
table; DRS and projector wiring lands in a follow-up commit (currently surfaces
raw building info plus pledged_total).
"""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.user import User
from ..repos import buildings as buildings_repo
from ..repos import prepaid as prepaid_repo

router = APIRouter(prefix="/projects", tags=["projects"])


async def _serialize_with_pledged(session: AsyncSession, building) -> dict:
    pledged = await prepaid_repo.confirmed_total(session, building.id)
    return {
        "id": str(building.id),
        "name": building.name,
        "address": building.address,
        "lat": float(building.lat),
        "lon": float(building.lon),
        "unitCount": building.unit_count,
        "occupancy": float(building.occupancy) if building.occupancy is not None else None,
        "kind": building.kind,
        "stage": building.stage,
        "roofAreaM2": float(building.roof_area_m2) if building.roof_area_m2 is not None else None,
        "roofPolygonGeojson": building.roof_polygon_geojson,
        "roofSource": building.roof_source,
        "roofConfidence": float(building.roof_confidence) if building.roof_confidence is not None else None,
        "dataSource": building.data_source,
        "prepaidCommittedKes": float(pledged),
        "createdAt": (building.created_at or datetime.utcnow()).isoformat(),
        "updatedAt": (building.updated_at or datetime.utcnow()).isoformat(),
    }


@router.get("")
async def list_projects(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    rows = await buildings_repo.list_all(session)

    # Scope: residents/homeowners/building_owners see only their own building.
    # Other roles see the full portfolio (provider/electrician/financier need it
    # for Discover; admin needs it for the cockpit).
    if user.role in {"resident", "homeowner", "building_owner"} and user.building_id:
        rows = [r for r in rows if r.id == user.building_id]

    return [await _serialize_with_pledged(session, b) for b in rows]


@router.get("/{building_id}")
async def get_project(
    building_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        bid = uuid.UUID(building_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid_building_id")
    building = await buildings_repo.get(session, bid)
    if building is None:
        raise HTTPException(status_code=404, detail="building_not_found")
    if user.role in {"resident", "homeowner", "building_owner"} and user.building_id != bid:
        raise HTTPException(status_code=403, detail="not_your_building")
    return await _serialize_with_pledged(session, building)
