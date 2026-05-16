"""Deterministic UUIDs for seeded pilot entities — mirrors scripts/seed.py namespace."""

from __future__ import annotations

import uuid

SEED_NS = uuid.UUID("11111111-1111-1111-1111-111111111111")


def seed_uuid(name: str) -> uuid.UUID:
    return uuid.uuid5(SEED_NS, name)
