"""Back-compat shim — canonical location is app.db.session.

Existing imports `from .database import get_db / engine / SessionLocal` continue
to work. New code should import from app.db.session directly.
"""
from .db.session import Base, SessionLocal, engine, get_session

# Legacy alias
get_db = get_session

__all__ = ["Base", "SessionLocal", "engine", "get_db", "get_session"]
