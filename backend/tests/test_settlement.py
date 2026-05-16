from app.services.settlement import calculate_settlement


def test_settlement_waterfall_sums_to_revenue():
    settlement = calculate_settlement(2340, 20, {"reserve": 0.05, "providers": 0.3, "financiers": 0.45, "owner": 0.06, "emappa": 0.14})
    assert abs(settlement["allocatedTotal"] + settlement["unallocated"] - settlement["revenue"]) <= 0.01
    assert settlement["phase"] == "recovery"


def test_settlement_phase_echoes_royalty():
    settlement = calculate_settlement(
        2340,
        20,
        {"reserve": 0.05, "providers": 0.3, "financiers": 0.45, "owner": 0.06, "emappa": 0.14},
        "royalty",
    )
    assert settlement["phase"] == "royalty"
