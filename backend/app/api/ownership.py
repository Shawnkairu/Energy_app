"""Ownership endpoints — pilot pass-through using FinancierPosition snapshot."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.user import User
from ..repos import financiers as financiers_repo

router = APIRouter(prefix="/ownership", tags=["ownership"])


@router.get("/{building_id}/{side}")
async def get_ownership(
    building_id: str,
    side: str,
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if side not in {"provider", "financier", "resident", "homeowner"}:
        raise HTTPException(status_code=400, detail="invalid_side")
    # Pilot scope: only financier positions are stored explicitly.
    # Provider/resident shares ride on FinancierPosition-style records that the
    # post-pilot ownership ledger will manage.
    return []
