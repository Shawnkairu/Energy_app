# profiles.py
import numpy as np
import pandas as pd

PROFILE_PARAMS = {
    "basic_lighting":        {"mean": 0.18, "sd": 0.06},
    "lighting_tv":           {"mean": 0.45, "sd": 0.15},
    "emerging_appliance":    {"mean": 0.80, "sd": 0.25},
    "microbiz_kiosk":        {"mean": 1.60, "sd": 0.50},
}

def generate_daily_usage(profile_key: str, days: int, seed: int | None = None) -> pd.Series:
    if seed is not None:
        np.random.seed(seed)
    p = PROFILE_PARAMS[profile_key]
    arr = np.random.normal(loc=p["mean"], scale=p["sd"], size=days)
    arr = np.clip(arr, 0.02, None)
    return pd.Series(arr).round(3)

def make_users(config: list[dict], days: int, seed: int | None = None) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    rows = []
    for c in config:
        s = None if seed is None else int(rng.integers(0, 1_000_000))
        series = generate_daily_usage(c["profile"], days, s)
        for d, kwh in enumerate(series, start=1):
            rows.append({"user": c["name"], "day": d, "usage_kwh": float(kwh), "profile": c["profile"]})
    return pd.DataFrame(rows)