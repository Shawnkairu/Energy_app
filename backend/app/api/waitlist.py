"""Public waitlist signup endpoint."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..repos import waitlist as waitlist_repo

router = APIRouter(prefix="/waitlist", tags=["waitlist"])


class WaitlistBody(BaseModel):
    name: str | None = None
    email: EmailStr
    phone: str | None = None
    role: str | None = None
    neighborhood: str | None = None


@router.post("")
async def submit(
    body: WaitlistBody,
    session: AsyncSession = Depends(get_session),
):
    await waitlist_repo.submit(
        session,
        name=body.name,
        email=body.email.lower().strip(),
        phone=body.phone,
        role=body.role,
        neighborhood=body.neighborhood,
    )
    await session.commit()
    return {"ok": True}
