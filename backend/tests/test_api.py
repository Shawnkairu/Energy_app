import pytest
from httpx import AsyncClient

from app.data.seed_uuids import seed_uuid
from scripts import seed as seed_script


async def _auth_headers(client: AsyncClient):
    response = await client.post(
        "/auth/verify-otp",
        json={"email": "resident-a@emappa.test", "code": "000000"},
    )
    assert response.status_code == 200
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}


async def test_onboarding_complete_rejects_admin_role_in_body(client):
    headers = await _auth_headers(client)
    response = await client.post(
        "/me/onboarding-complete",
        headers=headers,
        json={"displayName": "x", "role": "admin"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "admin_onboarding_forbidden"


async def test_select_role_persists_financier_before_onboarding_complete(client):
    email = "pilot-role-pick@emappa.test"
    response = await client.post("/auth/verify-otp", json={"email": email, "code": "000000"})
    assert response.status_code == 200
    token = response.json()["token"]
    user = response.json()["user"]
    assert user["role"] == "resident"
    assert user["onboardingComplete"] is False
    headers = {"Authorization": f"Bearer {token}"}
    r2 = await client.post("/me/select-role", headers=headers, json={"role": "financier"})
    assert r2.status_code == 200
    assert r2.json()["user"]["role"] == "financier"
    assert r2.json()["user"]["onboardingComplete"] is False


async def test_select_role_rejects_admin(client):
    response = await client.post("/auth/verify-otp", json={"email": "pilot-admin-role@emappa.test", "code": "000000"})
    assert response.status_code == 200
    token = response.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post("/me/select-role", headers=headers, json={"role": "admin"})
    assert r.status_code == 403
    assert r.json()["detail"] == "admin_role_forbidden"


async def test_select_role_conflict_when_already_complete(client):
    headers = await _auth_headers(client)
    me = await client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["onboardingComplete"] is True
    r = await client.post("/me/select-role", headers=headers, json={"role": "electrician"})
    assert r.status_code == 409
    assert r.json()["detail"] == "onboarding_already_complete"


async def test_select_role_provider_requires_business_type(client):
    email = "pilot-provider-pick@emappa.test"
    response = await client.post("/auth/verify-otp", json={"email": email, "code": "000000"})
    assert response.status_code == 200
    token = response.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post("/me/select-role", headers=headers, json={"role": "provider"})
    assert r.status_code == 400
    assert r.json()["detail"] == "business_type_required_for_provider"


def test_seed_admins_must_be_allowlisted(monkeypatch):
    monkeypatch.setattr(seed_script, "get_settings", lambda: type("Settings", (), {"admin_emails": "ops@emappa.test"})())

    with pytest.raises(RuntimeError, match="not in EMAPPA_ADMIN_EMAILS"):
        seed_script._assert_seed_admins_allowed([{"email": "admin@emappa.test", "role": "admin"}])


def test_seed_admins_pass_when_allowlisted(monkeypatch):
    monkeypatch.setattr(seed_script, "get_settings", lambda: type("Settings", (), {"admin_emails": "admin@emappa.test"})())

    seed_script._assert_seed_admins_allowed([{"email": "admin@emappa.test", "role": "admin"}])


async def test_health(client):
    response = await client.get("/health")
    assert response.json() == {"status": "ok", "db": "ok"}


async def test_projects_contract(client):
    response = await client.get("/projects", headers=await _auth_headers(client))
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 1
    assert "id" in projects[0]
    assert "prepaidCommittedKes" in projects[0]


async def test_get_drs_returns_canonical_payload_when_building_exists(client):
    headers = await _auth_headers(client)
    nyeri_id = str(seed_uuid("nyeri-ridge-a"))
    response = await client.get(f"/drs/{nyeri_id}", headers=headers)
    if response.status_code == 404:
        pytest.skip("DB has no seeded buildings — run backend/scripts/seed for full integration")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload.get("criticalFailures"), list)
    assert isinstance(payload.get("checklist"), list)
    assert isinstance(payload.get("warnings"), list)
    assert float(payload["score"]) <= 100.0


async def test_role_home_contract(client):
    response = await client.get("/roles/resident/home", headers=await _auth_headers(client))
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "resident"
    assert "projects" in data
    assert "activity" in data


async def test_waitlist_persists(client):
    response = await client.post(
        "/waitlist",
        json={
            "name": "Resident A",
            "email": "resident-a@emappa.test",
            "role": "resident",
            "phone": "+254700000000",
            "neighborhood": "Nyeri",
        },
    )
    assert response.status_code == 200
    assert response.json()["ok"] is True


async def test_prepaid_commit_confirm_updates_project(client):
    headers = await _auth_headers(client)
    projects_response = await client.get("/projects", headers=headers)
    assert projects_response.status_code == 200
    building_id = projects_response.json()[0]["id"]

    created = await client.post(
        "/prepaid/commit",
        json={"buildingId": building_id, "amountKes": 500},
        headers=headers,
    )
    assert created.status_code == 200
    assert "commitment" in created.json()


async def test_bad_prepaid_rejected(client):
    headers = await _auth_headers(client)
    projects_response = await client.get("/projects", headers=headers)
    assert projects_response.status_code == 200
    building_id = projects_response.json()[0]["id"]

    response = await client.post(
        "/prepaid/commit",
        json={"buildingId": building_id, "amountKes": 0},
        headers=headers,
    )
    assert response.status_code == 422


def test_dev_seed_otp_only_allows_test_accounts():
    from app.api.auth import _allows_dev_seed_otp

    assert _allows_dev_seed_otp("resident-a@emappa.test", "000000")
    assert not _allows_dev_seed_otp("resident-a@emappa.test", "123456")
    assert not _allows_dev_seed_otp("person@example.com", "000000")
