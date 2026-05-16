"""Provider endpoints — inventory + orders + quote requests stubs."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.inventory import InventoryItem
from ..models.user import User
from ..repos import inventory as inventory_repo

router = APIRouter(prefix="/providers", tags=["providers"])


def _serialize(item: InventoryItem) -> dict:
    return {
        "id": str(item.id),
        "providerUserId": str(item.provider_user_id),
        "sku": item.sku,
        "kind": item.kind,
        "stock": item.stock,
        "unitPriceKes": float(item.unit_price_kes),
        "reliabilityScore": float(item.reliability_score),
    }


class AddInventoryBody(BaseModel):
    sku: str
    kind: str
    stock: int = Field(ge=0)
    unit_price_kes: float = Field(alias="unitPriceKes", gt=0)

    model_config = ConfigDict(populate_by_name=True)


@router.get("/{user_id}/inventory")
async def list_inventory(
    user_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if user.role != "provider" or str(user.id) != user_id:
        raise HTTPException(status_code=403, detail="not_your_inventory")
    items = await inventory_repo.list_for_provider(session, uuid.UUID(user_id))
    return [_serialize(i) for i in items]


@router.post("/{user_id}/inventory")
async def add_inventory(
    user_id: str,
    body: AddInventoryBody,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if user.role != "provider" or str(user.id) != user_id:
        raise HTTPException(status_code=403, detail="not_your_inventory")
    if body.kind not in ("panel", "infra"):
        raise HTTPException(status_code=400, detail="invalid_kind")
    item = await inventory_repo.add(
        session,
        provider_user_id=uuid.UUID(user_id),
        sku=body.sku,
        kind=body.kind,
        stock=body.stock,
        unit_price_kes=body.unit_price_kes,
    )
    await session.commit()
    return {"item": _serialize(item)}


@router.get("/{user_id}/orders")
async def list_orders(
    user_id: str,
    user: User = Depends(get_current_user),
):
    """Pilot stub — orders ledger is post-pilot."""
    if user.role != "provider" or str(user.id) != user_id:
        raise HTTPException(status_code=403, detail="not_your_orders")
    return []


@router.get("/{user_id}/quote-requests")
async def list_quote_requests(
    user_id: str,
    user: User = Depends(get_current_user),
):
    """Pilot stub — quote requests ledger is post-pilot."""
    if user.role != "provider" or str(user.id) != user_id:
        raise HTTPException(status_code=403, detail="not_your_quotes")
    return []
