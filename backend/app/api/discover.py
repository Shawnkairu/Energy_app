"""Discovery feed — Airbnb-style project cards for ecosystem contributors."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.user import User
from ..repos import buildings as buildings_repo
from ..repos import prepaid as prepaid_repo

router = APIRouter(prefix="/discover", tags=["discover"])


@router.get("")
async def discover(
    role: str,
    _: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Return ProjectCard[] filtered by role intent.

    Pilot scope: returns all non-retired buildings with role-specific gap copy.
    Real filtering (region, deal size, equipment match) lands post-pilot.
    """
    if role not in {"provider", "electrician", "financier"}:
        raise HTTPException(status_code=400, detail="invalid_role")

    buildings = await buildings_repo.list_all(session)
    cards = []
    for b in buildings:
        if b.stage == "retired":
            continue

        pledged = await prepaid_repo.confirmed_total(session, b.id)
        # Heuristic readiness "gap" copy by role
        if role == "provider":
            gap = "Needs panels + inverter + balance-of-system"
        elif role == "electrician":
            gap = "Install scope: panels + roof rails + DB upgrade"
        else:  # financier
            gap = f"Capital ask outstanding; KES {float(pledged):,.0f} pledged so far"

        card = {
            "buildingId": str(b.id),
            "name": b.name,
            "address": b.address,
            "photoUrl": None,
            "drsScore": 0.65,  # placeholder; real DRS recompute lands separately
            "drsDecision": "review",
            "stage": b.stage,
            "gapSummary": gap,
        }
        if role == "financier":
            card["capitalAskKes"] = 250_000
        elif role == "provider":
            card["equipmentAsk"] = {"panels": 12, "infrastructure": ["inverter", "DB upgrade"]}
        elif role == "electrician":
            card["electricianAsk"] = {"scope": "install", "payEstimateKes": 35_000}

        cards.append(card)
    return cards
