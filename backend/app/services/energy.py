def round2(value: float) -> float:
    return round(value + 1e-12, 2)


def ratio(numerator: float, denominator: float) -> float:
    return numerator / denominator if denominator > 0 else 0


def calculate_energy(input: dict) -> dict:
    daily_generation = input["arrayKw"] * input["peakSunHours"] * input["systemEfficiency"]
    daily_demand = input["monthlyDemandKwh"] / 30
    daily_daytime_demand = daily_demand * input["daytimeDemandFraction"]
    daily_night_demand = daily_demand - daily_daytime_demand
    direct_daily = min(daily_generation, daily_daytime_demand)
    excess_daily = max(0, daily_generation - direct_daily)
    usable_battery = input["batteryKwh"] * input["batteryDepthOfDischarge"]
    charged_daily = min(excess_daily, usable_battery)
    battery_used_daily = min(charged_daily * input["batteryRoundTripEfficiency"], daily_night_demand)
    waste_daily = max(0, excess_daily - charged_daily)

    e_gen = round2(daily_generation * 30)
    e_direct = round2(direct_daily * 30)
    e_charge = round2(charged_daily * 30)
    e_battery_used = round2(battery_used_daily * 30)
    e_sold_uncapped = round2(e_direct + e_battery_used)
    e_sold = round2(min(e_sold_uncapped, input["monthlyDemandKwh"], e_gen))
    e_waste = round2(max(0, e_gen - e_direct - e_charge))
    e_grid = round2(max(0, input["monthlyDemandKwh"] - e_sold))
    utilization = round2(ratio(e_sold, e_gen))
    waste_rate = round2(ratio(e_waste, e_gen))
    return {
        "E_gen": e_gen,
        "E_direct": e_direct,
        "E_charge": e_charge,
        "E_battery_used": e_battery_used,
        "E_sold": e_sold,
        "E_waste": e_waste,
        "E_grid": e_grid,
        "utilization": utilization,
        "wasteRate": waste_rate,
        "coverage": round2(ratio(e_sold, input["monthlyDemandKwh"])),
    }


def calculate_revenue(e_sold: float, price_per_kwh: float) -> float:
    return round2(e_sold * price_per_kwh)


def calculate_savings(e_sold: float, grid_price_kes: float, solar_price_kes: float) -> float:
    return round2(max(0, (grid_price_kes - solar_price_kes) * e_sold))
