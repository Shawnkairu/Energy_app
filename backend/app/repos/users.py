"""User repository."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import User


async def get_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_by_id(session: AsyncSession, user_id: uuid.UUID) -> User | None:
    return await session.get(User, user_id)


async def create(
    session: AsyncSession,
    *,
    email: str,
    role: str,
    building_id: uuid.UUID | None = None,
    business_type: str | None = None,
    display_name: str | None = None,
    onboarding_complete: bool = False,
) -> User:
    user = User(
        email=email,
        role=role,
        building_id=building_id,
        business_type=business_type,
        display_name=display_name,
        onboarding_complete=onboarding_complete,
    )
    session.add(user)
    await session.flush()
    return user


async def upsert_by_email(
    session: AsyncSession,
    *,
    email: str,
    role: str,
    **kwargs,
) -> User:
    """Get-or-create. Used during seed and during auto-provisioning of seeded emails on first OTP."""
    existing = await get_by_email(session, email)
    if existing:
        return existing
    return await create(session, email=email, role=role, **kwargs)


async def mark_onboarding_complete(
    session: AsyncSession,
    user_id: uuid.UUID,
    *,
    display_name: str | None = None,
    business_type: str | None = None,
) -> None:
    values: dict = {"onboarding_complete": True}
    if display_name is not None:
        values["display_name"] = display_name
    if business_type is not None:
        values["business_type"] = business_type
    await session.execute(update(User).where(User.id == user_id).values(**values))


async def touch_last_seen(session: AsyncSession, user_id: uuid.UUID) -> None:
    await session.execute(
        update(User).where(User.id == user_id).values(last_seen_at=datetime.now(timezone.utc))
    )
