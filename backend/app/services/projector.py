from .drs import calculate_drs, get_drs_label
from .energy import calculate_energy, calculate_savings
from .lbrs import calculate_lbrs, get_lbrs_label
from .ownership import calculate_ownership_payouts
from .payback import calculate_payback
from .settlement import calculate_settlement


def _default_lbrs(project: dict) -> dict:
    if project.get("lbrs"):
        return project["lbrs"]
    live = project.get("stage") == "live"
    bk = project.get("buildingKind")
    site_kind = "homeowner" if bk in ("single_family", "small_compound") else "apartment"
    return {
        "siteKind": site_kind,
        "asBuiltBomVerified": live,
        "electricalSafetyComplete": live,
        "solarBusIsolationVerified": live,
        "inverterBatteryTestsComplete": live,
        "atsSwitchingPerApartmentComplete": live,
        "homeSwitchingFallbackComplete": live,
        "meterMappingDataReliable": live,
        "tokenSettlementDryRunPassed": live,
        "backendTokenControlDryRunPassed": live,
        "residentOwnerLaunchReadinessComplete": live,
    }


def project_building(project: dict) -> dict:
    energy = calculate_energy(project["energy"])
    settlement_phase = project.get("settlementPhase") or "recovery"
    settlement = calculate_settlement(energy["E_sold"], project["solarPriceKes"], project["settlementRates"], settlement_phase)
    prepaid_months_covered = project["prepaidCommittedKes"] / settlement["revenue"] if settlement["revenue"] > 0 else 0
    prepaid_coverage = min(1, prepaid_months_covered)
    drs = project["drs"]
    bk = project.get("buildingKind")
    site_kind = "homeowner" if bk in ("single_family", "small_compound") else "apartment"
    drs_input = {
        **drs,
        "siteKind": site_kind,
        "demandCoverage": min(100, energy["utilization"] * 100),
        "prepaidCommitment": min(100, prepaid_coverage * 100),
        "projectedUtilization": energy["utilization"],
        "hasResidentDemandSignal": drs.get("hasResidentDemandSignal", drs.get("hasPrepaidFunds")),
    }
    drs_out = calculate_drs(drs_input)
    lbrs = calculate_lbrs(_default_lbrs(project))
    provider_payouts = calculate_ownership_payouts(settlement["providerPool"], project["providerOwnership"])
    financier_payouts = calculate_ownership_payouts(settlement["financierPool"], project["financierOwnership"])
    savings_kes = calculate_savings(energy["E_sold"], project["gridPriceKes"], project["solarPriceKes"])
    funding_progress = project["fundedKes"] / project["capitalRequiredKes"] if project["capitalRequiredKes"] > 0 else 0
    resident_monthly_solar_kwh = energy["E_sold"] / project["units"]
    resident_savings_kes = savings_kes / project["units"]
    retained_provider_ownership = sum(p["percentage"] for p in project["providerOwnership"] if p["ownerRole"] == "provider")
    resident_owned_provider_share = sum(p["percentage"] for p in project["providerOwnership"] if p["ownerRole"] == "resident")
    kill_switches = [f["message"] for f in drs_out.get("criticalFailures", [])]
    deployment_gates = [{"label": c["label"], "complete": c["complete"]} for c in drs_out.get("checklist", [])]

    is_homeowner_site = bk in ("single_family", "small_compound")
    owner_host_royalty_kes = 0 if is_homeowner_site else settlement["ownerRoyalty"]

    electrician_view = {
        "checklistComplete": len([g for g in deployment_gates if g["complete"]]),
        "checklistTotal": len(deployment_gates),
        "gates": deployment_gates,
        "certified": drs["hasCertifiedLeadElectrician"],
        "maintenanceTickets": 0 if drs["monitoringConnectivityResolved"] else 2,
    }

    return {
        "project": project,
        "energy": energy,
        "settlement": settlement,
        "drs": {**drs_out, "label": get_drs_label(drs_out["decision"])},
        "lbrs": {**lbrs, "label": get_lbrs_label(lbrs["decision"])},
        "providerPayouts": provider_payouts,
        "financierPayouts": financier_payouts,
        "savingsKes": savings_kes,
        "fundingProgress": funding_progress,
        "roleViews": {
            "resident": {
                "prepaidBalanceKes": round(project["prepaidCommittedKes"] / project["units"]),
                "averagePrepaidBalanceKes": round(project["prepaidCommittedKes"] / project["units"]),
                "monthlySolarKwh": round(resident_monthly_solar_kwh, 1),
                "savingsKes": round(resident_savings_kes),
                "solarCoverage": energy["coverage"],
                "ownedProviderShare": resident_owned_provider_share,
            },
            "owner": {
                "monthlyRoyaltyKes": owner_host_royalty_kes,
                "prepaidCoverage": prepaid_coverage,
                "prepaidMonthsCovered": round(prepaid_months_covered, 2),
                "residentParticipation": min(1, prepaid_coverage),
                "comparableMedianRoyaltyKes": round(owner_host_royalty_kes * 0.86),
                "gates": deployment_gates,
            },
            "provider": {
                "retainedOwnership": retained_provider_ownership,
                "soldOwnership": resident_owned_provider_share,
                "monthlyPayoutKes": sum(p["payout"] for p in provider_payouts if p["ownerRole"] == "provider"),
                "monetizedKwh": energy["E_sold"],
                "generatedKwh": energy["E_gen"],
                "utilization": energy["utilization"],
                "wasteKwh": energy["E_waste"],
                "gridFallbackKwh": energy["E_grid"],
                "deploymentGates": deployment_gates,
                "monitoringStatus": "Monitoring online" if drs["monitoringConnectivityResolved"] else "Connectivity blocked",
                "warrantyDocuments": 4 if drs["hasVerifiedSupplierQuote"] else 1,
                "openMaintenanceTickets": 0 if drs["monitoringConnectivityResolved"] else 2,
            },
            "financier": {
                "remainingCapitalKes": max(0, project["capitalRequiredKes"] - project["fundedKes"]),
                "committedCapitalKes": project["fundedKes"],
                "fundingProgress": funding_progress,
                "monthlyRecoveryKes": settlement["financierPool"],
                "downsideUtilization": max(0, energy["utilization"] - 0.18),
                "baseUtilization": energy["utilization"],
            },
            "electrician": electrician_view,
            "installer": electrician_view,
            "supplier": {
                "openRequests": 1 if drs["hasVerifiedSupplierQuote"] else 3,
                "verifiedBom": drs["hasVerifiedSupplierQuote"],
                "leadTimeDays": 6 if drs["hasVerifiedSupplierQuote"] else 14,
                "catalogItems": 42 if drs["hasVerifiedSupplierQuote"] else 24,
                "warrantyDocuments": 4 if drs["hasVerifiedSupplierQuote"] else 1,
                "reliabilityScore": 94 if drs["hasVerifiedSupplierQuote"] else 72,
            },
            "admin": {
                "alertCount": len(kill_switches),
                "blockedReasonCount": len(kill_switches),
                "settlementHealth": "trusted" if drs["settlementDataTrusted"] else "paused",
                "gates": deployment_gates,
            },
        },
        "transparency": {
            "utilizationBand": "Top utilization band" if energy["utilization"] >= 0.75 else "Watch band" if energy["utilization"] >= 0.6 else "Risk band",
            "roiRange": "Downside ~8y / base ~5.5y / upside ~4y (not guaranteed)" if energy["utilization"] >= 0.75 else "Downside 12y+ / base ~7y / upside ~5y (not guaranteed)" if energy["utilization"] >= 0.6 else "Review required — low utilization stretches payback",
            "privacyNote": "Benchmarks show distributions, never private counterpart finances.",
        },
        "financierPayback": calculate_payback({"investment": max(project["fundedKes"], 1), "monthlyPayout": settlement["financierPool"]}),
    }
