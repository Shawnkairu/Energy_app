e.mappa
Scenario E - Supplier and Provider Network Flow
Supplier/provider onboarding, inventory verification, quotes, equipment-as-a-service, project discovery, DRS/LBRS contribution, generation economics, share buy-down, wallet settlement, and live asset operations
Clearly labeled scope
This document defines the supplier/provider experience for e.mappa. It covers installation-hardware suppliers, solar-panel providers, hybrid suppliers/providers, individual asset contributors, inventory verification, project discovery, project commitment, quote and bill-of-materials workflows, equipment-as-a-service, provider-side energy generation, ownership buy-down by residents/building owners/homeowners, wallet settlement, and live asset monitoring. It is written as a canonical product and implementation spec for Scenario E only.

Internal product specification. Prepared for the e.mappa app, backend, deployment operations, and stakeholder coordination model.
1. Executive Summary
Scenario E is the supplier/provider path. This stakeholder is not just a vendor listing parts and not just a solar-panel owner waiting for passive yield. In e.mappa, suppliers and providers are the asset and component liquidity layer of the network: they make panels, batteries, inverters, ATS devices, meters, Solar DB components, protection devices, cables, mounting equipment, connectivity hardware, and warranties available to real deployment projects.
The product must fork onboarding because the same person or business may be one of three things: a supplier of installation hardware, a provider of generation assets, or both. In many real markets, the same solar business sells panels, batteries, inverters, installation accessories, and sometimes provides installation services. e.mappa should support that reality without forcing every participant into one rigid category. At the same time, the backend must keep asset roles separate because a panel provider earns from the provider/array pool, while an infrastructure supplier or equipment-as-a-service participant earns from the infrastructure/financier pool or one-time equipment sale.
Product law
Suppliers/providers can discover and commit equipment to projects only after verification appropriate to their role. A supplier quote or provider commitment can help DRS move toward 100%, but it does not make installation start. Physical installation still begins only after DRS reaches 100%. A supplier/provider earns cash only through approved equipment sale, approved equipment-as-a-service terms, provider-side kWh revenue from monetized solar, share buy-down proceeds, warranty-approved replacement flows, or enabled external monetization such as net metering/export credit or energy trading. No payout is created by generated-but-unsold solar, pledged demand, stale inventory sitting idle, or unverified readings.

The first screen should be Discover: a project marketplace showing nearby projects, DRS state, component gaps, funding status, delivery distance, required equipment, and opportunity type.
The second screen should be Project Status: committed projects, quote/BOM state, delivery tasks, ownership records, DRS/LBRS dependencies, and live asset status.
The third screen should be Energy Generation: provider-side generation, sold kWh, wasted/curtailed kWh, battery charge/discharge contribution, grid fallback context, asset ownership split, and performance alerts.
The fourth screen should be Wallet: equipment sale income, equipment-as-a-service income, provider kWh revenue, share buy-down proceeds, predicted inventory income, pending payouts, deductions, disputes, and scaling trajectory.
The fifth screen should be Profile: business/individual verification, inventory catalog, quotes, service area, delivery capability, warranties, documents, rating, certifications, and payout settings.
Inventory offered by individuals must be verified for ownership, safety, compatibility, condition, serial numbers, and warranty status before it can be matched to a project.
When residents, building owners, or homeowners buy shares of a provider array, physical generation does not decrease. The original provider’s economic claim decreases in proportion to the sold ownership share. The app should say “your retained claim” or “your remaining provider share,” not imply the panels produce less electricity.
2. Supplier vs Provider vs Hybrid Role
The word supplier/provider can easily become messy. e.mappa should support flexible participation, but the economic identity must remain explicit. A participant can hold multiple economic identities under one account.
Role
What they contribute
Primary payout basis
Main product risk
Installation-hardware supplier
Inverters, batteries, Solar DB components, ATS devices, meters, breakers, SPD, cables, conduit, mounts, routers, monitoring dongles, accessories.
One-time equipment sale, delivery fee, warranty replacement flow, or equipment-as-a-service infrastructure-pool claim.
Bad quotes, unavailable stock, unsafe substitutes, poor warranty support, or stale inventory misrepresented as project-ready.
Solar-panel provider
Panels or array capacity that feed the e.mappa system. May own panels outright or contribute approved panels to a project.
Provider/array pool from monetized kWh, share buy-down proceeds, and externally monetized generation where enabled.
Overpromised returns if utilization is weak, poor panel compatibility, weak performance data, or unclear ownership.
Hybrid supplier/provider
Business or individual contributes both generation assets and installation infrastructure.
Multiple ledgers: equipment sale or infra pool for hardware, provider pool for panels, share buy-down proceeds where applicable.
Blended economics can confuse the user unless wallet sections and asset identities are separated.
Individual asset contributor
An individual offers one or more panels, battery, inverter, cable, ATS units, meters, or other approved components.
Sale price, lease/equipment-as-a-service claim, or ownership share depending on terms.
Ownership proof, condition, compatibility, degradation, and safety are harder to verify.
Business inventory partner
A solar shop, distributor, electrician-supplier, or hardware business lists inventory and quotes.
Sale margin, delivery income, inventory-as-a-service income, provider revenue if they also own panels.
Inventory may be stale, price may drift, delivery promises may fail, or substitutes may be unapproved.

Identity rule
One account can be both supplier and provider, but every asset must be classified. Panels belong to the provider/array side. Inverters, batteries, Solar DB, ATS, meters, wiring, protection, mounting, and monitoring belong to the infrastructure side unless a contract deliberately creates a bundled asset pool.

