"""Energy readings repository."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import desc, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.energy import EnergyReading


async def bulk_insert_readings(
    session: AsyncSession, readings: list[dict]
) -> int:
    if not readings:
        return 0
    stmt = insert(EnergyReading).values(readings)
    await session.execute(stmt)
    return len(readings)


async def series(
    session: AsyncSession,
    building_id: uuid.UUID,
    *,
    kind: str,
    start: datetime,
    end: datetime,
) -> list[EnergyReading]:
    result = await session.execute(
        select(EnergyReading)
        .where(EnergyReading.building_id == building_id)
        .where(EnergyReading.kind == kind)
        .where(EnergyReading.timestamp >= start)
        .where(EnergyReading.timestamp <= end)
        .order_by(EnergyReading.timestamp)
    )
    return list(result.scalars().all())


async def today_summary(
    session: AsyncSession, building_id: uuid.UUID
) -> dict[str, list[float]]:
    """Return 24-element arrays for generation, load, irradiance for the trailing 24h."""
    end = datetime.now(timezone.utc)
    start = end - timedelta(hours=24)
    out: dict[str, list[float]] = {"generation_kwh": [], "load_kwh": [], "irradiance_w_m2": []}
    kind_map = {"generation": "generation_kwh", "load": "load_kwh", "irradiance": "irradiance_w_m2"}
    for kind, key in kind_map.items():
        rows = await series(session, building_id, kind=kind, start=start, end=end)
        # Bucket by hour (last 24)
        bucket: dict[int, float] = {}
        for r in rows:
            hour = r.timestamp.hour if r.timestamp else 0
            bucket[hour] = bucket.get(hour, 0.0) + float(r.value)
        out[key] = [bucket.get(h, 0.0) for h in range(24)]
    return out


async def latest_reading(
    session: AsyncSession, building_id: uuid.UUID, kind: str
) -> EnergyReading | None:
    result = await session.execute(
        select(EnergyReading)
        .where(EnergyReading.building_id == building_id)
        .where(EnergyReading.kind == kind)
        .order_by(desc(EnergyReading.timestamp))
        .limit(1)
    )
    return result.scalar_one_or_none()
