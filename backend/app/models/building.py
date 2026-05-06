"""Building model — matches buildings table in 0001_pilot_baseline."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Boolean, CheckConstraint, Integer, Numeric, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class Building(Base):
    __tablename__ = "buildings"
    __table_args__ = (
        CheckConstraint(
            "stage IN ('listed','qualifying','funding','installing','live','retired')",
            name="buildings_stage_check",
        ),
        CheckConstraint(
            "kind IN ('apartment','single_family')",
            name="buildings_kind_check",
        ),
        CheckConstraint(
            "kind <> 'single_family' OR unit_count = 1",
            name="buildings_single_family_unit_count",
        ),
        CheckConstraint(
            "roof_source IS NULL OR roof_source IN ('microsoft_footprints','owner_traced','owner_typed')",
            name="buildings_roof_source_check",
        ),
        CheckConstraint(
            "data_source IN ('synthetic','measured','mixed')",
            name="buildings_data_source_check",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    lat: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    lon: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    unit_count: Mapped[int] = mapped_column(Integer, nullable=False)
    occupancy: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    kind: Mapped[str] = mapped_column(Text, nullable=False, server_default="apartment")
    stage: Mapped[str] = mapped_column(Text, nullable=False)
    roof_area_m2: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    roof_polygon_geojson: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    roof_source: Mapped[str | None] = mapped_column(Text, nullable=True)
    roof_confidence: Mapped[Decimal | None] = mapped_column(Numeric, nullable=True)
    data_source: Mapped[str] = mapped_column(Text, nullable=False, server_default="synthetic")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now())
