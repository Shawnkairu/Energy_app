"""
e.mappa Trading Platform - Interactive Dashboard
Streamlit visualization of 24-hour simulation
"""

import streamlit as st
import json
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import sys
import time
sys.path.append('/home/claude/emappa_simulation')

from solar_generation import create_provider_fleet
from customers import create_customer_base, get_prosumers, get_consumers
from allocation_engine import AllocationEngine
from p2p_trading import P2PMarketplace
from run_simulation import EmappaSimulation

# Page config
st.set_page_config(
    page_title="e.mappa Trading Platform",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
    <style>
    .big-metric {
        font-size: 2.5rem !important;
        font-weight: bold !important;
        color: #1f77b4 !important;
    }
    .stMetric {
        background-color: #f0f2f6;
        padding: 15px;
        border-radius: 10px;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize session state
if 'simulation_run' not in st.session_state:
    st.session_state.simulation_run = False
    st.session_state.results = None
    st.session_state.simulation = None

def load_or_run_simulation():
    """Load existing results or run new simulation"""
    if st.session_state.simulation is None:
        st.session_state.simulation = EmappaSimulation()
    
    if st.session_state.results is None:
        with st.spinner("Running 24-hour simulation..."):
            results = st.session_state.simulation.run_24_hour_simulation()
            st.session_state.results = results
            st.session_state.simulation_run = True
    
    return st.session_state.results

def plot_supply_demand_curves(results):
    """Plot 24-hour supply and demand curves"""
    
    hours = [h['hour'] for h in results['hourly_data']]
    supply = [h['supply_demand']['total_supply_kw'] for h in results['hourly_data']]
    demand = [h['supply_demand']['total_demand_kw'] for h in results['hourly_data']]
    
    fig = go.Figure()
    
    # Supply curve
    fig.add_trace(go.Scatter(
        x=hours,
        y=supply,
        mode='lines+markers',
        name='Solar Supply',
        line=dict(color='#FDB462', width=3),
        fill='tozeroy',
        fillcolor='rgba(253, 180, 98, 0.3)'
    ))
    
    # Demand curve
    fig.add_trace(go.Scatter(
        x=hours,
        y=demand,
        mode='lines+markers',
        name='Customer Demand',
        line=dict(color='#80B1D3', width=3),
        fill='tozeroy',
        fillcolor='rgba(128, 177, 211, 0.3)'
    ))
    
    # Peak annotations
    peak_supply_hour = max(results['hourly_data'], key=lambda x: x['supply_demand']['total_supply_kw'])
    peak_demand_hour = max(results['hourly_data'], key=lambda x: x['supply_demand']['total_demand_kw'])
    
    fig.add_annotation(
        x=peak_supply_hour['hour'],
        y=peak_supply_hour['supply_demand']['total_supply_kw'],
        text=f"☀️ Peak Solar<br>{peak_supply_hour['supply_demand']['total_supply_kw']:.1f} kW",
        showarrow=True,
        arrowhead=2,
        bgcolor="white"
    )
    
    fig.add_annotation(
        x=peak_demand_hour['hour'],
        y=peak_demand_hour['supply_demand']['total_demand_kw'],
        text=f"⚡ Peak Demand<br>{peak_demand_hour['supply_demand']['total_demand_kw']:.1f} kW",
        showarrow=True,
        arrowhead=2,
        bgcolor="white"
    )
    
    fig.update_layout(
        title="24-Hour Supply & Demand Profile",
        xaxis_title="Hour of Day",
        yaxis_title="Power (kW)",
        hovermode='x unified',
        height=400,
        showlegend=True,
        legend=dict(x=0.02, y=0.98)
    )
    
    return fig

def plot_price_dynamics(results):
    """Plot pricing across day"""
    
    hours = [h['hour'] for h in results['hourly_data']]
    avg_provider_price = [h['provider_stats']['weighted_avg_price'] for h in results['hourly_data']]
    customer_price = [h['allocation']['customer_price_with_markup'] for h in results['hourly_data']]
    
    # Add KPLC comparison
    kplc_price = [35 if h in [6,7,8,9,18,19,20,21,22] else 28 for h in hours]
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=hours,
        y=kplc_price,
        mode='lines',
        name='KPLC Rate',
        line=dict(color='red', width=2, dash='dash')
    ))
    
    fig.add_trace(go.Scatter(
        x=hours,
        y=avg_provider_price,
        mode='lines+markers',
        name='Provider Avg Price',
        line=dict(color='green', width=2)
    ))
    
    fig.add_trace(go.Scatter(
        x=hours,
        y=customer_price,
        mode='lines+markers',
        name='e.mappa Customer Price',
        line=dict(color='blue', width=3),
        fill='tonexty',
        fillcolor='rgba(0, 100, 255, 0.2)'
    ))
    
    fig.update_layout(
        title="Price Comparison: e.mappa vs KPLC",
        xaxis_title="Hour of Day",
        yaxis_title="Price (KES/kWh)",
        hovermode='x unified',
        height=400,
        showlegend=True
    )
    
    return fig

