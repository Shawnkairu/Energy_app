"""FinancierPosition — capital pledged per building per financier."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Numeric, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class FinancierPosition(Base):
    __tablename__ = "financier_positions"
    __table_args__ = (
        UniqueConstraint("financier_user_id", "building_id", name="financier_position_unique"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    financier_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    building_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("buildings.id"), nullable=False
    )
    committed_kes: Mapped[Decimal] = mapped_column(Numeric, nullable=False, server_default="0")
    deployed_kes: Mapped[Decimal] = mapped_column(Numeric, nullable=False, server_default="0")
    returns_to_date_kes: Mapped[Decimal] = mapped_column(Numeric, nullable=False, server_default="0")
    irr_pct: Mapped[Decimal] = mapped_column(Numeric, nullable=False, server_default="0")
    milestones_hit: Mapped[list[Any]] = mapped_column(JSONB, nullable=False, server_default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
