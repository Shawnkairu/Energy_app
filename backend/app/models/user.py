"""User + OtpCode models — auth domain."""
from __future__ import annotations

import uuid
from datetime import datetime

from typing import Any

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, Integer, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "role IN ('resident','homeowner','building_owner','provider','financier','electrician','admin')",
            name="users_role_check",
        ),
        CheckConstraint(
            "business_type IS NULL OR business_type IN ('panels','infrastructure','both')",
            name="users_business_type_check",
        ),
        Index("idx_users_email", "email"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    email: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    phone: Mapped[str | None] = mapped_column(Text, nullable=True)
    role: Mapped[str] = mapped_column(Text, nullable=False)
    business_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    building_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("buildings.id"), nullable=True
    )
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    display_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    profile: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default="{}")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    last_seen_at: Mapped[datetime | None] = mapped_column(nullable=True)


class OtpCode(Base):
    __tablename__ = "otp_codes"
    __table_args__ = (Index("idx_otp_email_expires", "email", "expires_at"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    email: Mapped[str] = mapped_column(Text, nullable=False)
    code_hash: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(nullable=False)
    consumed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
