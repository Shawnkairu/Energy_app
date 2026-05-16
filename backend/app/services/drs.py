"""DRS gate model — mirrors packages/shared/src/drs.ts; see docs/DRS_FORMULA.md."""


def clamp_score(value: float) -> float:
    return max(0.0, min(100.0, float(value)))


def round1(value: float) -> float:
    return round(value + 1e-12, 1)


def _site_kind(inp: dict) -> str:
    return inp.get("siteKind") or "apartment"


def _electrician_score(inp: dict) -> float:
    elec = inp.get("electricianReadiness", inp.get("installerReadiness", 0))
    return clamp_score(elec)


def _weighted_display_score(inp: dict, elec: float) -> float:
    return round1(
        clamp_score(inp.get("demandCoverage", 0)) * 0.35
        + clamp_score(inp.get("prepaidCommitment", 0)) * 0.2
        + clamp_score(inp.get("loadProfile", 0)) * 0.15
        + clamp_score(inp.get("installationReadiness", 0)) * 0.1
        + elec * 0.1
        + clamp_score(inp.get("capitalAlignment", 0)) * 0.1,
    )


def _apartment_failures(inp: dict) -> list[dict]:
    failures: list[dict] = []
    demand_signal = inp.get("hasResidentDemandSignal", inp.get("hasPrepaidFunds"))
    site_inspection = inp.get("siteInspectionComplete", True)
    capacity_plan = inp.get("capacityPlanApproved", True)
    stakeholders = inp.get(
        "stakeholdersVetted",
        inp.get("hasCertifiedLeadElectrician") and inp.get("hasVerifiedSupplierQuote"),
    )
    electrician_paid = inp.get("electricianLaborPaymentResolved", True)
    contracts = inp.get("contractsAndComplianceReady", True)

    if not inp.get("ownerPermissionsComplete"):
        failures.append(
            {
                "code": "OWNER_AUTH",
                "message": "Owner authorization and site access permissions incomplete.",
                "responsibleRole": "building_owner",
            }
        )
    if not stakeholders:
        failures.append(
            {
                "code": "STAKEHOLDER_VET",
                "message": "Stakeholder availability and vetting incomplete (electrician / provider / capital).",
                "responsibleRole": "admin",
            }
        )
    if not site_inspection:
        failures.append(
            {
                "code": "SITE_INSPECTION",
                "message": "Site inspection not complete (meter bank, roof, cable routes, Solar DB/ATS space).",
                "responsibleRole": "electrician",
            }
        )
    if not capacity_plan:
        failures.append(
            {
                "code": "CAPACITY_PLAN",
                "message": "Capacity plan not approved (phasing, reserve margin, max apartments).",
                "responsibleRole": "admin",
            }
        )
    if float(inp.get("projectedUtilization", 0)) < 0.6:
        failures.append(
            {
                "code": "DEMAND_LOW",
                "message": "Demand / utilization forecast below 60% — deployment economically unsafe.",
                "responsibleRole": "resident",
            }
        )
    if not demand_signal:
        failures.append(
            {
                "code": "DEMAND_SIGNAL",
                "message": "Resident demand evidence insufficient (pledges and/or prepaid load signals).",
                "responsibleRole": "resident",
            }
        )
    if not inp.get("hasVerifiedSupplierQuote"):
        failures.append(
            {
                "code": "HARDWARE_PKG",
                "message": "Hardware package / verified BOM or quote not ready.",
                "responsibleRole": "provider",
            }
        )
    if not electrician_paid:
        failures.append(
            {
                "code": "ELEC_PAYMENT",
                "message": "Electrician payment or labor-as-capital terms not resolved.",
                "responsibleRole": "financier",
            }
        )
    if not contracts:
        failures.append(
            {
                "code": "CONTRACTS",
                "message": "Contracts, waterfall, and compliance review incomplete.",
                "responsibleRole": "admin",
            }
        )
    if not inp.get("hasCertifiedLeadElectrician"):
        failures.append(
            {
                "code": "ELEC_LEAD",
                "message": "No certified lead electrician assigned.",
                "responsibleRole": "electrician",
            }
        )
    if not inp.get("solarApartmentCapacityFitVerified"):
        failures.append(
            {
                "code": "SOLAR_CAPACITY",
                "message": "Solar/battery capacity vs participating apartments not verified (dedicated solar path).",
                "responsibleRole": "electrician",
            }
        )
    if not inp.get("apartmentAtsMeterMappingVerified"):
        failures.append(
            {
                "code": "ATS_MAP",
                "message": "Apartment ATS + PAYG meter mapping incomplete.",
                "responsibleRole": "electrician",
            }
        )
    if not inp.get("atsKplcSwitchingVerified"):
        failures.append(
            {
                "code": "ATS_KPLC",
                "message": "ATS ↔ KPLC fallback architecture not verified.",
                "responsibleRole": "electrician",
            }
        )
    if not inp.get("monitoringConnectivityResolved"):
        failures.append(
            {
                "code": "MONITORING",
                "message": "Monitoring connectivity unresolved.",
                "responsibleRole": "provider",
            }
        )
    if not inp.get("settlementDataTrusted"):
        failures.append(
            {
                "code": "SETTLEMENT_DATA",
                "message": "Settlement data cannot be trusted — pause or conservative mode.",
                "responsibleRole": "admin",
            }
        )
    return failures


