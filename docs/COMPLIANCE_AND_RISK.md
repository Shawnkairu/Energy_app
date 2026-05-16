# Compliance and Risk (Financier-Heavy)

Financier and cross-border flows are legally sensitive. This file summarizes **product requirements**; it is **not** legal advice. Full narrative: [imported-specs/scenario-f-financier-flow.md](./imported-specs/scenario-f-financier-flow.md).

## Non‑negotiables

- **No guaranteed ROI** language in UX or marketing.
- **KYC / KYB**, **AML/CFT**, **suitability / appropriateness**, **jurisdiction gating**, **disclosures**, **escrow/custody**, **investment limits**, and **records** before retail-scale capital formation.
- **Commit flow** is multi-step: instrument → amount → limits → documents → knowledge check (retail) → escrow funding → **DRS updates only after legally valid reservation**.
- **Energy trading / wheeling / net metering** only when explicitly **enabled** with metering, utility compensation, and consumer disclosure (see scenario A/C specs).

## Trading / export roadmap

Treat wheeling and retail energy trading as **roadmap** unless a feature flag + jurisdiction rules mark them enabled.

## Code / UX pointers

- Financier portal sections: Discover → Project status → Energy generation → Wallet → Profile (`packages/shared/src/stakeholderSections.ts`).
- Shared financier types: `FinancierEligibilityTier`, `ExternalMonetization` in `packages/shared/src/types.ts` (extend with counsel-reviewed enums as products harden).
