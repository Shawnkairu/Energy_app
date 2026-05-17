"""Buildings endpoints — create + roof capture + suggest."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.building import Building
from ..models.user import User
from ..repos import buildings as buildings_repo
from ..repos import users as users_repo
from ..services.roof import MicrosoftFootprintsAdapter, polygon_area_m2

router = APIRouter(prefix="/buildings", tags=["buildings"])


def _serialize(b: Building) -> dict:
    return {
        "id": str(b.id),
        "name": b.name,
        "address": b.address,
        "lat": float(b.lat),
        "lon": float(b.lon),
        "unitCount": b.unit_count,
        "occupancy": float(b.occupancy) if b.occupancy is not None else None,
        "kind": b.kind,
        "stage": b.stage,
        "roofAreaM2": float(b.roof_area_m2) if b.roof_area_m2 is not None else None,
        "roofPolygonGeojson": b.roof_polygon_geojson,
        "roofSource": b.roof_source,
        "roofConfidence": float(b.roof_confidence) if b.roof_confidence is not None else None,
        "dataSource": b.data_source,
        "inviteCode": b.invite_code,
        "createdAt": (b.created_at or datetime.utcnow()).isoformat(),
        "updatedAt": (b.updated_at or datetime.utcnow()).isoformat(),
    }


class CreateBuildingBody(BaseModel):
    name: str
    address: str
    lat: float
    lon: float
    unit_count: int = Field(alias="unitCount", ge=1)
    occupancy: float | None = None
    kind: str = "apartment"

    model_config = ConfigDict(populate_by_name=True)


@router.post("")
async def create_building(
    body: CreateBuildingBody,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if user.role not in {"building_owner", "homeowner"}:
        raise HTTPException(status_code=403, detail="role_not_permitted")

    # Homeowner constraint: kind=single_family, unit_count=1, regardless of body
    kind = body.kind
    unit_count = body.unit_count
    if user.role == "homeowner":
        kind = "single_family"
        unit_count = 1

    building = await buildings_repo.create(
        session,
        name=body.name,
        address=body.address,
        lat=body.lat,
        lon=body.lon,
        unit_count=unit_count,
        occupancy=body.occupancy,
        kind=kind,
        stage="listed",
    )
    # Link the user to the building
    if user.building_id is None:
        from sqlalchemy import update as sa_update

        from ..models.user import User as UserModel

        await session.execute(
            sa_update(UserModel).where(UserModel.id == user.id).values(building_id=building.id)
        )

    await session.commit()
    return {"building": _serialize(building)}


class SetRoofBody(BaseModel):
    polygon_geojson: dict[str, Any] | None = Field(default=None, alias="polygonGeojson")
    area_m2: float | None = Field(default=None, alias="areaM2")
    source: str

    model_config = ConfigDict(populate_by_name=True)


@router.post("/{building_id}/roof")
async def set_roof(
    building_id: str,
    body: SetRoofBody,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        bid = uuid.UUID(building_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid_building_id")

    if user.role not in {"building_owner", "homeowner"} or user.building_id != bid:
        raise HTTPException(status_code=403, detail="not_your_building")

    if body.source not in ("microsoft_footprints", "owner_traced", "owner_typed"):
        raise HTTPException(status_code=400, detail="invalid_source")

    # Compute area from polygon if polygon supplied without explicit area
    area = body.area_m2
    if body.polygon_geojson and area is None:
        try:
            ring = body.polygon_geojson["coordinates"][0]
            area = polygon_area_m2([(c[0], c[1]) for c in ring])
        except (KeyError, IndexError, TypeError):
            raise HTTPException(status_code=400, detail="invalid_polygon")

    confidence_map = {
        "microsoft_footprints": 0.55,
        "owner_traced": 0.85,
        "owner_typed": 0.4,
    }

    building = await buildings_repo.update_roof(
        session,
        bid,
        polygon_geojson=body.polygon_geojson,
        area_m2=area,
        source=body.source,
        confidence=confidence_map[body.source],
    )
    await session.commit()
    if building is None:
        raise HTTPException(status_code=404, detail="building_not_found")
    return {"building": _serialize(building)}


@router.get("/{building_id}/roof/suggest")
async def suggest_roof(
    building_id: str,
    lat: float,
    lon: float,
    _: User = Depends(get_current_user),
):
    adapter = MicrosoftFootprintsAdapter()
    suggestion = await adapter.suggest(lat=lat, lon=lon)
    if suggestion is None:
        return {"available": False}
    return {
        "polygonGeojson": suggestion.polygon_geojson,
        "areaM2": suggestion.area_m2,
        "confidence": suggestion.confidence,
    }
