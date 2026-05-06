"""PrepaidCommitment model — pledges in pilot mode."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Index, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class PrepaidCommitment(Base):
    __tablename__ = "prepaid_commitments"
    __table_args__ = (
        CheckConstraint("amount_kes > 0", name="prepaid_amount_positive"),
        CheckConstraint(
            "payment_method IN ('pledge','mpesa')", name="prepaid_payment_method_check"
        ),
        CheckConstraint(
            "status IN ('pending','confirmed','failed')", name="prepaid_status_check"
        ),
        Index("idx_prepaid_building_status", "building_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    building_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("buildings.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    amount_kes: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    payment_method: Mapped[str] = mapped_column(Text, nullable=False, server_default="pledge")
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="confirmed")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    confirmed_at: Mapped[datetime | None] = mapped_column(nullable=True)
