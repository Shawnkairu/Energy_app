"""InventoryItem — provider-owned SKUs."""
from __future__ import annotations

import uuid
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class InventoryItem(Base):
    __tablename__ = "inventory_items"
    __table_args__ = (
        CheckConstraint("kind IN ('panel','infra')", name="inventory_kind_check"),
        CheckConstraint("stock >= 0", name="inventory_stock_nonneg"),
        Index("idx_inventory_provider", "provider_user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    provider_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    sku: Mapped[str] = mapped_column(Text, nullable=False)
    kind: Mapped[str] = mapped_column(Text, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    unit_price_kes: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    reliability_score: Mapped[Decimal] = mapped_column(Numeric, nullable=False, server_default="1.0")
