def calculate_payback(input: dict) -> dict:
    monthly_payout = input["monthlyPayout"]
    target_multiple = input.get("targetMultiple", 1.4)
    if monthly_payout <= 0:
        return {"principalMonths": None, "targetMonths": None, "yearsToPrincipal": None, "yearsToTarget": None}
    principal_months = input["investment"] / monthly_payout
    target_months = (input["investment"] * target_multiple) / monthly_payout
    return {"principalMonths": round(principal_months, 1), "targetMonths": round(target_months, 1), "yearsToPrincipal": round(principal_months / 12, 1), "yearsToTarget": round(target_months / 12, 1)}
