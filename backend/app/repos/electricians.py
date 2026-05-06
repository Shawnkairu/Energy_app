"""Electrician domain repository — jobs and certifications."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.certification import Certification
from ..models.job import Job


# Jobs

async def list_jobs(
    session: AsyncSession,
    electrician_user_id: uuid.UUID,
    *,
    status: str | None = None,
) -> list[Job]:
    stmt = select(Job).where(Job.electrician_user_id == electrician_user_id)
    if status:
        stmt = stmt.where(Job.status == status)
    stmt = stmt.order_by(desc(Job.created_at))
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def add_job(
    session: AsyncSession,
    *,
    electrician_user_id: uuid.UUID,
    building_id: uuid.UUID,
    scope: str,
    pay_estimate_kes: Decimal | float,
    checklist: list[dict[str, Any]] | None = None,
) -> Job:
    job = Job(
        electrician_user_id=electrician_user_id,
        building_id=building_id,
        scope=scope,
        pay_estimate_kes=Decimal(str(pay_estimate_kes)),
        checklist=checklist or [],
        status="active",
        started_at=datetime.now(timezone.utc),
    )
    session.add(job)
    await session.flush()
    return job


# Certifications

async def list_certifications(
    session: AsyncSession, electrician_user_id: uuid.UUID
) -> list[Certification]:
    result = await session.execute(
        select(Certification)
        .where(Certification.electrician_user_id == electrician_user_id)
        .order_by(desc(Certification.expires_at))
    )
    return list(result.scalars().all())


async def add_certification(
    session: AsyncSession,
    *,
    electrician_user_id: uuid.UUID,
    name: str,
    issuer: str,
    doc_url: str | None,
    issued_at: datetime,
    expires_at: datetime,
) -> Certification:
    cert = Certification(
        electrician_user_id=electrician_user_id,
        name=name,
        issuer=issuer,
        doc_url=doc_url,
        issued_at=issued_at,
        expires_at=expires_at,
    )
    session.add(cert)
    await session.flush()
    return cert


def cert_status(cert: Certification, now: datetime | None = None) -> str:
    """Compute display status. Pure function used by API layer to derive Certification.status."""
    now = now or datetime.now(timezone.utc)
    expires = cert.expires_at
    if expires <= now:
        return "expired"
    days_left = (expires - now).days
    if days_left <= 30:
        return "expiring"
    return "valid"
