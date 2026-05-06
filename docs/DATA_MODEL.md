# Data Model

> **Pilot fields** are marked below. See [PILOT_SCOPE.md](PILOT_SCOPE.md) for the rationale and exit criteria.

## Building

Deployment and benchmark unit. Stores location band, units, occupancy, meter configuration, owner terms, DRS, deployment status, and live performance.

**Pilot additions:**
- `roof_area_m2` — computed from polygon or manually entered
- `roof_polygon_geojson` — GeoJSON Polygon, lat/lon
- `roof_source` — `'microsoft_footprints' | 'owner_traced' | 'owner_typed'`
- `roof_confidence` — 0..1, used in DRS
- `data_source` — `'synthetic' | 'measured' | 'mixed'` (pilot defaults to `'synthetic'`)

## Resident Account

Stores building membership, **pledged balance** (pilot) / prepaid balance (post-pilot), consumption, owned shares, savings, and payout wallet.

**Pilot identity:** `email` is the primary identifier. `phone` is optional secondary.

## Provider Asset

Represents a solar array with provider identity, capacity, MPPT/channel, generation, monetized output, retained ownership, sold shares, and payout.

## Infrastructure Asset

Represents inverter, battery, DB upgrades, monitoring, balance-of-system, and financier recovery rights.

## Supplier Order

Tracks BOM, quote, selected supplier, price, lead time, delivery, serial numbers, warranty docs, and fulfillment status.

## Installer Job

Tracks electrician ownership of site inspection, install checklist, photos, test readings, and go-live signoff.

## Settlement Period

The truth source for dashboards: `E_gen`, `E_direct`, `E_charge`, `E_battery_used`, `E_sold`, `E_waste`, `E_grid`, prepaid cash, revenue, payout waterfall, reserve, and anomalies.

**Pilot additions:**
- `simulation` (boolean) — true if no payout instructions were issued
- `data_source` — `'synthetic' | 'measured' | 'mixed'`

## Energy Reading (Pilot)

Time-series row used to feed projector and settlement when on-site meters are absent. Schema: `building_id`, `timestamp`, `kind` (`generation` | `load` | `irradiance`), `value`, `unit`, `source` (`synthetic` | `measured`), `provenance` (e.g., `'pvwatts:v8:cache=2026-04-12'`, `'open-meteo:shortwave_radiation'`, `'load-archetype:emerging_appliance:seed=42'`).

## Ownership Ledger

Immutable audit trail of asset ownership: asset ID, owner ID, percentage, effective date, transfer price, and payout rights moved.