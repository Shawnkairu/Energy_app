e.mappa
Apartment Buildings — Scenario A
Resident onboarding, ATS-based apartment allocation, capacity queue, ownership, and future energy trading

Clearly labeled scope
This document covers the apartment-building resident experience when no project is live in the building yet, including buildings that are not enrolled, owner-enrolled but inactive, organizing, funding, installing, installed but not apartment-activated, and live/connected. It is written as the canonical product + implementation spec for this scenario only.

1. Executive Summary
Scenario A is the resident entry point for apartment buildings where e.mappa is not yet physically available to that resident. The resident should never be pushed into a fake purchase. They should be guided through account setup, building identification, load profiling, demand pledging, capacity status, and eventually apartment activation.
Product law
Pledge when electricity cannot yet flow to that apartment. Buy or top up only when electricity can flow to that apartment through a verified e.mappa connection. Settlement happens only after prepaid solar is actually consumed.

The correct hardware assumption is apartment-level switching, not common-bus injection for everyone.
Each participating apartment is connected through an ATS at or near the apartment meter point, allowing e.mappa solar and KPLC/grid fallback to be switched safely.
Residents can pledge interest before installation or before their apartment is connected, but a pledge is non-binding and does not guarantee a service slot.
Capacity is finite. The app must show whether the resident is capacity-cleared, queued, waitlisted, or blocked.
Residents with disposable income may buy shares of the array or infrastructure; ownership affects future waterfall payouts.
Future energy trading should be acknowledged as a roadmap layer, not promised as an available resident feature until utility/regulatory/accounting conditions are satisfied.
2. Correct Hardware Architecture for Apartment Buildings
The app, docs, and code should no longer assume that e.mappa injects power into a common building bus where every apartment passively receives solar. The canonical apartment-building architecture is a separate e.mappa solar supply path with apartment-level ATS switching.
Layer
Canonical model
Why it matters
Generation
Provider-owned panels feed the e.mappa system through inverter/charge-controller architecture.
Provider production and share ownership can be accounted for in software.
Storage / conversion
Battery and inverter supply the e.mappa solar path.
The system can time-shift solar and provide a controlled e.mappa supply path.
Apartment connection
Each participating apartment gets an ATS at or near its individual PAYG meter point.
Only enrolled apartments can be connected to e.mappa supply. Non-enrolled apartments stay on KPLC.
Fallback
The ATS switches the apartment between e.mappa supply and KPLC/grid supply.
Residents are not stranded when solar tokens run out or e.mappa supply is unavailable.
Activation
A resident is live only after their apartment is capacity-cleared, mapped, wired, switched, tested, and activated.
Tokens should become purchasable only when delivery is actually possible.
Measurement
Apartment-level usage and system-level generation must be reconciled for settlement.
Settlement must pay on monetized solar, not theoretical or unallocated generation.

Replace old language
Do not use “common bus injection” as the default product model. Replace vague “meter/inverter match” language with “apartment ATS + meter mapping + capacity clearance + switching verification.”

2.1 ATS States Per Apartment
ATS / apartment state
Meaning
Resident action
Not mapped
The resident’s unit and PAYG meter have not been confidently mapped.
Confirm unit, meter details, and permission for inspection.
Mapped, not capacity-cleared
The apartment is known, but the system may not have enough capacity.
Pledge interest and join the capacity queue.
Capacity-cleared
The apartment fits within available e.mappa capacity or expansion capacity has been approved.
Complete load profile and prepare for ATS scheduling.
ATS scheduled
Electrician visit is scheduled or pending.
Confirm appointment and access.
ATS installed, not verified
Hardware exists but switching test/signoff is incomplete.
Wait for verification or resolve blocker.
Activated
ATS switching is verified and the apartment can receive e.mappa supply.
Buy/top up usable tokens.
Suspended
Apartment was active but is paused for safety, tamper, non-payment, or maintenance.
Resolve issue; KPLC fallback remains available.

