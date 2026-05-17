import asyncio

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import get_settings
from app.db.session import engine
from app.main import app
from app.store import store


def pytest_configure(config):
    """Purge transient test users once before the suite runs.

    CI provisions a fresh Postgres per run, but local dev shares the app DB. Tests that
    POST /auth/verify-otp with a fixed email leave a user row behind; the next run sees
    the prior role and fails. We scope deletion to the dedicated test-email prefix to
    avoid touching seeded fixtures or real users. A dedicated short-lived engine keeps
    this off the app's connection pool, which per-test fixtures dispose between tests.
    """
    async def _purge() -> None:
        cleanup_engine = create_async_engine(get_settings().database_url)
        try:
            async with cleanup_engine.begin() as conn:
                await conn.execute(
                    text("DELETE FROM users WHERE email LIKE 'pilot-%@emappa.test'")
                )
        finally:
            await cleanup_engine.dispose()

    asyncio.run(_purge())


@pytest.fixture(autouse=True)
def reset_store():
    store.reset()
    yield


@pytest.fixture(autouse=True)
async def reset_async_db_pool():
    """Dispose pooled asyncpg connections so each test gets a fresh event loop."""
    yield
    await engine.dispose()


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
