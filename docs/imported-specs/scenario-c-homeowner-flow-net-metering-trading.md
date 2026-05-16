e.mappa
Scenario C - Homeowner Flow
Homeowner onboarding, project deployment, prepaid consumption, system health, ownership, and settlement

Clearly labeled scope This document defines the homeowner experience for a single home or small compound where the same user can initiate a project, consume prepaid e.mappa energy, and optionally buy ownership in the array or infrastructure. It is written as a canonical product and implementation spec for the homeowner path only.
1. Executive Summary
Scenario C is the homeowner path. The homeowner is not merely a passive consumer and not merely a project initiator. They are the site owner, the primary energy user, and an optional capital participant. That creates a powerful product path, but it also creates accounting risk if the app blends consumption and investment into one messy balance.
Product law A homeowner can initiate a project before the system exists, but they can only buy usable energy tokens after the home is physically capable of receiving e.mappa supply. Ownership shares are separate from tokens. A homeowner does not earn a host royalty from their own roof; only asset ownership creates earnings.
The homeowner may initiate deployment for their own property.
The homeowner may consume solar through prepaid tokens after activation.
The homeowner should not receive a host royalty for using their own roof. Host royalties make sense for apartment building owners because they provide a service platform for residents; they do not make sense when the site owner and consumer are the same household.
The homeowner may optionally buy array or infrastructure ownership, but ownership cashflows do not magically come from the homeowner paying themselves. True homeowner ownership earnings come from externally monetized energy: net-metering/export credits where permitted, energy trading/wheeling where enabled, or third-party consumption if the project later serves other approved loads. Self-consumed energy primarily creates savings, not cash income.
The app must keep separate ledgers for prepaid consumption balance, project contributions, and asset-share earnings if the homeowner chooses to invest.
The project cannot move from idea to installation until DRS is 100%. It cannot go live until LBRS is 100%.
2. What Must Be True for the Homeowner Model to Make Sense
Question
Correct answer
Product consequence
Can one person be site owner, consumer, and asset owner?
Yes, but the roles must be separated in accounting.
Use one account with multiple economic identities, not one blended wallet line.
Can the homeowner buy tokens before installation?
No. Pre-live money may be a project contribution or ownership investment, not usable kWh.
Wallet must label pre-live funds carefully. No fake token balance that implies deliverable energy.
Can the homeowner receive a host royalty from their own token spend?
No. A homeowner is not providing rooftop hosting as a service to separate residents; they are using their own property for their own energy project.
Do not include a host-royalty pool in the standard homeowner waterfall. Show savings and ownership earnings instead.
Can the homeowner self-own the whole system?
Yes, but self-ownership does not turn the homeowner’s own token spend into real external revenue.
Show avoided grid cost as savings. Show ownership earnings only when energy is monetized externally through approved export/net metering, trading, or third-party usage.
Is demand readiness the same as apartment pledges?
No. For a single home, demand readiness means load fit, homeowner commitment, and system sizing discipline.
Do not require neighbor demand. Do require a credible load profile and right-sized hardware.
Can the system be oversized because the homeowner wants more solar?
Not without a credible use case.
Overbuilding creates waste, weak payout performance, and false ROI expectations.
Where do homeowner ownership payouts come from?
From externally monetized energy, not from circular self-payments.
Track three distinct value channels: self-consumption savings, export/net-metering credits, and trading/external sales revenue.

Brutal correction
The homeowner path is not “download app, get free solar.” It is “download app, qualify the property, assemble capital/equipment/labor, pass installation gates, then consume prepaid energy through a verified physical connection.” The magic is coordination, not physics avoidance.
3. Homeowner Economic Identities
The same human user may hold several economic identities. The backend should model these identities explicitly so the UI can remain simple without corrupting settlement logic. The site-owner identity gives deployment authority and site control; it does not create a default host royalty.
Identity
What the homeowner does
What they pay
What they receive
Site owner / project authority
Provides roof/land, access, equipment location, cable routes, meter-area access, and maintenance permission for their own project.
No default infrastructure obligation unless they choose to invest.
Deployment authority, site control, system visibility, and energy savings after activation. No host royalty by default.
Consumer
Uses e.mappa supply after the system is live and switching/metering are verified.
Prepaid token top-ups at the active solar tariff.
Delivered kWh, savings vs grid, grid fallback when e.mappa supply is unavailable.
Array owner
Buys a share of the solar generation pool or contributes panels under approved terms.
Capital contribution or transfer price for array share.
Pro-rata claim on externally monetized array revenue: net-metering/export credits, enabled energy trading, or third-party usage. Self-consumption is shown mainly as savings, not cash income.
Infrastructure owner
Buys a share of inverter, battery, ATS/changeover, wiring, monitoring, installation capital, or blended infrastructure pool.
Capital contribution based on project valuation.
Pro-rata claim on externally monetized infrastructure revenue during recovery/royalty phases. If the homeowner is the only consumer, internal self-consumption should reduce effective cost rather than appear as cash profit.
Project initiator
Clicks deploy, provides documents, approves inspection, and keeps the project moving.
No automatic purchase from clicking deploy.
Project status, readiness visibility, and eventual right to activate once gates are passed.

