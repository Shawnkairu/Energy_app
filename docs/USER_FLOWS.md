# User Flows

> **Pilot mode:** verification is via **email OTP** (no SMS), residents **pledge** instead of paying, energy data is **synthesized**, and roofs are captured via **owner-traced or auto-suggested polygons**. See [PILOT_SCOPE.md](PILOT_SCOPE.md) and [IA_SPEC.md](IA_SPEC.md) for the canonical screen-by-screen layout.

For the canonical screen layout, **always defer to [IA_SPEC.md](IA_SPEC.md)**. The flows below describe the sequenced actions a user takes through those screens.

## Resident (4 screens: Home / Energy / Wallet / Profile)

Onboard via email OTP, enter building invite code, confirm building. Land on Home (Tokens) and pledge from there. Energy tab shows usage always; generation panel appears only if shares ≥ 1. Wallet aggregates pledges and (if any) ownership earnings. Optional path: buy a share via Wallet's marketplace embed.

## Homeowner (4 screens: Home / Energy / Wallet / Profile)

A homeowner is a single-family-home owner who is also the sole resident — they combine building owner project lifecycle with resident token/consumption flow. Onboard via email OTP, enter address (unit_count=1 and kind=single_family auto-set), capture roof polygon (auto-suggest → traced → manual sqm fallback), preview homeowner royalty terms, optionally pledge first tokens. Land on adaptive Home — shows project readiness as the hero pre-live, token balance as the hero post-live. Energy always shows generation (homeowner owns the rooftop). Wallet consolidates three streams: pledges out, royalties in (as building owner), share earnings in (if they retain shares). When others buy shares of the homeowner's array, the homeowner's share shrinks but they continue earning royalty as the building host.

## Building Owner (4 screens: Home / Energy / Wallet / Profile)

Onboard via email OTP, submit building basics, **confirm or trace the roof polygon** (Microsoft footprint auto-suggest → owner trace → manual sqm fallback), preview owner royalty terms. Land on Home (Project) which surfaces DRS, blockers, deployment progress, pledged demand, and embedded actions (resident roster, compare-bill, approve-terms, deployment detail).

## Provider (5 screens: Discover / Inventory / Generation / Wallet / Profile)

Provider role merges what was previously "Provider" and "Supplier" — the same business often supplies both panels and infrastructure. Onboard with business basics including `business_type` (panels / infrastructure / both). Discover surfaces Airbnb-style project cards filtered to deals needing equipment they sell. Inventory tracks SKUs (segmented by panels vs infra), open quote requests, fulfilled orders, reliability score. Generation is share-gated: visible only on arrays where the provider still holds shares — once residents buy them out, the provider receives royalty payouts but loses live generation visibility for that array.

## Financier (4 screens: Discover / Portfolio / Wallet / Profile)

Onboard with investor profile (institution / individual, target deal size, target return). Discover is Airbnb-inspired (filter, scroll project cards) and Portfolio is Robinhood-inspired (positions, compounding curve, IRR). Pledge capital from a deal room (embedded from Discover or Portfolio).

## Electrician (5 screens: Discover / Jobs / Wallet / Compliance / Profile)

Renamed from "Installer / Labor". Onboard with personal basics + scope (install / inspection / maintenance) and optional certification upload. Discover lists projects needing electrician work. Jobs tracks active and completed work with embedded checklists, photo capture, readings, and sign-off. Compliance manages certifications (status, expiry, renewals) and training courses.

## Admin (mobile: 3 screens — Alerts / Projects / Profile; cockpit: full ops surface)

Mobile admin is a thin read-only view; full admin (DRS gate toggles, settlement runs, queue management, security findings) lives in the cockpit web app, not bound by the 5-screen rule.
