"""onboarding_extensions — invite codes, role profile bag

Adds:
  - buildings.invite_code TEXT UNIQUE — short code residents enter to join.
    Generated app-side on insert; index for lookup.
  - users.profile JSONB NOT NULL DEFAULT '{}' — role-specific onboarding fields
    (electrician: {region, scope[]}; financier: {investor_kind, target_deal_size_kes,
    target_return_pct}; future roles extend without schema change).

Revision ID: 0002_onboarding_extensions
Revises: 0001_pilot_baseline
Create Date: 2026-05-06
"""
from __future__ import annotations

from typing import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0002_onboarding_extensions"
down_revision: str | Sequence[str] | None = "0001_pilot_baseline"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "buildings",
        sa.Column("invite_code", sa.Text(), nullable=True),
    )
    op.create_index(
        "idx_buildings_invite_code",
        "buildings",
        ["invite_code"],
        unique=True,
        postgresql_where=sa.text("invite_code IS NOT NULL"),
    )

    op.add_column(
        "users",
        sa.Column(
            "profile",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "profile")
    op.drop_index("idx_buildings_invite_code", table_name="buildings")
    op.drop_column("buildings", "invite_code")
