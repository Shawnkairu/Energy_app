# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the **e.mappa Trading Platform Simulation** - a proof-of-concept demonstration system for the e.mappa energy aggregation and peer-to-peer trading platform. It simulates a 24-hour operation of the platform with 20 homes in Nyeri, Kenya, showing how the dual-layer system (provider aggregation + P2P trading) optimizes energy distribution and creates value for all stakeholders.

The simulation consists of a complete Python simulation engine and an interactive Streamlit web dashboard for presenting results to stakeholders like KPLC.

## Development Commands

### Running the Dashboard

```bash
# Install dependencies
pip install -r files/requirements.txt

# Run the Streamlit dashboard (interactive visualization)
cd files
streamlit run streamlit_app.py
```

The dashboard will open automatically in your browser at `http://localhost:8501`.

### Running the Console Simulation

```bash
# Run the complete 24-hour simulation (console output)
cd files
python run_simulation.py

# Generate detailed reports from saved results
python generate_report.py

# Test individual modules
python solar_generation.py    # Test provider fleet generation
python customers.py            # Test customer base creation
python allocation_engine.py    # Test allocation algorithm
python p2p_trading.py          # Test P2P marketplace
```

### Alternative Ports

If port 8501 is already in use:

```bash
streamlit run streamlit_app.py --server.port 8502
```

## Architecture

### Simulation Engine Components

The simulation consists of 6 core Python modules in the `files/` directory:

#### 1. Solar Generation ([solar_generation.py](files/solar_generation.py))

Simulates realistic 24-hour solar production curves for the 3 provider fleet.

**Key Classes:**
- `SolarProvider` - Represents a solar provider with capacity, pricing, and reliability
  - `generate_production_curve()` - Creates realistic sine-wave solar output based on Nyeri, Kenya irradiance patterns (5.5 kWh/m²/day)
  - `generate_dynamic_pricing()` - Time-of-day pricing (higher during peak demand hours)

**Provider Fleet Configuration:**
- Provider A - SolarTech: 30 kW capacity, KES 18/kWh base, 85% reliability
- Provider B - GreenPower: 40 kW capacity, KES 20/kWh base, 95% reliability
- Provider C - EcoEnergy: 25 kW capacity, KES 16/kWh base, 75% reliability

**Key Functions:**
- `create_provider_fleet()` - Initializes all 3 providers with production curves
- `get_total_available_power(providers, hour)` - Calculates total supply at given hour

#### 2. Customer Management ([customers.py](files/customers.py))

Creates and manages the 20-customer pilot base (14 consumers + 6 prosumers).

**Key Classes:**
- `Customer` - Base class for regular consumers
  - `generate_consumption_pattern()` - Creates realistic 24-hour demand curves with morning (6-9 AM) and evening (6-10 PM) peaks

- `Prosumer` (extends Customer) - Customers with solar ownership shares
  - `ownership_share_kw` - Their portion of total solar capacity
  - `generate_production_from_share()` - Calculates their generation based on ownership percentage
  - `calculate_net_position()` - Returns excess (positive) or deficit (negative) energy
  - `has_excess_to_sell()` - Boolean check for P2P trading eligibility

**Customer Base:**
- 14 regular consumers (12 residential, 2 business)
- 6 prosumers with ownership shares: 4.0, 6.0, 3.0, 5.0, 4.5, 3.5 kW (total 26 kW)

**Key Functions:**
- `create_customer_base()` - Generates all 20 customers with consumption patterns
- `get_prosumers(customers)` - Filters to prosumer-only list
- `get_consumers(customers)` - Filters to consumer-only list
- `calculate_total_demand(customers, hour)` - Aggregates demand for specific hour

#### 3. Allocation Engine ([allocation_engine.py](files/allocation_engine.py))

The core optimization algorithm that distributes provider power to customers.

**Key Classes:**
- `AllocationEngine` - Main allocation optimizer
  - `platform_markup` - KES 2.0/kWh fee added to provider costs
  - `allocate_hour()` - Runs multi-criteria optimization for one hour