3. Resident Building Availability State Machine
State
Building / apartment reality
What resident sees
Primary action
A0: Building not found / owner unaware
No owner enrollment, no project, no physical e.mappa path.
“e.mappa is not active here yet.” Demand page, owner invite, neighbor invite, rough timeline.
Pledge interest; invite owner/neighbors.
A1: Owner enrolled, no project deployed
Owner account exists but no installation project is active.
“Your owner has joined, but no project has started.” Show demand progress.
Pledge interest; complete load estimate.
A2: Project organizing / DRS
Building is being qualified. DRS depends on demand, load profile, roof/capacity, capital, electricians.
DRS progress, blockers, projected capacity, queue position.
Pledge/adjust pledge; improve load profile.
A3: Funding / provider / electrician coordination
Project is being assembled; capacity may still be constrained.
Timeline, capacity slots, financing progress, hardware status.
Stay in queue, update pledge/load profile.
A4: Installation in progress
System installation has started, but apartments may not be connected.
Installation progress and estimated apartment activation sequence.
Confirm unit access; wait for ATS scheduling.
A5: Installed but apartment not activated
Building system exists, but this apartment has no verified ATS connection yet.
“Solar is installed, but your apartment is not activated.”
Complete ATS activation steps.
A6: Live and connected
Apartment is capacity-cleared and ATS-verified.
Token balance, live supply status, grid fallback, usage, savings.
Buy/top up tokens.

4. Resident Onboarding Demo — Scenario A
Welcome: resident sees a polished e.mappa introduction, building imagery, and the promise of cheaper local energy once their apartment can be served.
Account setup: email OTP for pilot; phone/M-Pesa identity later for production. The copy should say this account will be tied to building and unit context.
Role selection: resident selects “I live in an apartment building.” The resident should not have to understand providers, financiers, and electricians at this stage.
Find building: ask for location permission, building name, unit number, optional owner invite code, and a manual address fallback.
Classify status: e.mappa determines whether the building is not found, owner-enrolled, organizing, funding, installing, installed-not-activated, or live.
Fast load estimate: capture current KPLC spend, appliance categories, daytime/evening usage pattern, and optional receipt/photo evidence.
Capacity check: compare estimated resident load against system capacity, existing confirmed/queued load, and the apartment activation plan.
Pledge or buy: if the apartment cannot be served today, allow a non-binding pledge. If the apartment is live and connected, allow token purchase/top-up.
Home screen: show building status, pledge/token status, queue position, load-profile confidence, next action, and owner/neighbor invite tools.
5. Pledge, Buy, and Capacity Queue Rules
Resident-facing promise
A pledge is a demand signal, not a purchase, reservation, guaranteed allocation, or guaranteed connection. It can improve building readiness and queue priority, but final service depends on capacity, installation, safety, permissions, and verification.

Resident condition
Allowed action
Label in app
What it means
No e.mappa path to apartment
Pledge only
Pledge interest
No money charged. Helps demand/DRS.
Project organizing/funding/installing
Pledge/adjust/unpledge
Pledge solar tokens
Still non-binding until activation.
System installed, apartment not ATS-verified
Pledge or reserve interest, not buy
Activation pending
Resident may be queued for ATS installation.
Apartment live + ATS verified
Buy/top up
Buy solar tokens
Prepaid balance can now unlock actual e.mappa supply.
Capacity full
Join waitlist or expansion queue
Join capacity queue
Resident is interested but cannot be served until capacity expands or slots free up.


6. Capacity Queue Design
Capacity is not just roof size or inverter size. It is the amount of resident load the system can reliably serve without overpromising solar availability, harming utilization economics, or creating a poor resident experience. The app must prevent unlimited pledging from being interpreted as unlimited service availability.
6.1 Capacity Inputs
Solar capacity: installed or planned array kW and expected monthly generation.
Battery capacity: usable kWh after depth-of-discharge and round-trip efficiency.
Inverter output: maximum simultaneous supply capacity.
ATS/apartment hardware budget: number of apartments that can be wired in the current project phase.
Resident load estimates: monthly kWh, peak load, daytime/evening distribution, and confidence score.
Target utilization: healthy systems should generally target 75-85% utilization; below 60% is a serious warning unless there is a credible demand plan.
Reserve margin: do not allocate 100% of modeled capacity; keep headroom for forecast error, battery degradation, and usage spikes.
6.2 Queue Statuses
Queue status
Meaning
Resident UI copy
Interested
Resident has indicated interest but has not provided enough data.
“Complete your load estimate to improve your place in line.”
Pledged
Resident has made a non-binding pledge.
“Your pledge helps qualify the building. No money charged.”
Capacity review
Resident’s estimated load may be too high for current phase.
“We are checking whether current system capacity can serve your apartment.”
Capacity-cleared
Resident fits within current phase capacity.
“Your apartment fits the current phase. ATS activation can be scheduled when installation is ready.”
Queued
Resident is in line for later capacity or later ATS installation.
“You are in the queue. We will notify you when capacity opens.”
Waitlisted / expansion needed
Current system cannot serve the resident without expansion.
“Current capacity is full. Your demand may help justify expansion.”
Activated
Resident has completed ATS activation and can buy usable tokens.
“Your apartment is connected. Buy solar tokens to start using e.mappa.”

