import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import SessionLocal, drop_db, init_db
from app.main import app
from app.services.startup import ensure_initial_admin


@pytest.fixture(autouse=True)
async def reset_db():
    await drop_db()
    await init_db()
    async with SessionLocal() as db:
        await ensure_initial_admin(db)
    yield
    await drop_db()


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def auth_headers(client: AsyncClient):
    response = await client.post(
        "/api/v1/admin/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