def _homeowner_failures(inp: dict) -> list[dict]:
    failures: list[dict] = []
    property_ok = inp.get("propertyAuthorityComplete") or False
    site_ok = inp.get("siteFeasibilityComplete") or False
    load_ok = inp.get("loadProfileSizingComplete") or False
    stakeholders = bool(inp.get("stakeholdersVetted")) or (
        bool(inp.get("hasCertifiedLeadElectrician")) and bool(inp.get("hasVerifiedSupplierQuote"))
    )
    capital_ok = inp.get("capitalAndLaborResolved") or False
    hardware_ok = inp.get("hardwareProcurementComplete") or inp.get("hasVerifiedSupplierQuote")
    legal_ok = inp.get("legalUtilityDisciplineComplete") or False
    contracts = inp.get("contractsAndComplianceReady", True)
    demand_signal = inp.get("hasResidentDemandSignal", inp.get("hasPrepaidFunds"))

    if not property_ok:
        failures.append({"code": "PROP_AUTH", "message": "Property authority not verified.", "responsibleRole": "homeowner"})
    if not site_ok:
        failures.append({"code": "SITE_FEAS", "message": "Site feasibility incomplete.", "responsibleRole": "electrician"})
    if not load_ok:
        failures.append(
            {"code": "LOAD_SIZE", "message": "Load profile and sizing discipline incomplete.", "responsibleRole": "homeowner"}
        )
    if not stakeholders:
        failures.append({"code": "STAKE_READY", "message": "Stakeholder readiness incomplete.", "responsibleRole": "admin"})
    if not capital_ok:
        failures.append(
            {
                "code": "CAPITAL_LABOR",
                "message": "Capital stack and electrician payment not resolved.",
                "responsibleRole": "financier",
            }
        )
    if not hardware_ok:
        failures.append({"code": "HW_PROC", "message": "Hardware procurement path incomplete.", "responsibleRole": "provider"})
    if not legal_ok:
        failures.append(
            {
                "code": "LEGAL_UTIL",
                "message": "Legal / utility / export discipline incomplete.",
                "responsibleRole": "electrician",
            }
        )
    if not contracts:
        failures.append({"code": "CONTRACTS", "message": "Contracts and compliance incomplete.", "responsibleRole": "admin"})
    if not inp.get("hasCertifiedLeadElectrician"):
        failures.append(
            {"code": "ELEC_LEAD", "message": "No certified lead electrician assigned.", "responsibleRole": "electrician"}
        )
    if float(inp.get("projectedUtilization", 0)) < 0.6:
        failures.append(
            {
                "code": "DEMAND_LOW",
                "message": "Utilization forecast below credible threshold.",
                "responsibleRole": "homeowner",
            }
        )
    if not demand_signal:
        failures.append(
            {
                "code": "DEMAND_SIG",
                "message": "Homeowner commitment / demand signal insufficient.",
                "responsibleRole": "homeowner",
            }
        )
    if not inp.get("monitoringConnectivityResolved"):
        failures.append(
            {"code": "MONITORING", "message": "Monitoring connectivity unresolved.", "responsibleRole": "provider"}
        )
    if not inp.get("settlementDataTrusted"):
        failures.append({"code": "SETTLEMENT_DATA", "message": "Settlement data cannot be trusted.", "responsibleRole": "admin"})
    return failures