6.3 Queue Priority
First-come, first-served is the default because it is easy to understand and feels fair. But it should be tempered by technical fit so the first residents do not accidentally consume all capacity with poor load timing or oversized loads.
Priority factor
Recommendation
Why
Timestamp
Use as the primary tie-breaker.
Preserves first-come, first-served fairness.
Load fit
Residents whose load fits available capacity and improves utilization can be cleared sooner.
Protects system economics and reliability.
Load-profile confidence
Verified or high-confidence estimates rank above vague estimates.
Reduces overcommitment risk.
Owner/inspection readiness
Units that can be physically accessed and wired safely may move faster.
Prevents blocked apartments from freezing the queue.
Equity guardrail
Avoid clearing only high-income residents; consider reserving some slots for smaller basic loads.
Protects brand trust and inclusive mission.

Do not hide capacity constraints
The app should openly say: “Current system capacity may not fit every apartment in this phase.” Hiding this creates resentment later.

7. Load Profile Capture
Load profile should inform DRS and capacity clearing, but it should not make the first pledge feel like an engineering audit. Use progressive accuracy.
Level
When used
Inputs
Confidence
Level 1: Fast estimate
During resident onboarding and first pledge.
KPLC spend, appliance checklist, people in unit, time-of-day usage, optional receipt.
Low to medium.
Level 2: Improved estimate
When project enters DRS/funding/install planning.
Guided appliance inventory, nameplate photos, optional computer vision, optional electrician visit.
Medium to high.
Level 3: Verified load
After ATS/meter integration and live usage.
Measured apartment consumption and actual token usage.
Highest.

DRS should treat load profile as a confidence-weighted input, not a raw self-reported number.
Residents should be able to lower, raise, edit, or cancel their pledge before activation.
If a resident’s load is too large for current capacity, the app should suggest a partial phase: “We can serve your basic loads first” if technically supported.
If capacity is full, the resident’s pledge still matters because it can trigger an expansion case.

8. Resident Ownership of Array or Infrastructure Shares
Some residents may have disposable income and want to own part of the local energy economy, not just buy tokens. This should be a separate layer from consumption. A resident can be a consumer only, an owner only, or both.
8.1 What Can Be Owned
Asset class
What resident owns
What ownership gives them
Key caution
Array share
A percentage of a provider array or provider pool tied to the building.
A pro-rata claim on provider-side payouts from monetized kWh attributable to that array/pool.
They earn only when energy is sold, not merely generated.
Infrastructure share
A percentage of the infrastructure pool: inverter, battery, ATS hardware, wiring, monitoring, installation capital.
A pro-rata claim on financier/infrastructure payouts during recovery and royalty phases.
Returns depend on utilization, collections, maintenance, and phase rules.
Bundled project share
A blended slice of both generation and infrastructure economics.
Simpler retail product: one share receives blended payout.
Must be carefully disclosed to avoid confusing consumption tokens with investment shares.

8.2 Ownership vs Tokens
Concept
Purpose
Resident pays
Resident receives
Tokens / kWh balance
Consume electricity.
Prepaid amount after apartment activation.
Right to use e.mappa supply until balance runs out.
Pledge
Signal demand before electricity can flow.
No money charged in pilot/pre-live.
Improves demand evidence; no guaranteed slot.
Ownership share
Earn from the system.
Capital purchase amount.
Future payouts if monetized solar revenue exists.

8.3 How to Determine Full Value of the Array
The share price should not be arbitrary. It should be anchored to either replacement cost, earning power, or a blended valuation. For trust, e.mappa should show the method used.
Valuation method
Formula / logic
Best use
Concern
Cost basis
Array value = panels + mounting + DC cabling + installation attributable to array, minus depreciation.
Early pilot, simple and auditable.
May ignore strong or weak earning power.
Replacement cost
Array value = current market replacement cost of equivalent capacity.
When equipment prices move materially over time.
Can rise even if actual asset is older.
Income approach
Array value = discounted expected future provider payouts from monetized kWh.
Mature systems with usage history.
Requires assumptions about utilization, tariff, downtime, degradation.
Blended fair value
Fair value = weighted blend of depreciated cost basis and income approach.
Best long-term marketplace method.
More complex, needs transparent assumptions.

