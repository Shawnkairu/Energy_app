"""Waitlist leads repository."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.waitlist import WaitlistLead


async def submit(
    session: AsyncSession,
    *,
    name: str | None,
    email: str,
    phone: str | None = None,
    role: str | None = None,
    neighborhood: str | None = None,
) -> WaitlistLead:
    lead = WaitlistLead(
        name=name, email=email, phone=phone, role=role, neighborhood=neighborhood
    )
    session.add(lead)
    await session.flush()
    return lead
