# e.mappa Product Context

> Provider-agnostic energy platform aggregating community-scale solar providers into one marketplace.

---

## Vision

**We help** rural and peri-urban Kenyan households **transform from** passive electricity consumers with unreliable access **into** empowered prosumers with entrepreneurial opportunities **by** aggregating multiple solar providers through a distributed host system that delivers reliable, affordable power while enabling peer-to-peer energy trading.

**Core Promise:** 30-40% cost savings + income opportunities through P2P trading

---

## The Problem (Validated by 430-person survey)

| Pain Point | Survey Result | App Solution |
|------------|---------------|--------------|
| Unreliable power | 72.6% experienced blackouts last week | Real-time status, 90%+ uptime |
| Too expensive | 85.9% say electricity costs too much | Provider optimization, 30-40% savings |
| Opaque billing | 70.7% don't understand their bills | Transparent dashboard, clear breakdowns |
| No flexibility | 75.5% want flexible payment options | PAYG, subscription, post-paid |
| No visibility | 89.9% want real-time usage data | Live consumption tracking |

---

## User Types

### 1. Consumer (Primary)
- Rural/peri-urban households
- 4-person median household
- KES 3,000/month median spend (~$23 USD)
- Heavy M-Pesa users, smartphone literate
- Need: Reliable, affordable power with transparency

### 2. Host (Critical for scale)
- Schools, churches, people with large roofs/space
- Offer roof space for solar panel installation
- Earn passive income from hosting
- **Like Airbnb for solar-powered electricity**

### 3. Provider (B2B)
- Off-grid solar companies (M-KOPA, Sun King, etc.)
- Get access to wider markets without building distribution
- Compete on price and quality, not first-mover advantage

---

## Core Features

### Phase 1 (MVP)
- [ ] Real-time energy dashboard
- [ ] Provider optimization (Cost/Capacity/Reliability sliders)
- [ ] Transparent usage & billing
- [ ] M-Pesa integration
- [ ] Smart meter data visualization

### Phase 2
- [ ] P2P energy trading marketplace
- [ ] Host onboarding flow
- [ ] Provider marketplace for B2B

### Phase 3
- [ ] SIM Toolkit integration (no internet required)
- [ ] Community ownership/equity accumulation

---

## Design Principles

### Inspired By:

| App | What to Borrow |
|-----|----------------|
| **Tesla** | Dark energy flow visualization, minimalist elegance, animated power lines |
| **Enphase** | Energy flow diagram (Grid → Solar → Home → Battery), circular gauges, panel-level data |
| **Robinhood** | Interactive touch-responsive charts, time period selectors, smooth micro-animations |
| **Airbnb** | Warm "homey" feel, clean white space, trust indicators, host system UX |

### Visual Guidelines:
- **Light theme** with the brand color palette
- Colors: Slate blue (#4A5C7A), Light blue (#A2BFD9), Coral (#E07856)
- Smooth 60fps animations (react-native-reanimated)
- Energy flow should feel alive and dynamic
- Charts should be interactive and touch-responsive
- Trust indicators (verified badges, reviews, stats)

---

## Screen-by-Screen Purpose

### Home Screen
**Purpose:** At-a-glance energy status
**Inspiration:** Tesla/Enphase energy flow
**Key Elements:**
- Animated energy flow visualization (Grid → Solar → Home)
- Current power status (importing/exporting)
- Today's consumption summary
- Nearest solar farm location
- Quick actions (Buy power, View billing)

### Providers Screen
**Purpose:** Optimize your energy mix
**Key Elements:**
- 3-way slider (Cost/Capacity/Reliability) - auto-balances to 100%
- Real-time pie chart showing provider allocation
- Provider cards with allocation percentage
- No "optimize" button - updates in real-time as you slide

### Usage Screen
**Purpose:** Understand your consumption
**Inspiration:** Enphase energy charts
**Key Elements:**
- Time period selector (Day/Week/Month/Year)
- Consumption bar chart (teal, visible)
- Import/Export summary
- Clear cost breakdown

### Trading Screen
**Purpose:** Buy/sell surplus energy with neighbors
**Inspiration:** Robinhood trading interface
**Key Elements:**
- Interactive price chart with time periods
- Your surplus energy display
- Neighbor listings with distance
- Buy/Sell toggle
- Market price indicators

### Wallet Screen
**Purpose:** Manage payments and earnings
**Key Elements:**
- Current balance
- M-Pesa integration
- Transaction history
- Top-up options (PAYG, subscription)
- P2P trading earnings

### Profile Screen
**Purpose:** Identity + Host onboarding
**Inspiration:** Airbnb profile
**Key Elements:**
- Profile card with stats (Trades, Reviews, Months on e.mappa)
- Verified badge
- "Energy History" quick card
- "Connections" quick card (neighbors traded with)
- **"Become a Host"** section (critical CTA)
- Account settings

---

## Key Metrics to Surface in UI

### For Consumers:
- kWh consumed today/this month
- KES saved vs. Kenya Power baseline
- Current cost per kWh
- Uptime percentage
- Provider mix breakdown

### For Prosumers (P2P Traders):
- Surplus energy available
- KES earned from trading
- Number of trades completed
- Neighbor connections

### For Hosts:
- kWh generated from their panels
- Passive income earned
- Community members served

---

## Kenya-Specific Context

### Currency & Payments:
- All prices in **KES** (Kenyan Shillings)
- Primary payment: **M-Pesa** (not credit cards)
- PAYG (Pay-As-You-Go) is standard, not subscription

### Energy Context:
- **KPLC** = Kenya Power (the monopoly utility)
- Current tariff: KSh 24-29/kWh
- Frequent blackouts are normal
- Diesel generators are expensive backup (~$0.40/kWh)

### Target Areas:
- Peri-urban: Ruiru, Juja, Ongata Rongai (near Nairobi)
- Rural: Nyeri County, market towns near Nakuru

### Language:
- English primary, but consider Swahili for key terms
- "Baraza" = community town hall

---

## Competitive Positioning

| Competitor | Their Approach | Our Differentiation |
|------------|----------------|---------------------|
| Kenya Power (KPLC) | Monopoly, unreliable, opaque | Choice, reliability, transparency |
| M-KOPA / Sun King | Single vendor, watt-limited | Multi-provider, community scale |
| PowerGen | Single operator mini-grids | Provider aggregation, P2P trading |

**We are:** "AWS for solar" - infrastructure that aggregates providers, network effects as more join.

---

## Success Metrics

### Pilot (10-15 households):
- 90%+ uptime (vs 73% baseline)
- 15-30% cost savings
- 70%+ monthly active app users
- 10%+ try P2P trading

### Scale (500 households):
- 30%+ active P2P traders
- 5+ providers on platform
- KSh 500+/month savings per household

---

## Technical Stack

- **Frontend:** React Native + Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **Charts:** react-native-chart-kit (upgrading to wagmi-charts for trading)
- **Animations:** react-native-reanimated
- **Graphics:** react-native-svg (for energy flow)
- **Payments:** M-Pesa API integration

---

*Last updated: January 2026*
