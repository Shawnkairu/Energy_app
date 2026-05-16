# User Flows

> **Canonical scenarios:** [imported-specs/](imported-specs/README.md) (A–F). Screen layout: [IA_SPEC.md](IA_SPEC.md). Field-level conformance to the scenario specs: [SPEC_COMPLIANCE_CHECKLIST.md §3.2](SPEC_COMPLIANCE_CHECKLIST.md).

## Resident (Home / Energy / Wallet / Profile)

States: building not found → owner enrolled (no deploy) → organizing/DRS → funding/coordination → installation → installed (unit not activated) → live.

Actions: find building, load profile, **pledge** (not purchase), invite owner/neighbors, capacity queue, ATS activation, **buy/top-up tokens only after apartment activation**.

Capacity queue: interested → pledged → capacity review → cleared → queued → waitlisted → activated.

Copy: *"Pledge is a demand signal, not a purchase, reservation, guaranteed allocation, or guaranteed connection."*

## Homeowner (Home / Energy / Wallet / Profile)

Single-family owner + sole resident. States: account → property submitted → verified → DRS → deployment-ready → install → LBRS → live.

Wallet separates: consumption balance, project contributions, ownership earnings/offsets, export/trading (if enabled).

**No host royalty** on own roof. Self-consumption = savings / net effective cost; cash only from external monetization (export, trading, third-party loads where permitted).

## Building owner (Home / Energy / Wallet / Profile)

Site access and enrollment — **not default infrastructure buyer**. Optional share purchase separate from host royalty.

States: submitted → verified inactive → cooking/DRS → deployment-ready → install → LBRS → live (or maintenance/suspended).

Pre-live: projected/synthetic energy only. Live: measured load, E_sold, waste, grid fallback, utilization. Wallet: host royalty education pre-live; royalty + optional share earnings post-live.

## Provider (Discover / Projects / Energy generation / Wallet / Profile)

`businessType`: panels, infrastructure, or both. Projects is the current-status tab for accepted/active project commitments, quote/BOM state, DRS/LBRS dependencies, delivery proof, and live asset status. Inventory, supply catalog, warranties, and service capability live under Profile. Inventory does not earn until accepted into a real project.

## Financier (Discover / Project status / Energy generation / Wallet / Profile)

Investment-app UX, regulated-product behavior: KYC/KYB, AML, suitability, jurisdiction, escrow, disclosures, limits, **no guaranteed ROI**. Discover shows DRS, capital gap, payback **ranges**, risk badges. Commit is multi-step; DRS funding credit only after escrow + eligibility.

## Electrician (Discover / Projects / Wallet / Profile)

Product role name **electrician** (not installer). Certification tiers, DRS inspection tasks, installation, LBRS signoff, maintenance, household requests. Default economics: milestone payment; optional labor-as-capital with explicit opt-in → usually infrastructure pool.

## Admin

Mobile: thin read-only. **Cockpit**: DRS/LBRS gates, settlement, stress tests, queues — see [ARCHITECTURE.md](ARCHITECTURE.md).
