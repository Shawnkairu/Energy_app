"""OTP repository — code creation, consumption, attempt tracking."""
from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone

from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user import OtpCode

CODE_TTL_MINUTES = 10
MAX_ATTEMPTS = 5
RATE_LIMIT_WINDOW = timedelta(minutes=10)
RATE_LIMIT_MAX = 3


def hash_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


async def recent_count(session: AsyncSession, email: str) -> int:
    """Count OTP requests for `email` in the last RATE_LIMIT_WINDOW."""
    cutoff = datetime.now(timezone.utc) - RATE_LIMIT_WINDOW
    result = await session.execute(
        select(func.count(OtpCode.id)).where(OtpCode.email == email, OtpCode.created_at >= cutoff)
    )
    return int(result.scalar() or 0)


async def create_code(session: AsyncSession, email: str, code: str) -> OtpCode:
    record = OtpCode(
        email=email,
        code_hash=hash_code(code),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=CODE_TTL_MINUTES),
    )
    session.add(record)
    await session.flush()
    return record


async def get_active_for_email(session: AsyncSession, email: str) -> OtpCode | None:
    """Return the most recent unconsumed code for an email, regardless of expiry."""
    result = await session.execute(
        select(OtpCode)
        .where(OtpCode.email == email, OtpCode.consumed_at.is_(None))
        .order_by(desc(OtpCode.created_at))
        .limit(1)
    )
    return result.scalar_one_or_none()


async def consume_code(session: AsyncSession, record: OtpCode) -> None:
    record.consumed_at = datetime.now(timezone.utc)
    await session.flush()


async def increment_attempts(session: AsyncSession, record: OtpCode) -> None:
    record.attempts = (record.attempts or 0) + 1
    await session.flush()


def is_expired(record: OtpCode) -> bool:
    return record.expires_at <= datetime.now(timezone.utc)


def is_locked_out(record: OtpCode) -> bool:
    return record.attempts >= MAX_ATTEMPTS