3. What Must Be True for Scenario E to Work
Question
Correct answer
Product consequence
Can a normal solar shop participate?
Yes. Most real businesses will sell multiple categories of equipment and may also own panels.
Onboarding should fork by offered asset classes, not force one exclusive role.
Can individuals participate with one or two panels?
Yes, if ownership, condition, compatibility, and logistics are verified.
Let individuals list assets, but gate matching through inspection and approved specifications.
Can stale inventory earn money?
Potentially, but only when assigned to a real project under sale, lease, or equipment-as-a-service terms and accepted into DRS/LBRS.
Show predicted income as scenario modeling, not guaranteed income.
Can suppliers be paid before the building is live?
Yes, for approved equipment sale or delivery terms. No, for kWh-linked provider revenue before monetized solar exists.
Separate sale cashflow from usage-based cashflow.
Can providers earn from solar generated but not consumed?
No, unless export, net-metering, or trading is legally enabled and monetized.
Energy screen must distinguish generated, sold, wasted/curtailed/exported, and externally monetized kWh.
Does a provider lose generation when residents buy shares?
No. Physical generation stays the same. The provider’s retained economic claim declines by the share sold.
Use ownership math: retained_provider_claim = provider_original_share - sold_share. Do not say generation decreases.
Can suppliers choose any substitute part?
No. Substitutions must pass e.mappa compatibility, safety, monitoring, warranty, and settlement requirements.
Create approved component library and substitution workflow.
Should quotes be fixed forever?
No. Quotes need validity periods, delivery terms, taxes/VAT, warranty terms, and stock reservation rules.
Quote objects need expiry and reservation state.

Brutal correction
The supplier/provider marketplace cannot become a dumping ground for random hardware. e.mappa only works if hardware can be trusted, installed, monitored, settled, warranted, and matched to the correct project architecture. Inventory liquidity is powerful, but unsafe or incompatible liquidity destroys the network.

4. Architecture Assumptions Suppliers/Providers Must Understand
Suppliers and providers need enough technical context to avoid offering the wrong equipment. They do not need to become electricians, but their quotes and commitments must map to the correct e.mappa architecture.
Project type
Canonical architecture
Supplier/provider consequence
Apartment building
Separate e.mappa solar bus, dedicated Solar DB, per-apartment ATS near individual meter point, per-apartment metering, KPLC fallback.
Supply Solar DB components, ATS units, meters, protection, cabling, mounting, connectivity, batteries/inverters, and provider panels that fit the approved capacity plan.
Homeowner / single home
Home-level controlled switching through approved ATS/changeover, inverter/battery, metered home supply, KPLC fallback, export/backfeed discipline.
Supply home-appropriate inverter, battery, switchgear, metering, protection, wiring, panels, and connectivity. Do not assume apartment-level ATS unless project design requires it.
Small compound / shop-home hybrid
Project-specific controlled switching plan approved during DRS.
Require e.mappa/electrician review before committing unusual equipment or bundled supply.

Architecture guardrail
Suppliers/providers should not sell into a project as if e.mappa is using uncontrolled common-bus injection. Apartment projects require allocation hardware and verified switching. If the quoted package cannot support prepaid allocation, DRS should remain blocked.

5. Scenario E Onboarding Flow
Welcome: position e.mappa as a way to turn inventory, panels, and solar infrastructure into productive local energy assets.
Role fork: choose Supplier of installation hardware, Provider of solar panels/array capacity, or Both. Allow later role expansion.
Account type: choose business/entity or individual contributor. The requirements should change based on this choice.
Identity setup: email/phone OTP, legal name, phone, location, payout account, security settings, and optional M-Pesa/business payout details.
Business verification path: business registration where available, address, shop/warehouse location, tax/PIN if relevant, contact person, operating area, delivery capability, warranty documents, and supplier references.
Individual verification path: national ID/passport, proof of asset ownership, asset photos, serial numbers, location, condition disclosure, prior use history, and permission for inspection if needed.
Role-specific inventory capture: panels, inverters, batteries, ATS units, meters, breakers, SPD, cables, mounts, monitoring devices, routers, accessories, warranties, quantities, condition, and prices.
Quote setup: collect component-level quote, bulk quote, delivery price, installation-hand-off requirements, quote validity period, VAT/taxes if applicable, warranty terms, replacement rules, reservation deposit requirements, and expected restock date.
Compatibility pre-check: e.mappa flags missing specs, unknown brands, unsupported ratings, no monitoring capability, weak warranty, poor condition, or mismatch with canonical architectures.
Inventory earning model: show scenario simulations for selling outright, equipment-as-a-service, leasing, provider ownership, share buy-down, and hybrid contribution. Label all projections as estimates.
Training/standards: lightweight modules on DRS, LBRS, approved components, no silent substitutions, settlement on monetized solar, and warranty obligations.
Verification decision: approved, provisionally approved, supplier-only, provider-only, individual asset contributor, needs inspection, needs more documents, restricted catalog, or rejected.
5.1 Business vs Individual Requirements
Requirement area
Business / shop / distributor
Individual asset contributor
Identity
Business name, registration if available, owner/manager identity, phone/email, payout account, address.
Legal name, national ID/passport, phone/email, payout account, location.
Asset proof
Inventory list, purchase invoices if available, supplier/distributor references, stock photos, warehouse/shop photos.
Proof of ownership, receipt if available, serial number photos, physical asset photos, condition proof.
Inventory depth
SKU-level catalog, quantities, current stock, reserved stock, reorder timeline, delivery capacity.
Specific assets only: one battery, two panels, inverter, cables, ATS units, etc.
Quotes
Line-item quotes, bulk discounts, delivery fees, VAT/tax handling, warranty, quote validity.
Offer price, lease price, equipment-as-a-service value, inspection requirement, pickup/delivery terms.
Warranty/service
Manufacturer warranty docs, replacement policy, return process, support contact.
Warranty status if transferable, condition disclosure, no-warranty warning if applicable.
Risk controls
Price reasonableness checks, quote expiry, stock reservation, conflict disclosure, performance rating.
Inspection gate, compatibility gate, depreciation/condition discount, fraud checks.

6. Verification and Certification Tiers
Tier
Allowed activity
Typical requirements
Unverified
Can browse education and begin catalog upload, but cannot commit assets to projects.
Account created; identity not reviewed.
Verified individual contributor
Can offer approved individual assets to projects after compatibility and condition review.
Identity verified, asset proof, serial/photos, condition accepted, payout setup.
Verified supplier
Can quote and supply approved installation hardware to DRS projects.
Business or individual verification, catalog approved, quote rules accepted, warranty/delivery terms clear.
Verified provider
Can contribute panels/array capacity and earn provider-side kWh revenue after go-live.
Panel ownership verified, specs approved, site logistics accepted, settlement terms signed.
Hybrid supplier/provider
Can contribute both infrastructure equipment and generation assets with separate ledgers.
Supplier and provider requirements met; asset classification accepted.
Preferred network partner
Receives higher ranking and faster matching for projects.
Reliable deliveries, good warranty support, fair pricing, low dispute rate, accurate inventory, strong performance history.
Restricted / probation
Can only quote specific categories or requires manual approval before commitments.
Incomplete docs, unknown brands, repeated delivery issues, pricing disputes, or quality concerns.

