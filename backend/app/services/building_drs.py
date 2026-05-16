"""Map DB Building rows to BuildingProject-shaped dicts for DRS via project_building."""

from __future__ import annotations

import copy
from typing import Any

from ..data.demo import DEMO_PROJECTS
from ..data.seed_uuids import seed_uuid
from ..models.building import Building

_DEMO_UUID_TO_INDEX: dict[Any, int] = {
    seed_uuid("nyeri-ridge-a"): 0,
    seed_uuid("karatina-court"): 1,
}


def _db_stage_to_project_stage(stage: str) -> str:
    return {
        "listed": "review",
        "qualifying": "review",
        "funding": "funding",
        "installing": "install",
        "live": "live",
        "retired": "blocked",
    }.get(stage, "review")


def _kahawa_homeowner_template(building: Building) -> dict[str, Any]:
    return {
        "locationBand": building.address,
        "energy": {
            "arrayKw": 8,
            "peakSunHours": 5.2,
            "systemEfficiency": 0.82,
            "batteryKwh": 12,
            "batteryDepthOfDischarge": 0.85,
            "batteryRoundTripEfficiency": 0.9,
            "monthlyDemandKwh": 620,
            "daytimeDemandFraction": 0.48,
        },
        "solarPriceKes": 20,
        "gridPriceKes": 28,
        "settlementRates": {"reserve": 0.05, "providers": 0.3, "financiers": 0.45, "owner": 0.06, "emappa": 0.14},
        "drs": {
            "demandCoverage": 48,
            "prepaidCommitment": 0,
            "loadProfile": 58,
            "installationReadiness": 40,
            "installerReadiness": 42,
            "electricianReadiness": 42,
            "capitalAlignment": 35,
            "projectedUtilization": 0.62,
            "hasPrepaidFunds": False,
            "hasResidentDemandSignal": False,
            "hasCertifiedLeadElectrician": False,
            "solarApartmentCapacityFitVerified": True,
            "apartmentAtsMeterMappingVerified": True,
            "atsKplcSwitchingVerified": False,
            "ownerPermissionsComplete": True,
            "hasVerifiedSupplierQuote": False,
            "monitoringConnectivityResolved": False,
            "settlementDataTrusted": False,
            "contractsAndComplianceReady": False,
            "propertyAuthorityComplete": False,
            "siteFeasibilityComplete": False,
            "loadProfileSizingComplete": False,
            "stakeholdersVetted": False,
            "capitalAndLaborResolved": False,
            "hardwareProcurementComplete": False,
            "legalUtilityDisciplineComplete": False,
        },
        "providerOwnership": [{"ownerId": "provider-demo", "ownerRole": "provider", "percentage": 1}],
        "financierOwnership": [{"ownerId": "financier-demo", "ownerRole": "financier", "percentage": 1}],
        "capitalRequiredKes": 850000,
        "fundedKes": 0,
        "prepaidCommittedKes": 0,
    }


def _apartment_synthetic_template(building: Building) -> dict[str, Any]:
    units = max(1, building.unit_count)
    monthly = 120 * units
    return {
        "locationBand": building.address,
        "energy": {
            "arrayKw": min(24.0, 6.0 + units * 0.8),
            "peakSunHours": 5.3,
            "systemEfficiency": 0.81,
            "batteryKwh": min(36.0, 8.0 + units * 1.2),
            "batteryDepthOfDischarge": 0.84,
            "batteryRoundTripEfficiency": 0.89,
            "monthlyDemandKwh": monthly,
            "daytimeDemandFraction": 0.42,
        },
        "solarPriceKes": 21,
        "gridPriceKes": 28,
        "settlementRates": {"reserve": 0.06, "providers": 0.34, "financiers": 0.38, "owner": 0.06, "emappa": 0.16},
        "drs": {
            "demandCoverage": 35,
            "prepaidCommitment": 0,
            "loadProfile": 45,
            "installationReadiness": 35,
            "installerReadiness": 40,
            "electricianReadiness": 40,
            "capitalAlignment": 38,
            "projectedUtilization": 0.55,
            "hasPrepaidFunds": False,
            "hasResidentDemandSignal": False,
            "hasCertifiedLeadElectrician": False,
            "solarApartmentCapacityFitVerified": False,
            "apartmentAtsMeterMappingVerified": False,
            "atsKplcSwitchingVerified": False,
            "ownerPermissionsComplete": False,
            "hasVerifiedSupplierQuote": False,
            "siteInspectionComplete": False,
            "capacityPlanApproved": False,
            "stakeholdersVetted": False,
            "electricianLaborPaymentResolved": False,
            "contractsAndComplianceReady": False,
            "monitoringConnectivityResolved": False,
            "settlementDataTrusted": False,
        },
        "providerOwnership": [{"ownerId": "provider-demo", "ownerRole": "provider", "percentage": 1}],
        "financierOwnership": [{"ownerId": "financier-demo", "ownerRole": "financier", "percentage": 1}],
        "capitalRequiredKes": 900000,
        "fundedKes": 0,
        "prepaidCommittedKes": 0,
    }


def resolve_project_dict_for_drs(building: Building, prepaid_committed_kes: float) -> dict[str, Any]:
    bid = building.id
    idx = _DEMO_UUID_TO_INDEX.get(bid)
    if idx is not None:
        proj = copy.deepcopy(DEMO_PROJECTS[idx])
    elif building.kind == "single_family":
        proj = _kahawa_homeowner_template(building)
    else:
        proj = _apartment_synthetic_template(building)

    bk = "single_family" if building.kind == "single_family" else "apartment"
    proj["id"] = str(bid)
    proj["name"] = building.name
    proj["units"] = building.unit_count
    proj["buildingKind"] = bk
    proj["stage"] = _db_stage_to_project_stage(building.stage)
    proj["prepaidCommittedKes"] = float(prepaid_committed_kes)
    return proj
