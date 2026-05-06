"""Prepaid (pledge) repository."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.prepaid import PrepaidCommitment


async def create_pledge(
    session: AsyncSession,
    *,
    building_id: uuid.UUID,
    user_id: uuid.UUID,
    amount_kes: Decimal | float,
) -> PrepaidCommitment:
    if Decimal(str(amount_kes)) <= 0:
        raise ValueError("amount_kes must be positive")
    record = PrepaidCommitment(
        building_id=building_id,
        user_id=user_id,
        amount_kes=Decimal(str(amount_kes)),
        payment_method="pledge",
        status="confirmed",
        confirmed_at=datetime.now(timezone.utc),
    )
    session.add(record)
    await session.flush()
    return record


async def confirmed_total(session: AsyncSession, building_id: uuid.UUID) -> Decimal:
    result = await session.execute(
        select(func.coalesce(func.sum(PrepaidCommitment.amount_kes), 0))
        .where(PrepaidCommitment.building_id == building_id)
        .where(PrepaidCommitment.status == "confirmed")
    )
    total = result.scalar_one()
    return Decimal(str(total)) if total is not None else Decimal(0)


async def history(
    session: AsyncSession, building_id: uuid.UUID, *, limit: int = 100
) -> list[PrepaidCommitment]:
    result = await session.execute(
        select(PrepaidCommitment)
        .where(PrepaidCommitment.building_id == building_id)
        .order_by(desc(PrepaidCommitment.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())


async def history_for_user(
    session: AsyncSession, user_id: uuid.UUID, *, limit: int = 100
) -> list[PrepaidCommitment]:
    result = await session.execute(
        select(PrepaidCommitment)
        .where(PrepaidCommitment.user_id == user_id)
        .order_by(desc(PrepaidCommitment.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())
