import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_login_and_me(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/admin/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["data"]["username"] == "admin"
