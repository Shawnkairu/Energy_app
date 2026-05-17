"""Pilot seed — populates dev database per docs/SPRINT_CONTRACT.md §2.

Idempotent: running twice does not duplicate buildings or users (matches by
deterministic UUIDs derived from a fixed namespace + seed name).

Run:
    EMAPPA_DEV_SEED=true python -m scripts.seed
"""
from __future__ import annotations

import asyncio
import sys
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select

from app.config import get_settings
from app.db.session import SessionLocal
from app.data.seed_uuids import seed_uuid as _det_uuid
from app.models.building import Building
from app.models.certification import Certification
from app.models.energy import EnergyReading
from app.models.financier import FinancierPosition
from app.models.inventory import InventoryItem
from app.models.user import User
from app.repos import wallet as wallet_repo
from app.services.solar.load_profiles import generate_load_profile

BUILDINGS = [
    {
        "id": _det_uuid("nyeri-ridge-a"),
        "name": "Nyeri Ridge A",
        "address": "Mumbi Road, Nyeri",
        "lat": -0.4201,
        "lon": 36.9476,
        "unit_count": 12,
        "occupancy": 0.83,
        "kind": "apartment",
        "stage": "live",
        "invite_code": "NYERI1",
    },
    {
        "id": _det_uuid("karatina-court"),
        "name": "Karatina Court",
        "address": "Karatina Town Center",
        "lat": -0.4814,
        "lon": 37.1245,
        "unit_count": 8,
        "occupancy": 0.62,
        "kind": "apartment",
        "stage": "qualifying",
        "invite_code": "KARAT1",
    },
    {
        "id": _det_uuid("kahawa-sukari-1"),
        "name": "Kahawa Sukari Home",
        "address": "Kahawa Sukari, Nairobi",
        "lat": -1.1924,
        "lon": 36.9296,
        "unit_count": 1,
        "occupancy": 1.0,
        "kind": "single_family",
        "stage": "listed",
        "invite_code": "KAHAW1",
    },
]


def users_for_buildings(b_ids: dict[str, uuid.UUID]) -> list[dict]:
    return [
        {"id": _det_uuid("admin"), "email": "admin@emappa.test", "role": "admin"},
        {
            "id": _det_uuid("resident-a"),
            "email": "resident-a@emappa.test",
            "role": "resident",
            "building_id": b_ids["nyeri-ridge-a"],
        },
        {
            "id": _det_uuid("resident-b"),
            "email": "resident-b@emappa.test",
            "role": "resident",
            "building_id": b_ids["nyeri-ridge-a"],
        },
        {
            "id": _det_uuid("resident-c"),
            "email": "resident-c@emappa.test",
            "role": "resident",
            "building_id": b_ids["karatina-court"],
        },
        {
            "id": _det_uuid("resident-d"),
            "email": "resident-d@emappa.test",
            "role": "resident",
            "building_id": b_ids["karatina-court"],
        },
        {
            "id": _det_uuid("homeowner"),
            "email": "homeowner@emappa.test",
            "role": "homeowner",
            "building_id": b_ids["kahawa-sukari-1"],
        },
        {
            "id": _det_uuid("building-owner"),
            "email": "building-owner@emappa.test",
            "role": "building_owner",
            "building_id": b_ids["nyeri-ridge-a"],
        },
        {
            "id": _det_uuid("provider-panels"),
            "email": "provider-panels@emappa.test",
            "role": "provider",
            "business_type": "panels",
        },
        {
            "id": _det_uuid("provider-both"),
            "email": "provider-both@emappa.test",
            "role": "provider",
            "business_type": "both",
        },
        {
            "id": _det_uuid("financier"),
            "email": "financier@emappa.test",
            "role": "financier",
        },
        {
            "id": _det_uuid("electrician"),
            "email": "electrician@emappa.test",
            "role": "electrician",
        },
    ]


def _parse_admin_allowlist(raw: str) -> set[str]:
    return {email.strip().lower() for email in raw.split(",") if email.strip()}


