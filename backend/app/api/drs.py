"""DRS endpoints — DB-backed reads. Heuristic scoring; full projector wiring TBD."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.user import User
from ..repos import buildings as buildings_repo
from ..repos import prepaid as prepaid_repo

router = APIRouter(prefix="/drs", tags=["drs"])


async def _compute_drs(session: AsyncSession, bid: uuid.UUID) -> dict:
    building = await buildings_repo.get(session, bid)
    if building is None:
        raise HTTPException(status_code=404, detail="building_not_found")
    pledged = await prepaid_repo.confirmed_total(session, bid)
    score = 0.65
    blockers: list[str] = []
    if float(pledged) <= 0:
        blockers.append("No resident pledges yet")
        score -= 0.2
    if not building.roof_polygon_geojson:
        blockers.append("Roof polygon not captured")
        score -= 0.1
    # Roof-area / kWp budget (5.5 m²/kWp). 0 area is an unconditional review.
    if not building.roof_area_m2:
        blockers.append("Roof area unknown — confirm roof during onboarding")
    score = max(0.0, min(1.0, score))
    decision = "approve" if score >= 0.7 else "review" if score >= 0.4 else "block"
    return {
        "score": round(score, 2),
        "decision": decision,
        "reasons": blockers,
        "components": {
            "demandCoverage": 0.5 if float(pledged) > 0 else 0.0,
            "prepaidCommitment": min(1.0, float(pledged) / 5000),
            "loadProfile": 0.7,
            "installationReadiness": 0.6,
            "installerReadiness": 0.7,
            "capitalAlignment": 0.6,
        },
    }


@router.get("/{building_id}")
async def get_drs(
    building_id: str,
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        bid = uuid.UUID(building_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid_building_id")
    return await _compute_drs(session, bid)


@router.get("/{building_id}/history")
async def drs_history(
    building_id: str,
    _: User = Depends(get_current_user),
):
    return []
