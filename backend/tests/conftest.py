import pytest
from httpx import ASGITransport, AsyncClient

from app.db.session import engine
from app.main import app
from app.store import store


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