UI rule The homeowner can see a unified wallet, but the wallet must contain separate sections: consumption balance, project contributions/deposits, and ownership earnings. Do not add a host-earnings line for a homeowner using their own roof.
4. Correct Home Hardware Architecture
For a single home, the canonical model is home-level controlled switching, not apartment-level switching. The system still needs a physically verifiable boundary between e.mappa supply and grid fallback. The home should receive e.mappa supply only through a commissioned, metered, and safety-tested connection.
Layer
Homeowner model
Why it matters
Generation
Panels feed a hybrid inverter through DC strings and MPPT inputs.
Generation can be tracked for provider or ownership accounting.
Storage / conversion
Battery and inverter manage solar capture, time shifting, and AC supply.
Enables daytime and evening use while limiting waste.
Solar distribution path
Inverter output feeds a Solar DB / protected home supply path, usually through a changeover or ATS arrangement.
Prevents uncontrolled backfeed and creates a clean activation boundary.
Fallback
KPLC/grid remains available through approved fallback wiring and switching.
Homeowner is not stranded when tokens finish, solar is insufficient, or maintenance is required.
Measurement
Smart meter/CT/inverter data tracks generation, battery, solar delivered to the home, and grid fallback.
Settlement pays on monetized delivered solar, not merely generated solar.
Activation
Home is live only after installation, switching, metering, monitoring, safety, and settlement tests pass.
Tokens become usable only when energy delivery is real.

Architecture guardrail
Do not design the homeowner path around unauthorized export, informal backfeed, or vague “grid tie” language. The safe MVP assumption is controlled local supply, metered consumption, grid fallback, anti-islanding/export discipline, and a tested switching path.
5. Homeowner Project State Machine
State
Reality
What homeowner sees
Primary action
H0: Account created, property unknown
User has not yet tied account to a verified property.
Welcome, role selection, property location request, basic promise.
Add home/property.
H1: Property submitted, not verified
Homeowner claims site but ownership/authority is pending.
Verification progress, required documents, blocked deploy CTA.
Upload documents and utility/meter details.
H2: Verified, no project initiated
Property is verified but no installation project is active.
Quiet home dashboard with readiness snapshot and “Initiate project” CTA.
Complete load profile and choose whether to initiate.
H3: Project cooking / DRS
Project is being qualified for deployment.
DRS timeline, blockers, system sizing, stakeholder/capital readiness.
Resolve blockers, approve inspection, confirm commitment.
H4: Deployment-ready / installation scheduled
DRS is 100%; installation can proceed.
Installation date, access checklist, hardware procurement status.
Confirm access and installation schedule.
H5: Installation in progress
Electricians are installing hardware.
Installation tracker, safety notices, no live token use yet.
Provide access and wait for completion.
H6: Installed, not live / LBRS
Hardware is installed but tests are not complete.
LBRS test checklist, failed/pending items, expected corrections.
Wait for signoff or approve remediation.
H7: Live and connected
Home is commissioned and can receive e.mappa supply.
Token balance, live energy flow, system health, wallet activity.
Buy/top up tokens and monitor performance.
H8: Suspended / maintenance
System was live but is paused due to safety, data, payment, or maintenance issue.
Alert, fallback status, issue owner, estimated resolution steps.
Use grid fallback and resolve blocker.

