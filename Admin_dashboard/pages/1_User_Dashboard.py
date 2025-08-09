# pages/1_User_Dashboard.py
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px

from profiles import make_users
from optimization_logic import allocate_per_user_day_per_alpha
from user_payment_models import (
    simulate_postpaid_cost,
    simulate_token_cost,
    simulate_subscription_cost,
)

st.set_page_config(page_title="User Dashboard", layout="wide")

# ---------- Load shared state (with safe fallbacks) ----------
providers   = st.session_state.get("providers", None)
user_config = st.session_state.get("user_config", None)
home_page   = st.session_state.get("home_page", "energy_streamlit_app.py")

if providers is None or not isinstance(providers, pd.DataFrame) or providers.empty:
    providers = pd.DataFrame({
        'provider':['SolarOne','GreenLight','SunStream','RayPower','BrightSolar','NovaEnergy'],
        'price_per_kwh':[0.12,0.10,0.14,0.11,0.13,0.09],
        'capacity_kwh':[500,600,400,300,450,550]
    })

if user_config is None or len(user_config) == 0:
    user_config = [
        {"name":"Amina",  "profile":"basic_lighting"},
        {"name":"Otieno", "profile":"lighting_tv"},
        {"name":"Wanjiku","profile":"emerging_appliance"},
        {"name":"Juma",   "profile":"microbiz_kiosk"},
    ]

all_users = [u["name"] for u in user_config]

# ---------- Resolve selected user from URL or session ----------
qp_user = st.query_params.get("user", None)
if isinstance(qp_user, list):
    qp_user = qp_user[0] if qp_user else None

selected_user = qp_user or st.session_state.get("selected_user")
if selected_user not in all_users:
    selected_user = all_users[0]

# Keep URL in sync without causing loops
if st.query_params.get("user") != selected_user:
    try:
        st.query_params["user"] = selected_user
    except Exception:
        st.experimental_set_query_params(user=selected_user)

st.session_state["selected_user"] = selected_user

# ---------- One-time session defaults ----------
if "days" not in st.session_state:
    st.session_state["days"] = 30

if "user_prefs" not in st.session_state:
    st.session_state["user_prefs"] = {u: 0.5 for u in all_users}  # price weight α per user

# ---------- Sidebar controls (stable via keys) ----------
with st.sidebar:
    st.header("Simulation controls")

    # Days persists automatically via key
    st.number_input("Days to simulate", min_value=1, max_value=60, key="days")

    # Per-user price priority (%). Capacity = 100 - price.
    alpha_key = f"alpha_{selected_user}_pct"
    if alpha_key not in st.session_state:
        st.session_state[alpha_key] = int(st.session_state["user_prefs"].get(selected_user, 0.5) * 100)

    price_pct = st.slider(
        f"{selected_user}: Price priority (%)",
        min_value=0, max_value=100,
        key=alpha_key,
        help="Higher = prefers cheaper providers; Lower = prefers higher-capacity providers."
    )
    st.session_state["user_prefs"][selected_user] = st.session_state[alpha_key] / 100.0
    cap_pct = 100 - st.session_state[alpha_key]
    c1, c2 = st.columns(2)
    c1.metric("Price", f"{price_pct}%")
    c2.metric("Capacity", f"{cap_pct}%")

# ---------- Recompute usage + allocation using state ----------
days = int(st.session_state["days"])

# Ensure every user has a preference (in case cohort changed)
for u in all_users:
    st.session_state["user_prefs"].setdefault(u, 0.5)

usage_df = make_users(user_config, days, seed=42)  # reproducible; change/remove seed if desired
alloc_df = allocate_per_user_day_per_alpha(providers, usage_df, st.session_state["user_prefs"])

u_usage = usage_df[usage_df["user"] == selected_user].copy()
u_alloc = alloc_df[alloc_df["user"] == selected_user].copy()

# ---------- Header ----------
st.title(f"User Dashboard — {selected_user}")

# ---------- Change user (optional) ----------
with st.expander("Change user", expanded=False):
    new_user = st.selectbox("User", all_users, index=all_users.index(selected_user))
    if new_user != selected_user:
        try:
            st.query_params["user"] = new_user
        except Exception:
            st.experimental_set_query_params(user=new_user)
        st.session_state["selected_user"] = new_user
        st.rerun()

# ---------- Layout: profile & allocation ----------
left, right = st.columns([1, 2], gap="large")

with left:
    st.subheader("Profile")
    prof = next((u["profile"] for u in user_config if u["name"] == selected_user), "—")
    alpha = st.session_state["user_prefs"].get(selected_user, 0.5)
    st.write(f"**Profile:** {prof}")
    st.write(f"**Price priority:** {int(100*alpha)}%  |  **Capacity priority:** {100-int(100*alpha)}%")

    total_days = len(u_usage)
    total_kwh = float(u_usage["usage_kwh"].sum()) if total_days > 0 else 0.0
    avg_kwh = float(u_usage["usage_kwh"].mean()) if total_days > 0 else float("nan")

    st.metric("Total days", total_days)
    st.metric("Total demand (kWh)", round(total_kwh, 2))
    st.metric("Avg daily demand (kWh)", round(avg_kwh, 3) if not np.isnan(avg_kwh) else "—")

    st.subheader("Daily demand")
    st.dataframe(u_usage[["day","usage_kwh"]], use_container_width=True, height=320)