def _warnings(inp: dict) -> list[str]:
    w: list[str] = []
    u = float(inp.get("projectedUtilization", 0))
    if 0.6 <= u < 0.75:
        w.append("Utilization in watch band (60–75%).")
    if clamp_score(inp.get("loadProfile", 0)) < 70:
        w.append("Load profile confidence is moderate — improve estimates before scaling.")
    return w


def _build_apartment_checklist(inp: dict, elec: float) -> list[dict]:
    demand_signal = inp.get("hasResidentDemandSignal", inp.get("hasPrepaidFunds"))
    stakeholders_done = inp.get("stakeholdersVetted")
    if stakeholders_done is None:
        stakeholders_done = bool(inp.get("hasCertifiedLeadElectrician") and inp.get("hasVerifiedSupplierQuote"))
    return [
        {"id": "owner", "category": "Owner authorization", "displayWeight": 10, "critical": True, "complete": bool(inp.get("ownerPermissionsComplete")), "label": "Owner authorization and access"},
        {"id": "stake", "category": "Stakeholders", "displayWeight": 15, "critical": True, "complete": bool(stakeholders_done), "label": "Stakeholder availability and vetting"},
        {"id": "inspect", "category": "Inspection", "displayWeight": 15, "critical": True, "complete": inp.get("siteInspectionComplete") is not False, "label": "Site inspection complete"},
        {"id": "capplan", "category": "Capacity", "displayWeight": 15, "critical": True, "complete": inp.get("capacityPlanApproved") is not False, "label": "Capacity plan approved"},
        {
            "id": "demand",
            "category": "Demand",
            "displayWeight": 15,
            "critical": True,
            "complete": float(inp.get("projectedUtilization", 0)) >= 0.6 and bool(demand_signal),
            "label": "Demand proof / pledges / utilization",
        },
        {"id": "hw", "category": "Hardware", "displayWeight": 15, "critical": True, "complete": bool(inp.get("hasVerifiedSupplierQuote")), "label": "Hardware package and logistics"},
        {"id": "elecpay", "category": "Labor", "displayWeight": 10, "critical": True, "complete": inp.get("electricianLaborPaymentResolved") is not False, "label": "Electrician payment / labor-capital"},
        {"id": "legal", "category": "Contracts", "displayWeight": 5, "critical": True, "complete": inp.get("contractsAndComplianceReady") is not False, "label": "Contracts and compliance"},
        {
            "id": "ats",
            "category": "Architecture",
            "displayWeight": 0,
            "critical": True,
            "complete": bool(inp.get("apartmentAtsMeterMappingVerified") and inp.get("atsKplcSwitchingVerified") and inp.get("solarApartmentCapacityFitVerified")),
            "label": "Dedicated solar path + ATS mapping",
        },
        {"id": "elec", "category": "Electrician", "displayWeight": 0, "critical": True, "complete": bool(inp.get("hasCertifiedLeadElectrician") and elec >= 50), "label": "Certified electrician readiness"},
        {
            "id": "mon",
            "category": "Ops",
            "displayWeight": 0,
            "critical": True,
            "complete": bool(inp.get("monitoringConnectivityResolved") and inp.get("settlementDataTrusted")),
            "label": "Monitoring and settlement trust",
        },
    ]


