"""Energy time-series endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.energy import EnergyReading
from ..models.user import User
from ..repos import energy as energy_repo

router = APIRouter(prefix="/energy", tags=["energy"])


def _serialize(r: EnergyReading) -> dict:
    return {
        "buildingId": str(r.building_id),
        "timestamp": r.timestamp.isoformat() if r.timestamp else None,
        "kind": r.kind,
        "value": float(r.value),
        "unit": r.unit,
        "source": r.source,
        "provenance": r.provenance,
    }


@router.get("/{building_id}/series")
async def series(
    building_id: str,
    kind: str,
    from_: str | None = None,
    to: str | None = None,
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        bid = uuid.UUID(building_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid_building_id")
    if kind not in ("generation", "load", "irradiance"):
        raise HTTPException(status_code=400, detail="invalid_kind")
    start = datetime.fromisoformat(from_) if from_ else datetime(1970, 1, 1)
    end = datetime.fromisoformat(to) if to else datetime.utcnow()
    rows = await energy_repo.series(session, bid, kind=kind, start=start, end=end)
    return [_serialize(r) for r in rows]


@router.get("/{building_id}/today")
async def today(
    building_id: str,
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        bid = uuid.UUID(building_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid_building_id")
    return await energy_repo.today_summary(session, bid)
