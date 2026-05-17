"""Financier endpoints — portfolio + capital pledge."""
from __future__ import annotations

import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.financier import FinancierPosition
from ..models.user import User
from ..repos import financiers as financiers_repo
from ..repos import wallet as wallet_repo

router = APIRouter(prefix="/financiers", tags=["financiers"])


def _serialize(p: FinancierPosition) -> dict:
    return {
        "buildingId": str(p.building_id),
        "committedKes": float(p.committed_kes),
        "deployedKes": float(p.deployed_kes),
        "returnsToDateKes": float(p.returns_to_date_kes),
        "irrPct": float(p.irr_pct),
        "milestonesHit": p.milestones_hit or [],
    }


@router.get("/{user_id}/portfolio")
async def portfolio(
    user_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if user.role != "financier" or str(user.id) != user_id:
        raise HTTPException(status_code=403, detail="not_your_portfolio")
    positions = await financiers_repo.list_for_financier(session, uuid.UUID(user_id))
    return [_serialize(p) for p in positions]


class PledgeCapitalBody(BaseModel):
    building_id: str = Field(alias="buildingId")
    amount_kes: float = Field(alias="amountKes", gt=0)

    model_config = ConfigDict(populate_by_name=True)


@router.post("/{user_id}/pledge-capital")
async def pledge_capital(
    user_id: str,
    body: PledgeCapitalBody,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if user.role != "financier" or str(user.id) != user_id:
        raise HTTPException(status_code=403, detail="not_your_capital")
    try:
        bid = uuid.UUID(body.building_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid_building_id")
    position = await financiers_repo.upsert_pledge(
        session,
        financier_user_id=user.id,
        building_id=bid,
        additional_kes=Decimal(str(body.amount_kes)),
    )
    # Pilot: simulation=true on the resulting record (no real deployment)
    await wallet_repo.record(
        session,
        user_id=user.id,
        kind="capital_deploy",
        amount_kes=Decimal(f"-{body.amount_kes}"),
        reference=f"Capital pledged to {body.building_id}",
    )
    await session.commit()
    return {"position": _serialize(position)}