7. Inventory and Quote Model
Inventory is the supplier/provider equivalent of electrician evidence. e.mappa should not merely store “I have batteries.” It should know what asset exists, who owns it, where it is, whether it is new or used, what project types it can fit, what price/lease terms apply, and what evidence supports the listing.
Inventory field
Purpose
Example
Asset category
Classifies asset into provider/array or infrastructure side.
Panel, battery, inverter, ATS, meter, breaker, SPD, cable, mounting, router.
Brand/model/spec
Compatibility and safety.
Deye 5kW hybrid inverter, 48V lithium battery, 550W panel, DIN rail ATS.
Quantity and availability
Prevents projects relying on phantom stock.
10 in stock, 4 reserved, restock in 7 days.
Condition
Determines risk and valuation.
New, used, refurbished, open-box, stale inventory, unknown condition.
Ownership proof
Fraud prevention and resale/lease rights.
Receipt, distributor invoice, serial number, asset photo.
Location
Matching to nearby projects and logistics cost.
Nyeri town, Nairobi warehouse, can ship to project.
Price and quote validity
Prevents stale quotes from breaking DRS.
KSh 125,000 valid for 7 days, delivery KSh 2,500.
Warranty status
Supports LBRS and maintenance later.
Manufacturer warranty through 2028; supplier replacement within 14 days.
Allowed economic model
Determines wallet flows.
Sale only, lease, equipment-as-a-service, provider ownership, hybrid.
Project compatibility tags
Improves matching.
Apartment ATS rollout, home changeover, 5kW inverter system, battery expansion.

7.1 Quote States
Quote state
Meaning
Project effect
Draft
Supplier/provider has entered information but not submitted a binding quote.
Does not count toward DRS.
Submitted
Quote is visible to project/electrician/e.mappa review.
Can be compared but not yet committed.
Under review
e.mappa/electrician is checking compatibility, price reasonableness, delivery, and warranty.
May support planning but not DRS completion.
Approved
Quote matches project needs and approved specs.
Can count toward hardware package readiness if funding/reservation is resolved.
Reserved
Stock is reserved for a specific project until expiry.
Supports DRS if other gates are complete.
Committed
Contract accepted; asset must be delivered or made available under terms.
DRS hardware gate can pass if all required components are committed.
Delivered
Asset physically delivered to site/electrician with evidence.
Installation can proceed if DRS is otherwise complete.
Installed/activated
Asset passed installation evidence and LBRS tests.
Usage-based revenue may start only after go-live and monetized kWh.
Expired/cancelled
Quote no longer valid or stock unavailable.
DRS blocker reopens unless replacement quote exists.

8. Equipment-as-a-Service and Stale Inventory
A major opportunity is turning stale or idle inventory into productive infrastructure. But the app must be brutally clear: inventory does not earn because it exists. It earns only when accepted into a project and monetized according to its contract.
Model
How it works
Best use
Caution
Outright sale
Project buys the component. Supplier earns sale revenue after funding and delivery acceptance.
Standard components, simple pilot, clean accounting.
Supplier stops earning after sale except warranty/service fees.
Equipment-as-a-service
Supplier keeps ownership of equipment and receives a pro-rata infrastructure-pool claim or lease payment.
Expensive items: inverter, battery, ATS/meter package, Solar DB hardware.
Must disclose utilization risk and pool basis. No guaranteed return from sunlight.
Lease / rental
Project pays periodic fixed or usage-linked fee for equipment.
Temporary deployment, pilot hardware, expansion phase.
Fixed fees can create stress if utilization is low; needs solvency checks.
Hybrid sale + revenue share
Part of equipment paid upfront, remaining value converted into pool claim.
Partial capital availability.
Requires separate ledgers and clear waterfall treatment.
Provider array ownership
Provider contributes panels and earns provider/array pool from monetized kWh.
Panel owners and solar businesses.
Provider revenue depends on E_sold, not E_gen.
Buy-down / share sale
Residents, owners, homeowners, or financiers buy part of the asset share from original provider/supplier.
Democratizes ownership and lets providers recover capital.
Must reduce retained claim, not physical generation. Requires valuation basis.

Predicted income rule
Predicted income for stale inventory should be modeled as a range under utilization scenarios, not a guaranteed yield. Show assumptions: project tariff, expected E_sold, utilization, equipment value, payout pool, ownership percentage, maintenance reserve, downtime, and share buy-down effects.

9. Project Discovery Screen
Discover is the first screen. It should work like a polished project marketplace. Suppliers/providers should immediately see which projects need assets, how close they are, what DRS blockers remain, what hardware is missing, whether funding exists, and what economic model is available.
Project card field
Display
Why it matters
Project image
Apartment/home photo or privacy-safe placeholder.
Makes the opportunity feel real and location-based.
Location/proximity
Town/area, distance, delivery route estimate, shipping/pickup option.
Suppliers need logistics clarity.
Project type
Apartment building, homeowner, small compound, shop-home hybrid.
Determines architecture and component requirements.
DRS score
Percentage plus top blockers: hardware missing, funding incomplete, electrician pending, inspection pending.
Shows whether inventory can move the project toward deployment.
Component gaps
Required missing items and quantities.
Directly matches inventory to need.
Funding status
Funded, partially funded, seeking equipment-as-a-service, seeking provider panels, seeking quotes.
Shows whether the supplier can expect sale income or must accept revenue-share risk.
Provider opportunity
Array kW needed, roof capacity, expected utilization, provider pool estimate.
Panel providers can evaluate potential kWh income.
Inventory match score
How much of the project BOM this participant can satisfy.
Turns stale inventory into targeted opportunity.
Electrician linkage
Lead electrician/crew assigned, pending, or needed.
Suppliers/providers often coordinate delivery with electricians.
Projected income range
Sale revenue, EaaS projection, provider kWh projection, buy-down possibility.
Helps stakeholders choose rationally without overpromising.

