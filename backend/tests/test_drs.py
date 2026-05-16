from types import SimpleNamespace

from app.data.demo import DEMO_PROJECTS
from app.data.seed_uuids import seed_uuid
from app.services.building_drs import resolve_project_dict_for_drs
from app.services.drs import calculate_drs
from app.services.projector import project_building


def test_resolve_karatina_uuid_blocked_matches_demo_reasons():
    building = SimpleNamespace(
        id=seed_uuid("karatina-court"),
        name="Karatina Court",
        unit_count=16,
        kind="apartment",
        stage="review",
        address="Karatina Town Center",
    )
    proj = resolve_project_dict_for_drs(building, 46000.0)
    drs = project_building(proj)["drs"]
    assert drs["decision"] == "blocked"
    assert any("Hardware package" in msg or "60%" in msg for msg in drs["reasons"])


def test_homeowner_stakeholder_readiness_or_matches_checklist():
    inp = {
        "siteKind": "homeowner",
        "demandCoverage": 70,
        "prepaidCommitment": 65,
        "loadProfile": 72,
        "installationReadiness": 68,
        "installerReadiness": 76,
        "capitalAlignment": 70,
        "projectedUtilization": 0.76,
        "hasPrepaidFunds": True,
        "hasResidentDemandSignal": True,
        "hasCertifiedLeadElectrician": True,
        "hasVerifiedSupplierQuote": True,
        "monitoringConnectivityResolved": True,
        "settlementDataTrusted": True,
        "contractsAndComplianceReady": True,
        "propertyAuthorityComplete": True,
        "siteFeasibilityComplete": True,
        "loadProfileSizingComplete": True,
        "capitalAndLaborResolved": True,
        "hardwareProcurementComplete": True,
        "legalUtilityDisciplineComplete": True,
        "stakeholdersVetted": False,
        "solarApartmentCapacityFitVerified": True,
        "apartmentAtsMeterMappingVerified": True,
        "atsKplcSwitchingVerified": True,
        "ownerPermissionsComplete": True,
    }
    out = calculate_drs(inp)
    assert all(f["code"] != "STAKE_READY" for f in out["criticalFailures"])
    stake = next(c for c in out["checklist"] if c["id"] == "stake")
    assert stake["complete"] is True


def test_drs_blocks_karatina_for_supplier_quote_and_demand():
    drs = project_building(DEMO_PROJECTS[1])["drs"]
    assert drs["decision"] == "blocked"
    assert any("Hardware package" in r or "60%" in r for r in drs["reasons"])


def test_drs_deployment_ready_nyeri():
    drs = project_building(DEMO_PROJECTS[0])["drs"]
    assert drs["decision"] == "deployment_ready"


def test_drs_blocks_when_hardware_missing_even_if_utilization_ok():
    project = {**DEMO_PROJECTS[0], "drs": {**DEMO_PROJECTS[0]["drs"], "hasVerifiedSupplierQuote": False}}
    drs = project_building(project)["drs"]
    assert drs["decision"] == "blocked"
    assert any("Hardware package" in r for r in drs["reasons"])


def test_drs_includes_checklist_and_critical_failure_metadata():
    drs = project_building(DEMO_PROJECTS[0])["drs"]
    assert drs["checklist"]
    assert all("label" in item and "complete" in item for item in drs["checklist"])
    assert drs["criticalFailures"] == []