6. Homeowner Onboarding Flow
1. Welcome: present e.mappa as a way to turn the home into a local energy node while keeping grid fallback available.
2. Account setup: email/phone OTP for pilot, with production path for M-Pesa identity, KYC, and security settings.
3. Role selection: homeowner selects “I own or control a home/property.” Avoid making them choose between “owner” and “consumer” because they are both.
4. Property location: capture address, GPS pin, county/town, roof type if known, and whether this is a standalone house, maisonette, small compound, or shop-home hybrid.
5. Authority verification: collect title/lease/owner authorization, utility account/meter evidence, national ID or business docs where applicable, and permission for site inspection.
6. Utility and meter context: capture KPLC meter type, meter number if available, photos of meter area/DB, grid reliability, monthly spend, and prepaid usage pattern.
7. Fast load profile: capture current monthly spend, major appliances, daytime usage, evening usage, peak loads, critical loads, and optional receipt/photo evidence.
8. Site preview: ask for roof photos, available area, shade/obstructions, preferred equipment location, WiFi/cellular signal, and access constraints.
9. Readiness summary: show a simple “home energy project potential” card using verified status, rough load fit, roof potential, and next missing steps.
10. Deployment decision: after property verification and basic load/site data, ask whether the homeowner wants to initiate a project. Clicking initiate starts DRS; it does not mean installation has started.
Onboarding boundary
Do not put DRS inside account setup. Onboarding verifies the homeowner and property. DRS begins only when the verified homeowner initiates a project.
7. The Four Homeowner Screens
7.1 Home
Project not live
Live / connected
Project status hero: verified property, DRS/LBRS stage, blockers, next action, and “cooking up your energy project” timeline.
Live supply hero: solar/battery/grid state, token balance, system health, and active alerts.
System preview: proposed array size, battery estimate, inverter size, expected coverage, expected savings range, and confidence label.
Animated home diagram: roof array, inverter, battery, Solar DB/changeover, home loads, and grid fallback.
Project controls: initiate, pause, approve inspection, approve design, approve installation date, or resolve missing documents.
System controls: view outage/fallback status, request maintenance, see component health, and access ownership card.
No live energy flow; projections must be clearly labeled as estimates.
Actual energy flow only after verified monitoring and switching are live.

7.2 Energy Usage / Generation
Project not live
Live / connected
Projected monthly load, expected solar generation, expected battery use, expected grid fallback, and estimated utilization.
Actual solar generated, direct solar consumed, battery charged, battery discharged, grid fallback, waste/curtailment, export/net-metering credit where enabled, and traded energy where enabled.
Load profile confidence: self-reported, receipt-supported, electrician-verified, or measured.
Consumption timeline: daily/weekly/monthly kWh, token burn rate, savings vs grid, and solar coverage.
System sizing view: why the proposed array/battery/inverter size fits the home.
Generation ownership view if homeowner owns shares: self-consumed share shown as effective cost reduction/savings; exported, credited, or traded share shown as potential ownership earnings.
Warnings if proposed system is oversized, under-batteried, under-loaded, or likely to waste energy.
Alerts if production drops, battery degrades, inverter faults, monitoring data is missing, or grid fallback is unusually high.

7.3 Wallet
Project not live
Live / connected
No usable kWh token purchase unless delivery is physically possible.
Buy/top up prepaid solar tokens.
Project contribution section: any deployment deposit, ownership purchase, or refundable project contribution must be labeled separately from energy tokens.
Consumption ledger: token purchases, kWh debits, tariff, solar used, refunds/rollovers if applicable.
Ownership education: array share, infrastructure share, blended share, valuation basis, risk disclosure, and projected range.
Earnings ledger: externally sourced array-share payouts, infrastructure-share payouts, net-metering/export credits, energy-trading proceeds, maintenance reserve deductions, and e.mappa platform fee. Do not label circular self-consumption as cash earnings.
Capital status: whether equipment/labor is financed, provider-owned, supplier-as-a-service, homeowner-funded, or mixed.
Net effective cost view: gross token spend, avoided grid cost, export/trading credits, and ownership payouts clearly separated. The app may show net benefit, but must not pretend the homeowner earned cash by paying themselves.

