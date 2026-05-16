from app.data.demo import DEMO_PROJECTS
from app.services.consistency import audit_all_demo_projects
from app.services.lbrs import calculate_lbrs
from app.services.payback import calculate_payback
from app.services.projector import project_building


def test_lbrs_live_ready_all_gates():
    result = calculate_lbrs(
        {
            "siteKind": "apartment",
            "asBuiltBomVerified": True,
            "electricalSafetyComplete": True,
            "solarBusIsolationVerified": True,
            "inverterBatteryTestsComplete": True,
            "atsSwitchingPerApartmentComplete": True,
            "meterMappingDataReliable": True,
            "tokenSettlementDryRunPassed": True,
            "backendTokenControlDryRunPassed": True,
            "residentOwnerLaunchReadinessComplete": True,
        }
    )
    assert result["decision"] == "deployment_ready"
    assert result["score"] == 100.0
    assert len(result["checklist"]) == 8
    assert all("responsibleRole" in f for f in result["criticalFailures"])


def test_lbrs_blocks_on_safety():
    result = calculate_lbrs(
        {
            "asBuiltBomVerified": True,
            "electricalSafetyComplete": False,
            "solarBusIsolationVerified": True,
            "inverterBatteryTestsComplete": True,
            "atsSwitchingPerApartmentComplete": True,
            "meterMappingDataReliable": True,
            "tokenSettlementDryRunPassed": True,
            "backendTokenControlDryRunPassed": True,
            "residentOwnerLaunchReadinessComplete": True,
        }
    )
    assert result["decision"] == "blocked"
    assert any(f["code"] == "ELEC_SAFE" for f in result["criticalFailures"])


def test_lbrs_homeowner_requires_home_switching():
    base = {
        "siteKind": "homeowner",
        "asBuiltBomVerified": True,
        "electricalSafetyComplete": True,
        "solarBusIsolationVerified": True,
        "inverterBatteryTestsComplete": True,
        "meterMappingDataReliable": True,
        "tokenSettlementDryRunPassed": True,
        "backendTokenControlDryRunPassed": True,
        "residentOwnerLaunchReadinessComplete": True,
        "homeSwitchingFallbackComplete": False,
    }
    blocked = calculate_lbrs(base)
    assert blocked["decision"] == "blocked"
    assert any(f["code"] == "ATS_HOME" for f in blocked["criticalFailures"])

    ok = calculate_lbrs({**base, "homeSwitchingFallbackComplete": True})
    assert ok["decision"] == "deployment_ready"


def test_payback_positive_matches_two_decimal_rounding():
    pb = calculate_payback({"investment": 12000, "monthlyPayout": 1000})
    assert pb["notCurrentlyRecovering"] is False
    assert pb["principalMonths"] == 12.0
    assert pb["yearsToPrincipal"] == 1.0

    assert calculate_payback({"investment": 100_000, "monthlyPayout": 333})["principalMonths"] == 300.3


def test_payback_zero_payout():
    z = calculate_payback({"investment": 12000, "monthlyPayout": 0})
    assert z["notCurrentlyRecovering"] is True


def test_demo_consistency_audit():
    audit = audit_all_demo_projects(DEMO_PROJECTS)
    assert audit["ok"]
    assert all(r["ok"] for r in audit["results"])


def test_projector_owner_royalty_zero_for_homeowner():
    p = {**DEMO_PROJECTS[0], "buildingKind": "single_family", "stage": "live"}
    out = project_building(p)
    assert out["roleViews"]["owner"]["monthlyRoyaltyKes"] == 0
    assert out["lbrs"]["checklist"]


def test_deployment_gates_track_drs_checklist():
    out = project_building(DEMO_PROJECTS[0])
    assert len(out["roleViews"]["electrician"]["gates"]) == len(out["drs"]["checklist"])