def _build_homeowner_checklist(inp: dict, elec: float) -> list[dict]:
    demand_signal = inp.get("hasResidentDemandSignal", inp.get("hasPrepaidFunds"))
    hw = inp.get("hardwareProcurementComplete")
    if hw is None:
        hw = inp.get("hasVerifiedSupplierQuote")
    return [
        {"id": "prop", "category": "Authority", "displayWeight": 12, "critical": True, "complete": bool(inp.get("propertyAuthorityComplete") or False), "label": "Property authority"},
        {"id": "site", "category": "Feasibility", "displayWeight": 12, "critical": True, "complete": bool(inp.get("siteFeasibilityComplete") or False), "label": "Site feasibility"},
        {"id": "load", "category": "Load", "displayWeight": 12, "critical": True, "complete": bool(inp.get("loadProfileSizingComplete") or False), "label": "Load profile and sizing"},
        {
            "id": "stake",
            "category": "Stakeholders",
            "displayWeight": 12,
            "critical": True,
            "complete": bool(inp.get("stakeholdersVetted"))
            or (bool(inp.get("hasCertifiedLeadElectrician")) and bool(inp.get("hasVerifiedSupplierQuote"))),
            "label": "Stakeholder readiness",
        },
        {"id": "cap", "category": "Capital", "displayWeight": 12, "critical": True, "complete": bool(inp.get("capitalAndLaborResolved") or False), "label": "Capital and electrician payment"},
        {"id": "hw", "category": "Hardware", "displayWeight": 12, "critical": True, "complete": bool(hw), "label": "Hardware procurement"},
        {"id": "legal", "category": "Utility", "displayWeight": 12, "critical": True, "complete": bool(inp.get("legalUtilityDisciplineComplete") or False), "label": "Legal and utility discipline"},
        {
            "id": "ready",
            "category": "Activation",
            "displayWeight": 8,
            "critical": False,
            "complete": bool(demand_signal) and float(inp.get("projectedUtilization", 0)) >= 0.6,
            "label": "Homeowner consumption readiness (pre-activation)",
        },
        {"id": "elec", "category": "Electrician", "displayWeight": 8, "critical": True, "complete": bool(inp.get("hasCertifiedLeadElectrician") and elec >= 50), "label": "Certified electrician"},
        {
            "id": "mon",
            "category": "Ops",
            "displayWeight": 0,
            "critical": True,
            "complete": bool(inp.get("monitoringConnectivityResolved") and inp.get("settlementDataTrusted")),
            "label": "Monitoring and settlement trust",
        },
    ]


def calculate_drs(inp: dict) -> dict:
    elec = _electrician_score(inp)
    sk = _site_kind(inp)
    critical_failures = _homeowner_failures(inp) if sk == "homeowner" else _apartment_failures(inp)
    warnings = _warnings(inp)
    checklist = _build_homeowner_checklist(inp, elec) if sk == "homeowner" else _build_apartment_checklist(inp, elec)
    score = min(100.0, _weighted_display_score(inp, elec))
    components = {
        "demandCoverage": clamp_score(inp.get("demandCoverage", 0)),
        "prepaidCommitment": clamp_score(inp.get("prepaidCommitment", 0)),
        "loadProfile": clamp_score(inp.get("loadProfile", 0)),
        "installationReadiness": clamp_score(inp.get("installationReadiness", 0)),
        "electricianReadiness": elec,
        "installerReadiness": elec,
        "capitalAlignment": clamp_score(inp.get("capitalAlignment", 0)),
    }
    if critical_failures:
        decision = "blocked"
    elif warnings:
        decision = "review"
    else:
        decision = "deployment_ready"
    reasons = [f["message"] for f in critical_failures] + warnings
    return {
        "score": score,
        "decision": decision,
        "reasons": reasons,
        "criticalFailures": critical_failures,
        "warnings": warnings,
        "checklist": checklist,
        "components": components,
    }


def get_drs_label(decision: str) -> str:
    if decision == "deployment_ready":
        return "Deployment-ready (all critical gates)"
    if decision == "review":
        return "Review — non-critical warnings"
    return "Blocked — critical gate failed"
