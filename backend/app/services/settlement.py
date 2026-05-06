from .energy import calculate_revenue, round2


def calculate_settlement(e_sold: float, price_per_kwh: float, rates: dict) -> dict:
    revenue = calculate_revenue(e_sold, price_per_kwh)
    reserve = revenue * rates["reserve"]
    provider_pool = revenue * rates["providers"]
    financier_pool = revenue * rates["financiers"]
    owner_royalty = revenue * rates["owner"]
    emappa_fee = revenue * rates["emappa"]
    allocated = reserve + provider_pool + financier_pool + owner_royalty + emappa_fee
    return {"revenue": revenue, "reserve": round2(reserve), "providerPool": round2(provider_pool), "financierPool": round2(financier_pool), "ownerRoyalty": round2(owner_royalty), "emappaFee": round2(emappa_fee), "unallocated": round2(revenue - allocated)}


def validate_settlement_rates(rates: dict) -> dict:
    total = rates["reserve"] + rates["providers"] + rates["financiers"] + rates["owner"] + rates["emappa"]
    return {"total": round2(total), "isBalanced": abs(total - 1) < 0.0001}
