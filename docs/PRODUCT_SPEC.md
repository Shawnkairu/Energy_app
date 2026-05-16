# Product Spec

e.mappa turns apartment buildings into prepaid, locally financed energy economies on a **dedicated e.mappa solar supply path**. Rooftop solar, inverter, and battery feed that path—not a common-bus injection into arbitrary building loads. Each **participating** apartment connects through an **apartment-level automatic transfer switch (ATS)** at or near its **PAYG (KPLC prepay) meter**; the ATS selects between e.mappa solar and KPLC/grid fallback. **Non-participating apartments remain on KPLC** and are not tied to the e.mappa path. Residents buy cheaper solar when their unit is capacity-cleared and ATS-active, fall back to grid when the ATS selects KPLC, and can optionally own shares in local energy assets. Building owners host the site and enrollment. Providers deploy panels into DRS-qualified buildings. Financiers fund named projects with live performance data. Electricians execute verified deployments; providers supply panels and infrastructure under `businessType`.

## Product Doctrine

- Do not deploy solar first and hunt for demand later.
- Qualify buildings, pre-onboard residents, secure deal-level capital, verify installation, then activate settlement.
- No postpaid balances.
- No payout from unused, wasted, curtailed, or free-exported energy.
- No opaque financier pool in the initial product.
- Show distributions and benchmarks, not private counterpart finances.

> **Source of truth:** the canonical scenario specs in [docs/imported-specs/](./imported-specs/README.md) (A: resident, B: apartment building owner, C: homeowner, D: electrician, E: provider, F: financier) plus the DRS/LBRS/go-live installation spec and the AI-native system design. This file is a summary; where it conflicts with imported specs, the imported specs win. Per-role field-level conformance is tracked in [SPEC_COMPLIANCE_CHECKLIST.md §3.2](./SPEC_COMPLIANCE_CHECKLIST.md).

## Primary Surfaces

- Mobile app: native role-based product for residents, homeowners, building owners, providers, financiers, and electricians. Each role is guarded and owns its own route/component folder.
- Cockpit: e.mappa-internal analytics, tables, DRS command center, settlement monitor, stress testing, and operating workflows. It is not a stakeholder portal.
- Website: public explanation plus isolated stakeholder web portals for all non-e.mappa roles.

## UX Direction

Light-first, graph-aware interfaces with Stripe-level composition, not Stripe theming: white/off-white backgrounds, crisp cards, subtle depth, high whitespace, precise typography, and a distinctly e.mappa palette of graphite, solar peach, soft sky, warm cream, and status colors only when they communicate truth. Keep Tesla/Enphase energy clarity, Robinhood finance legibility, and Airbnb trust/onboarding polish, but avoid dark default UI and stray brand colors.