with right:
    st.subheader("Provider allocation (stacked)")
    if not u_alloc.empty:
        fig_u = px.bar(
            u_alloc, x="day", y="alloc_kwh", color="provider",
            labels={"alloc_kwh":"kWh Allocated","day":"Day"},
            title=f"Daily Allocation for {selected_user}"
        )
        fig_u.update_layout(barmode="stack", xaxis=dict(tickmode="linear", dtick=1))
        st.plotly_chart(fig_u, use_container_width=True)
    else:
        st.info("No allocation yet. Adjust days or preferences.")

# ---------- Billing (with real provider prices) ----------
st.divider()
st.subheader("Billing Model Simulation (with real provider prices)")

billing_model = st.selectbox(
    "Choose billing model",
    ["Postpaid", "Token (Prepaid)", "Subscription"],
    key=f"billing_{selected_user}"
)

if billing_model == "Postpaid":
    df_bill = simulate_postpaid_cost(u_alloc, providers)
    st.dataframe(df_bill, use_container_width=True)
    st.success(f"📬 Total bill: {df_bill['cost'].sum():,.2f}  "
               f"for {df_bill['used_kwh'].sum():.2f} kWh")

elif billing_model == "Token (Prepaid)":
    token_start = st.number_input("Initial tokens (kWh)", min_value=0.0, value=10.0, key=f"tok_{selected_user}")
    df_bill = simulate_token_cost(u_alloc, providers, token_start)
    st.dataframe(df_bill, use_container_width=True)
    st.success(f"💳 Final token balance: {df_bill['remaining_tokens_kwh'].iloc[-1]:.2f} kWh  "
               f"| Total cost: {df_bill['cost'].sum():,.2f}")

elif billing_model == "Subscription":
    allowance = st.number_input("Monthly allowance (kWh)", min_value=1.0, value=20.0, key=f"allow_{selected_user}")
    rollover = st.checkbox("Enable rollover", True, key=f"roll_{selected_user}")
    df_bill, roll = simulate_subscription_cost(u_alloc, providers, allowance, rollover)
    st.dataframe(df_bill, use_container_width=True)
    st.success(f"📦 Remaining kWh at end: {df_bill['remaining_allow_kwh'].iloc[-1]:.2f}  "
               f"| Total cost: {df_bill['cost'].sum():,.2f}")
    if rollover:
        st.info(f"🔁 {roll} kWh will roll over to next month")

# ---------- Billing charts ----------
if 'df_bill' in locals() and not df_bill.empty:
    # 1) Daily cost line
    fig_cost = px.line(df_bill, x="day", y="cost", markers=True,
                       title="Daily Energy Cost", labels={"day":"Day","cost":"Cost"})
    fig_cost.update_layout(xaxis=dict(tickmode="linear", dtick=1))
    st.plotly_chart(fig_cost, use_container_width=True)

    # 2) Provider contribution pie (effective cost actually paid)
    if not u_alloc.empty:
        alloc_cost = u_alloc.merge(
            providers[["provider","price_per_kwh"]], on="provider", how="left"
        )
        alloc_cost["base_cost"] = alloc_cost["alloc_kwh"] * alloc_cost["price_per_kwh"]

        tot_alloc_per_day = u_alloc.groupby("day", as_index=False)["alloc_kwh"].sum() \
                                   .rename(columns={"alloc_kwh":"alloc_total"})
        used_per_day = df_bill[["day","used_kwh"]].copy()
        usage_mix = tot_alloc_per_day.merge(used_per_day, on="day", how="left")
        usage_mix["used_frac"] = np.where(
            usage_mix["alloc_total"] > 0,
            np.clip(usage_mix["used_kwh"] / usage_mix["alloc_total"], 0, 1),
            0.0
        )

        alloc_cost = alloc_cost.merge(usage_mix[["day","used_frac"]], on="day", how="left").fillna({"used_frac":0.0})
        alloc_cost["effective_cost"] = alloc_cost["base_cost"] * alloc_cost["used_frac"]

        prov_cost = alloc_cost.groupby("provider", as_index=False)["effective_cost"].sum()
        fig_pie = px.pie(prov_cost, names="provider", values="effective_cost",
                         title="Provider Contribution to Total Bill")
        st.plotly_chart(fig_pie, use_container_width=True)

st.divider()
# Back to home
cols = st.columns([1,6])
with cols[0]:
    if st.button("⬅ Back to Users"):
        try:
            st.switch_page(home_page)
        except Exception:
            # Fallback if switch_page unsupported
            st.link_button("Go to Users", home_page)