Wallet warning
Never show “you earned money” from solar that was merely generated. Earnings must come from monetized prepaid solar actually delivered and settled.
7.4 Profile
Account and identity settings.
Property profile: location, ownership/authority verification, utility meter details, DB photos, roof/site documentation.
Project documents: design proposal, installation agreement, ownership terms, warranty documents, inspection reports, LBRS signoff, maintenance history.
Emergency and maintenance contacts: electrician, provider, e.mappa support, and grid fallback guidance.
Notification preferences: token alerts, system faults, maintenance, settlement statements, ownership updates.
8. Deployment Readiness Score for Homeowners
DRS begins only after the verified homeowner initiates a project. The UI can show a friendly percentage, but the backend should treat critical gates as hard blockers. A 95% score with unpaid electrician labor, failed property verification, or unsafe wiring is still not deployment-ready.
DRS category
Required checks
Critical blocker?
Property authority
Homeowner identity, property ownership/control, utility account or site permission, inspection consent, data consent.
Yes
Site feasibility
Roof/ground area, structural fit, shade, mounting method, cable route, DB/meter access, inverter/battery location, weather protection.
Yes
Load profile and sizing
Monthly kWh estimate, peak load, daytime/night split, critical loads, system size, reserve margin, utilization risk.
Yes
Stakeholder readiness
Vetted electrician available, provider/supplier availability, financier availability if needed, responsibilities assigned.
Yes
Capital and electrician payment
Equipment funded or committed, electrician labor/logistics paid upfront or explicitly converted into capital contribution, transport included.
Yes
Hardware procurement
Panels, inverter, battery, Solar DB, ATS/changeover, smart meter/CT, protection devices, cables, mounting, connectivity, labels.
Yes
Legal and utility discipline
No unauthorized export/backfeed assumption, anti-islanding/export settings, local electrical compliance, permit/notification requirements if applicable.
Yes
Homeowner consumption readiness
Prepaid rule accepted, tariff understood, initial activation/top-up flow ready, grid fallback explained.
No, but required before activation

Demand readiness for a homeowner
For a single home, demand is not measured by resident pledges. Demand readiness means the home has enough credible load to justify the proposed system size and the homeowner understands that token spend, not theoretical generation, drives payout economics.
9. Home Hardware Checklist
Group
Components / evidence required
Solar generation
PV panels, MC4 connectors, string plan, mounting rails/brackets, roof/ground mounting method, shading assessment.
Inverter and storage
Hybrid inverter sized to household load, compatible lithium battery, BMS compatibility, inverter monitoring dongle, firmware/configuration notes.
Protection and distribution
Solar DB or protected sub-board, DC isolator, AC isolator/changeover/ATS, MCBs, RCD/RCBO where required, Type 2 SPD, fuses, labels.
Metering and data
Smart meter or CT clamp, inverter API/cloud access, cellular/WiFi connectivity, 4G router if needed, meter calibration/validation plan.
Wiring and routing
PV DC cable, AC cable, conduit, glands, cable route photos, cable length estimate, wall/roof penetrations, weatherproofing.
Earthing and safety
Earth bonding, lightning/surge plan where relevant, battery ventilation/placement, fire/safety instructions, emergency isolation point.
Grid fallback
KPLC meter photos, main DB photos, fallback path, anti-islanding/export discipline, switching test plan.
Documentation
Quote, bill of materials, serial numbers, warranties, electrician signoff, homeowner acceptance, maintenance schedule.

10. Live Home Readiness Score
LBRS starts after installation is physically complete. It proves the home is safe, metered, switchable, monitorable, and settlement-ready. The homeowner should not be able to buy usable tokens until LBRS is 100%.
LBRS test category
Pass condition
Visual and mechanical inspection
Panels secure, cables protected, equipment mounted correctly, battery location safe, labels installed.
Electrical safety tests
Polarity, continuity, insulation resistance where applicable, grounding/earthing, breaker sizing, protection devices, no exposed conductors.
Inverter commissioning
Correct inverter mode, MPPT/string readings, AC output stable, firmware/config documented, anti-islanding/export settings appropriate.
Battery tests
Battery communicates with inverter/BMS, charges and discharges safely, usable capacity configured, low/high SOC behavior checked.
Switching / fallback tests
ATS/changeover switches correctly between e.mappa supply and KPLC fallback; no dangerous backfeed; home can fall back when tokens or supply are unavailable.
Metering tests
Smart meter/CT/inverter data matches expected readings; delivered solar kWh can be distinguished from grid fallback.
Token-control test
Token balance can authorize e.mappa supply; zero/expired balance triggers the designed fallback/suspension behavior without cutting off lawful grid access.
Monitoring test
App receives generation, battery, grid, and consumption data; missing-data state is handled conservatively.
Settlement dry run
Simulated kWh creates correct allocations to reserve, provider/array owner, infrastructure owner, and platform; no payout exceeds collected cash.
Homeowner handover
Homeowner sees emergency isolation instructions, support contact, warranty docs, maintenance rules, and accepts go-live.

