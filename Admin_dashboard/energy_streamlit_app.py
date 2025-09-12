# energy_app.py
import streamlit as st
import pandas as pd
import plotly.express as px

from profiles import make_users
from optimization_logic import compute_weights, allocate_per_user_day_per_alpha

st.set_page_config(page_title="e.mappa", layout="wide")
st.title("e.mappa — Users")

# --- Providers (centralized here; import from a data file later) ---
providers = pd.DataFrame({
    'provider': ['SolarOne','GreenLight','SunStream','RayPower','BrightSolar','NovaEnergy'],
    'price_per_kwh': [0.12, 0.10, 0.14, 0.11, 0.13, 0.09],
    'capacity_kwh': [500, 600, 400, 300, 450, 550]  # per-day capacity if you later enforce caps
})

# --- Cohort ---
user_config = [
    {"name": "Amina",  "profile": "basic_lighting"},
    {"name": "Otieno", "profile": "lighting_tv"},
    {"name": "Wanjiku","profile": "emerging_appliance"},
    {"name": "Juma",   "profile": "microbiz_kiosk"},
]

# with st.sidebar:
#     st.header("Simulation Settings")
#     days = st.number_input("Days to simulate", 1, 60, 30)

#     st.markdown("### Per‑user preference")
#     st.caption("Choose how much each user prioritizes **Price** vs **Capacity**. Capacity % = 100 − Price %.")
#     user_prefs = {}
#     for u in user_config:
#         with st.expander(f"{u['name']} — preference", expanded=False):
#             price_pct = st.slider("Price priority (%)", 0, 100, 50, key=f"alpha_{u['name']}",
#                                   help="Higher = prefers cheaper providers; Lower = prefers higher-capacity providers.")
#             cap_pct = 100 - price_pct
#             c1, c2 = st.columns(2)
#             c1.metric("Price", f"{price_pct}%")
#             c2.metric("Capacity", f"{cap_pct}%")
#             user_prefs[u["name"]] = price_pct / 100.0

# --- Persist in session state so pages/ can read the same inputs ---
# defaults (safe if user lands on dashboard first)
st.session_state.setdefault("days", 30)
st.session_state.setdefault("user_prefs", {u["name"]: 0.5 for u in user_config})

st.subheader("Users")
for uname in [u["name"] for u in user_config]:
    if st.button(f"👤 {uname}", key=f"btn_{uname}"):
        try:
            st.query_params["user"] = uname
        except Exception:
            st.experimental_set_query_params(user=uname)
        st.session_state["selected_user"] = uname
        st.switch_page("pages/1_User_Dashboard.py")

st.divider()
# st.subheader("Quick preview (first 10 rows)")
# st.dataframe(usage_df.head(10), use_container_width=True)
usage_df = make_users(user_config, int(st.session_state["days"]), seed=42)
# Optional small overview chart: total daily demand by user (readable)
totals = usage_df.groupby(["user","day"], as_index=False)["usage_kwh"].sum()
fig = px.bar(totals, x="day", y="usage_kwh", color="user", barmode="group",
             title="Daily demand by user (preview)", labels={"usage_kwh":"kWh","day":"Day"})
fig.update_layout(xaxis=dict(tickmode="linear", dtick=1))
st.plotly_chart(fig, use_container_width=True)