**Allocation Strategy:**
- **Multi-criteria scoring**: Combines price (50%), reliability (30%), and capacity (20%)
- **Greedy allocation**: Assigns from highest-scored providers first
- **Fairness constraints**: Ensures no provider over-allocated beyond capacity
- **Customer cost calculation**: Provider cost + platform markup

**Key Data Structures:**
- `AllocationResult` - Contains customer allocations, provider utilization, weighted avg price, unmet demand
- Returns dictionary: `{customer_id: {provider_name: kwh_allocated}}`

**Key Functions:**
- `calculate_customer_cost()` - Computes total cost including platform fee
- `get_kplc_comparison_cost()` - Calculates equivalent KPLC cost for comparison
- `run_allocation_analysis()` - Runs allocation across multiple hours

#### 4. P2P Trading Marketplace ([p2p_trading.py](files/p2p_trading.py))

Order book-based peer-to-peer energy trading system.

**Key Classes:**
- `P2PMarketplace` - Order matching engine
  - `platform_fee_percent` - 5% commission on all trades
  - `add_order()` - Places buy/sell order and attempts matching
  - `_match_orders()` - Matches orders using price-time priority (max heap for buys, min heap for sells)

- `TradingAgent` - Automated trading logic for prosumers/consumers
  - `create_sell_order()` - Prosumer sells excess at base KES 19/kWh (premium during peak hours)
  - `create_buy_order()` - Consumer buys deficit at base KES 22/kWh (willing to pay more at peak)

**Trading Mechanism:**
- **Price discovery**: Market clearing when buy price ≥ sell price
- **Trade execution**: At seller's price (market standard)
- **Dynamic pricing**: Adjusts based on time of day and supply/demand conditions
- **Platform revenue**: 5% fee on gross trade value

**Key Data Structures:**
- `Order` - Buy or sell order with user_id, quantity, price, hour
- `Trade` - Completed trade with buyer, seller, quantity, price, platform fee

**Key Functions:**
- `simulate_p2p_trading_hour()` - Orchestrates trading for one hour, returns statistics

#### 5. Main Simulation Runner ([run_simulation.py](files/run_simulation.py))

Integrates all components into a complete 24-hour simulation.

**Key Classes:**
- `EmappaSimulation` - Main simulation orchestrator
  - Initializes providers, customers, allocation engine, and P2P marketplace
  - `run_24_hour_simulation()` - Executes full simulation, returns comprehensive JSON results
  - `_simulate_hour()` - Runs single hour: allocation → P2P trading → cost calculation
  - `_calculate_summary()` - Aggregates 24-hour metrics
  - `print_summary()` - Console-friendly output
  - `export_results()` - Saves to JSON file

**Simulation Flow:**
```
For each hour (0-23):
  1. Get provider supply and customer demand
  2. Run allocation engine (optimize distribution)
  3. Calculate provider costs
  4. Run P2P marketplace (prosumer trading)
  5. Calculate e.mappa vs KPLC costs
  6. Compile hour_data metrics
```

**Output Structure:**
```json
{
  "simulation_metadata": {...},
  "hourly_data": [
    {
      "hour": 0,
      "supply_demand": {...},
      "provider_stats": {...},
      "allocation": {...},
      "p2p_trading": {...},
      "costs": {...}
    },
    ...
  ],
  "summary": {
    "energy_metrics": {...},
    "financial_metrics": {...},
    "trading_metrics": {...},
    "system_metrics": {...}
  }
}
```

#### 6. Report Generator ([generate_report.py](files/generate_report.py))

Creates detailed console reports from simulation results.

**Report Functions:**
- `generate_hourly_report()` - 24-hour breakdown table with supply, demand, trades, savings
- `generate_provider_analysis()` - Provider utilization and pricing analysis
- `generate_customer_savings_report()` - Per-customer savings with monthly/annual projections
- `generate_platform_business_metrics()` - Revenue breakdown and scale projections

