def round2(value: float) -> float:
    return round(value + 1e-12, 2)


def ratio(numerator: float, denominator: float) -> float:
    return numerator / denominator if denominator > 0 else 0


def calculate_energy(input: dict) -> dict:
    daily_generation = input["arrayKw"] * input["peakSunHours"] * input["systemEfficiency"]
    e_gen = daily_generation * 30
    daily_demand = input["monthlyDemandKwh"] / 30
    daily_daytime_demand = daily_demand * input["daytimeDemandFraction"]
    daily_night_demand = daily_demand - daily_daytime_demand
    direct_daily = min(daily_generation, daily_daytime_demand)
    excess_daily = max(0, daily_generation - direct_daily)
    usable_battery = input["batteryKwh"] * input["batteryDepthOfDischarge"]
    charged_daily = min(excess_daily, usable_battery)
    battery_used_daily = min(charged_daily * input["batteryRoundTripEfficiency"], daily_night_demand)
    waste_daily = max(0, excess_daily - charged_daily)
    e_direct = direct_daily * 30
    e_charge = charged_daily * 30
    e_battery_used = battery_used_daily * 30
    e_sold = e_direct + e_battery_used
    e_waste = waste_daily * 30
    e_grid = max(0, input["monthlyDemandKwh"] - e_sold)
    return {"E_gen": round2(e_gen), "E_direct": round2(e_direct), "E_charge": round2(e_charge), "E_battery_used": round2(e_battery_used), "E_sold": round2(e_sold), "E_waste": round2(e_waste), "E_grid": round2(e_grid), "utilization": round2(ratio(e_sold, e_gen)), "coverage": round2(ratio(e_sold, input["monthlyDemandKwh"]))}


def calculate_revenue(e_sold: float, price_per_kwh: float) -> float:
    return round2(e_sold * price_per_kwh)


def calculate_savings(e_sold: float, grid_price_kes: float, solar_price_kes: float) -> float:
    return round2(max(0, (grid_price_kes - solar_price_kes) * e_sold))
