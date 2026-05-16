# Imported e.mappa Canonical Specs

These files are Markdown imports of the latest product and strategy documents used to update the repo. They are intended for Cursor/Codex/agent reference during repo-wide implementation work. Treat them as product source material, but keep the executable source of truth for formulas/types/business rules inside `packages/shared` and backend services.

**Compliance matrix:** Track implementation status against IA, pilot scope, and these imports in [`../SPEC_COMPLIANCE_CHECKLIST.md`](../SPEC_COMPLIANCE_CHECKLIST.md).

## Imported files

- [`scenario-a-resident-ats-capacity-ownership-trading-spec.md`](./scenario-a-resident-ats-capacity-ownership-trading-spec.md) — apartment resident flow, ATS allocation, capacity queue, ownership, trading roadmap.
- [`scenario-b-apartment-building-owner-flow.md`](./scenario-b-apartment-building-owner-flow.md) — apartment building owner onboarding, hosting role, DRS/LBRS, owner royalty, optional ownership.
- [`scenario-c-homeowner-flow-net-metering-trading.md`](./scenario-c-homeowner-flow-net-metering-trading.md) — homeowner flow, no host royalty, self-consumption savings, external monetization via net metering/trading.
- [`scenario-d-electrician-flow.md`](./scenario-d-electrician-flow.md) — electrician onboarding, certification, Discover/Projects/Wallet/Profile, DRS/LBRS execution and signoff.
- [`scenario-e-suppliers-providers-flow.md`](./scenario-e-suppliers-providers-flow.md) — supplier/provider inventory, quotes, EaaS, provider pool vs infrastructure pool, share buy-down.
- [`scenario-f-financier-flow.md`](./scenario-f-financier-flow.md) — financier onboarding, compliance gating, instruments, project discovery, buyouts, wallet, portfolio.
- [`installation-process-drs-lbrs-go-live.md`](./installation-process-drs-lbrs-go-live.md) — deployment process, DRS, LBRS, canonical apartment hardware architecture, electrician economics.
- [`ai-native-company-system-design.md`](./ai-native-company-system-design.md) — AI-native/closed-loop company strategy notes.

Settlement, payback, and stress-test framing for implementation also live in [`../SETTLEMENT_AND_PAYBACK.md`](../SETTLEMENT_AND_PAYBACK.md).

## Original Word documents

The exact `.docx` files are preserved in [`original-docx/`](./original-docx/).

## Non-negotiable doctrine summary

- e.mappa is prepaid-only. No postpaid usage, arrears, or payout from uncollected cash.
- Pay on monetized solar, not generated solar. `E_sold` is the economic base, not `E_gen`.
- Apartment projects use a separate e.mappa solar bus, Solar DB, per-apartment ATS/metering, and KPLC fallback. Do not default to uncontrolled common-bus injection.
- DRS gates deployment; LBRS gates live energy consumption. Both require all critical gates to pass.
- Residents pledge before activation and buy/top up only after their apartment is physically activated.
- Building owners host; they do not buy infrastructure by default. Their host royalty starts only after monetized prepaid solar exists.
- Homeowners do not earn host royalties from their own roof. Their self-consumption is savings/internal offset; cash earnings require external monetization such as net metering/export/trading/third-party usage.
- Electricians are verified/certified execution partners; default economics should pay labor upfront, with optional labor-as-capital only by explicit opt-in.
- Suppliers/providers can be hardware suppliers, panel providers, or both, but panels map to provider/array pools while infrastructure hardware maps to infrastructure pools.
- Financier flows require compliance-by-design: KYC/KYB, AML/CFT, eligibility, suitability, jurisdiction gating, escrow/custody, risk disclosures, no guaranteed returns.