10. Project Detail Page
Section
Contents
Hero
Project name/code, image, type, location radius, DRS/LBRS state, target timeline, hardware readiness, funding status.
Readiness summary
DRS gates, blockers, current stakeholder commitments, missing hardware, delivery deadlines.
Technical scope
Apartment count or home load, array size, battery target, inverter target, ATS/meter count, Solar DB requirements, monitoring needs.
BOM requirements
Approved component list, required specs, allowed substitutes, quantities, quote deadlines, warranty requirements.
Electrician/e.mappa notes
Site inspection notes, cable route, DB/meter photos, roof constraints, compatibility warnings, delivery/access rules.
Economic options
Sell equipment, lease, equipment-as-a-service, provider array contribution, hybrid, share buy-down eligibility.
Projected performance
Expected E_gen, E_sold range, utilization range, wasted energy risk, grid fallback context.
Payment terms
Deposit, delivery payment, installation acceptance, LBRS acceptance, kWh revenue rules, holdbacks, dispute process.
Commit CTA
Submit quote, reserve inventory, commit provider panels, offer EaaS, message project ops, or decline.

11. Commit Flow
Supplier/provider taps Submit Quote, Offer Equipment, Commit Panels, or Offer Equipment-as-a-Service.
Select contribution type: sale, provider-owned panels, infrastructure EaaS, lease, hybrid, share-sale-ready asset, or warranty/replacement part.
Select assets from inventory catalog or add new asset if not already listed.
Confirm specs, condition, warranty, serial numbers, photos, quantity, location, and delivery method.
Enter price, delivery fee, quote validity, reservation deadline, taxes/VAT if relevant, deposit rule, and replacement policy.
Review project architecture and approved specifications. Acknowledge no silent substitutions.
Choose payment model and risk: upfront sale, milestone sale, infrastructure-pool claim, provider-pool claim, hybrid terms, or lease.
Review predicted income range and assumptions. Confirm that projections are not guaranteed.
Accept terms: asset ownership proof, delivery obligations, evidence requirements, warranty obligations, conflict disclosure, no off-platform side agreements that break settlement.
After acceptance, the contribution appears in Project Status and can move DRS hardware/stakeholder readiness forward if all other conditions are satisfied.
Commitment rule
A supplier/provider can quote many projects, but committed stock should be locked to one project until expiry or release. The app must prevent double-selling the same inverter, battery, ATS batch, or panel set to multiple projects.

12. Supplier/Provider Project State Machine
State
Reality
Supplier/provider UI
E0: Not verified
Account exists but cannot commit assets.
Verification checklist, inventory draft prompt, role fork.
E1: Verified, no commitments
Eligible to discover projects and submit quotes.
Discover feed plus empty Project Status screen.
E2: Quote submitted
Quote or asset offer is awaiting review.
Quote state, compatibility checks, expiry countdown.
E3: Quote approved
Offer is approved for project consideration.
Reservation CTA, funding status, next project blocker.
E4: Inventory reserved
Stock is held for project until deadline.
Reservation timer, deposit/funding status, delivery requirements.
E5: Committed to DRS
Asset commitment helps fill hardware/provider readiness.
DRS gate contribution, pending contract, delivery schedule.
E6: Delivery/procurement
Equipment is being shipped, delivered, or handed to electrician.
Delivery tracker, proof upload, recipient confirmation.
E7: Installed, not live
Asset installed but LBRS is still pending.
Installation evidence, failed/pending LBRS items, warranty docs.
E8: Live asset
LBRS passed and system is active.
Energy generation, kWh sold, retained ownership share, wallet cashflow.
E9: Maintenance/warranty
Asset needs replacement, support, or warranty review.
Fault ticket, root cause, replacement decision, payout/hold impact.
E10: Completed/exited
Asset sold outright or ownership fully bought down.
Final statements, history, rating, future opportunities.

13. The Five Supplier/Provider Screens
Screen
Not live / not committed
Committed / in progress
Live / connected
Discover
Nearby projects needing quotes, panels, batteries, inverters, ATS, meters, Solar DB components, cables, mounts, routers, or EaaS.
Can still browse but active commitments are highlighted to avoid overcommitment.
Shows expansion, replacement, maintenance, and new project opportunities.
Project Status
Empty state: no committed projects. User can add inventory or browse Discover.
Committed assets, quote status, DRS blockers, delivery schedule, electrician coordination, LBRS dependencies.
Live asset status, component health, performance issues, warranty claims, share buy-down status.
Energy Generation
Projected generation and provider income only if panels are offered to a project; no live data.
Projected E_gen/E_sold, expected utilization, installation readiness, monitoring setup.
Actual generation, sold kWh, wasted/curtailed kWh, battery-related flows, grid fallback context, retained provider claim.
Wallet
No earnings yet; shows predicted inventory income scenarios and quote pipeline.
Pending sale payouts, reserved stock value, expected EaaS/provider revenue, deposits, holds.
Equipment sale income, provider kWh revenue, infra/EaaS revenue, share buy-down proceeds, deductions, disputes, predicted scaling trajectory.
Profile
Verification, role, inventory catalog, service area, documents, payout setup.
Ratings, active catalog, quote templates, delivery capability, warranty docs, team/business info.
Performance history, completed projects, asset portfolio, retained shares, supplier/provider score.

14. Project Status Screen
Project Status is the operational control center for committed contributions. It should not feel like a passive order history. It should show what the supplier/provider must do next to keep the project moving toward DRS and LBRS.
Panel
Supplier/provider view
Project timeline
Initiated, DRS, deployment-ready, installation, LBRS, go-live, live operations, maintenance.
Contribution card
Assets committed, quantity, value, economic model, ownership status, warranty, serial numbers.
DRS dependency
Whether this contribution is blocking hardware package readiness, stakeholder availability, or contracts.
BOM match
Approved items, missing specs, substitute requests, electrician compatibility notes.
Delivery tracker
Pickup/delivery schedule, courier/driver, handoff recipient, proof of delivery, issue log.
LBRS dependency
Whether installed asset passed as-built verification, safety, monitoring, metering, and token/settlement dry run.
Share buy-down tracker
Asset valuation, percent sold to residents/owners/homeowners, retained claim, proceeds received, remaining claim.
Action buttons
Update stock, upload serials, adjust quote, approve substitute, schedule delivery, respond to issue, accept/reject buy-down, open warranty ticket.

