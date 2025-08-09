# optimization.py
import pandas as pd

def compute_weights(providers_df: pd.DataFrame, alpha: float) -> pd.Series:
    avg_price = providers_df['price_per_kwh'].mean()
    rel_price = avg_price / providers_df['price_per_kwh']                  # cheaper -> larger
    rel_cap   = providers_df['capacity_kwh'] / providers_df['capacity_kwh'].max()
    score = alpha * rel_price + (1 - alpha) * rel_cap
    return score / score.sum()

def allocate_per_user_day_per_alpha(providers_df, usage_df, user_alpha_map):
    rows = []
    for (u, d), g in usage_df.groupby(['user','day']):
        demand = float(g['usage_kwh'].iloc[0])
        alpha  = float(user_alpha_map[u])
        w = compute_weights(providers_df, alpha).reset_index(drop=True)
        alloc = (w * demand)
        for prov, kwh in zip(providers_df['provider'], alloc):
            rows.append({"user": u, "day": d, "provider": prov, "alloc_kwh": round(float(kwh),3)})
    return pd.DataFrame(rows)