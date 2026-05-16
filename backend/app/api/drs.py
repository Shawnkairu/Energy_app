"""DRS endpoints — DB-backed reads; canonical scoring via project_building + calculate_drs."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.user import User
from ..repos import buildings as buildings_repo
from ..repos import prepaid as prepaid_repo
from ..services.building_drs import resolve_project_dict_for_drs
from ..services.projector import project_building

router = APIRouter(prefix="/drs", tags=["drs"])


@router.get("/{building_id}")
async def get_drs(
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

    pledged = await prepaid_repo.confirmed_total(session, bid)
    project = resolve_project_dict_for_drs(building, float(pledged))
    projected = project_building(project)
    return projected["drs"]


@router.get("/{building_id}/history")
async def drs_history(
    building_id: str,
    _: User = Depends(get_current_user),
):
    return []
