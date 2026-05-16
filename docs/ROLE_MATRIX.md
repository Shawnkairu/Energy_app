# Role Matrix (Public vs Internal)

| Surface | resident | homeowner | building_owner | provider | financier | electrician | admin |
|---------|----------|-----------|------------------|----------|-----------|---------------|-------|
| Mobile tabs | Home, Energy, Wallet, Profile | Home, Energy, Wallet, Profile | Home, Energy, Wallet, Profile | Discover, Projects, Energy gen., Wallet, Profile | Discover, Project status*, Energy gen., Wallet, Profile | Discover, Projects, Wallet, Profile | Cockpit-first |
| Web portal | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Cockpit |
| Primary economics | Pledge vs prepaid tokens; capacity queue | Savings + external monetization; no host royalty | Site access; optional shares; host royalty only after monetized solar | Panels vs infra pools per `businessType` | Instruments, escrow, payback **ranges** | Milestones; optional labor-as-capital → infra pool | Ops |

\*Financier **Project status** uses the `portfolio` route slug. Provider second tab is **Projects** (`projects` route); any `inventory` route is legacy/profile-scoped and must not appear as primary navigation.

**Provider** absorbs legacy “supplier” public role — classify hardware vs panels via `businessType` / asset category.

**Electrician** replaces “installer” in product copy; legacy API keys may still accept `installerReadiness` as an alias in DRS inputs.

Canonical scenarios: [docs/imported-specs/](./imported-specs/).
