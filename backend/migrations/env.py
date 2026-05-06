"""Alembic environment for the e.mappa backend.

Reads DATABASE_URL from app.config (which itself reads EMAPPA_DATABASE_URL or .env).
Targets are intentionally raw SQL via op.create_table — we lock schema in migrations,
not in autogenerate, so the schema in docs/SPRINT_CONTRACT.md §2 is the source of truth.
"""
from __future__ import annotations

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.config import get_settings

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Schema is defined explicitly in each migration; we don't use autogenerate.
target_metadata = None


def _sync_url() -> str:
    """Alembic uses sync mode for migration command execution; convert async URL."""
    url = get_settings().database_url
    return url.replace("+asyncpg", "")


def run_migrations_offline() -> None:
    context.configure(
        url=_sync_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    cfg_section = config.get_section(config.config_ini_section, {})
    cfg_section["sqlalchemy.url"] = get_settings().database_url
    connectable = async_engine_from_config(cfg_section, prefix="sqlalchemy.", poolclass=pool.NullPool)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