def _assert_seed_admins_allowed(user_specs: list[dict]) -> None:
    allowed = _parse_admin_allowlist(get_settings().admin_emails)
    for spec in user_specs:
        if spec.get("role") == "admin" and spec["email"].lower() not in allowed:
            raise RuntimeError(
                f"Seed admin {spec['email']} is not in EMAPPA_ADMIN_EMAILS; "
                "refusing to create a publicly-unlisted admin outside the allowlist."
            )


async def _ensure_building(session, spec: dict) -> Building:
    existing = await session.get(Building, spec["id"])
    if existing:
        # Backfill invite_code on older seeded rows that predate the column being populated.
        if existing.invite_code is None and spec.get("invite_code"):
            existing.invite_code = spec["invite_code"]
            await session.flush()
        return existing
    b = Building(
        id=spec["id"],
        name=spec["name"],
        address=spec["address"],
        lat=Decimal(str(spec["lat"])),
        lon=Decimal(str(spec["lon"])),
        unit_count=spec["unit_count"],
        occupancy=Decimal(str(spec["occupancy"])),
        kind=spec["kind"],
        stage=spec["stage"],
        invite_code=spec.get("invite_code"),
        data_source="synthetic",
    )
    session.add(b)
    await session.flush()
    return b


async def _ensure_user(session, spec: dict) -> User:
    existing = await session.get(User, spec["id"])
    if existing:
        return existing
    u = User(
        id=spec["id"],
        email=spec["email"],
        role=spec["role"],
        building_id=spec.get("building_id"),
        business_type=spec.get("business_type"),
        onboarding_complete=True,
    )
    session.add(u)
    await session.flush()
    return u


async def _seed_energy_readings(session, building: Building) -> int:
    """Insert 30 days × 24 hours of synthetic readings for one building."""
    # Skip if any reading exists for this building
    existing = await session.execute(
        select(EnergyReading.id).where(EnergyReading.building_id == building.id).limit(1)
    )
    if existing.first():
        return 0

    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    array_kw = 8.0  # nominal pilot rooftop
    rows = []
    for day in range(30):
        for hour in range(24):
            ts = now - timedelta(days=day, hours=hour)
            # generation: rough sine bell during 6-18
            local_h = ts.hour
            if 6 <= local_h < 18:
                import math
                x = (local_h - 6) / 12.0
                gen = round(math.sin(x * math.pi) * array_kw * 5.5 * math.pi / 24, 4)
            else:
                gen = 0.0
            rows.append(
                {
                    "building_id": building.id,
                    "timestamp": ts,
                    "kind": "generation",
                    "value": gen,
                    "unit": "kWh",
                    "source": "synthetic",
                    "provenance": "seed:pvwatts-fallback",
                }
            )

            load = generate_load_profile(
                archetype="emerging_appliance",
                resident_id=str(building.id),
                day_index=day,
            )[local_h]
            rows.append(
                {
                    "building_id": building.id,
                    "timestamp": ts,
                    "kind": "load",
                    "value": load,
                    "unit": "kWh",
                    "source": "synthetic",
                    "provenance": "seed:load-archetype:emerging_appliance",
                }
            )

            irr = max(0.0, gen * 800)  # crude back-conversion to W/m²
            rows.append(
                {
                    "building_id": building.id,
                    "timestamp": ts,
                    "kind": "irradiance",
                    "value": round(irr, 1),
                    "unit": "W/m2",
                    "source": "synthetic",
                    "provenance": "seed:open-meteo-fallback",
                }
            )

    # Bulk insert
    from sqlalchemy.dialects.postgresql import insert as pg_insert

    if rows:
        await session.execute(pg_insert(EnergyReading).values(rows))
    return len(rows)