11. Ownership Logic for Homeowners
Ownership should be available, but it must not be confused with consumption or self-payment. A homeowner may own none, part, or all of the project economics. Their energy still needs to be accounted for through prepaid tokens after activation, but any “payout” produced by their own token spend is circular. In the homeowner model, true ownership cashflows require an outside monetization source: net metering/export credits where allowed, energy trading/wheeling where enabled, or paid usage by another approved party.
Ownership type
What it means
Payout source
Caution
No ownership
Homeowner consumes only and does not buy asset shares.
No asset-share payout.
They still pay tokens for delivered solar. Their benefit is savings, resilience where supported, and property-level control, not host royalties.
Array share
Homeowner owns part of the generation asset or provider pool.
Externally monetized provider/array revenue: net-metering/export credits, energy trading proceeds, or third-party consumption. Self-consumption is mainly savings/offset.
Generated but unused solar does not pay. Self-consumed solar should not be presented as cash income from the homeowner’s own money.
Infrastructure share
Homeowner owns part of inverter, battery, ATS/changeover, wiring, monitoring, installation capital.
Infrastructure/financier pool funded by external monetization, export/trading credits, or third-party consumption; internal self-consumption may be shown as cost offset.
Payback depends on utilization, collections, and whether surplus can be monetized beyond the homeowner’s own load.
Full self-ownership
Homeowner owns all or nearly all project assets.
Avoided grid cost from self-consumption, plus net-metering/export credits or trading proceeds if enabled.
Do not show the homeowner “earning” from paying themselves. Show net benefit: savings + external credits/proceeds - reserves/platform/maintenance.
Existing asset contribution
Homeowner contributes existing panels, battery, inverter, or wiring if approved.
Only externally monetized value after valuation, compatibility check, and ownership registration.
Unsafe, mismatched, undocumented, or degraded assets should be rejected or heavily discounted.

Valuation rule
For early homeowner projects, value assets by documented cost basis or replacement cost minus depreciation. Do not sell homeowner shares using optimistic income forecasts before measured utilization exists.
11.1 Homeowner Ownership Payout Sources
The homeowner has three value channels, and the app must not blend them:
1. Self-consumption savings: solar used by the home reduces what the homeowner would otherwise buy from KPLC/grid. This is economic value, but it is not external cash revenue.
2. Net metering or export credit: if utility rules and metering permit compensated export, surplus kWh can create a credit or cash-equivalent value. This is a legitimate payout/earning source because a counterparty outside the homeowner is crediting the energy.
3. Energy trading or wheeling: if e.mappa enables compliant trading, surplus energy can be sold/accounted to another buyer or load. This is a legitimate payout source because another party pays for the kWh.
Until net metering, export crediting, or trading is enabled, homeowner ownership should mostly show avoided grid cost and net effective cost, not cash earnings. If external financiers or providers own part of the system, the homeowner’s token spend can still pay those external parties; however, any payout routed back to the homeowner from their own consumption should be displayed as an internal offset, not income.
12. Settlement Logic
The homeowner path must preserve the same economic doctrine: pay on externally monetized or prepaid delivered solar, not generated solar. For ordinary resident or apartment consumption, monetized solar is paid consumption. For a homeowner consuming their own project energy, the app must distinguish external revenue from internal transfer. Self-consumed solar creates savings and may reduce net effective cost; it should not be framed as a cash payout unless there is an external payer, export credit, or trading settlement.
Event
Settlement result
Homeowner tops up tokens
Cash enters prepaid balance/settlement pool; no stakeholder payout until energy is delivered.
Solar generated and consumed by the home
Delivered kWh debits token balance for control/accounting. If external stakeholders own assets, the external portion is paid by waterfall. If the homeowner owns the receiving pool, the return is shown as an internal offset/net effective cost reduction, not cash income.
Solar generated but battery full and home load low
No payout unless surplus is legally exported for compensation or traded through an enabled settlement product. Otherwise it is wasted/curtailed/free-exported and earns nothing.
Home uses more than solar/battery can provide
Grid fallback serves shortfall; only solar-delivered portion settles through e.mappa.
Homeowner uses solar from their own roof
No host royalty is paid. Self-consumption creates savings versus grid. Ownership payouts require external monetization; any internal share return from own token spend should be netted as a cost offset.
Homeowner owns asset shares
Payouts route to the ownership ledger only from legitimate value sources: external buyer payments, net-metering/export credits, trading proceeds, or third-party consumption. Internal circular flows are labeled as offsets.
Monitoring data missing
Settlement pauses or uses conservative fallback rules until data is verified.
Surplus exported under approved net metering/export credit
Credit/cash-equivalent value enters the settlement pool according to utility rules, then pays reserve, asset owners, and platform per configured waterfall.
Surplus sold through enabled energy trading/wheeling
Buyer payment or settlement credit creates external revenue. Ownership payouts can be paid from that revenue after utility/network fees, reserve, and platform rules.

