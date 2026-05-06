"""/me endpoints — onboarding completion and self-mutations.

Hard-rejects role='admin' on POST /me/onboarding-complete per
docs/IA_SPEC.md §8.5. Admin role is provisioned only via
backend/scripts/grant_admin.py or backend/scripts/seed.py.
"""
from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.user import User
from ..repos import users as users_repo

router = APIRouter(prefix="/me", tags=["me"])


class OnboardingCompleteBody(BaseModel):
    display_name: str | None = None
    business_type: Literal["panels", "infrastructure", "both"] | None = None
    # role is intentionally NOT in this body — onboarding cannot change role.
    # Role is set during signup or by an operator running grant_admin.py.


def _serialize_user(user: User) -> dict:
    from ..api.auth import _serialize_user as base

    return base(user)


@router.post("/onboarding-complete")
async def onboarding_complete(
    body: OnboardingCompleteBody,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # Defensive: even though the body schema doesn't include `role`, refuse any
    # attempt to set admin-anything via this endpoint.
    if user.role == "admin":
        # Existing admins shouldn't go through this flow; harmless but we no-op.
        return _serialize_user(user)

    if user.role == "provider" and not body.business_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="business_type_required_for_provider",
        )

    await users_repo.mark_onboarding_complete(
        session,
        user.id,
        display_name=body.display_name,
        business_type=body.business_type,
    )
    await session.commit()

    refreshed = await users_repo.get_by_id(session, user.id)
    assert refreshed is not None
    return {"user": _serialize_user(refreshed)}
