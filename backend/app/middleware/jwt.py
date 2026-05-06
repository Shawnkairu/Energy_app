"""FastAPI dependency that validates Authorization: Bearer <jwt> and loads the user."""
from __future__ import annotations

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import get_session
from ..models.user import User
from ..repos import users as users_repo
from ..services.jwt import JwtDecodeError, decode_token, user_id_from_payload


async def get_current_user(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> User:
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="missing_token")
    token = auth.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
    except JwtDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_token"
        ) from exc

    user_id = user_id_from_payload(payload)
    user = await users_repo.get_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="user_not_found")
    await users_repo.touch_last_seen(session, user_id)
    await session.commit()
    return user


def require_role(*allowed: str):
    """Dependency factory that further constrains a route to specific roles."""

    async def _dep(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="role_not_permitted"
            )
        return user

    return _dep


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="admin_only")
    return user
