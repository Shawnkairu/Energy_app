# Data Model

> **Source of truth:** scenario specs in [imported-specs/](imported-specs/README.md). Each entity here must match the data-model section of its scenario doc (scenario A §11 for resident; scenario B §6 for building owner; scenario C §10 for homeowner; scenario D §6 for electrician; scenario E §8 for provider; scenario F §8 for financier). Current code-vs-spec gaps are tracked in [SPEC_COMPLIANCE_CHECKLIST.md §3.2](SPEC_COMPLIANCE_CHECKLIST.md).

## Building

Deployment and benchmark unit. Stores location band, units, occupancy, **apartment participation and ATS/meter topology (per enrolled unit)**, owner terms, DRS, deployment status, and live performance.

**Apartment building hardware (canonical):** e.mappa generation and storage feed a **separate e.mappa solar supply path**. Each **participating** apartment is served through an **apartment-level ATS** at or near its **PAYG meter**, switching that unit between the e.mappa path and **KPLC/grid fallback**. Non-participating apartments are not connected to the e.mappa supply path. DRS includes **solar capacity fit vs participating apartments**, **ATS/meter mapping**, and **ATS ↔ KPLC switching verification** before go-live token economics activate for a unit.

**Roof asset context:**
- `roof_area_m2` — computed from polygon or manually entered
- `roof_polygon_geojson` — GeoJSON Polygon, lat/lon
- `roof_source` — `'microsoft_footprints' | 'owner_traced' | 'owner_typed' | 'google_solar_api'`
- `roof_confidence` — 0..1, used in DRS
- `data_source` — `'synthetic' | 'measured' | 'mixed'` (current operational state per environment is tracked in [DEPLOYMENT_AND_READINESS.md](DEPLOYMENT_AND_READINESS.md))

## Resident Account

Identity: phone is the primary identifier with SMS OTP; email is a secondary identifier. Stores building membership, capacity-queue status (per scenario A §6.2: `interested` / `pledged` / `capacity_review` / `capacity_cleared` / `queued` / `waitlisted` / `activated`), prepaid token balance, consumption, owned shares (per `AssetShare`), savings, and payout wallet. **Pledges are non-binding demand signals stored separately from prepaid balance** (scenario A §5).

## Provider Asset

Represents a solar array with provider identity, capacity, MPPT/channel, generation, monetized output, retained ownership, sold shares, and payout.

## Infrastructure Asset

Represents inverter, battery, DB upgrades, monitoring, balance-of-system, and financier recovery rights.

## Supplier Order

Tracks BOM, quote, selected supplier, price, lead time, delivery, serial numbers, warranty docs, and fulfillment status.

## Electrician work order

Tracks certified electrician ownership of site inspection, install checklist, photos, test readings, LBRS signoff, and go-live evidence.

## Settlement Period

> Formulas and waterfall phases: [SETTLEMENT_AND_PAYBACK.md](SETTLEMENT_AND_PAYBACK.md). Legacy detail: [SETTLEMENT_RULES.md](SETTLEMENT_RULES.md).

The truth source for dashboards: `E_gen`, `E_direct`, `E_charge`, `E_battery_used`, `E_sold`, `E_waste`, `E_grid`, prepaid cash, revenue, payout waterfall, reserve, and anomalies.

- `data_source` — `'synthetic' | 'measured' | 'mixed'` (per-environment posture lives in [DEPLOYMENT_AND_READINESS.md](DEPLOYMENT_AND_READINESS.md))
- `simulation` (boolean) — true when payout instructions were not issued (used while real payment rails are still being wired)

## Energy Reading

Time-series row used to feed projector and settlement. Schema: `building_id`, `timestamp`, `kind` (`generation` | `load` | `irradiance`), `value`, `unit`, `source` (`synthetic` | `measured`), `provenance` (e.g., `'pvwatts:v8:cache=2026-04-12'`, `'open-meteo:shortwave_radiation'`, `'load-archetype:emerging_appliance:seed=42'`, `'iot:building_id:hour'`). Source attribution is per-row so settlement can mix measured and synthetic streams without losing audit fidelity.

## Scenario A entities (not yet implemented; tracked in [SPEC_COMPLIANCE_CHECKLIST.md §3.2.1](SPEC_COMPLIANCE_CHECKLIST.md))

Scenario A §11 requires the following entities, none of which exist yet in `backend/app/models/`:

- `ApartmentConnection` — `building_id`, `resident_user_id`, `unit_number`, `meter_id`, `ats_id`, `connection_state`, `capacity_status`, `queue_position`, `activated_at`, `suspended_reason`
- `ResidentLoadProfile` — `resident_user_id`, `building_id`, `estimated_monthly_kwh`, `daytime_fraction`, `peak_kw_estimate`, `confidence_level`, `source`, `updated_at`
- `CapacityPlan` — `building_id`, `phase_id`, `array_kw`, `battery_usable_kwh`, `inverter_kw`, `max_active_apartments`, `max_monthly_served_kwh`, `reserve_margin_pct`
- `CapacityQueueEntry` — `building_id`, `resident_user_id`, `status`, `joined_at`, `priority_score`, `queue_position`, `cleared_at`, `notes`
- `AssetShare` — `asset_id`, `asset_type`, `owner_user_id`, `owner_role`, `percentage`, `acquisition_price_kes`, `valuation_method`, `acquired_at`
- `AssetValuation` — `asset_id`, `valuation_method`, `cost_basis_kes`, `depreciation_pct`, `replacement_cost_kes`, `income_value_kes`, `fair_value_kes`, `assumptions_json`, `effective_at`
- `EnergyTradeIntent` — `buyer_user_id`, `source_region/building_id`, `desired_kwh`, `max_price_kes_per_kwh`, `status`, `regulatory_enabled`, `utility_fee_estimate`

## Ownership Ledger

Immutable audit trail of asset ownership: asset ID, owner ID, percentage, effective date, transfer price, and payout rights moved.