# Strategy — Infrastructure-as-a-Network

This is a long-arc strategy doc, not a sprint scope doc. The pilot ships what's in [PILOT_SCOPE.md](PILOT_SCOPE.md). This doc captures *where the company is going* so we don't lose the thread.

## The realization

When we shipped homeowner as a first-class role alongside resident and building owner, we didn't just expand the addressable market — we changed the category of company we're building.

**The original framing:** e.mappa coordinates energy allocation inside apartment buildings.

**The actual category we're in:** e.mappa coordinates the financing, deployment, and ongoing payouts of distributed infrastructure projects, with energy as the first vertical.

The homeowner unlock removes the constraints that made apartments hard:

| Constraint (apartments) | Removed (single-family) |
|---|---|
| Allocation complexity across many residents | One household, one consumer |
| Bus-bar integration / meter topology | One meter, one main panel |
| KPLC ambiguity around shared metering | Standard residential connection |
| Shared consumption accounting | None — direct attribution |
| Resident-onboarding density required for DRS | One pledger = full demand coverage |
| Landlord legal/political coordination | Owner = decision maker |

What remains is the actual product: a **deployment liquidity network** that turns *"someone wants infrastructure"* into *"funded, sourced, installed, monitored, paid"* through software.

## Why "infrastructure-as-a-network" is the right framing

The platform coordinates, in real time:
- **Demand** (homeowners, building owners, residents) — they say what they need
- **Capital** (financiers) — they fund deals with visible readiness, milestones, and returns
- **Equipment** (providers — panels + infra) — they reserve hardware against deals
- **Labor** (electricians) — they bid and execute against verified projects
- **Settlement** — payouts flow continuously from sold-energy revenue, not lump-sum at completion

That's not a solar marketplace. It's a coordination protocol for any recurring-cashflow physical infrastructure: solar today, water filtration / battery storage / fiber / EV charging / cold storage / micro-irrigation tomorrow. Anything where:
1. There's a recurring cash flow tied to consumption
2. Multiple stakeholders need to coordinate to deploy it
3. Trust + visibility unlock more deployment than upfront capital

## What the moat actually is

Not energy allocation. Not even solar.

The moat is **deployment liquidity** — how fast can a project go from *"I want this"* → *"funded and installed"*. Today that takes weeks of phone calls, quotes, financing applications, installer scheduling. e.mappa makes it minutes-to-funded, days-to-installed, with full visibility for every stakeholder.

That speed compounds as the network grows. Every new financier reduces capital cost. Every new installer reduces deployment time. Every new supplier reduces equipment lead-time. Liquidity begets liquidity.

## What this means for the pilot (today)

**The pilot scope does not change.** We're still shipping:
- Email OTP + pledge mode + synthetic data
- Six public roles + admin
- Apartment buildings AND homeowners

What changes is how we *talk* about what we're shipping. We're not "an apartment-building solar app with homeowner support added on." We're "a coordination network for distributed infrastructure, with two initial deployment topologies."

Marketing copy and investor pitch should reflect the larger framing. Engineering scope does not.

## What this means for after the pilot

Three things become priorities once the pilot validates:

1. **Homeowner-first growth.** Single-family is a faster-and-cheaper land-grab than apartments. Lower CAC per project, less coordination friction, more deployment density. Apartments remain higher-utilization-per-array but don't drive top-of-funnel growth.

2. **Capital structure that handles the regulatory weight of the model.** Multi-financier-funded household infrastructure with returns tied to consumption looks investment-like to regulators. We need to structure carefully:
   - Probably a special-purpose vehicle per project that holds the asset
   - Financier "ownership" in shares of the SPV, not the household directly
   - Returns characterized as utility revenue distribution, not investment yield
   - **This is a licensed-corporate-finance problem and needs counsel before scaling beyond 50–100 projects.** Capture early.

3. **Verticals beyond solar.** Once the deployment-liquidity loop works for solar, the same primitives (DRS, settlement waterfall, ownership ledger, agent coordination) transfer to other recurring-cashflow infrastructure. Battery storage is the obvious next adjacency. Then EV charging. Then water and cold storage. Each new vertical is "another column in the registry" not a new product.

## Risks this framing introduces

Honest catalog of what could go wrong:

1. **Securities risk.** "Many financiers fund one household, payouts tied to consumption" can look like an investment contract under Kenyan or US securities law (Howey-style analysis). Counsel before scaling.

2. **Operational sprawl.** Coordinating six stakeholder types across one vertical is hard. Adding more verticals before the first one is operationally calm is reckless. Discipline: **one vertical to operational excellence, then the next.**

3. **Scope-creep on the product team.** "We're a coordination network!" can become "let's build everything." The pilot scope discipline ([PILOT_SCOPE.md](PILOT_SCOPE.md)) becomes more important, not less, as the framing gets bigger.

4. **Underutilization economics on single-family.** Apartments naturally consume more solar locally per kWp deployed; single-family homes export more to the grid (which we don't monetize). Real economics on single-family must be modeled with PVWatts data and household load profiles before we commit to homeowner-first growth strategically.

5. **Trust fragility.** A coordination protocol's value is proportional to trust. One settlement-error scandal at 50 projects is recoverable; at 5,000 it's existential. Audit logs, reconciliation jobs, and cockpit visibility from day one are non-negotiable.

## What stays the same

The core rules in [README.md](../README.md) and product doctrine in [PRODUCT_SPEC.md](PRODUCT_SPEC.md) hold. Prepaid-only (or pledge-only in pilot), DRS gates everything, monetized solar drives payouts, ownership ledger sums to 100%, settlement reconciles to the cent. The bigger framing doesn't change the discipline; it raises the stakes.

## When to revisit this doc

After the pilot ships and runs against real users for ≥30 days. Re-examine:
- Is homeowner CAC actually lower than building-owner CAC?
- Is single-family deployment time actually shorter?
- Is utilization economics actually viable on single-family?
- Are financiers more interested in many small deals or few large deals?

The answers will determine whether "infrastructure-as-a-network" is the right framing or just an attractive abstraction.

---

**Discipline reminder:** This doc captures the long arc. Today's sprint shipping the pilot is what makes the long arc possible. Don't let strategy talk eat shipping time.
