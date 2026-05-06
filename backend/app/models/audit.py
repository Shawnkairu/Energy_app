"""AuditLog — append-only audit trail."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, BigInteger, ForeignKey, Index, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class AuditLog(Base):
    __tablename__ = "audit_log"
    __table_args__ = (Index("idx_audit_target_at", "target_type", "target_id", "at"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    action: Mapped[str] = mapped_column(Text, nullable=False)
    target_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