Recommended MVP valuation
For the pilot, use depreciated cost basis as the default value anchor, then show projected income separately. Do not overprice shares based on optimistic income forecasts before measured utilization exists.

8.4 Share Price Example
Example: provider-owned array package costs KSh 300,000 installed. If residents can buy up to 30% of that provider pool, the resident-buyable pool is KSh 90,000. A resident buying KSh 9,000 owns 10% of the resident-buyable pool, which equals 3% of the total provider array pool.
Input
Example value
Total installed array value
KSh 300,000
Resident-buyable portion
30% = KSh 90,000
Resident purchase
KSh 9,000
Resident share of buyable pool
10%
Resident share of total array pool
3%
Revenue claim
3% of provider-side payout pool for monetized kWh tied to that array/pool

8.5 How Ownership Fits the Waterfall
The waterfall should first allocate gross monetized solar revenue into stakeholder pools, then distribute each pool to its owners. Ownership changes who receives a pool; it does not create extra revenue.
Waterfall step
Pool
Who receives it if resident owns shares
1
Reserve
System reserve, not resident-owned by default.
2
Provider / array pool
Provider and resident-shareholders split this pool according to ownership of the array/provider pool.
3
Infrastructure / financier pool
Financiers and resident infrastructure-shareholders split this pool according to ownership of the infrastructure pool.
4
Building owner royalty
Building owner receives host royalty unless separate terms assign part of it elsewhere.
5
e.mappa platform share
e.mappa receives residual platform economics.

Critical settlement rule
A resident who owns shares should earn only from monetized prepaid solar. If solar is wasted, curtailed, exported for free, or uncollected, ownership does not trigger a payout.

8.6 Ownership Product States in the Resident App
Resident state
Ownership UI
Pre-live, not capacity-cleared
Show education only: “Ownership opens after project terms are approved.” Avoid selling shares before the building is viable.
Project approved, funding open
Show share marketplace with risk disclosures, valuation basis, projected range, and no guaranteed returns.
Live and connected
Show shares, earnings, generation visibility if array-share owner, and cashflow history.
Capacity waitlisted
Allow ownership only if legally/product-wise acceptable; clearly state ownership does not guarantee consumption slot.

9. Future Energy Trading / Wheeling Layer
Energy trading is strategically important, but it should be framed as a future layer rather than a pilot promise. The concept: a resident in a non-live or capacity-full building could buy cheaper kWh sourced from a live e.mappa building, while the utility earns a wheeling or settlement fee for enabling transfer/accounting over the grid.
Layer
What must be true
Regulatory permission
Utility/regulator must permit third-party energy accounting, wheeling, netting, or equivalent settlement.
Metering/accounting
Exported/allocated kWh must be measured or accounted for in a way all parties accept.
Utility compensation
KPLC/utility earns wheeling, network, or settlement fee so the grid is not bypassed economically.
Consumer protection
The buyer must understand that they are buying a credited energy product, not physically receiving electrons from a specific rooftop.
Settlement engine
e.mappa must support source building, destination account, utility fee, provider payouts, owner royalties, and platform fee.

9.1 Trading States for Scenario A Residents
Resident condition
Future trading message
Building not enrolled
“In the future, nearby energy trading may let you access cheaper energy before your building installs hardware, where utility rules allow.”
Capacity full
“You are waitlisted for direct connection. Future trading may provide an accounting-based option if enabled in your area.”
Owner refuses project
“Your building may still be eligible for future trading products if utility settlement is available.”
Live but tokens unavailable
“Grid fallback remains available. Trading is separate from local supply and will appear only when enabled.”

Do not overpromise trading
Do not say “you can buy from another building soon.” Say “future energy trading may be available where utility and regulatory conditions allow.”

