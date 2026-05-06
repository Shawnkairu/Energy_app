from copy import deepcopy
from datetime import datetime, timedelta, timezone
from random import randint
from uuid import uuid4
from app.data.demo import DEMO_PROJECTS
from app.services.projector import project_building


class DemoStore:
    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self.projects = {project["id"]: deepcopy(project) for project in DEMO_PROJECTS}
        self.waitlist = []
        self.prepaid = []
        self.otp = {}
        self.settlements = []
        self.drs_snapshots = []

    def list_projects(self) -> list[dict]:
        return list(self.projects.values())

    def get_project(self, project_id: str) -> dict | None:
        return self.projects.get(project_id)

    def activity_feed(self) -> list[str]:
        return ["Resident prepaid commitment increased by KSh 18,000", "Supplier quote verified for inverter and battery package", "Installer checklist ready for Nyeri Ridge A", "DRS review flagged low utilization risk at Karatina Court"]

    def add_waitlist_lead(self, lead: dict) -> dict:
        submission = {**lead, "id": str(uuid4()), "createdAt": datetime.now(timezone.utc).isoformat(), "source": "api"}
        self.waitlist.append(submission)
        return submission

    def issue_otp(self, phone: str) -> str:
        code = f"{randint(0, 999999):06d}"
        self.otp[phone] = {"code": code, "expiresAt": datetime.now(timezone.utc) + timedelta(minutes=5)}
        return code

    def verify_otp(self, phone: str, code: str) -> dict | None:
        entry = self.otp.get(phone)
        if not entry or entry["code"] != code or entry["expiresAt"] < datetime.now(timezone.utc):
            return None
        return {"id": "pilot-user", "phone": phone, "role": "resident", "buildingId": "nyeri-ridge-a"}

    def default_user(self) -> dict:
        return {"id": "pilot-user", "phone": "+254700000000", "role": "resident", "buildingId": "nyeri-ridge-a"}

    def create_prepaid_commitment(self, building_id: str, amount_kes: float, resident_id: str = "pilot-resident") -> dict:
        commitment = {"id": str(uuid4()), "buildingId": building_id, "residentId": resident_id, "amountKes": amount_kes, "status": "pending", "createdAt": datetime.now(timezone.utc).isoformat()}
        self.prepaid.append(commitment)
        return commitment

    def confirm_prepaid_commitment(self, commitment_id: str) -> dict | None:
        for commitment in self.prepaid:
            if commitment["id"] == commitment_id:
                if commitment["status"] != "confirmed":
                    commitment["status"] = "confirmed"
                    self.projects[commitment["buildingId"]]["prepaidCommittedKes"] += commitment["amountKes"]
                    self.capture_drs_snapshot(commitment["buildingId"])
                return commitment
        return None

    def prepaid_balance(self, building_id: str) -> float:
        confirmed = sum(item["amountKes"] for item in self.prepaid if item["buildingId"] == building_id and item["status"] == "confirmed")
        return self.projects[building_id]["prepaidCommittedKes"] + confirmed

    def prepaid_history(self, building_id: str) -> list[dict]:
        return [item for item in self.prepaid if item["buildingId"] == building_id]

    def update_drs(self, building_id: str, updates: dict) -> dict | None:
        project = self.projects.get(building_id)
        if project is None:
            return None
        project["drs"].update(updates)
        self.capture_drs_snapshot(building_id)
        return project

    def capture_drs_snapshot(self, building_id: str) -> None:
        project = self.projects[building_id]
        self.drs_snapshots.append({"buildingId": building_id, "capturedAt": datetime.now(timezone.utc).isoformat(), "drs": project_building(project)["drs"]})

    def drs_history(self, building_id: str) -> list[dict]:
        snapshots = [item for item in self.drs_snapshots if item["buildingId"] == building_id]
        return sorted(snapshots, key=lambda item: item["capturedAt"], reverse=True)

    def add_settlement_record(self, record: dict) -> None:
        self.settlements.append(record)

    def settlement_history(self, building_id: str) -> list[dict]:
        records = [item for item in self.settlements if item["buildingId"] == building_id]
        return sorted(records, key=lambda item: item["periodStart"], reverse=True)

    def transfer_ownership(self, building_id: str, payload: dict) -> list[dict]:
        project = self.projects.get(building_id)
        if project is None:
            raise KeyError(building_id)
        if payload["percentage"] <= 0:
            raise ValueError("Transfer percentage must be greater than zero")
        key = f"{payload['pool']}Ownership"
        positions = project[key]
        sender = next((position for position in positions if position["ownerId"] == payload["fromOwnerId"]), None)
        if sender is None or sender["percentage"] < payload["percentage"]:
            raise ValueError("Sender does not have enough ownership")
        sender["percentage"] -= payload["percentage"]
        recipient = next((position for position in positions if position["ownerId"] == payload["toOwnerId"]), None)
        if recipient:
            recipient["percentage"] += payload["percentage"]
        else:
            positions.append({"ownerId": payload["toOwnerId"], "ownerRole": payload["toOwnerRole"], "percentage": payload["percentage"]})
        project[key] = [position for position in positions if position["percentage"] > 0.0001]
        if abs(sum(position["percentage"] for position in project[key]) - 1) > 0.0001:
            raise ValueError("Ownership ledger must total 100%")
        return project[key]


store = DemoStore()
