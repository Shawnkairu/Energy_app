# e.mappa

e.mappa is a mobile-first operating system for building-level energy economies. It qualifies buildings before deployment, pre-onboards prepaid demand, coordinates deal-level capital, verifies installation quality, and settles cashflows only from monetized solar energy.

## Stack

- `mobile`: Expo + Expo Router, primary mobile app
- `website`: Vite + React + TypeScript, public site plus isolated stakeholder web portals
- `cockpit`: Vite + React + TypeScript, internal e.mappa ops cockpit with integrated stress testing
- `packages/shared`: formulas, domain types, mock data, and business rules
- `packages/ui`: light-first design tokens and shared UI primitives
- `packages/api-client`: mock API/state layer that exposes computed product data

## Core Rules

- Prepaid only: no prepaid cash, no solar allocation, no payout.
- DRS gates deployment before funding release, hardware scheduling, and go-live.
- Payouts are based on monetized solar, not generated or wasted energy.
- Ownership controls future cashflows. Selling shares reduces the seller's future payout.
- Business logic lives in `packages/shared` and is imported everywhere.
- Stakeholder portals stay role-isolated; cockpit/admin remains internal-only.
- Stakeholder sections are registered in `packages/shared`; every phone-visible non-admin section must have a matching website portal section, while web may add clearly marked web-only depth.

> **Pilot mode** relaxes three of these rules until external integrations land: email OTP instead of SMS, non-binding pledges instead of prepaid cash, and synthesized energy/irradiance instead of on-site meters. See [docs/PILOT_SCOPE.md](docs/PILOT_SCOPE.md) for the authoritative pilot scope and exit criteria.

## Commands

```bash
npm install
npm run dev:website
npm run dev:cockpit
npm run dev:mobile
npm run audit:shared
npm run build
```
