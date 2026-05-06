"""Settlement endpoints — pilot mode runs always tag simulation=true."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user, require_admin
from ..models.settlement import SettlementPeriod
from ..models.user import User
from ..repos import buildings as buildings_repo
from ..repos import prepaid as prepaid_repo
from ..repos import settlement as settlement_repo

router = APIRouter(prefix="/settlement", tags=["settlement"])


def _serialize(p: SettlementPeriod) -> dict:
    return {
        "id": str(p.id),
        "buildingId": str(p.building_id),
        "periodStart": p.period_start.isoformat(),
        "periodEnd": p.period_end.isoformat(),
        "eGen": float(p.e_gen),
        "eSold": float(p.e_sold),
        "eWaste": float(p.e_waste),
        "revenueKes": float(p.revenue_kes),
        "payouts": p.payouts,
        "simulation": p.simulation,
        "dataSource": p.data_source,
        "createdAt": p.created_at.isoformat() if p.created_at else None,
    }


class RunBody(BaseModel):
    building_id: str = Field(alias="buildingId")
    period_start: str = Field(alias="periodStart")
    period_end: str = Field(alias="periodEnd")

    class Config:
        populate_by_name = True


@router.post("/run")
async def run_settlement(
    body: RunBody,
    _admin: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
):
    try:
        bid = uuid.UUID(body.building_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid_building_id")
    building = await buildings_repo.get(session, bid)
    if building is None:
        raise HTTPException(status_code=404, detail="building_not_found")

    pledged = await prepaid_repo.confirmed_total(session, bid)
    if pledged <= 0:
        raise HTTPException(status_code=400, detail="zero_pledge")

    # Pilot waterfall — minimal but real allocation.
    revenue = Decimal(str(pledged))
    reserve = revenue * Decimal("0.10")
    provider = revenue * Decimal("0.40")
    financier = revenue * Decimal("0.20")
    owner = revenue * Decimal("0.20")
    emappa = revenue - reserve - provider - financier - owner

    period = await settlement_repo.create_period(
        session,
        building_id=bid,
        period_start=datetime.fromisoformat(body.period_start),
        period_end=datetime.fromisoformat(body.period_end),
        e_gen=Decimal(0),
        e_sold=Decimal(0),
        e_waste=Decimal(0),
        revenue_kes=revenue,
        payouts={
            "reserve": float(reserve),
            "provider": float(provider),
            "financier": float(financier),
            "owner": float(owner),
            "emappa": float(emappa),
        },
        simulation=True,
        data_source="synthetic",
    )
    await session.commit()
    return {"period": _serialize(period)}


@router.get("/{building_id}/latest")
async def latest(
    building_id: str,
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        bid = uuid.UUID(building_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid_building_id")
    period = await settlement_repo.latest(session, bid)
    if period is None:
        return None
    return _serialize(period)


@router.get("/{building_id}/history")
async def history(
    building_id: str,
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    try:
        bid = uuid.UUID(building_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid_building_id")
    rows = await settlement_repo.history(session, bid)
    return [_serialize(p) for p in rows]