15. Energy Generation Screen
For providers, Energy Generation is central. For pure suppliers of infrastructure hardware, the screen should still show performance of assets they own under EaaS or warranty, but it should not pretend they own solar generation if they only supplied batteries, inverters, ATS units, or meters.
Metric
Meaning
Who sees it
E_gen
Total solar generated by the relevant array/provider channel or provider pool.
Panel providers, array shareholders, relevant project ops.
E_sold
Solar actually delivered, prepaid/settled, and monetized. The core payout base.
Providers, infra contributors, financiers, owners, e.mappa.
E_waste / curtailed
Generated solar not monetized because demand/storage/export/trading did not capture it.
Providers and asset owners, because it affects returns.
Battery charged/discharged
Energy stored and later used after efficiency loss.
Battery EaaS suppliers, infrastructure owners, providers.
Grid fallback
Demand served by KPLC/grid after solar/battery/tokens are unavailable.
All stakeholders for system performance context.
Utilization
E_sold / E_gen. The key economic health metric for providers.
Providers, suppliers with usage-linked claims, project ops.
Retained provider claim
The provider’s remaining economic share after share buy-downs.
Original provider and project accounting.
Shareholder claim
The portion of provider/infrastructure pool now owned by residents/building owners/homeowners/financiers.
Share buyers and asset owners.
Data quality
Verified, estimated, missing, delayed, or disputed readings.
Everyone whose payout depends on data.

Critical correction
When building owners, residents, or homeowners buy shares, generation does not decrease. The provider’s remaining claim on the provider/array pool decreases. The Energy Generation screen should show total generation, sold energy, and retained ownership claim separately.

15.1 Provider Share Buy-Down Display
Line item
Example wording
Why
Total array generation
Your array generated 420 kWh this month.
Physical output remains visible.
Monetized solar sold
360 kWh was sold through prepaid e.mappa usage.
Payout base is E_sold.
Original provider ownership
You originally owned 100% of this provider pool.
Establishes baseline.
Shares sold
30% has been bought by residents/owners.
Shows economic buy-down.
Retained claim
You retain 70% of provider-pool payouts.
Correctly describes reduced economic claim.
Buy-down proceeds
You received KSh X from share sales.
Capital recovery channel separate from kWh revenue.
Future provider revenue
Your future kWh revenue is based on 70% of the provider pool unless you sell more shares.
Prevents surprise when monthly revenue decreases after selling shares.

16. Wallet and Settlement
The wallet must separate every income stream. A supplier/provider can receive equipment sale revenue, provider kWh revenue, infrastructure-pool revenue, lease income, share buy-down proceeds, warranty payments, refunds, or dispute holds. A single blended “earnings” number would hide the economics and create confusion.
Income type
When earned
Release condition
Equipment sale
Project buys component outright.
Funding confirmed, delivery accepted, serials/warranty submitted; optional installation/LBRS hold depending on terms.
Delivery/logistics fee
Supplier/provider delivers equipment to site/electrician.
Proof of delivery and recipient confirmation.
Provider kWh revenue
Provider-owned panels generate solar that is actually monetized.
Project live, data verified, E_sold calculated, waterfall run.
Infrastructure/EaaS revenue
Supplier-owned infrastructure earns from infrastructure pool or lease terms.
Project live or lease term active; readings/availability verified.
Hybrid sale + revenue share
Part of asset sold upfront; remaining value earns pool claim.
Sale conditions plus signed conversion terms.
Share buy-down proceeds
A resident, owner, homeowner, or financier buys part of the provider/infra asset claim.
Share sale settled, ownership ledger updated, risk disclosures accepted.
Warranty/replacement income
Supplier provides approved replacement outside warranty or under reimbursable maintenance terms.
Root cause and coverage decision approved.
Refunds/deductions
Returned equipment, failed delivery, warranty claim, rejected asset, late penalties.
Dispute or contract process complete.

16.1 Wallet Sections
Cash sales: paid or pending equipment sales, delivery fees, deposits, refunds, and tax/VAT notes where relevant.
Usage-linked revenue: provider pool, infrastructure pool, lease payments, EaaS claims, retained ownership percentage, settlement period.
Share buy-down: assets sold, buyer categories, sale value, retained claim, proceeds received, and future revenue effect.
Predicted income: modeled scenarios for current inventory under realistic utilization and price assumptions. Must be clearly marked as projected.
Inventory pipeline: quoted value, approved value, reserved value, committed value, delivered value, installed value, live earning value.
Disputes and holds: why money is pending, who must act, evidence required, expected resolution path.
Scaling trajectory: how many projects their current inventory could support, expected monthly revenue under conservative/base/upside utilization, and bottlenecks such as delivery radius or stock gaps.
17. Predicted Income Modeling
Predicted income is useful, but dangerous if presented like a promise. The app should show conservative/base/upside projections and make assumptions visible.
Scenario
Supplier/provider inputs
Output shown
Outright sale scenario
Inventory cost, quote price, delivery fee, probability of acceptance, quote pipeline.
Potential cash sales this month, margin estimate if cost entered, project fit.
Equipment-as-a-service scenario
Asset value, pool type, claim percentage, projected E_sold, infrastructure pool rate, utilization range.
Monthly revenue range, payback range, retained asset value, downside warning.
Provider panel scenario
Panel kW, expected generation, utilization, provider pool rate, retained share, downtime.
E_gen estimate, E_sold estimate, provider revenue range, waste risk.
Share buy-down scenario
Asset valuation, percentage offered for sale, buyer demand, acquisition price.
Capital recovered upfront, retained claim after sale, future kWh revenue reduction.
Stale inventory activation
Idle stock list, compatible projects nearby, likely quote acceptance, delivery radius.
Which inventory can be matched, expected activation timeline, revenue range.
Scaling trajectory
Current stock, average project BOM, service radius, delivery capacity, capital locked in inventory.
How many projects can be supported and which bottleneck limits growth.

Projection guardrail
Use ranges and labels: conservative, base, upside. Never show “guaranteed monthly income.” Include utilization risk, LBRS risk, payment model, data-quality risk, and share buy-down effects.