**Scale Projections:**
- 100 homes → ~$3,500/year
- 500 homes → ~$17,500/year
- 2,000 homes → ~$70,000/year

### Dashboard Structure

The Streamlit app ([streamlit_app.py](files/streamlit_app.py)) provides an interactive web interface:

1. **Real-time Simulation Runner** - Executes `EmappaSimulation.run_24_hour_simulation()` and caches results
2. **Key Performance Indicators** - 4-metric dashboard showing savings, revenue, trades, and prosumer earnings
3. **Interactive Charts** - Plotly visualizations consuming the JSON results
4. **Scale Projections** - Revenue modeling for scaling from 20 to 2,000 homes

**Visualization Functions:**
- `plot_supply_demand_curves()` - 24-hour solar supply vs customer demand with peak annotations
- `plot_price_dynamics()` - KPLC vs provider vs e.mappa pricing comparison
- `plot_provider_utilization()` - Stacked area chart showing which providers are used when
- `plot_p2p_trading_activity()` - Dual bar charts for trading volume (kWh) and value (KES)
- `plot_cost_savings_waterfall()` - Waterfall chart breaking down costs
- `create_live_trading_feed()` - Table of recent P2P trades

### Data Flow

```
create_provider_fleet() → 3 SolarProviders with production curves
create_customer_base() → 20 Customers (14 consumers + 6 prosumers)
    ↓
EmappaSimulation.run_24_hour_simulation()
    ↓
For each hour:
  AllocationEngine.allocate_hour() → Optimal provider-to-customer distribution
  simulate_p2p_trading_hour() → Prosumer excess trading
  Cost calculations → e.mappa vs KPLC comparison
    ↓
Returns JSON results:
  - hourly_data[] (24 hours of detailed metrics)
  - summary (aggregated financial/energy/trading metrics)
    ↓
Streamlit visualizations or generate_report.py consume JSON
    ↓
Interactive dashboard or console reports
```

## Key Algorithms

### Allocation Optimization

The allocation engine uses a **multi-criteria greedy algorithm**:

1. **Score Providers**: Combines normalized price (50%), reliability (30%), and capacity ratio (20%)
2. **Sort by Score**: Highest-scoring provider first
3. **Greedy Assignment**: Allocate from best provider until customer satisfied or provider depleted
4. **Capacity Constraints**: Never exceed provider's available capacity
5. **Fair Distribution**: All customers get proportional access to best providers

### P2P Order Matching

The P2P marketplace uses a **continuous double auction**:

1. **Order Books**: Max heap for buy orders (highest price first), min heap for sell orders (lowest price first)
2. **Price-Time Priority**: Orders at same price matched by timestamp
3. **Crossing Orders**: Trade when buy_price ≥ sell_price
4. **Trade Price**: Seller's ask price (market standard)
5. **Partial Fills**: Orders partially filled if quantity mismatched

## Key Metrics Displayed

### Financial Metrics
- **Customer Savings**: Percentage and total KES saved vs KPLC rates (typically 30-40%)
- **Platform Revenue**: Daily and monthly projected revenue from transaction fees
- **Prosumer Earnings**: Average earnings from selling excess solar energy

### Energy Metrics
- **Total Energy Allocated**: kWh distributed via provider aggregation
- **P2P Energy Traded**: kWh traded peer-to-peer (percentage of total)
- **Peak Supply/Demand**: Maximum power levels with timestamps

### Trading Metrics
- **Total P2P Trades**: Count of executed peer-to-peer transactions
- **Trade Volume**: Energy transferred between prosumers and consumers
- **Market Clearing Price**: Equilibrium price from order book

## Business Context

### Purpose
This simulation was built to demonstrate e.mappa's viability to **KPLC (Kenya Power and Lighting Company)** for a partnership discussion. The dashboard proves the concept works with realistic data before deploying a physical pilot.

