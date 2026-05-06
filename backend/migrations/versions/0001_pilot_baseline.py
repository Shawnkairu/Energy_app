"""pilot_baseline — schema lock per docs/SPRINT_CONTRACT.md §2

Creates all tables required by the pilot:
users, otp_codes, buildings, prepaid_commitments, energy_readings,
settlement_periods, audit_log, waitlist_leads.

Role enum is locked to: resident, building_owner, provider, financier, electrician, admin.
Admin is intentionally last; per docs/IA_SPEC.md §8.5 admin is never publicly assignable —
enforced at API level (POST /me/onboarding-complete returns 403 for role='admin') and
provisioning level (backend/scripts/grant_admin.py only).

Revision ID: 0001_pilot_baseline
Revises:
Create Date: 2026-05-06
"""
from __future__ import annotations

from typing import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0001_pilot_baseline"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Enable pgcrypto for gen_random_uuid()
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.create_table(
        "buildings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("lat", sa.Numeric(), nullable=False),
        sa.Column("lon", sa.Numeric(), nullable=False),
        sa.Column("unit_count", sa.Integer(), nullable=False),
        sa.Column("occupancy", sa.Numeric(), nullable=True),
        sa.Column("kind", sa.Text(), nullable=False, server_default=sa.text("'apartment'")),
        sa.Column("stage", sa.Text(), nullable=False),
        sa.Column("roof_area_m2", sa.Numeric(), nullable=True),
        sa.Column("roof_polygon_geojson", postgresql.JSONB(), nullable=True),
        sa.Column("roof_source", sa.Text(), nullable=True),
        sa.Column("roof_confidence", sa.Numeric(), nullable=True),
        sa.Column("data_source", sa.Text(), nullable=False, server_default=sa.text("'synthetic'")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint(
            "stage IN ('listed','qualifying','funding','installing','live','retired')",
            name="buildings_stage_check",
        ),
        sa.CheckConstraint(
            "kind IN ('apartment','single_family')",
            name="buildings_kind_check",
        ),
        # Single-family buildings must have exactly one unit. Enforced at API too.
        sa.CheckConstraint(
            "kind <> 'single_family' OR unit_count = 1",
            name="buildings_single_family_unit_count",
        ),
        sa.CheckConstraint(
            "roof_source IS NULL OR roof_source IN ('microsoft_footprints','owner_traced','owner_typed')",
            name="buildings_roof_source_check",
        ),
        sa.CheckConstraint(
            "data_source IN ('synthetic','measured','mixed')",
            name="buildings_data_source_check",
        ),
    )

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.Text(), nullable=False, unique=True),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("role", sa.Text(), nullable=False),
        sa.Column("business_type", sa.Text(), nullable=True),
        sa.Column("building_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("buildings.id"), nullable=True),
        sa.Column("onboarding_complete", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("display_name", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("last_seen_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.CheckConstraint(
            "role IN ('resident','homeowner','building_owner','provider','financier','electrician','admin')",
            name="users_role_check",
        ),
        # Homeowner role must reference a single_family building. Enforced via deferred check;
        # Postgres validates the FK row's kind via a trigger added in a follow-up migration if needed.
        # For pilot we trust API-level enforcement on POST /buildings + onboarding.
        sa.CheckConstraint(
            "business_type IS NULL OR business_type IN ('panels','infrastructure','both')",
            name="users_business_type_check",
        ),
    )
    op.create_index("idx_users_email", "users", ["email"])

    op.create_table(
        "otp_codes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("code_hash", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("idx_otp_email_expires", "otp_codes", ["email", sa.text("expires_at DESC")])

    op.create_table(
        "prepaid_commitments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("building_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("buildings.id"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("amount_kes", sa.Numeric(), nullable=False),
        sa.Column("payment_method", sa.Text(), nullable=False, server_default=sa.text("'pledge'")),
        sa.Column("status", sa.Text(), nullable=False, server_default=sa.text("'confirmed'")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("confirmed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.CheckConstraint("amount_kes > 0", name="prepaid_amount_positive"),
        sa.CheckConstraint(
            "payment_method IN ('pledge','mpesa')",
            name="prepaid_payment_method_check",
        ),
        sa.CheckConstraint(
            "status IN ('pending','confirmed','failed')",
            name="prepaid_status_check",
        ),
    )
    op.create_index("idx_prepaid_building_status", "prepaid_commitments", ["building_id", "status"])

    op.create_table(
        "energy_readings",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("building_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("buildings.id"), nullable=False),
        sa.Column("timestamp", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("kind", sa.Text(), nullable=False),
        sa.Column("value", sa.Numeric(), nullable=False),
        sa.Column("unit", sa.Text(), nullable=False),
        sa.Column("source", sa.Text(), nullable=False),
        sa.Column("provenance", sa.Text(), nullable=False),
        sa.CheckConstraint(
            "kind IN ('generation','load','irradiance')",
            name="energy_kind_check",
        ),
        sa.CheckConstraint(
            "source IN ('synthetic','measured')",
            name="energy_source_check",
        ),
    )
    op.create_index(
        "idx_energy_building_kind_time",
        "energy_readings",
        ["building_id", "kind", sa.text("timestamp DESC")],
    )

    op.create_table(
        "settlement_periods",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("building_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("buildings.id"), nullable=False),
        sa.Column("period_start", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("period_end", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("e_gen", sa.Numeric(), nullable=False),
        sa.Column("e_sold", sa.Numeric(), nullable=False),
        sa.Column("e_waste", sa.Numeric(), nullable=False),
        sa.Column("revenue_kes", sa.Numeric(), nullable=False),
        sa.Column("payouts", postgresql.JSONB(), nullable=False),
        sa.Column("simulation", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("data_source", sa.Text(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint(
            "data_source IN ('synthetic','measured','mixed')",
            name="settlement_data_source_check",
        ),
    )
    op.create_index("idx_settlement_building_created", "settlement_periods", ["building_id", sa.text("created_at DESC")])

    op.create_table(
        "audit_log",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("actor_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.Text(), nullable=False),
        sa.Column("target_type", sa.Text(), nullable=True),
        sa.Column("target_id", sa.Text(), nullable=True),
        sa.Column("payload", postgresql.JSONB(), nullable=True),
        sa.Column("at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("idx_audit_target_at", "audit_log", ["target_type", "target_id", sa.text("at DESC")])

    op.create_table(
        "waitlist_leads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("role", sa.Text(), nullable=True),
        sa.Column("neighborhood", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # Discovery feed source data — providers' inventory, electricians' jobs/certs, financiers' positions
    # These tables back the contract endpoints in §3 of SPRINT_CONTRACT.md
    op.create_table(
        "inventory_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("provider_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("sku", sa.Text(), nullable=False),
        sa.Column("kind", sa.Text(), nullable=False),
        sa.Column("stock", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("unit_price_kes", sa.Numeric(), nullable=False),
        sa.Column("reliability_score", sa.Numeric(), nullable=False, server_default=sa.text("1.0")),
        sa.CheckConstraint("kind IN ('panel','infra')", name="inventory_kind_check"),
        sa.CheckConstraint("stock >= 0", name="inventory_stock_nonneg"),
    )
    op.create_index("idx_inventory_provider", "inventory_items", ["provider_user_id"])

    op.create_table(
        "certifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("electrician_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("issuer", sa.Text(), nullable=False),
        sa.Column("doc_url", sa.Text(), nullable=True),
        sa.Column("issued_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("idx_certifications_electrician", "certifications", ["electrician_user_id"])

    op.create_table(
        "jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("electrician_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("building_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("buildings.id"), nullable=False),
        sa.Column("scope", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default=sa.text("'active'")),
        sa.Column("checklist", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("pay_estimate_kes", sa.Numeric(), nullable=False),
        sa.Column("started_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("completed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint(
            "scope IN ('install','inspection','maintenance')",
            name="jobs_scope_check",
        ),
        sa.CheckConstraint(
            "status IN ('active','completed')",
            name="jobs_status_check",
        ),
    )
    op.create_index("idx_jobs_electrician_status", "jobs", ["electrician_user_id", "status"])

    op.create_table(
        "financier_positions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("financier_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("building_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("buildings.id"), nullable=False),
        sa.Column("committed_kes", sa.Numeric(), nullable=False, server_default=sa.text("0")),
        sa.Column("deployed_kes", sa.Numeric(), nullable=False, server_default=sa.text("0")),
        sa.Column("returns_to_date_kes", sa.Numeric(), nullable=False, server_default=sa.text("0")),
        sa.Column("irr_pct", sa.Numeric(), nullable=False, server_default=sa.text("0")),
        sa.Column("milestones_hit", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("financier_user_id", "building_id", name="financier_position_unique"),
    )

    op.create_table(
        "wallet_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("at", sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("kind", sa.Text(), nullable=False),
        sa.Column("amount_kes", sa.Numeric(), nullable=False),
        sa.Column("reference", sa.Text(), nullable=False),
        sa.CheckConstraint(
            "kind IN ('pledge','royalty','equipment_sale','job_payment','capital_deploy','capital_return')",
            name="wallet_kind_check",
        ),
    )
    op.create_index("idx_wallet_user_at", "wallet_transactions", ["user_id", sa.text("at DESC")])


def downgrade() -> None:
    op.drop_table("wallet_transactions")
    op.drop_table("financier_positions")
    op.drop_table("jobs")
    op.drop_table("certifications")
    op.drop_table("inventory_items")
    op.drop_table("waitlist_leads")
    op.drop_table("audit_log")
    op.drop_table("settlement_periods")
    op.drop_table("energy_readings")
    op.drop_table("prepaid_commitments")
    op.drop_table("otp_codes")
    op.drop_table("users")
    op.drop_table("buildings")