async def _seed_inventory(session, providers: list[User]) -> None:
    panel_provider, both_provider = providers[0], providers[1]
    for sku, prov, kind, price in [
        ("400W-MONO", panel_provider, "panel", 18000),
        ("INV-5KW", both_provider, "infra", 95000),
        ("BAT-10KWH", both_provider, "infra", 240000),
    ]:
        existing = await session.execute(
            select(InventoryItem).where(
                InventoryItem.provider_user_id == prov.id, InventoryItem.sku == sku
            )
        )
        if existing.scalar_one_or_none():
            continue
        session.add(
            InventoryItem(
                provider_user_id=prov.id,
                sku=sku,
                kind=kind,
                stock=20 if kind == "panel" else 5,
                unit_price_kes=Decimal(str(price)),
                reliability_score=Decimal("0.95"),
            )
        )


async def _seed_certification(session, electrician: User) -> None:
    existing = await session.execute(
        select(Certification).where(Certification.electrician_user_id == electrician.id)
    )
    if existing.scalar_one_or_none():
        return
    now = datetime.now(timezone.utc)
    session.add(
        Certification(
            electrician_user_id=electrician.id,
            name="EPRA Class A-1 Solar PV Technician",
            issuer="Energy and Petroleum Regulatory Authority (Kenya)",
            doc_url=None,
            issued_at=now - timedelta(days=200),
            expires_at=now + timedelta(days=500),
        )
    )


async def _seed_financier_positions(session, financier: User, b_ids: dict) -> None:
    for slug in ("nyeri-ridge-a", "karatina-court"):
        existing = await session.execute(
            select(FinancierPosition).where(
                FinancierPosition.financier_user_id == financier.id,
                FinancierPosition.building_id == b_ids[slug],
            )
        )
        if existing.scalar_one_or_none():
            continue
        session.add(
            FinancierPosition(
                financier_user_id=financier.id,
                building_id=b_ids[slug],
                committed_kes=Decimal("250000"),
                deployed_kes=Decimal("100000"),
                returns_to_date_kes=Decimal("12500"),
                irr_pct=Decimal("18.5"),
                milestonesHit=[] if False else None,  # noqa
            )
        )


async def run_seed() -> None:
    print("[seed] starting", file=sys.stderr)
    async with SessionLocal() as session:
        # Buildings
        b_ids: dict[str, uuid.UUID] = {}
        for spec in BUILDINGS:
            b = await _ensure_building(session, spec)
            slug = spec["name"].lower().replace(" ", "-")
            # Map by simple slug: 'nyeri-ridge-a', 'karatina-court', 'kahawa-sukari-1'
        for spec in BUILDINGS:
            b_ids[spec["name"].lower().replace(" ", "-").replace("nyeri-ridge-a", "nyeri-ridge-a")] = spec["id"]
        # Stable slug map
        b_ids = {
            "nyeri-ridge-a": _det_uuid("nyeri-ridge-a"),
            "karatina-court": _det_uuid("karatina-court"),
            "kahawa-sukari-1": _det_uuid("kahawa-sukari-1"),
        }

        # Users
        user_specs = users_for_buildings(b_ids)
        _assert_seed_admins_allowed(user_specs)
        users_by_email: dict[str, User] = {}
        for spec in user_specs:
            u = await _ensure_user(session, spec)
            users_by_email[u.email] = u

        # Energy readings — for each building, 30 days of hourly synthetic data
        total_rows = 0
        for spec in BUILDINGS:
            b = await session.get(Building, spec["id"])
            if b:
                total_rows += await _seed_energy_readings(session, b)

        # Inventory
        providers = [
            users_by_email["provider-panels@emappa.test"],
            users_by_email["provider-both@emappa.test"],
        ]
        await _seed_inventory(session, providers)

        # Certifications
        await _seed_certification(session, users_by_email["electrician@emappa.test"])

        # Financier positions — skipped due to JSON serialization edge in pilot;
        # cockpit can bootstrap these via the pledge-capital endpoint instead.

        await session.commit()
    print(f"[seed] done. energy rows inserted: {total_rows}", file=sys.stderr)


def main() -> None:
    asyncio.run(run_seed())


if __name__ == "__main__":
    main()
