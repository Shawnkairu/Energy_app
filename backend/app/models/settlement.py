"""SettlementPeriod model — pilot writes always have simulation=true."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, Numeric, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class SettlementPeriod(Base):
    __tablename__ = "settlement_periods"
    __table_args__ = (
        CheckConstraint(
            "data_source IN ('synthetic','measured','mixed')", name="settlement_data_source_check"
        ),
        Index("idx_settlement_building_created", "building_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    building_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("buildings.id"), nullable=False
    )
    period_start: Mapped[datetime] = mapped_column(nullable=False)
    period_end: Mapped[datetime] = mapped_column(nullable=False)
    e_gen: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    e_sold: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    e_waste: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    revenue_kes: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    payouts: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    simulation: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    data_source: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
