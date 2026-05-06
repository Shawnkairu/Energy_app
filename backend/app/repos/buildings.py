"""Buildings repository."""
from __future__ import annotations

import secrets
import string
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.building import Building


_CODE_ALPHABET = string.ascii_uppercase + string.digits  # 36 chars; no lowercase to avoid l/1 confusion
# Drop ambiguous chars so codes are read aloud reliably
_CODE_ALPHABET = "".join(c for c in _CODE_ALPHABET if c not in "0O1I")


def _generate_invite_code(length: int = 6) -> str:
    return "".join(secrets.choice(_CODE_ALPHABET) for _ in range(length))


async def get_by_invite_code(session: AsyncSession, code: str) -> Building | None:
    result = await session.execute(
        select(Building).where(Building.invite_code == code.upper().strip())
    )
    return result.scalar_one_or_none()


async def list_all(session: AsyncSession) -> list[Building]:
    result = await session.execute(select(Building).order_by(Building.created_at))
    return list(result.scalars().all())


async def get(session: AsyncSession, building_id: uuid.UUID) -> Building | None:
    return await session.get(Building, building_id)


async def create(
    session: AsyncSession,
    *,
    name: str,
    address: str,
    lat: Decimal | float,
    lon: Decimal | float,
    unit_count: int,
    occupancy: Decimal | float | None = None,
    kind: str = "apartment",
    stage: str = "listed",
) -> Building:
    if kind == "single_family" and unit_count != 1:
        raise ValueError("single_family buildings must have unit_count=1")

    # Generate a unique invite code; loop on the rare collision.
    code = _generate_invite_code()
    for _ in range(8):
        existing = await get_by_invite_code(session, code)
        if existing is None:
            break
        code = _generate_invite_code()

    building = Building(
        name=name,
        address=address,
        lat=lat,
        lon=lon,
        unit_count=unit_count,
        occupancy=occupancy,
        kind=kind,
        stage=stage,
        invite_code=code,
    )
    session.add(building)
    await session.flush()
    return building


async def update_roof(
    session: AsyncSession,
    building_id: uuid.UUID,
    *,
    polygon_geojson: dict[str, Any] | None = None,
    area_m2: Decimal | float | None = None,
    source: str = "owner_typed",
    confidence: Decimal | float | None = None,
) -> Building | None:
    values: dict[str, Any] = {
        "roof_source": source,
        "updated_at": datetime.now(timezone.utc),
    }
    if polygon_geojson is not None:
        values["roof_polygon_geojson"] = polygon_geojson
    if area_m2 is not None:
        values["roof_area_m2"] = area_m2
    if confidence is not None:
        values["roof_confidence"] = confidence
    await session.execute(update(Building).where(Building.id == building_id).values(**values))
    return await get(session, building_id)


async def set_stage(session: AsyncSession, building_id: uuid.UUID, stage: str) -> None:
    await session.execute(
        update(Building)
        .where(Building.id == building_id)
        .values(stage=stage, updated_at=datetime.now(timezone.utc))
    )