18. Matching Logic
The supplier/provider marketplace becomes powerful when the app can match project needs to nearby inventory and provider assets. Matching should not be based only on distance or price.
Matching factor
Use in ranking
Risk if ignored
Compatibility
Must match approved specs, voltage/current ratings, capacity plan, monitoring requirements.
Unsafe or unusable equipment reaches site.
Availability
Stock must be real, unreserved, and deliverable within project timeline.
DRS falsely reaches readiness then fails.
Location/logistics
Nearby stock or reliable shipping improves schedule and cost.
Delays installation and harms electrician timelines.
Price reasonableness
Compare against market ranges and alternate quotes.
Collusion, overpricing, or exploitative quotes.
Warranty quality
Prioritize transferable warranty and responsive supplier.
Post-live failures become expensive.
Provider performance
For panels, rank by expected production, prior performance, condition, and data reliability.
Low-performing assets reduce yield.
Supplier reliability
Delivery accuracy, dispute history, quote accuracy, stock truthfulness.
Network trust collapses.
Economic model fit
Project may need sale, lease, EaaS, provider ownership, or hybrid.
Good inventory gets ignored because payment structure is mismatched.

19. Supplier/Provider Responsibilities During DRS
DRS gate
Supplier/provider responsibility
Evidence required
Stakeholder availability
Declare available assets, service area, delivery ability, and role.
Verified profile, inventory availability, quote submission.
Hardware package ready
Quote or commit approved components that match BOM.
Line-item quote, specs, photos, quantities, warranty docs.
Provider array readiness
Commit panels/provider capacity with known specs and ownership terms.
Panel specs, serials where possible, ownership proof, array value, provider terms.
Funding/equipment terms
Choose sale, EaaS, lease, provider ownership, or hybrid.
Signed terms, valuation, payout pool, risk disclosure.
Logistics readiness
Confirm delivery, pickup, storage, site access, handoff recipient.
Delivery plan, contact, schedule, proof requirements.
Substitution readiness
If specified part is unavailable, propose approved substitute.
Substitution request, specs, compatibility notes, price delta.
Contracts/waterfall terms
Accept economic pool and payout rules before installation.
Signed agreement, ownership ledger entries, quote lock.
Compliance/warranty
Provide warranty docs, safety docs, manufacturer specs, installation constraints.
PDF/photos, manual, warranty contact, expiry dates.

20. Supplier/Provider Responsibilities During LBRS
Suppliers/providers do not usually run LBRS, but their assets must pass LBRS. A component that fails installation verification, safety, monitoring, metering, or settlement dry run can block go-live.
LBRS dependency
Supplier/provider role
Failure response
As-built/BOM verification
Serials, model numbers, quantities, and asset source must match approved commitment.
Resolve mismatch, approve documented substitution, or replace asset.
Electrical safety
Components must meet ratings and installation requirements.
Replace unsafe/incorrect parts; warranty/penalty depends on cause.
Monitoring/data
Inverter, meter, CT, dongle, or router must provide required data.
Fix connectivity, replace device, or define approved fallback.
ATS/meter mapping
Supplier-provided ATS/meters must support correct switching and measurement.
Replace wrong spec, assist electrician with docs, resolve warranty issue.
Provider panel performance
Panel string must produce within expected range after installation.
Investigate shade, wiring, panel fault, spec mismatch, or degradation.
Settlement dry run
Asset ownership and payout pool must be correctly represented in backend.
Correct asset ledger, valuation, ownership percentage, or pool mapping.
Launch packet
Warranty docs and maintenance contacts must be visible to owner/homeowner/e.mappa ops.
Upload missing docs before full activation if required.

21. Ownership, Valuation, and Share Buy-Down
Scenario E must support democratized ownership without corrupting the economics. The original supplier/provider can sell part of the asset claim to residents, building owners, homeowners, or financiers. That sale can help the original asset contributor recover capital early. But it also reduces future claim on the relevant payout pool.
Asset type
Valuation basis
Who can buy shares
Economic effect
Provider array / panels
Cost basis, replacement cost less depreciation, or income approach once performance history exists.
Residents, building owners, homeowners, financiers, possibly other providers.
Buyer receives pro-rata provider/array pool. Original provider retained claim decreases.
Infrastructure equipment
Cost basis or replacement cost less depreciation; income approach only after stable utilization.
Financiers, residents, building owners, homeowners, suppliers.
Buyer receives pro-rata infrastructure/financier pool or lease claim. Original supplier retained claim decreases.
Bundled project share
Blended valuation of array and infrastructure assets.
Potentially easier for retail buyers, but requires stronger disclosure.
Buyer receives blended pool share; accounting must still map internally to asset pools.
Used/stale inventory
Discounted cost/replacement value adjusted for age, condition, warranty, degradation, and inspection.
Only after compatibility and condition approval.
Lower valuation protects buyers and project economics.

Ownership rule
Ownership changes who receives an existing payout pool. It does not create extra revenue. A provider who sells 30% of the array share receives buy-down proceeds and retains 70% of future provider-pool payouts tied to that asset. The system still pays only from monetized solar.

21.1 Share Buy-Down Example
Input
Example value
Interpretation
Provider array value
KSh 300,000
Valuation based on documented cost/replacement/depreciation method.
Provider sells
30% of array pool
Residents/owners/homeowners buy a combined 30% claim.
Buy-down proceeds
KSh 90,000 before fees/taxes if any
Provider recovers capital upfront.
Provider retained claim
70%
Provider now receives 70% of provider-pool payouts from future monetized kWh.
Shareholder claim
30%
Buyers split 30% of provider-pool payouts according to their shares.
Physical generation
Unchanged
Panels still generate based on sun, performance, and system conditions.

22. Maintenance, Warranty, and Replacement Flow
Issue type
Likely owner
Product behavior
Asset fails under warranty
Supplier/provider or manufacturer depending on terms.
Open warranty ticket, attach LBRS/maintenance evidence, replace or repair under agreed rule.
Wrong component delivered
Supplier/provider.
Block installation/LBRS; require replacement or approved substitution; potential rating impact.
Installed incorrectly
Electrician/crew unless component docs were misleading.
Root-cause review separates workmanship from supplier fault.
Component degradation
Asset owner or maintenance reserve depending on contract and normal wear.
Update performance projections, reserve claim, replacement plan.
Monitoring/data failure
Supplier/provider if device failure; project ops if connectivity/service issue.
Pause or conservatively settle affected readings until fixed.
Household-specific issue
Household, warranty, electrician, or project reserve depending on cause.
Do not automatically charge supplier/provider unless root cause ties to their asset.
Recall or unsafe batch
Supplier/provider and e.mappa ops.
Flag affected projects, block new commitments, schedule inspections/replacements.

