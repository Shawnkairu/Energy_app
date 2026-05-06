def test_health(client):
    assert client.get("/health").json() == {"status": "ok", "db": "connected"}


def test_projects_contract(client):
    response = client.get("/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) == 2
    assert projects[0]["project"]["id"] == "nyeri-ridge-a"
    assert "roleViews" in projects[0]


def test_role_home_contract(client):
    response = client.get("/roles/resident/home")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "resident"
    assert data["primary"]["project"]["id"] == "nyeri-ridge-a"


def test_waitlist_persists(client):
    response = client.post("/waitlist", json={"role": "resident", "phone": "+254700000000", "neighborhood": "Nyeri"})
    assert response.status_code == 200
    assert response.json()["source"] == "api"


def test_prepaid_commit_confirm_updates_project(client):
    created = client.post("/prepaid/commit", json={"buildingId": "nyeri-ridge-a", "amountKes": 500}).json()
    confirmed = client.post(f"/prepaid/{created['id']}/confirm")
    assert confirmed.status_code == 200
    project = client.get("/projects/nyeri-ridge-a").json()
    assert project["project"]["prepaidCommittedKes"] == 184500


def test_bad_prepaid_rejected(client):
    response = client.post("/prepaid/commit", json={"buildingId": "nyeri-ridge-a", "amountKes": 0})
    assert response.status_code == 422
