"""Wallet transactions repository."""
from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.wallet import WalletTransaction


async def record(
    session: AsyncSession,
    *,
    user_id: uuid.UUID,
    kind: str,
    amount_kes: Decimal | float,
    reference: str,
) -> WalletTransaction:
    tx = WalletTransaction(
        user_id=user_id,
        kind=kind,
        amount_kes=Decimal(str(amount_kes)),
        reference=reference,
    )
    session.add(tx)
    await session.flush()
    return tx


async def list_for_user(
    session: AsyncSession, user_id: uuid.UUID, *, limit: int = 100
) -> list[WalletTransaction]:
    result = await session.execute(
        select(WalletTransaction)
        .where(WalletTransaction.user_id == user_id)
        .order_by(desc(WalletTransaction.at))
        .limit(limit)
    )
    return list(result.scalars().all())


async def balance(session: AsyncSession, user_id: uuid.UUID) -> Decimal:
    result = await session.execute(
        select(func.coalesce(func.sum(WalletTransaction.amount_kes), 0)).where(
            WalletTransaction.user_id == user_id
        )
    )
    val = result.scalar_one()
    return Decimal(str(val)) if val is not None else Decimal(0)
