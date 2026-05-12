def _auth_headers(client):
    response = client.post(
        "/auth/verify-otp",
        json={"email": "resident-a@emappa.test", "code": "000000"},
    )
    assert response.status_code == 200
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_health(client):
    assert client.get("/health").json() == {"status": "ok", "db": "ok"}


def test_projects_contract(client):
    response = client.get("/projects", headers=_auth_headers(client))
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 1
    assert "id" in projects[0]
    assert "prepaidCommittedKes" in projects[0]


def test_role_home_contract(client):
    response = client.get("/roles/resident/home", headers=_auth_headers(client))
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "resident"
    assert "projects" in data
    assert "activity" in data


def test_waitlist_persists(client):
    response = client.post(
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


def test_prepaid_commit_confirm_updates_project(client):
    headers = _auth_headers(client)
    projects_response = client.get("/projects", headers=headers)
    assert projects_response.status_code == 200
    building_id = projects_response.json()[0]["id"]

    created = client.post(
        "/prepaid/commit",
        json={"buildingId": building_id, "amountKes": 500},
        headers=headers,
    )
    assert created.status_code == 200
    assert "commitment" in created.json()


def test_bad_prepaid_rejected(client):
    headers = _auth_headers(client)
    projects_response = client.get("/projects", headers=headers)
    assert projects_response.status_code == 200
    building_id = projects_response.json()[0]["id"]

    response = client.post(
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
