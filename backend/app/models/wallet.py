"""WalletTransaction — append-only cashflow rows per user."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, CheckConstraint, ForeignKey, Index, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"
    __table_args__ = (
        CheckConstraint(
            "kind IN ('pledge','royalty','equipment_sale','job_payment','capital_deploy','capital_return')",
            name="wallet_kind_check",
        ),
        Index("idx_wallet_user_at", "user_id", "at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    kind: Mapped[str] = mapped_column(Text, nullable=False)
    amount_kes: Mapped[Decimal] = mapped_column(Numeric, nullable=False)
    reference: Mapped[str] = mapped_column(Text, nullable=False)
