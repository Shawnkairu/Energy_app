"""Pilot seed — populates dev database with the fixtures referenced in
docs/SPRINT_CONTRACT.md §2.

This is a placeholder skeleton. The Phase B `db` and `solar` subagents flesh out
the actual inserts using the SQLAlchemy repos and the PVWatts/NASA-POWER adapters.
For now this file documents the required seed shape so subagents have an unambiguous spec.

Required seed contents:

  Buildings (2):
    - nyeri-ridge-a   — real Kenyan lat/lon
    - karatina-court  — real Kenyan lat/lon

  Users (10):
    - admin@emappa.test                  role=admin            (granted via this script, NOT public)
    - resident-a@emappa.test             role=resident         building=nyeri-ridge-a, owns shares > 0
    - resident-b@emappa.test             role=resident         building=nyeri-ridge-a, owns shares > 0
    - resident-c@emappa.test             role=resident         building=karatina-court, shares = 0
    - resident-d@emappa.test             role=resident         building=karatina-court, shares = 0
    - building-owner@emappa.test         role=building_owner   building=nyeri-ridge-a
    - provider-panels@emappa.test        role=provider         business_type=panels
    - provider-both@emappa.test          role=provider         business_type=both
    - financier@emappa.test              role=financier
    - electrician@emappa.test            role=electrician
    All seed users have onboarding_complete=true.

  Energy readings: ~720 hourly rows per building (last 30 days; generation + load + irradiance)
    All tagged source='synthetic' with provenance describing the source adapter.

  Settlement period: one for last 30 days per building, simulation=true.

  Inventory: 3 SKUs across the 2 providers (1 panel SKU, 2 infra SKUs).

  Certifications: 1 valid cert on the electrician seed user.

  Financier portfolio: 5,000 KES committed across the 2 buildings.

Usage:

    EMAPPA_DEV_SEED=true python -m backend.scripts.seed

The seed is idempotent — running it twice does not duplicate data.
"""
from __future__ import annotations

import asyncio
import sys


async def run_seed() -> None:
    print(
        "[seed] placeholder — Phase B `db`/`auth`/`solar` subagents implement the actual inserts.",
        file=sys.stderr,
    )
    print(
        "[seed] required shape is documented in this file's docstring; matches docs/SPRINT_CONTRACT.md §2.",
        file=sys.stderr,
    )


def main() -> None:
    asyncio.run(run_seed())


if __name__ == "__main__":
    main()