23. Ratings, Ranking, and Trust
Metric
How to measure
Why it matters
Inventory accuracy
Quoted stock vs real available stock; double-booking; expiry accuracy.
Prevents fake DRS readiness.
Quote fairness
Market comparison, consistency, price changes, hidden costs.
Protects projects from exploitation.
Delivery reliability
On-time delivery, handoff evidence, condition on arrival.
Protects electrician schedule and owner trust.
Compatibility quality
How often supplied assets pass electrician review and LBRS.
Rewards suppliers who understand e.mappa standards.
Warranty responsiveness
Time to respond, replacement acceptance, documentation quality.
Reduces post-live downtime.
Provider performance
Actual generation vs expected under comparable conditions, downtime, degradation.
Improves yield and return modeling.
Dispute rate
Rejected assets, late delivery, failed warranties, pricing disputes.
Controls marketplace risk.
Participation depth
Projects supported, categories supplied, capital unlocked, inventory activated.
Shows ecosystem contribution but should not override safety/quality.

24. Fraud, Abuse, and Safety Controls
Risk
Control
Fake inventory
Serial photos, timestamps, proof of ownership, random inspection, deposit/reservation discipline.
Double-selling stock
Inventory reservation locks, quote expiry, committed stock ledger, penalty for duplicate commitment.
Stolen or unauthorized assets
Ownership proof, ID/KYC/KYB, serial checks where possible, suspicious listing review.
Unsafe/unknown equipment
Approved component library, compatibility checks, electrician review, LBRS gate.
Collusion with electricians
Alternate quotes, price reasonableness, conflict disclosure, audit trail, e.mappa review.
Overstated condition
Photos, inspection, depreciation rules, warranty verification, performance monitoring.
Silent substitutions
Substitution workflow, serial verification, delivery acceptance, LBRS as-built check.
Return/warranty abuse
Root-cause tagging, evidence comparison, warranty terms, dispute workflow.
Misleading income projections
Mandatory assumptions, ranges, no guaranteed-return language, measured performance updates.
Provider overclaims generation
Inverter/MPPT/meter data, asset ledger, ownership mapping, data quality status.

25. Notifications and Alerts
Trigger
Notification
New nearby project
A project near you needs 5kW inverter, 5kWh battery, ATS units, and provider panels. DRS 64%.
Inventory match
Your listed battery matches a project in Nyeri. Estimated EaaS range available.
Quote requested
Electrician/project ops requested a quote for approved ATS units and meters.
Quote expiring
Your quote expires in 24 hours. Extend, update, or release stock.
Funding available
This project now has funding for the inverter/battery package. Confirm reservation.
Delivery scheduled
Electrician confirmed site access. Deliver hardware Tuesday 9:00 AM - 2:00 PM.
Substitution review
Your substitute inverter requires technical approval before DRS can pass.
LBRS issue
Installed meter is not reporting data. Review warranty/support request.
Project live
Project is live. Provider revenue will begin from verified monetized kWh.
Share buy-down
Residents bought 10% of your array claim. Your retained provider share is now 90%.
Payout released
KSh X released for equipment delivery / provider revenue / EaaS settlement.
Performance alert
Generation is below expected range. Check shading, wiring, panel condition, or monitoring data.

26. Backend Data Model Additions
Entity
Core fields
SupplierProviderProfile
user_id, account_type, legal_name, business_name, role_flags, verification_status, service_area, payout_account_id, rating_summary, risk_status
SupplierBusinessVerification
profile_id, document_type, document_url, business_address, tax_or_pin, reviewer_id, status, notes, verified_at
AssetInventoryItem
asset_id, owner_user_id, asset_category, brand, model, specs_json, condition, quantity, location, ownership_proof_url, serial_numbers_json, warranty_status, status
AssetQuote
quote_id, asset_id, project_id, quantity, unit_price_kes, delivery_fee_kes, quote_valid_until, taxes_json, warranty_terms, status
AssetReservation
reservation_id, quote_id, project_id, quantity_reserved, reserved_until, deposit_required_kes, status
ProviderArrayCommitment
commitment_id, project_id, provider_user_id, array_kw, panel_specs_json, valuation_kes, ownership_percentage, retained_claim_pct, status
InfrastructureEaaSCommitment
commitment_id, project_id, supplier_user_id, asset_ids, asset_value_kes, pool_type, percentage_claim, lease_terms_json, status
ProjectBOMRequirement
requirement_id, project_id, component_type, required_specs_json, quantity, approved_substitutes_json, status, matched_asset_id
DeliveryHandoff
handoff_id, project_id, asset_ids, from_user_id, to_user_id, delivery_method, gps, evidence_url, accepted_at, status
AssetOwnershipPosition
position_id, asset_id, owner_user_id, owner_role, percentage, acquisition_price_kes, valuation_method, acquired_at, status
ShareBuydownTransaction
transaction_id, asset_id, seller_user_id, buyer_user_id, percentage_sold, price_kes, fees_kes, retained_seller_claim_pct, status
ProviderEnergyLedger
ledger_id, project_id, asset_id, period_start, period_end, e_gen, e_sold, e_waste, utilization, provider_pool_kes, retained_claim_pct, payout_kes, data_quality_status
SupplierWalletLedger
ledger_id, user_id, project_id, source_type, asset_id, amount_kes, kwh, status, hold_reason, settlement_period_id, created_at
WarrantyTicket
ticket_id, project_id, asset_id, issue_type, root_cause, evidence_url, responsible_party, status, resolution, cost_kes

