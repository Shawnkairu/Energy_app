"""Role-home endpoints — per-role landing payloads.

Pilot scope: returns the projects list scoped to the caller's role/building plus
a synthesized activity feed. Real role-tailored aggregates land in cockpit views.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..middleware.jwt import get_current_user
from ..models.user import User
from ..repos import buildings as buildings_repo
from .projects import _serialize_with_pledged

router = APIRouter(prefix="/roles", tags=["roles"])

_PUBLIC_ROLES = {"resident", "homeowner", "building_owner", "provider", "financier", "electrician"}


@router.get("")
async def list_roles(_: User = Depends(get_current_user)):
    """Public role catalog — admin intentionally absent (IA_SPEC §8.5)."""
    return [
        {"id": "resident", "label": "Resident"},
        {"id": "homeowner", "label": "Homeowner"},
        {"id": "building_owner", "label": "Building Owner"},
        {"id": "provider", "label": "Provider"},
        {"id": "financier", "label": "Financier"},
        {"id": "electrician", "label": "Electrician"},
    ]


@router.get("/{role}/home")
async def role_home(
    role: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if role not in _PUBLIC_ROLES:
        raise HTTPException(status_code=404, detail="unknown_role")
    rows = await buildings_repo.list_all(session)
    if user.role in {"resident", "homeowner", "building_owner"} and user.building_id:
        rows = [r for r in rows if r.id == user.building_id]
    projects = [await _serialize_with_pledged(session, b) for b in rows]
    primary = projects[0] if projects else None
    return {
        "role": role,
        "primary": primary,
        "projects": projects,
        "activity": [],
    }