10. Resident App Screens for Scenario A
Screen
Pre-live / not connected
Live / connected
Home
Building status, queue position, pledge amount, DRS demand score, load-profile confidence, next action, owner/neighbor invite.
Token balance, live supply status, solar used today, grid fallback, savings, top-up CTA.
Energy
Projected coverage, expected savings, capacity explanation, synthetic/projected badge, future trading teaser.
24-hour solar/battery/grid flow, actual usage, savings, generation panel if owner of shares.
Wallet
Pledge total, edit/cancel pledge, pledge history, no-money-charged banner, ownership education.
Token purchases, consumption debits, ownership earnings, savings, share positions.
Profile
Building membership, unit/meter info, load profile, notifications, support, owner invite tools.
Account, building, unit/meter, ATS status, support, settings.


11. Data Model Additions
Entity
Fields to add
ApartmentConnection
building_id, resident_user_id, unit_number, meter_id, ats_id, connection_state, capacity_status, queue_position, activated_at, suspended_reason
ResidentLoadProfile
resident_user_id, building_id, estimated_monthly_kwh, daytime_fraction, peak_kw_estimate, confidence_level, source, updated_at
CapacityPlan
building_id, phase_id, array_kw, battery_usable_kwh, inverter_kw, max_active_apartments, max_monthly_served_kwh, reserve_margin_pct
CapacityQueueEntry
building_id, resident_user_id, status, joined_at, priority_score, queue_position, cleared_at, notes
AssetShare
asset_id, asset_type, owner_user_id, owner_role, percentage, acquisition_price_kes, valuation_method, acquired_at
AssetValuation
asset_id, valuation_method, cost_basis_kes, depreciation_pct, replacement_cost_kes, income_value_kes, fair_value_kes, assumptions_json, effective_at
EnergyTradeIntent
buyer_user_id, source_region/building_id, desired_kwh, max_price_kes_per_kwh, status, regulatory_enabled, utility_fee_estimate

12. Implementation Notes for Repo Cleanup
Replace meterInverterMatchResolved with apartmentMeterAtsMappingResolved and atsSwitchingVerified, or a broader allocationHardwareResolved plus explicit apartment connection objects.
Add capacityQueueResolved or capacityPlanApproved to DRS inputs.
Resident Home must branch by building availability state and apartment connection state, not just project stage.
Wallet copy must switch between pledge language and token purchase language based on apartment activation.
Energy screen must show projected/synthetic data before activation and measured/actual data after activation.
Ownership marketplace must separate consumption tokens from investment shares and show valuation basis.
Future trading should be represented as a roadmap/coming-soon state unless enabled by a feature flag and jurisdiction/utility rules.
13. Non-Negotiable Decision Rules
Rule
Reason
No buy/top-up before apartment activation.
Avoid selling undeliverable energy.
No payout from pledged demand alone.
Pledge is not cash and not consumed energy.
No payout from generated-but-unmonetized solar.
Protects settlement solvency.
No resident service guarantee from a pledge.
Capacity, safety, owner permission, and ATS activation still matter.
No hidden capacity shortage.
Trust requires clear queue and slot status.
No common-bus default assumption.
The canonical apartment architecture uses per-apartment ATS switching.
No ownership sale without valuation basis and risk disclosure.
Residents must understand what they are buying and how returns arise.
No energy trading promise before utility/regulatory support.
Trading depends on wheeling/accounting rules outside app control.

14. Demo Script — Resident in a Non-Enrolled Apartment Building
Resident downloads e.mappa and sees a polished welcome explaining cheaper local energy for apartment buildings.
Resident creates account, chooses “I live in an apartment building,” and shares location/building/unit details.
The app cannot find an active project and creates a resident-requested demand page for that building.
Resident completes a 60-second load estimate and pledges KSh 1,000 of interest. The app clearly says no money is charged.
The app shows: building not enrolled, owner not yet invited/accepted, 1 interested resident, estimated demand, and next steps.
Resident invites the building owner and neighbors. More residents join, improving demand evidence.
When the owner enrolls, e.mappa runs DRS using resident demand, load profile confidence, roof/capacity, financing, electrician readiness, and ATS/meter feasibility.
Capacity planning shows the first phase can serve only 12 of 24 apartments. The resident sees their capacity status and queue position.
If cleared, the resident proceeds to ATS scheduling and activation. If not cleared, they stay in the queue and may help justify expansion.
After ATS verification, the resident can buy real solar tokens. Their Home screen changes from pledge/waiting mode to live token mode.
If the resident buys shares, Wallet shows ownership position and future payouts from the relevant pool. Energy shows generation visibility only where ownership applies.
Energy trading remains a clearly labeled future option, shown only as roadmap copy unless utility-enabled.
