"""/me endpoints — onboarding completion, building join, self-mutations.

Hard-rejects role='admin' on POST /me/onboarding-complete per
docs/IA_SPEC.md §8.5. Admin role is provisioned only via
backend/scripts/grant_admin.py or backend/scripts/seed.py.
"""
from __future__ import annotations

from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.user import User
from ..repos import audit as audit_repo
from ..repos import buildings as buildings_repo
from ..repos import users as users_repo

router = APIRouter(prefix="/me", tags=["me"])


def _serialize_user(user: User) -> dict:
    from ..api.auth import _serialize_user as base

    return base(user)


class OnboardingCompleteBody(BaseModel):
    display_name: str | None = Field(default=None, alias="displayName")
    business_type: Literal["panels", "infrastructure", "both"] | None = Field(
        default=None, alias="businessType"
    )
    profile: dict[str, Any] | None = None

    class Config:
        populate_by_name = True


@router.post("/onboarding-complete")
async def onboarding_complete(
    body: OnboardingCompleteBody,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if user.role == "admin":
        return {"user": _serialize_user(user)}

    if user.role == "provider" and not body.business_type and not user.business_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="business_type_required_for_provider",
        )

    # Merge profile JSON instead of replacing — preserves prior fields across
    # multi-step onboarding flows.
    merged_profile: dict[str, Any] = dict(user.profile or {})
    if body.profile:
        merged_profile.update(body.profile)

    values: dict[str, Any] = {
        "onboarding_complete": True,
        "profile": merged_profile,
    }
    if body.display_name is not None:
        values["display_name"] = body.display_name
    if body.business_type is not None:
        values["business_type"] = body.business_type

    await session.execute(update(User).where(User.id == user.id).values(**values))
    await session.commit()

    refreshed = await users_repo.get_by_id(session, user.id)
    assert refreshed is not None
    return {"user": _serialize_user(refreshed)}


class JoinBuildingBody(BaseModel):
    code: str = Field(min_length=4, max_length=12)


@router.post("/join-building")
async def join_building(
    body: JoinBuildingBody,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Resident enters a building's invite code; backend looks it up and links them."""
    if user.role not in {"resident", "homeowner", "building_owner"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="role_not_permitted")

    building = await buildings_repo.get_by_invite_code(session, body.code)
    if building is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="invite_code_not_found")

    # Single-family buildings are only joinable by the homeowner role.
    if building.kind == "single_family" and user.role != "homeowner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="single_family_homeowner_only"
        )

    await session.execute(
        update(User).where(User.id == user.id).values(building_id=building.id)
    )
    await audit_repo.log_event(
        session,
        actor_user_id=user.id,
        action="me.join-building",
        target_type="building",
        target_id=str(building.id),
        payload={"code": body.code.upper().strip()},
    )
    await session.commit()

    return {
        "building": {
            "id": str(building.id),
            "name": building.name,
            "address": building.address,
            "kind": building.kind,
            "unitCount": building.unit_count,
        },
    }
