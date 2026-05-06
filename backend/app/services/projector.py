from .drs import calculate_drs, get_drs_label
from .energy import calculate_energy, calculate_savings
from .ownership import calculate_ownership_payouts
from .payback import calculate_payback
from .settlement import calculate_settlement


def project_building(project: dict) -> dict:
    energy = calculate_energy(project["energy"])
    settlement = calculate_settlement(energy["E_sold"], project["solarPriceKes"], project["settlementRates"])
    prepaid_months_covered = project["prepaidCommittedKes"] / settlement["revenue"] if settlement["revenue"] > 0 else 0
    prepaid_coverage = min(1, prepaid_months_covered)
    drs_input = {**project["drs"], "demandCoverage": min(100, energy["utilization"] * 100), "prepaidCommitment": min(100, prepaid_coverage * 100), "projectedUtilization": energy["utilization"], "hasPrepaidFunds": project["prepaidCommittedKes"] > 0}
    drs = calculate_drs(drs_input)
    provider_payouts = calculate_ownership_payouts(settlement["providerPool"], project["providerOwnership"])
    financier_payouts = calculate_ownership_payouts(settlement["financierPool"], project["financierOwnership"])
    savings_kes = calculate_savings(energy["E_sold"], project["gridPriceKes"], project["solarPriceKes"])
    funding_progress = project["fundedKes"] / project["capitalRequiredKes"] if project["capitalRequiredKes"] > 0 else 0
    resident_monthly_solar_kwh = energy["E_sold"] / project["units"]
    resident_savings_kes = savings_kes / project["units"]
    retained_provider_ownership = sum(p["percentage"] for p in project["providerOwnership"] if p["ownerRole"] == "provider")
    resident_owned_provider_share = sum(p["percentage"] for p in project["providerOwnership"] if p["ownerRole"] == "resident")
    gates = [
        {"label": "Demand qualified", "complete": drs_input["projectedUtilization"] >= 0.6},
        {"label": "Prepaid committed", "complete": drs_input["hasPrepaidFunds"]},
        {"label": "Supplier quote verified", "complete": drs_input["hasVerifiedSupplierQuote"]},
        {"label": "Certified electrician assigned", "complete": drs_input["hasCertifiedLeadElectrician"]},
        {"label": "Monitoring ready", "complete": drs_input["monitoringConnectivityResolved"]},
        {"label": "Settlement data trusted", "complete": drs_input["settlementDataTrusted"]},
    ]
    return {
        "project": project,
        "energy": energy,
        "settlement": settlement,
        "drs": {**drs, "label": get_drs_label(drs["decision"])},
        "providerPayouts": provider_payouts,
        "financierPayouts": financier_payouts,
        "savingsKes": savings_kes,
        "fundingProgress": funding_progress,
        "roleViews": {
            "resident": {"prepaidBalanceKes": round(project["prepaidCommittedKes"] / project["units"]), "averagePrepaidBalanceKes": round(project["prepaidCommittedKes"] / project["units"]), "monthlySolarKwh": round(resident_monthly_solar_kwh, 1), "savingsKes": round(resident_savings_kes), "solarCoverage": energy["coverage"], "ownedProviderShare": resident_owned_provider_share},
            "owner": {"monthlyRoyaltyKes": settlement["ownerRoyalty"], "prepaidCoverage": prepaid_coverage, "prepaidMonthsCovered": round(prepaid_months_covered, 2), "residentParticipation": min(1, prepaid_coverage), "comparableMedianRoyaltyKes": round(settlement["ownerRoyalty"] * 0.86), "gates": gates},
            "provider": {"retainedOwnership": retained_provider_ownership, "soldOwnership": resident_owned_provider_share, "monthlyPayoutKes": sum(p["payout"] for p in provider_payouts if p["ownerRole"] == "provider"), "monetizedKwh": energy["E_sold"], "generatedKwh": energy["E_gen"], "utilization": energy["utilization"], "wasteKwh": energy["E_waste"], "gridFallbackKwh": energy["E_grid"], "deploymentGates": gates, "monitoringStatus": "Monitoring online" if project["drs"]["monitoringConnectivityResolved"] else "Connectivity blocked", "warrantyDocuments": 4 if project["drs"]["hasVerifiedSupplierQuote"] else 1, "openMaintenanceTickets": 0 if project["drs"]["monitoringConnectivityResolved"] else 2},
            "financier": {"remainingCapitalKes": max(0, project["capitalRequiredKes"] - project["fundedKes"]), "committedCapitalKes": project["fundedKes"], "fundingProgress": funding_progress, "monthlyRecoveryKes": settlement["financierPool"], "downsideUtilization": max(0, energy["utilization"] - 0.18), "baseUtilization": energy["utilization"]},
            "installer": {"checklistComplete": len([g for g in gates if g["complete"]]), "checklistTotal": len(gates), "gates": gates, "certified": project["drs"]["hasCertifiedLeadElectrician"], "maintenanceTickets": 0 if project["drs"]["monitoringConnectivityResolved"] else 2},
            "supplier": {"openRequests": 1 if project["drs"]["hasVerifiedSupplierQuote"] else 3, "verifiedBom": project["drs"]["hasVerifiedSupplierQuote"], "leadTimeDays": 6 if project["drs"]["hasVerifiedSupplierQuote"] else 14, "catalogItems": 42 if project["drs"]["hasVerifiedSupplierQuote"] else 24, "warrantyDocuments": 4 if project["drs"]["hasVerifiedSupplierQuote"] else 1, "reliabilityScore": 94 if project["drs"]["hasVerifiedSupplierQuote"] else 72},
            "admin": {"alertCount": len(drs["reasons"]), "blockedReasonCount": len(drs["reasons"]), "settlementHealth": "trusted" if project["drs"]["settlementDataTrusted"] else "paused", "gates": gates},
        },
        "transparency": {"utilizationBand": "Top utilization band" if energy["utilization"] >= 0.75 else "Watch band" if energy["utilization"] >= 0.6 else "Risk band", "roiRange": "4.8-6.2 years" if energy["utilization"] >= 0.75 else "6.1-8.4 years" if energy["utilization"] >= 0.6 else "Review required", "privacyNote": "Benchmarks show distributions, never private counterpart finances."},
        "financierPayback": calculate_payback({"investment": max(project["fundedKes"], 1), "monthlyPayout": settlement["financierPool"]}),
    }