13. Homeowner Deployment Workflow
1. Verified homeowner clicks “Initiate project.”
2. System creates a project record and begins DRS.
3. Electrician/site inspector receives roof, DB, meter, cable-route, load, and equipment-location tasks.
4. e.mappa generates a proposed system size and bill of materials based on load profile, roof/site constraints, budget, and utilization discipline.
5. Network participants commit: provider/supplier equipment, financier capital if needed, electrician labor/logistics, and maintenance responsibility.
6. Electrician payment is secured upfront, unless a deliberate labor-as-capital contract is created.
7. DRS reaches 100% only when property, site, capital, hardware, stakeholder, and design gates are complete.
8. Installation is scheduled and executed.
9. After physical installation, LBRS starts. Every test must pass.
10. When LBRS reaches 100%, the home is activated and the homeowner can buy/top up usable tokens.
14. Electrician Economics
The default homeowner model should pay electricians upfront. Single-home projects are smaller, more operationally hands-on, and more sensitive to local reputation risk. Turning electrician labor into long-term revenue participation should be optional, documented, and rare at first.
Model
When it works
How payout should work
Risk
Upfront labor
Default and recommended model.
Electrician fee is paid before or during installation milestones.
Requires capital readiness before deployment.
Labor-as-capital
Electrician voluntarily contributes labor/logistics instead of being paid upfront.
Their contribution becomes a share of the infrastructure capital stack and receives a pro-rata share of the infrastructure pool.
Can create confusion and underpay labor if utilization is weak.
Hybrid
Some labor paid upfront; some deferred as capital.
Paid portion is normal expense; deferred portion becomes documented capital contribution.
Needs clear contract and separate ledger.

Do not do this
Do not promise electricians a percentage of total gross kWh revenue merely because their labor equals a percentage of project cost. Cost contribution maps to the relevant capital pool unless the whole waterfall is intentionally redesigned.
15. Edge Cases and Required Product Behavior
Case
Required behavior
Homeowner starts onboarding but does not own/control the property
Do not allow deployment. Allow education only or require owner authorization.
Homeowner wants to buy tokens before the system is live
Do not allow usable energy token purchase. Allow project contribution or ownership purchase only with clear labeling and terms.
Homeowner wants a system bigger than their load supports
Warn about waste, poor utilization, slower payback, and require a credible external monetization path such as approved net metering/export credit, energy trading, or additional verified loads before approval.
Homeowner has unreliable grid and expects backup power
Clarify whether the installed inverter/battery design supports islanded backup. Do not imply blackout protection unless hardware supports it.
Homeowner self-funds all equipment
Still run DRS/LBRS. Self-funding does not bypass safety, metering, or settlement controls.
Homeowner owns shares and consumes tokens
Show token spend, avoided grid cost, externally sourced ownership payout, and net effective cost separately. Any return from the homeowner’s own token spend is an internal offset, not cash income.
Solar production drops unexpectedly
Flag component issue, weather/shading issue, monitoring issue, or degradation; adjust projections and payout expectations.
Battery degrades
Increase maintenance/reserve visibility, update usable capacity, and adjust projected coverage.
Grid fallback used heavily
Explain whether cause is low solar, high demand, dead battery, token depletion, switching issue, or system fault.
Net metering/export is unavailable
Do not project export earnings. Size the system primarily around self-consumption and battery use, or require trading/other demand before oversizing.
Energy trading is not enabled in the area
Do not show trading income as available. Keep it as a roadmap/disabled state and base economics on self-consumption savings plus any approved utility crediting.

