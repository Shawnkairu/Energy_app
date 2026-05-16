"""Electrician endpoints — jobs, certifications."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.certification import Certification
from ..models.job import Job
from ..models.user import User
from ..repos import electricians as electrician_repo

router = APIRouter(prefix="/electricians", tags=["electricians"])


def _serialize_job(j: Job) -> dict:
    return {
        "id": str(j.id),
        "electricianUserId": str(j.electrician_user_id),
        "buildingId": str(j.building_id),
        "scope": j.scope,
        "status": j.status,
        "checklist": j.checklist or [],
        "payEstimateKes": float(j.pay_estimate_kes),
        "startedAt": j.started_at.isoformat() if j.started_at else None,
        "completedAt": j.completed_at.isoformat() if j.completed_at else None,
    }


def _serialize_cert(c: Certification) -> dict:
    return {
        "id": str(c.id),
        "electricianUserId": str(c.electrician_user_id),
        "name": c.name,
        "issuer": c.issuer,
        "docUrl": c.doc_url,
        "issuedAt": c.issued_at.isoformat(),
        "expiresAt": c.expires_at.isoformat(),
        "status": electrician_repo.cert_status(c),
    }


@router.get("/{user_id}/jobs")
async def list_jobs(
    user_id: str,
    status: str | None = None,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if user.role != "electrician" or str(user.id) != user_id:
        raise HTTPException(status_code=403, detail="not_your_jobs")
    rows = await electrician_repo.list_jobs(session, uuid.UUID(user_id), status=status)
    return [_serialize_job(r) for r in rows]


class CertBody(BaseModel):
    name: str
    issuer: str
    doc_url: str | None = Field(default=None, alias="docUrl")
    issued_at: datetime = Field(alias="issuedAt")
    expires_at: datetime = Field(alias="expiresAt")

    model_config = ConfigDict(populate_by_name=True)


@router.get("/{user_id}/certifications")
async def list_certifications(
    user_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if user.role != "electrician" or str(user.id) != user_id:
        raise HTTPException(status_code=403, detail="not_your_certifications")
    rows = await electrician_repo.list_certifications(session, uuid.UUID(user_id))
    return [_serialize_cert(r) for r in rows]


@router.post("/{user_id}/certifications")
async def add_certification(
    user_id: str,
    body: CertBody,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if user.role != "electrician" or str(user.id) != user_id:
        raise HTTPException(status_code=403, detail="not_your_certifications")
    cert = await electrician_repo.add_certification(
        session,
        electrician_user_id=uuid.UUID(user_id),
        name=body.name,
        issuer=body.issuer,
        doc_url=body.doc_url,
        issued_at=body.issued_at,
        expires_at=body.expires_at,
    )
    await session.commit()
    return {"certification": _serialize_cert(cert)}
