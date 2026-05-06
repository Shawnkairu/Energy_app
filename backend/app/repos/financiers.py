"""Financier positions repository."""
from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.financier import FinancierPosition


async def list_for_financier(
    session: AsyncSession, financier_user_id: uuid.UUID
) -> list[FinancierPosition]:
    result = await session.execute(
        select(FinancierPosition).where(FinancierPosition.financier_user_id == financier_user_id)
    )
    return list(result.scalars().all())


async def upsert_pledge(
    session: AsyncSession,
    *,
    financier_user_id: uuid.UUID,
    building_id: uuid.UUID,
    additional_kes: Decimal | float,
) -> FinancierPosition:
    """Add capital to an existing position, or create one if none exists.

    Postgres ON CONFLICT — atomic on the (financier_user_id, building_id) unique key.
    """
    amount = Decimal(str(additional_kes))
    stmt = (
        insert(FinancierPosition)
        .values(
            financier_user_id=financier_user_id,
            building_id=building_id,
            committed_kes=amount,
        )
        .on_conflict_do_update(
            constraint="financier_position_unique",
            set_={"committed_kes": FinancierPosition.committed_kes + amount},
        )
        .returning(FinancierPosition)
    )
    result = await session.execute(stmt)
    return result.scalar_one()
