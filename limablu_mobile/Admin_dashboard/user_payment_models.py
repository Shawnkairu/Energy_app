# user_models.py
import pandas as pd

def _calc_daily_cost(allocation_df: pd.DataFrame, providers_df: pd.DataFrame) -> pd.Series:
    """Given allocation_df with columns [day, provider, alloc_kwh], return daily cost Series."""
    merged = allocation_df.merge(providers_df[['provider', 'price_per_kwh']], on='provider', how='left')
    merged['cost'] = merged['alloc_kwh'] * merged['price_per_kwh']
    daily_cost = merged.groupby('day', as_index=False)['cost'].sum()
    return daily_cost['cost']

def simulate_postpaid_cost(allocation_df: pd.DataFrame, providers_df: pd.DataFrame) -> pd.DataFrame:
    daily_usage = allocation_df.groupby('day', as_index=False)['alloc_kwh'].sum()['alloc_kwh']
    daily_cost = _calc_daily_cost(allocation_df, providers_df)
    return pd.DataFrame({
        "day": range(1, len(daily_usage)+1),
        "used_kwh": daily_usage.round(3),
        "cost": daily_cost.round(2),
        "status": "billed_end_of_month"
    })

def simulate_token_cost(allocation_df: pd.DataFrame, providers_df: pd.DataFrame, token_balance_kwh: float) -> pd.DataFrame:
    daily_usage = allocation_df.groupby('day', as_index=False)['alloc_kwh'].sum()['alloc_kwh']
    daily_cost = _calc_daily_cost(allocation_df, providers_df)

    rows, bal = [], float(token_balance_kwh)
    for d, (kwh, cost) in enumerate(zip(daily_usage, daily_cost), start=1):
        used = min(kwh, bal)
        proportion_used = 0 if kwh == 0 else used / kwh
        used_cost = cost * proportion_used
        bal -= used
        rows.append({
            "day": d,
            "used_kwh": round(used, 3),
            "cost": round(used_cost, 2),
            "status": "ok" if used == kwh else "depleted_mid_day",
            "remaining_tokens_kwh": round(max(bal, 0.0), 3)
        })
        if bal <= 0:
            bal = 0.0
    return pd.DataFrame(rows)

def simulate_subscription_cost(allocation_df: pd.DataFrame, providers_df: pd.DataFrame, monthly_allow_kwh: float,
                                rollover_enabled: bool = True) -> tuple[pd.DataFrame, float]:
    daily_usage = allocation_df.groupby('day', as_index=False)['alloc_kwh'].sum()['alloc_kwh']
    daily_cost = _calc_daily_cost(allocation_df, providers_df)

    rows, remaining = [], float(monthly_allow_kwh)
    for d, (kwh, cost) in enumerate(zip(daily_usage, daily_cost), start=1):
        used = min(kwh, remaining)
        proportion_used = 0 if kwh == 0 else used / kwh
        used_cost = cost * proportion_used
        remaining -= used
        rows.append({
            "day": d,
            "used_kwh": round(used, 3),
            "cost": round(used_cost, 2),
            "status": "within_plan" if used == kwh else "over_cap",
            "remaining_allow_kwh": round(max(remaining, 0.0), 3)
        })
        if remaining <= 0:
            remaining = 0.0
    rollover = round(remaining, 3) if rollover_enabled else 0.0
    return pd.DataFrame(rows), rollover