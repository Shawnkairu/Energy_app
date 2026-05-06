"""Wallet endpoints — universal cashflow per user."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.user import User
from ..models.wallet import WalletTransaction
from ..repos import wallet as wallet_repo

router = APIRouter(prefix="/wallet", tags=["wallet"])


def _serialize(tx: WalletTransaction) -> dict:
    return {
        "id": str(tx.id),
        "userId": str(tx.user_id),
        "at": tx.at.isoformat() if tx.at else None,
        "kind": tx.kind,
        "amountKes": float(tx.amount_kes),
        "reference": tx.reference,
    }


@router.get("/{user_id}/balance")
async def balance(
    user_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if str(user.id) != user_id and user.role != "admin":
        raise HTTPException(status_code=403, detail="not_your_wallet")
    bal = await wallet_repo.balance(session, uuid.UUID(user_id))
    return {"kes": float(bal), "breakdown": {}}


@router.get("/{user_id}/transactions")
async def transactions(
    user_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if str(user.id) != user_id and user.role != "admin":
        raise HTTPException(status_code=403, detail="not_your_wallet")
    txs = await wallet_repo.list_for_user(session, uuid.UUID(user_id))
    return [_serialize(t) for t in txs]