def plot_provider_utilization(results):
    """Plot provider utilization over time"""
    
    provider_names = list(results['hourly_data'][0]['provider_stats']['utilization'].keys())
    hours = [h['hour'] for h in results['hourly_data']]
    
    fig = go.Figure()
    
    for provider in provider_names:
        utilization = [h['provider_stats']['utilization'][provider] for h in results['hourly_data']]
        
        fig.add_trace(go.Scatter(
            x=hours,
            y=utilization,
            mode='lines+markers',
            name=provider.replace('Provider ', '').replace(' - ', ': '),
            stackgroup='one'
        ))
    
    fig.update_layout(
        title="Provider Utilization Throughout Day",
        xaxis_title="Hour of Day",
        yaxis_title="Utilization (%)",
        hovermode='x unified',
        height=400,
        showlegend=True
    )
    
    return fig

def plot_p2p_trading_activity(results):
    """Plot P2P trading volume and value"""
    
    hours = [h['hour'] for h in results['hourly_data']]
    trades = [h['p2p_trading']['trades_executed'] for h in results['hourly_data']]
    volume = [h['p2p_trading']['total_kwh_traded'] for h in results['hourly_data']]
    value = [h['p2p_trading']['total_value_kes'] for h in results['hourly_data']]
    
    fig = make_subplots(
        rows=2, cols=1,
        subplot_titles=("P2P Trading Volume", "P2P Transaction Value"),
        vertical_spacing=0.15
    )
    
    # Volume chart
    fig.add_trace(
        go.Bar(x=hours, y=volume, name='kWh Traded', marker_color='#8DD3C7'),
        row=1, col=1
    )
    
    # Value chart
    fig.add_trace(
        go.Bar(x=hours, y=value, name='Value (KES)', marker_color='#BEBADA'),
        row=2, col=1
    )
    
    fig.update_xaxes(title_text="Hour of Day", row=2, col=1)
    fig.update_yaxes(title_text="Energy (kWh)", row=1, col=1)
    fig.update_yaxes(title_text="Value (KES)", row=2, col=1)
    
    fig.update_layout(height=500, showlegend=False, hovermode='x unified')
    
    return fig

def plot_cost_savings_waterfall(results):
    """Waterfall chart showing cost breakdown"""
    
    summary = results['summary']['financial_metrics']
    
    fig = go.Figure(go.Waterfall(
        name="Cost Analysis",
        orientation="v",
        measure=["absolute", "relative", "relative", "total"],
        x=["KPLC Cost", "Provider Savings", "Platform Fee", "Customer Final Cost"],
        y=[
            summary['total_customer_cost_kplc_kes'],
            -(summary['total_customer_cost_kplc_kes'] - summary['total_customer_cost_emappa_kes'] - summary['platform_revenue_kes']),
            summary['platform_revenue_kes'],
            summary['total_customer_cost_emappa_kes']
        ],
        text=[
            f"KES {summary['total_customer_cost_kplc_kes']:,.0f}",
            f"-KES {(summary['total_customer_cost_kplc_kes'] - summary['total_customer_cost_emappa_kes'] - summary['platform_revenue_kes']):,.0f}",
            f"+KES {summary['platform_revenue_kes']:,.0f}",
            f"KES {summary['total_customer_cost_emappa_kes']:,.0f}"
        ],
        connector={"line": {"color": "rgb(63, 63, 63)"}},
    ))
    
    fig.update_layout(
        title="Cost Breakdown: KPLC vs e.mappa (24 hours)",
        showlegend=False,
        height=400
    )
    
    return fig

def create_live_trading_feed(results, max_trades=10):
    """Create a live trading feed display"""
    
    all_trades = []
    for hour_data in results['hourly_data']:
        if hour_data['p2p_trading']['trades_executed'] > 0:
            # Extract trade info (we'd need to modify simulation to include this)
            all_trades.append({
                'hour': hour_data['hour'],
                'count': hour_data['p2p_trading']['trades_executed'],
                'volume': hour_data['p2p_trading']['total_kwh_traded'],
                'value': hour_data['p2p_trading']['total_value_kes']
            })
    
    # Show recent trades
    df = pd.DataFrame(all_trades[-max_trades:])
    
    if not df.empty:
        df['hour'] = df['hour'].apply(lambda x: f"{x:02d}:00")
        df = df.rename(columns={
            'hour': 'Time',
            'count': 'Trades',
            'volume': 'Volume (kWh)',
            'value': 'Value (KES)'
        })
        
        st.dataframe(
            df.style.format({
                'Volume (kWh)': '{:.2f}',
                'Value (KES)': '{:.2f}'
            }),
            use_container_width=True
        )
    else:
        st.info("No P2P trades in this period")

