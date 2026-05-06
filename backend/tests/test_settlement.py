from app.services.settlement import calculate_settlement


def test_settlement_waterfall_sums_to_revenue():
    settlement = calculate_settlement(2340, 20, {"reserve": 0.05, "providers": 0.3, "financiers": 0.45, "owner": 0.06, "emappa": 0.14})
    allocated = settlement["reserve"] + settlement["providerPool"] + settlement["financierPool"] + settlement["ownerRoyalty"] + settlement["emappaFee"]
    assert abs(allocated + settlement["unallocated"] - settlement["revenue"]) <= 0.01
