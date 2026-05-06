"""EnergyReading — time-series synthetic + measured readings per building."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, CheckConstraint, ForeignKey, Index, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class EnergyReading(Base):
    __tablename__ = "energy_readings"
    __table_args__ = (
        CheckConstraint("kind IN ('generation','load','irradiance')", name="energy_kind_check"),
        CheckConstraint("source IN ('synthetic','measured')", name="energy_source_check"),
        Index("idx_energy_building_kind_time", "building_id", "kind", "timestamp"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    building_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("buildings.id"), nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(nullable=False)
    kind: Mapped[str] = mapped_column(Text, nullable=False)
    value: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    unit: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(Text, nullable=False)
    provenance: Mapped[str] = mapped_column(Text, nullable=False)
