"""Cross-cutting audits — mirrors packages/shared/src/consistency.ts."""

from .projector import project_building
from .settlement import validate_settlement_rates


def _near(a: float, b: float, tolerance: float = 0.05) -> bool:
    return abs(a - b) <= tolerance


def audit_project_consistency(project: dict) -> dict:
    projected = project_building(project)
    issues: list[str] = []
    rates = validate_settlement_rates(project["settlementRates"])

    if not rates["isBalanced"]:
        issues.append(f"Settlement rates must total 100%; received {rates['total'] * 100}%.")

    energy = projected["energy"]
    energy_balance = energy["E_sold"] + energy["E_waste"] + max(0, energy["E_gen"] - energy["E_sold"] - energy["E_waste"])

    if energy_balance - energy["E_gen"] > 0.1:
        issues.append("Energy outputs exceed generated energy.")

    settlement = projected["settlement"]
    settlement_total = settlement["allocatedTotal"] + settlement["unallocated"]

    if not _near(settlement_total, settlement["revenue"]):
        issues.append("Settlement waterfall does not reconcile to revenue.")

    provider_total = sum(p["payout"] for p in projected["providerPayouts"])
    if not _near(provider_total, settlement["providerPool"]):
        issues.append("Provider ownership payouts do not reconcile to provider pool.")

    financier_total = sum(p["payout"] for p in projected["financierPayouts"])
    if not _near(financier_total, settlement["financierPool"]):
        issues.append("Financier ownership payouts do not reconcile to financier pool.")

    if projected["roleViews"]["owner"]["prepaidCoverage"] > 1:
        issues.append("Prepaid coverage display should be capped at 100%.")

    demand_expected = round(projected["energy"]["utilization"] * 100, 1)
    if projected["drs"]["components"]["demandCoverage"] != demand_expected:
        issues.append("DRS demand coverage should follow calculated utilization.")

    return {"projectId": project["id"], "ok": len(issues) == 0, "issues": issues}


def audit_all_demo_projects(projects: list[dict]) -> dict:
    results = [audit_project_consistency(p) for p in projects]
    return {"ok": all(r["ok"] for r in results), "results": results}
