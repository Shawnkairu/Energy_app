from datetime import datetime, timezone
from .energy import calculate_energy
from .ownership import calculate_ownership_payouts
from .settlement import calculate_settlement, validate_settlement_rates


def run_settlement(store, building_id: str, period_start, period_end) -> dict:
    project = store.get_project(building_id)
    if project is None:
        raise KeyError(building_id)
    if project["stage"] != "live":
        raise ValueError("Settlement can only run for live buildings")
    if project["prepaidCommittedKes"] <= 0:
        raise ValueError("No prepaid balance available for settlement")
    if not validate_settlement_rates(project["settlementRates"])["isBalanced"]:
        raise ValueError("Settlement rates must sum to 1.0")
    energy = calculate_energy(project["energy"])
    settlement = calculate_settlement(
        energy["E_sold"],
        project["solarPriceKes"],
        project["settlementRates"],
        project.get("settlementPhase") or "recovery",
    )
    record = {"id": f"settlement-{building_id}-{period_start.isoformat()}", "buildingId": building_id, "periodStart": period_start.isoformat(), "periodEnd": period_end.isoformat(), "eSoldKwh": energy["E_sold"], **settlement, "providerPayouts": calculate_ownership_payouts(settlement["providerPool"], project["providerOwnership"]), "financierPayouts": calculate_ownership_payouts(settlement["financierPool"], project["financierOwnership"]), "createdAt": datetime.now(timezone.utc).isoformat()}
    store.add_settlement_record(record)
    return record
