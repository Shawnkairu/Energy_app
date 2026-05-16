"""LBRS — mirrors packages/shared/src/lbrs.ts; see docs/LBRS_FORMULA.md."""


def round1(value: float) -> float:
    return round(value + 1e-12, 1)


def _site_kind(inp: dict) -> str:
    return inp.get("siteKind") or "apartment"


def _collect_lbrs_critical_failures(inp: dict) -> list[dict]:
    f: list[dict] = []
    if not inp.get("asBuiltBomVerified"):
        f.append({"code": "AS_BUILT", "message": "As-built / BOM verification incomplete.", "responsibleRole": "electrician"})
    if not inp.get("electricalSafetyComplete"):
        f.append({"code": "ELEC_SAFE", "message": "Electrical safety tests incomplete.", "responsibleRole": "electrician"})
    if not inp.get("solarBusIsolationVerified"):
        f.append(
            {"code": "ISO", "message": "Solar bus isolation / no unsafe backfeed not verified.", "responsibleRole": "electrician"}
        )
    if not inp.get("inverterBatteryTestsComplete"):
        f.append(
            {"code": "INV_BAT", "message": "Inverter and battery commissioning tests incomplete.", "responsibleRole": "electrician"}
        )
    sk = _site_kind(inp)
    if sk == "apartment":
        if not inp.get("atsSwitchingPerApartmentComplete"):
            f.append(
                {"code": "ATS_APT", "message": "ATS switching tests per apartment incomplete.", "responsibleRole": "electrician"}
            )
    else:
        if not inp.get("homeSwitchingFallbackComplete"):
            f.append(
                {
                    "code": "ATS_HOME",
                    "message": "Home changeover / ATS and grid fallback tests incomplete.",
                    "responsibleRole": "electrician",
                }
            )
    if not inp.get("meterMappingDataReliable"):
        f.append({"code": "METER_MAP", "message": "Meter mapping and data reliability not verified.", "responsibleRole": "electrician"})
    if not inp.get("tokenSettlementDryRunPassed"):
        f.append({"code": "TOKEN_DRY", "message": "Token control / settlement dry run failed.", "responsibleRole": "admin"})
    if not inp.get("backendTokenControlDryRunPassed"):
        f.append(
            {
                "code": "BACKEND_DRY",
                "message": "Backend / token / settlement integration dry run incomplete.",
                "responsibleRole": "admin",
            }
        )
    if not inp.get("residentOwnerLaunchReadinessComplete"):
        f.append(
            {
                "code": "LAUNCH",
                "message": "Resident/owner launch readiness incomplete.",
                "responsibleRole": "building_owner",
            }
        )
    return f


def _checklist(inp: dict) -> list[dict]:
    sk = _site_kind(inp)
    ats_item = (
        {
            "id": "ats",
            "testName": "ATS apt",
            "displayWeight": 15,
            "critical": True,
            "complete": bool(inp.get("atsSwitchingPerApartmentComplete")),
            "label": "ATS switching per apartment",
        }
        if sk == "apartment"
        else {
            "id": "ats",
            "testName": "ATS home",
            "displayWeight": 15,
            "critical": True,
            "complete": bool(inp.get("homeSwitchingFallbackComplete")),
            "label": "Switching / fallback tests",
        }
    )
    return [
        {"id": "asbuilt", "testName": "As-built/BOM", "displayWeight": 10, "critical": True, "complete": bool(inp.get("asBuiltBomVerified")), "label": "As-built / BOM verification"},
        {"id": "safe", "testName": "Electrical safety", "displayWeight": 20, "critical": True, "complete": bool(inp.get("electricalSafetyComplete")), "label": "Electrical safety tests"},
        {"id": "iso", "testName": "Isolation", "displayWeight": 15, "critical": True, "complete": bool(inp.get("solarBusIsolationVerified")), "label": "Solar bus isolation / no backfeed"},
        {"id": "inv", "testName": "Inverter/battery", "displayWeight": 10, "critical": True, "complete": bool(inp.get("inverterBatteryTestsComplete")), "label": "Inverter + battery tests"},
        ats_item,
        {"id": "meter", "testName": "Meters", "displayWeight": 10, "critical": True, "complete": bool(inp.get("meterMappingDataReliable")), "label": "Meter mapping + data reliability"},
        {
            "id": "dry",
            "testName": "Dry run",
            "displayWeight": 10,
            "critical": True,
            "complete": bool(inp.get("tokenSettlementDryRunPassed") and inp.get("backendTokenControlDryRunPassed")),
            "label": "Backend/token/settlement dry run",
        },
        {
            "id": "launch",
            "testName": "Launch",
            "displayWeight": 10,
            "critical": True,
            "complete": bool(inp.get("residentOwnerLaunchReadinessComplete")),
            "label": "Resident/owner launch readiness",
        },
    ]


def _display_score(items: list[dict]) -> float:
    crit = [i for i in items if i.get("critical")]
    num = sum(i["displayWeight"] for i in crit if i.get("complete"))
    den = sum(i["displayWeight"] for i in crit)
    return round1((num / den) * 100) if den > 0 else 0.0


def calculate_lbrs(inp: dict) -> dict:
    items = _checklist(inp)
    fails = _collect_lbrs_critical_failures(inp)
    warnings: list[str] = []
    score = _display_score(items)
    if fails:
        decision = "blocked"
    elif warnings:
        decision = "review"
    else:
        decision = "deployment_ready"
    reasons = [c["message"] for c in fails] + warnings
    return {
        "score": score,
        "decision": decision,
        "reasons": reasons,
        "criticalFailures": fails,
        "warnings": warnings,
        "checklist": items,
    }


def get_lbrs_label(decision: str) -> str:
    if decision == "deployment_ready":
        return "Live-ready (all LBRS gates)"
    if decision == "review":
        return "LBRS review"
    return "LBRS blocked"
