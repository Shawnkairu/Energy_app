def round2(value: float) -> float:
    return round(value + 1e-12, 2)


def calculate_payback(input: dict) -> dict:
    monthly_payout = float(input["monthlyPayout"])
    target_multiple = float(input.get("targetMultiple", 1.5))
    if monthly_payout <= 0:
        return {
            "principalMonths": float("inf"),
            "targetMonths": float("inf"),
            "yearsToPrincipal": float("inf"),
            "yearsToTarget": float("inf"),
            "notCurrentlyRecovering": True,
        }
    investment = float(input["investment"])
    principal_months = investment / monthly_payout
    target_months = (investment * target_multiple) / monthly_payout
    return {
        "principalMonths": round2(principal_months),
        "targetMonths": round2(target_months),
        "yearsToPrincipal": round2(principal_months / 12),
        "yearsToTarget": round2(target_months / 12),
        "notCurrentlyRecovering": False,
    }
