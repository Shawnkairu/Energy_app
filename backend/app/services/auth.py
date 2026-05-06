from datetime import datetime, timedelta, timezone
from jose import jwt
from app.config import get_settings


def create_token(user: dict) -> str:
    settings = get_settings()
    payload = {"sub": user["id"], "phone": user["phone"], "role": user["role"], "exp": datetime.now(timezone.utc) + timedelta(hours=12)}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