### Key Value Propositions Shown
1. **Customer Savings**: 30-40% reduction vs KPLC rates
2. **Grid Compatibility**: Uses existing infrastructure (not competing)
3. **Platform Revenue**: Sustainable business model (KES 7,588/month for 20 homes)
4. **Prosumer Income**: Passive earnings for solar panel owners (KES 1,635/month average)
5. **Scalability**: Projects revenue at 100/500/2,000 homes

### KPLC Pricing Context
The simulation compares against KPLC's time-of-use rates:
- Peak hours (6-9 AM, 6-10 PM): KES 35/kWh
- Off-peak hours: KES 28/kWh

These rates are hard-coded in [allocation_engine.py:192-195](files/allocation_engine.py#L192-L195) and [streamlit_app.py:138](files/streamlit_app.py#L138).

## Design System

### Color Scheme
The dashboard uses a warm, professional palette:
- Solar Supply: `#FDB462` (orange) - represents solar generation
- Customer Demand: `#80B1D3` (blue) - represents consumption
- P2P Trading: `#8DD3C7` (teal), `#BEBADA` (purple)
- Scale Projections: Multi-color bars for visual distinction

### Layout
- **Wide Mode**: Enabled by default via `st.set_page_config(layout="wide")`
- **Sidebar**: Simulation controls and platform information
- **Main Area**: Metrics → Charts → Expandable details
- **Responsive Columns**: 2-column and 4-column layouts for different sections

## Session State Management

The dashboard uses Streamlit session state to cache simulation results:

```python
st.session_state.simulation_run    # Boolean flag
st.session_state.results           # JSON results from simulation
st.session_state.simulation        # EmappaSimulation instance
```

This prevents re-running the simulation on every interaction. The "Run New Simulation" button clears the state to trigger a fresh run.

## Deployment Considerations

### Local Demo (Current Setup)
- Runs on `localhost:8501`
- No internet required after dependencies installed
- Simulation takes ~10 seconds to run
- Ideal for in-person meetings

### Remote Deployment Options
1. **Streamlit Community Cloud** - Free hosting for public dashboards
2. **Ngrok** - Expose localhost to internet for remote presentations
3. **Internal Server** - Deploy on company server with proper authentication

## Known Limitations

1. **Hard-coded Paths**: Several modules use `sys.path.append('/home/claude/emappa_simulation')` which needs updating for actual deployment
2. **Static KPLC Rates**: Pricing comparison uses fixed rates, not real-time KPLC API
3. **No Authentication**: Dashboard is publicly accessible - not suitable for sensitive data
4. **Simulated Data**: Results are based on modeled behavior, not actual IoT device readings
5. **Randomness**: Solar cloud factors and consumption have random variance - results vary between runs

## File Structure

```
files/
├── Core Simulation Engine
│   ├── solar_generation.py       # Provider fleet with realistic solar curves
│   ├── customers.py              # Customer base (consumers + prosumers)
│   ├── allocation_engine.py      # Multi-criteria optimization algorithm
│   ├── p2p_trading.py           # Order book marketplace
│   └── run_simulation.py         # Main orchestrator (EmappaSimulation)
│
├── Visualization & Reporting
│   ├── streamlit_app.py          # Interactive Streamlit dashboard
│   └── generate_report.py        # Console report generator
│
├── Configuration
│   └── requirements.txt          # Python dependencies
│
└── Documentation
    ├── STREAMLIT_GUIDE.md        # Setup and demo instructions
    └── FINAL_SUMMARY.md          # Complete project overview and pitch guide
```

## Documentation

- [STREAMLIT_GUIDE.md](files/STREAMLIT_GUIDE.md) - Detailed setup instructions and demo walkthrough for KPLC meeting
- [FINAL_SUMMARY.md](files/FINAL_SUMMARY.md) - Complete project summary including pitch structure, value propositions, and next steps

## Related Projects

This simulation is part of the larger e.mappa ecosystem:
- **emappa** (React Native app in `../emappa`) - Mobile app interface
- **emappapp** (React Native app in `../emappapp`) - Alternative mobile implementation with CLAUDE.md
- **Backend** (expected separately) - FastAPI server for optimization and billing (referenced in emappapp)