27. Screen-Level UX Requirements
Area
UX requirement
Role fork
Make supplier/provider/both selection obvious. Allow one account to expand later without duplicating identity.
Inventory capture
Use camera-first asset listing, serial scanning, quote templates, condition tags, and warranty upload.
Discover feed
Airbnb-style project cards: image, distance, DRS, funding, component gaps, inventory match, projected income range.
Project status
Show the next action clearly: quote, reserve, deliver, upload serials, respond to LBRS issue, accept buy-down.
Energy generation
Separate physical generation, monetized solar, wasted solar, retained claim, and share-buyer claim.
Wallet
Separate equipment sale, EaaS, provider kWh revenue, share buy-down, predicted income, holds, and disputes.
Predictions
Make projections useful but conservative. Always show assumptions and ranges.
Profile
Make verification and catalog quality feel valuable: preferred partner badges, completed projects, inventory activated, warranty score.

28. Non-Negotiable Decision Rules
Do not let an unverified supplier/provider commit assets to e.mappa projects.
Do not treat a quote as hardware readiness until it is approved, valid, and the stock is reserved or committed.
Do not allow installation to begin until DRS = 100%. Supplier/provider commitments support DRS but do not override other gates.
Do not allow go-live until LBRS = 100% and asset records match installed hardware.
Do not let UI percentages override critical blockers.
Do not use common-bus injection as the apartment-building default.
Do not allow silent hardware substitution. Every substitute must pass compatibility, safety, monitoring, warranty, and settlement review.
Do not pay provider kWh revenue from generated-but-unsold solar, pledged demand, unpaid usage, or unverified data.
Do not show stale inventory as income-producing until it is accepted into a project under clear terms.
Do not present projected inventory income as guaranteed return.
Do not blend equipment sale income, provider kWh revenue, infrastructure/EaaS revenue, and share buy-down proceeds into one opaque wallet number.
Do not say generation decreases when shares are bought. Say the original provider’s retained claim decreases.
Do not sell shares without valuation basis, ownership ledger, risk disclosure, and clear pool mapping.
Do not let supplier/provider warranties disappear after go-live. Warranty docs and support responsibilities must follow the asset.
Do not let individuals contribute used equipment without ownership proof, condition review, compatibility review, and appropriate depreciation.
29. Demo Script - Supplier/Provider Joins and Powers a Project
A solar business opens e.mappa and selects “I supply installation hardware and provide solar panels.”
They create an account as a business, upload business verification documents, add shop/warehouse location, payout account, and delivery radius.
The app asks for inventory: panels, batteries, inverters, ATS units, meters, breakers, SPD, cables, mounting, routers, and warranties.
They enter line-item quotes with quantity, price, quote validity, delivery fee, warranty, and stock availability.
e.mappa checks compatibility against approved architecture and flags missing specs or risky items.
The app opens to Discover. They see nearby projects with photos, DRS score, hardware gaps, funding status, electrician status, and projected income ranges.
They tap an apartment-building project. It needs provider panels, a 5kW inverter, 5kWh battery, Solar DB parts, ATS units, meters, and cabling.
They offer panels as provider-owned generation assets and offer the battery/inverter as either sale or equipment-as-a-service.
The quote is reviewed and approved. Stock is reserved. The project’s hardware readiness improves in DRS.
Once all DRS gates reach 100%, installation is scheduled. The supplier/provider delivers equipment and uploads proof of delivery and serial numbers.
Electricians install the hardware. LBRS checks as-built records, safety, switching, metering, monitoring, and settlement dry run.
When LBRS reaches 100%, the building goes live. Provider revenue begins only from verified monetized kWh.
The Energy Generation screen shows total generation, solar sold, wasted energy, utilization, grid fallback context, and retained ownership claim.
Residents later buy 30% of the provider array. The app shows generation unchanged, provider retained claim reduced to 70%, buy-down proceeds received, and future provider-pool revenue adjusted.
Wallet shows equipment sale revenue, provider kWh revenue, EaaS income if selected, share buy-down proceeds, pending holds, and conservative/base/upside predictions for remaining inventory.
30. Open Variables Before Build
Open variable
Recommended default
Exact verification docs by country/county
Use flexible manual review in pilot; formalize by jurisdiction as operations mature.
Approved component library
Start with limited known-good categories and allow manual substitution review.
Quote validity
Default 7-14 days depending on component volatility; require explicit expiry.
Inventory reservation rule
Committed stock locked to one project until expiry, cancellation, or manual release.
Used equipment depreciation
Use conservative depreciation plus inspection; reject unsafe or undocumented critical equipment.
EaaS payout pool
Map infrastructure equipment to infrastructure/financier pool by default, not gross revenue.
Provider-pool rate
Use project waterfall terms; show projections based on E_sold utilization scenarios.
Share buy-down availability
Enable only after asset valuation method and risk disclosures are finalized.
Delivery proof standard
Require photos, GPS/time stamp, serials, recipient confirmation, and condition acceptance.
Warranty holdbacks
Consider small holdbacks for high-risk used/refurbished assets; avoid punitive treatment of reliable partners.
Preferred partner ranking
Use reliability, warranty support, price fairness, compatibility pass rate, and dispute history.

31. Final Product Positioning
Scenario E should make suppliers and providers feel like they are joining the asset liquidity engine of a new energy operating network. They can sell equipment, lease equipment, contribute generation, activate stale inventory, recover capital through share buy-downs, and earn from monetized kWh when their assets help produce real consumed value.
But the system must be strict where it matters: verification, inventory truth, approved hardware, quote validity, delivery evidence, warranty responsibility, ownership ledger accuracy, and settlement discipline. This is how e.mappa avoids becoming a chaotic hardware marketplace and instead becomes a coordinated infrastructure economy.
Final operating principle
Suppliers and providers supply the physical liquidity. Electricians prove the installation. e.mappa governs the standard and settlement. The product succeeds only if every component, panel, quote, warranty, delivery, and ownership claim can be trusted from project discovery through live operation.

Source Context Used
This Scenario E document synthesizes the existing e.mappa materials for Scenario A residents, Scenario B apartment building owners, Scenario C homeowners, Scenario D electricians, and the installation/DRS/LBRS spec. It also preserves the core e.mappa doctrines discussed across the project: prepaid-only usage, DRS before installation, LBRS before go-live, apartment ATS allocation, homeowner controlled switching, no payout from unmonetized solar, and separate ledgers for consumption, ownership, equipment sale, provider revenue, infrastructure revenue, and share buy-down proceeds.
