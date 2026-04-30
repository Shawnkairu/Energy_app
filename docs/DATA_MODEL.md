# Data Model

## Building

Deployment and benchmark unit. Stores location band, units, occupancy, meter configuration, owner terms, DRS, deployment status, and live performance.

## Resident Account

Stores building membership, prepaid balance, consumption, owned shares, savings, and payout wallet.

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

## Ownership Ledger

Immutable audit trail of asset ownership: asset ID, owner ID, percentage, effective date, transfer price, and payout rights moved.