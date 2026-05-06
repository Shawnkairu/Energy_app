"""Provider inventory repository."""
from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.inventory import InventoryItem


async def list_for_provider(
    session: AsyncSession, provider_user_id: uuid.UUID
) -> list[InventoryItem]:
    result = await session.execute(
        select(InventoryItem).where(InventoryItem.provider_user_id == provider_user_id)
    )
    return list(result.scalars().all())


async def add(
    session: AsyncSession,
    *,
    provider_user_id: uuid.UUID,
    sku: str,
    kind: str,
    stock: int,
    unit_price_kes: Decimal | float,
    reliability_score: Decimal | float = 1.0,
) -> InventoryItem:
    item = InventoryItem(
        provider_user_id=provider_user_id,
        sku=sku,
        kind=kind,
        stock=stock,
        unit_price_kes=Decimal(str(unit_price_kes)),
        reliability_score=Decimal(str(reliability_score)),
    )
    session.add(item)
    await session.flush()
    return item
