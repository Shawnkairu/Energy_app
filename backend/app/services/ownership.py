from .energy import round2


def calculate_ownership_payouts(pool: float, positions: list[dict]) -> list[dict]:
    return [{**position, "payout": round2(pool * position["percentage"])} for position in positions]
