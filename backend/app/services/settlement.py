from .energy import calculate_revenue, round2


def calculate_settlement(e_sold: float, price_per_kwh: float, rates: dict, phase: str | None = None) -> dict:
    phase_resolved = phase if phase is not None else "recovery"
    revenue = calculate_revenue(e_sold, price_per_kwh)
    reserve = revenue * rates["reserve"]
    provider_pool = revenue * rates["providers"]
    financier_pool = revenue * rates["financiers"]
    owner_royalty = revenue * rates["owner"]
    emappa_fee = revenue * rates["emappa"]
    allocated = reserve + provider_pool + financier_pool + owner_royalty + emappa_fee
    scale = revenue / allocated if allocated > revenue and allocated > 0 else 1.0
    reserve_a = round2(reserve * scale)
    provider_a = round2(provider_pool * scale)
    financier_a = round2(financier_pool * scale)
    owner_a = round2(owner_royalty * scale)
    emappa_a = round2(emappa_fee * scale)
    allocated_total = round2(reserve_a + provider_a + financier_a + owner_a + emappa_a)
    unallocated = round2(revenue - allocated_total)
    shortfall = round2(max(0.0, allocated - revenue))
    return {
        "revenue": revenue,
        "reserve": reserve_a,
        "providerPool": provider_a,
        "financierPool": financier_a,
        "ownerRoyalty": owner_a,
        "emappaFee": emappa_a,
        "unallocated": unallocated,
        "allocatedTotal": allocated_total,
        "shortfallKes": shortfall,
        "phase": phase_resolved,
    }


def validate_settlement_rates(rates: dict) -> dict:
    total = rates["reserve"] + rates["providers"] + rates["financiers"] + rates["owner"] + rates["emappa"]
    return {"total": round2(total), "isBalanced": abs(total - 1) < 0.0001}