# Main App
def main():
    # Header
    st.title("⚡ e.mappa Trading Platform Dashboard")
    st.markdown("**Real-time simulation of provider aggregation & peer-to-peer energy trading**")
    st.markdown("---")
    
    # Sidebar controls
    with st.sidebar:
        st.header("📊 Simulation Controls")
        
        if st.button("🔄 Run New Simulation", use_container_width=True):
            st.session_state.results = None
            st.session_state.simulation = None
            st.rerun()
        
        st.markdown("---")
        st.header("ℹ️ About e.mappa")
        st.markdown("""
        **e.mappa** is a dual-layer energy platform:
        
        1. **Provider Aggregation**: Optimally allocates power from multiple solar providers
        2. **P2P Trading**: Enables prosumers to sell excess energy credits
        
        **Pilot**: 20 homes in Nyeri, Kenya
        - 3 Solar Providers
        - 14 Consumers + 6 Prosumers
        - Using KPLC's existing grid
        """)
        
        st.markdown("---")
        st.markdown("**Tech Stack**")
        st.code("Python • Streamlit • Plotly")
    
    # Load or run simulation
    results = load_or_run_simulation()
    summary = results['summary']
    
    # Key Metrics Row
    st.header("📈 Key Performance Indicators (24 Hours)")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "Customer Savings",
            f"{summary['financial_metrics']['avg_savings_percent']:.1f}%",
            f"KES {summary['financial_metrics']['total_savings_kes']:,.0f} saved"
        )
    
    with col2:
        st.metric(
            "Platform Revenue",
            f"KES {summary['financial_metrics']['platform_revenue_kes']:,.0f}",
            f"KES {summary['financial_metrics']['platform_revenue_kes'] * 30:,.0f}/month"
        )
    
    with col3:
        st.metric(
            "P2P Trades",
            f"{summary['trading_metrics']['total_p2p_trades']}",
            f"{summary['energy_metrics']['p2p_as_percent_of_total']:.1f}% of energy"
        )
    
    with col4:
        st.metric(
            "Prosumer Earnings",
            f"KES {summary['trading_metrics']['avg_prosumer_earnings_kes']:.0f}",
            f"KES {summary['trading_metrics']['avg_prosumer_earnings_kes'] * 30:,.0f}/month"
        )
    
    st.markdown("---")
    
    # Charts Row 1: Supply/Demand and Pricing
    st.header("🔋 Supply & Demand Analysis")
    col1, col2 = st.columns(2)
    
    with col1:
        st.plotly_chart(plot_supply_demand_curves(results), use_container_width=True)
    
    with col2:
        st.plotly_chart(plot_price_dynamics(results), use_container_width=True)
    
    st.markdown("---")
    
    # Charts Row 2: Provider Performance
    st.header("⚙️ Provider Performance")
    col1, col2 = st.columns(2)
    
    with col1:
        st.plotly_chart(plot_provider_utilization(results), use_container_width=True)
    
    with col2:
        st.plotly_chart(plot_cost_savings_waterfall(results), use_container_width=True)
    
    st.markdown("---")
    
    # P2P Trading Section
    st.header("🤝 Peer-to-Peer Trading Activity")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.plotly_chart(plot_p2p_trading_activity(results), use_container_width=True)
    
    with col2:
        st.subheader("Recent Trades")
        create_live_trading_feed(results)
    
    st.markdown("---")
    
    # Detailed Metrics
    with st.expander("📊 Detailed System Metrics"):
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("**Energy Metrics**")
            st.metric("Total Allocated", f"{summary['energy_metrics']['total_energy_allocated_kwh']:.2f} kWh")
            st.metric("P2P Traded", f"{summary['energy_metrics']['total_p2p_traded_kwh']:.2f} kWh")
        
        with col2:
            st.markdown("**Financial Metrics**")
            st.metric("Revenue (Allocation)", f"KES {summary['financial_metrics']['revenue_from_allocation']:.2f}")
            st.metric("Revenue (P2P)", f"KES {summary['financial_metrics']['revenue_from_p2p']:.2f}")
        
        with col3:
            st.markdown("**System Metrics**")
            st.metric("Peak Supply", f"{summary['system_metrics']['peak_supply_kw']:.1f} kW @ {summary['system_metrics']['peak_supply_hour']:02d}:00")
            st.metric("Peak Demand", f"{summary['system_metrics']['peak_demand_kw']:.1f} kW @ {summary['system_metrics']['peak_demand_hour']:02d}:00")
    
    # Scale Projections
    with st.expander("📈 Scale Projections"):
        st.subheader("Annual Revenue at Scale")
        
        scales = [20, 100, 500, 2000]
        annual_revenues = [summary['financial_metrics']['platform_revenue_kes'] * 365 * (scale/20) for scale in scales]
        
        fig = go.Figure(go.Bar(
            x=[f"{scale} homes" for scale in scales],
            y=[rev / 130 for rev in annual_revenues],  # Convert to USD
            text=[f"${rev/130:,.0f}" for rev in annual_revenues],
            textposition='auto',
            marker_color=['#8DD3C7', '#FFFFB3', '#BEBADA', '#FB8072']
        ))
        
        fig.update_layout(
            title="Annual Revenue Projections (USD)",
            yaxis_title="Annual Revenue ($)",
            height=400
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: #666;'>
        <p><strong>e.mappa</strong> • Dual-System Energy Optimization Platform</p>
        <p>Built for KPLC Partnership Discussion • Nyeri Pilot 2026</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