16. Data Model Additions
Entity
Fields
HomeProperty
property_id, homeowner_user_id, location, property_type, verification_status, utility_meter_id, meter_photos, db_photos, roof_photos, authority_documents, created_at
HomeProject
project_id, property_id, project_state, drs_status, lbrs_status, proposed_array_kw, proposed_battery_kwh, proposed_inverter_kw, target_utilization, deployment_started_at, live_at
HomeLoadProfile
property_id, monthly_kwh_estimate, daytime_fraction, peak_kw_estimate, critical_loads_json, appliance_profile_json, confidence_level, source, updated_at
HomeSystem
system_id, project_id, inverter_id, battery_id, solar_db_id, ats_or_changeover_id, meter_id, monitoring_source, installed_capacity_kw, battery_usable_kwh, commissioned_at
HomeEnergyLedger
property_id, period_start, period_end, e_gen, e_direct, e_battery_used, e_grid, e_waste, e_sold, utilization, coverage, data_quality_status
HomeWalletLedger
user_id, property_id, ledger_type, amount_kes, kwh, counterparty_pool, transaction_type, settlement_period_id, status, created_at
HomeOwnershipPosition
asset_id, property_id, owner_user_id, owner_role, asset_type, percentage, acquisition_price_kes, valuation_method, acquired_at
HomeProjectReadinessGate
project_id, gate_type, category, status, blocker_severity, evidence_url, responsible_party, completed_at, notes
HomeExternalMonetizationLedger
property_id, source_type, source_counterparty, kwh, gross_value_kes, utility_fee_kes, platform_fee_kes, reserve_kes, net_settlement_value_kes, regulatory_status, settlement_period_id, evidence_url
HomeExportOrTradeEligibility
property_id, net_metering_enabled, export_meter_verified, trading_enabled, wheeling_enabled, utility_approval_status, max_export_kw, compensation_rate_kes_per_kwh, trading_region, effective_at

17. Non-Negotiable Decision Rules
Do not treat deployment initiation as installation approval. It only starts DRS.
Do not start installation until DRS is 100%.
Do not let the home go live until LBRS is 100%.
Do not sell usable energy tokens before verified delivery is possible.
Do not merge consumption balance, project contributions, and ownership earnings into one opaque wallet number.
Do not pay anyone from generated-but-unsold solar.
Do not project homeowner cash/credit earnings from ownership unless net metering/export credit, energy trading, or third-party consumption is actually enabled and measured.
Do not present homeowner ownership payouts as income when the source is only the homeowner’s own token spend; show that as an internal offset or net effective cost reduction.
Do not promise blackout protection unless the inverter/battery/switching design actually supports islanded backup.
Do not assume unauthorized grid export, informal backfeed, or unmetered delivery is acceptable.
Do not let self-funding bypass safety tests, metering tests, or settlement dry runs.
Do not let ownership shares imply guaranteed energy access, guaranteed returns, or free electricity.
18. Demo Script - Homeowner Initiates and Uses e.mappa
1. Homeowner opens e.mappa and selects “I own or control a home/property.”
2. They create an account, add property location, and upload ownership/authority and utility-meter evidence.
3. The app verifies the property and asks for a quick load profile, roof photos, meter/DB photos, and current KPLC spend.
4. The home screen shows a readiness summary and asks whether they want to initiate a project.
5. The homeowner taps “Initiate project.” The app starts the project timeline and DRS.
6. DRS shows site feasibility, load fit, stakeholder readiness, capital/equipment readiness, electrician payment, and hardware checklist.
7. Once DRS reaches 100%, installation is scheduled and tracked in the home screen.
8. After installation, LBRS begins. The electrician test portal verifies safety, switching, metering, battery/inverter behavior, monitoring, and settlement dry run.
9. When LBRS reaches 100%, the home goes live. The homeowner can buy prepaid tokens and the home screen switches to live solar/battery/grid flow.
10. The energy screen shows actual generation, consumption, battery use, grid fallback, utilization, savings, and any eligible export/trading credits.
11. The wallet shows token balance, consumption debits, avoided grid cost, ownership payouts only when externally monetized, export/trading credits if enabled, maintenance reserve, platform fee, and net effective cost. No host royalty is paid for a homeowner using their own roof.








