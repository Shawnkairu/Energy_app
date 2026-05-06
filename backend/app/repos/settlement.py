"""Settlement period repository."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.settlement import SettlementPeriod


async def create_period(
    session: AsyncSession,
    *,
    building_id: uuid.UUID,
    period_start: datetime,
    period_end: datetime,
    e_gen: Decimal,
    e_sold: Decimal,
    e_waste: Decimal,
    revenue_kes: Decimal,
    payouts: dict[str, Any],
    simulation: bool = True,
    data_source: str = "synthetic",
) -> SettlementPeriod:
    period = SettlementPeriod(
        building_id=building_id,
        period_start=period_start,
        period_end=period_end,
        e_gen=e_gen,
        e_sold=e_sold,
        e_waste=e_waste,
        revenue_kes=revenue_kes,
        payouts=payouts,
        simulation=simulation,
        data_source=data_source,
    )
    session.add(period)
    await session.flush()
    return period


async def latest(
    session: AsyncSession, building_id: uuid.UUID
) -> SettlementPeriod | None:
    result = await session.execute(
        select(SettlementPeriod)
        .where(SettlementPeriod.building_id == building_id)
        .order_by(desc(SettlementPeriod.created_at))
        .limit(1)
    )
    return result.scalar_one_or_none()


async def history(
    session: AsyncSession, building_id: uuid.UUID, *, limit: int = 50
) -> list[SettlementPeriod]:
    result = await session.execute(
        select(SettlementPeriod)
        .where(SettlementPeriod.building_id == building_id)
        .order_by(desc(SettlementPeriod.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())
