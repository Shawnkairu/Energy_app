e.mappa
Scenario F - Financier Network Flow
Financier onboarding, regulatory gating, project discovery, capital commitment, stakeholder buyouts, DRS/LBRS tracking, asset ownership, generation visibility, wallet settlement, projected returns, payback modeling, and portfolio operations
Clearly labeled scope
This document defines the financier experience for e.mappa. It covers individual financiers, business/entity financiers, sophisticated/qualified investors, regulated investment vehicles, project discovery, capital commitments, escrow/custody, buyout of equipment-as-a-service and labor-as-capital claims, ownership of infrastructure or generation assets, DRS/LBRS gating, live energy performance, wallet settlement, projected returns, payback tracking, investor protection, cross-border restrictions, and backend data structures. It is written as a canonical product and implementation spec for Scenario F only.

Internal product specification. Prepared for the e.mappa app, backend, deployment operations, compliance review, and stakeholder coordination model.
1. Executive Summary
Scenario F is the financier path. The financier is not simply a donor, not merely a lender, and not automatically the owner of every energy asset they fund. In e.mappa, financiers provide capital that turns verified project readiness into deployable energy infrastructure. Their money may fund batteries, inverters, ATS devices, meters, Solar DB hardware, wiring, monitoring, logistics, installation labor, provider panel buyouts, supplier inventory buyouts, or project expansion. The product must feel like an investment app, but it must behave like a regulated financial product with strict investor protection, suitability, custody, disclosure, jurisdiction, and audit controls.
The financier path should be open in spirit because e.mappa’s mission is broad participation in local energy economies. But the actual ability to invest must be gated. Not every user should be allowed to fund every project, every jurisdiction, or every instrument. A retail user in Kenya, a U.S. user, a Kenyan business, a diaspora investor, and a regulated fund may all have different eligibility, limits, documents, disclosures, tax treatment, and product access.
Product law
A financier can discover projects before committing capital, but their commitment should increase DRS only after the commitment is legally valid, funds are reserved or escrowed, eligibility checks pass, and project terms are accepted. A project cannot begin installation until DRS reaches 100%. A project cannot pay usage-linked returns until LBRS reaches 100%, the system is live, prepaid energy is consumed, and settlement has verified monetized solar. Projected returns are estimates, not promises. No payout is created by pledged demand, generated-but-unsold solar, unverified readings, or future trading that has not been enabled.

The first screen should be Discover: a financial marketplace of projects showing DRS, capital raised, capital gap, stakeholder-as-a-service claims, buyout opportunities, projected utilization, projected payback ranges, risk badges, and legal eligibility.
The second screen should be Project Status: committed or watched projects, DRS/LBRS progress, escrow status, milestone funding, stakeholder commitments, installation progress, go-live blockers, and live site health.
The third screen should be Energy Generation: project generation, monetized kWh, waste/curtailment, battery use, grid fallback, utilization, coverage, asset ownership split, and the financier’s economic exposure.
The fourth screen should be Wallet: principal deployed, pending commitments, cashflow, revenue-share payments, buyout proceeds, projected returns, actual return, projected payback, scenario stress tests, fees, reserves, taxes, and withdrawals.
The fifth screen should be Profile: identity, KYC/KYB, investor eligibility, jurisdiction, risk profile, accreditation/sophistication status where applicable, documents, payout account, tax info, limits, notification preferences, and compliance status.
Financiers are not limited by physical proximity, but they are limited by law, product availability, currency rails, cross-border restrictions, tax/reporting rules, concentration limits, and project eligibility.
A financier can buy out provider/supplier/electrician-as-a-service positions, but the asset acquired depends on what is bought: provider panels map to the provider/array pool; infrastructure equipment maps to the infrastructure pool; labor-as-capital maps to the infrastructure pool unless terms say otherwise.
2. Financier Role in the e.mappa Network
Financiers are the capital-routing layer. They can convert a promising but underfunded building or home into an installed system by funding missing infrastructure, buying out provider equipment, buying out supplier inventory-as-a-service, funding electrician milestones, financing expansion capacity, or replacing expensive capital with cheaper capital. Their role is powerful because a single financier can unlock many projects across distance, but it is dangerous if the app overpromises returns or lets unqualified users enter products they do not understand.
Financier function
What they do
System consequence
Project capitalizer
Fills the funding gap for a deployment project.
DRS can move toward 100% once funds are legally committed and escrowed.
Infrastructure owner
Funds inverter, battery, Solar DB, ATS, meters, wiring, monitoring, logistics, and sometimes installation capital.
Receives pro-rata claim on infrastructure/financier pool from monetized kWh, subject to phase rules.
Generation buyer
Buys out provider panels or provider array claims when terms allow.
Receives pro-rata claim on provider/array pool; original provider’s retained claim decreases.
As-a-service buyout participant
Buys out supplier equipment-as-a-service or electrician labor-as-capital claims.
Converts deferred stakeholder claims into financier ownership claims, improving stakeholder liquidity.
Expansion financier
Funds extra capacity after a live site proves demand.
Can unlock waitlisted apartments, higher coverage, or additional trading/export capacity where enabled.
Portfolio allocator
Spreads capital across many projects by geography, asset type, maturity, utilization, and risk.
Turns e.mappa from one-off project financing into an investment operating layer.

Brutal correction
The financier story cannot be “put money in and earn forever” without precision. Financiers earn only from configured payout pools funded by collected and monetized value. If utilization is weak, payback stretches. If the system is not live, usage-linked revenue is zero. If data is missing, settlement must pause or become conservative. Investor trust comes from honest math, not optimistic dashboards.

3. Regulatory and Investor Protection Positioning
Scenario F is the most legally sensitive flow. It resembles a financial/investment app, and many structures could be treated as securities, investment-based crowdfunding, collective investment schemes, private placements, loans, asset leases, revenue-share contracts, or regulated investment products depending on jurisdiction and instrument design. The product specification should therefore assume compliance-by-design and require legal review before live launch.
Regulatory guardrail
Do not ship the financier product as an open retail investment marketplace without counsel, licensing analysis, investor onboarding rules, risk disclosures, custody/escrow controls, AML/KYC, complaint handling, records retention, marketing controls, and jurisdiction-by-jurisdiction eligibility. The app may prototype UX, simulations, and private pilot workflows, but public capital raising requires a compliant structure.

Compliance area
Product requirement
Why it matters
KYC / KYB
Verify identity for individuals and beneficial ownership/directors for businesses/entities.
Prevents anonymous capital, fraud, sanctions risk, and weak audit trails.
AML / CFT
Source-of-funds checks, sanctions screening, transaction monitoring, suspicious activity escalation.
Energy finance can become a money-flow product; controls must exist before scaling.
Investor eligibility
Retail, sophisticated, accredited, qualified, professional, entity, fund, diaspora, or restricted status.
Determines which offerings the user can access and how much they can invest.
Suitability / appropriateness
Risk questionnaire, loss capacity, time horizon, concentration warnings, product comprehension.
Protects users from investing in products they do not understand.
Jurisdiction gating
Country of residence, tax residency, citizenship where needed, solicitation restrictions, offering availability.
A financier may invest far away only if the offering is legally available to them.
Custody / escrow
Funds held in approved escrow/custody or payment account until release conditions are met.
Capital should not be casually mixed with operating cash or released before conditions.
Disclosure
Risk factors, valuation method, waterfall, fees, reserves, rights, transfer restrictions, conflicts, no guaranteed returns.
Prevents deceptive investment UX.
Marketing controls
No guaranteed ROI copy, no misleading payback claims, no pressure tactics, no hidden risk.
Returns depend on utilization, collections, downtime, degradation, and law.
Records and reporting
Contracts, confirmations, statements, tax reports, audit logs, investor communications.
Required for trust, disputes, audits, and regulator review.

4. Financial Product Types
The app should avoid pretending every investment is the same thing. Each financing type should map to a specific asset, payout pool, risk profile, and legal treatment. The UI can simplify language, but the backend and contract layer must be explicit.
Product type
What financier funds or buys
Payout basis
Key risk
Infrastructure share
Battery, inverter, Solar DB, ATS, meters, wiring, monitoring, installation capital, logistics.
Infrastructure/financier pool from monetized kWh during recovery and royalty phases.
Utilization risk, hardware failure, maintenance, downtime, data gaps, contract waterfall.
Array / generation share
Provider panels or provider array claim.
Provider/array pool from monetized kWh tied to that array, plus enabled export/trading revenue where applicable.
Generation underperformance, shading, degradation, weak demand, buy-down valuation.
Supplier-as-a-service buyout
Supplier contributed equipment instead of upfront sale.
Acquires supplier’s infrastructure-pool claim or lease receivable, depending on contract.
Component condition, warranty, priority rank, project utilization.
Electrician labor-as-capital buyout
Electrician deferred labor value into infrastructure pool.
Acquires labor-capital claim, usually infrastructure pool, not gross revenue.
Evidence disputes, workmanship warranty, claim valuation, ethical treatment of labor.
Project revenue-share note
Financier contributes cash for defined share of project revenue until target return, then smaller royalty or expiration.
Contract-defined share of settlement waterfall.
May be regulated as security; return depends on actual monetized kWh.
Expansion tranche
Funds later capacity after live utilization proves demand.
Project-specific tranche waterfall; may have lower risk if live data exists.
Intercreditor priority, expansion performance, new hardware risk.
Portfolio allocation
Financier allocates across multiple projects or a managed pool.
Diversified project cashflows, potentially through a regulated vehicle.
Higher regulatory complexity; must not become unauthorized collective investment scheme.

Buyout rule
Buying out an as-a-service stakeholder does not magically create a gross-revenue claim. The financier steps into the claim that stakeholder actually had. Provider-panel buyout maps to provider/array economics. Supplier equipment buyout usually maps to infrastructure economics. Electrician labor-as-capital buyout usually maps to infrastructure-pool economics. Gross-revenue claims require explicit redesign of the waterfall and disclosure.

5. Financier Onboarding Flow
Welcome: present e.mappa as a way to finance verified local energy infrastructure and earn only from measured, monetized energy performance.
Choose role: user selects “Financier / investor.” Allow later role expansion if the same user also owns panels, supplies equipment, or owns a building/home.
Account creation: phone/email OTP, legal name, secure password/passkey, country of residence, preferred currency, and payout/withdrawal setup placeholder.
Account type: individual, business/entity, investment club, fund, family office, diaspora investor, or institutional partner. Each path has different requirements.
Identity verification: ID/passport, selfie/liveness where available, address, date of birth, tax residency, phone, email, and sanctions screening.
KYB for businesses/entities: registration documents, directors, beneficial owners, board authorization, tax/PIN, source of funds, authorized signatories, bank/M-Pesa details, and corporate address.
Investor eligibility: classify user under relevant jurisdiction rules: retail, sophisticated, accredited, qualified, professional, institutional, or restricted. Do not allow self-selection without verification where law requires evidence.
Risk profile and suitability: ask income/asset band where allowed, loss tolerance, time horizon, liquidity needs, investment experience, concentration comfort, and understanding of revenue-share/project risk.
Regulatory disclosures: show no guarantee, possible total loss, illiquidity, variable payback, utilization risk, downtime risk, regulatory risk, currency risk, and project-specific risk.
Jurisdiction gating: determine which offerings are visible and investable based on residence, citizenship/tax status where needed, local rules, currency rails, and platform licenses.
Payment rail setup: connect allowed payment method, bank/M-Pesa/escrow/custody account, withdrawal destination, and anti-fraud checks.
Investment limits: set per-investor, per-project, per-period, per-jurisdiction, and concentration limits based on eligibility and internal risk rules.
Education module: explain DRS, LBRS, monetized solar, settlement waterfall, utilization, payback ranges, provider vs infrastructure pools, and buyout mechanics.
Access decision: approved, limited retail access, sophisticated-only access, entity-approved, watch-only, restricted jurisdiction, needs more documents, or rejected.
5.1 Individual vs Business/Entity Financier Requirements
Account type
Required onboarding
Likely access pattern
Individual retail
Identity, address, tax residency, risk questionnaire, investment limits, disclosures, suitability checks, source-of-funds threshold checks.
Small ticket participation, project caps, simple products, strong warnings, restricted jurisdictions.
Sophisticated/accredited/qualified individual
Identity plus evidence of eligibility where required, larger risk disclosures, source-of-funds checks.
Higher limits, more project types, possible private deals or buyouts.
Business/entity
Company registration, directors, beneficial owners, board authorization, source of funds, tax documents, authorized signatory.
Can fund projects as treasury, supplier finance, project sponsor, or portfolio allocator.
Investment club/community group
Group rules, authorized signatory, member disclosures, beneficial owners, compliance classification.
May need special structure; avoid informal pooling that violates investment rules.
Fund/institution
Institutional KYB, mandate verification, investment committee docs, custody/settlement requirements, reporting integration.
Can fund many projects, expansion tranches, warehouse lines, or platform-level partnerships.
Watch-only user
Basic account but no investment eligibility or not yet approved.
Can browse education and simulated returns, but cannot commit capital.

6. Financier App Information Architecture
Screen
Pre-commit / empty state
Active / live state
Discover
Browse eligible projects after regulatory gating. If no investable projects: show watchlist, education, and eligibility blockers.
Project marketplace with DRS, capital raised, capital gap, stakeholder-as-a-service claims, risk, projected payback, and commit CTA.
Project Status
No committed projects yet. Watch projects or complete onboarding.
Committed projects grouped by DRS, installation, LBRS, live, blocked, completed, defaulted/suspended, and exited.
Energy Generation
Before live: projected generation only, clearly labeled as forecast.
Actual generation, monetized kWh, utilization, waste, battery, grid fallback, asset ownership split, and performance vs forecast.
Wallet
No capital deployed. Show approved limit, available cash, pending verification, and education.
Committed funds, escrowed funds, deployed principal, cashflows, projected/actual return, payback progress, fees, reserves, withdrawals, tax statements.
Profile
Complete identity, eligibility, risk profile, and payout setup to unlock investing.
KYC/KYB, eligibility tier, limits, jurisdiction, documents, tax forms, notification preferences, security, agreements, support.

7. Discover Screen - Investment Marketplace
Discover is the financier’s first screen. Unlike electricians and suppliers, financiers are not primarily constrained by proximity. They can browse projects across towns, counties, and eventually countries, but the feed must be filtered by legal eligibility and risk limits. A project can appear as watch-only if the user is not allowed to invest.
Project card field
Display
Why it matters
Project image and type
Apartment building, homeowner, small compound, or expansion project; photo or approved render.
Makes the opportunity tangible without overexposing private addresses.
Location / jurisdiction
Town/county/country, regulatory label, currency, project legal vehicle.
Financiers can invest far away only if legally eligible.
DRS score
Percentage plus hard blockers: capital gap, hardware missing, electrician payment, site inspection, demand proof, contracts.
Shows whether capital can actually move the project.
Capital raised
Amount committed, amount escrowed, amount still needed, financier count.
Shows funding progress and whether the project is close to deployment.
Capital gap
Specific missing amount by category: battery, inverter, ATS, meters, labor, provider panels, supplier buyout, expansion.
Helps financier understand what their money unlocks.
As-a-service claims
Supplier equipment-as-a-service, provider panel contribution, electrician labor-as-capital, hybrid claims open for buyout.
Enables buyout liquidity for stakeholders who contributed assets/labor.
Projected economics
Tariff, expected E_gen, expected E_sold, target utilization, projected monthly gross revenue, payout pool, projected payback range.
Finance app needs returns, but ranges must be conservative.
Risk badge
Pre-live, live expansion, low demand, high utilization, data quality, hardware complexity, regulatory dependency, currency risk.
Prevents the marketplace from becoming pure hype.
Instrument type
Infrastructure share, array share, buyout claim, revenue-share note, expansion tranche, portfolio allocation.
Clarifies what the financier would own.
Eligibility state
Invest now, watch only, documents needed, limit reached, restricted jurisdiction.
Compliance gating must be visible and non-negotiable.

Discover rule
A financier should be able to discover many projects, but the app should never show an ineligible project as investable. If the product is not legally available to that user, show education/watchlist only or hide the offer entirely depending on compliance guidance.

8. Project Detail Page
Section
Contents
Hero
Project image, type, region, legal availability, DRS/LBRS state, total project value, capital raised, funding gap, target timeline.
Funding stack
Provider contribution, supplier equipment, electrician labor, existing financiers, owner/homeowner participation, remaining gap, escrow status.
Use of funds
Exactly what the financier’s capital funds: battery, inverter, ATS, meters, Solar DB, panels, cable, labor, logistics, expansion, buyout.
Asset rights
What the financier owns or claims: infrastructure pool %, provider pool %, buyout claim, note, lease receivable, or tranche claim.
Readiness summary
DRS categories, blockers, what happens if this financing is completed, and what remains after capital is committed.
Demand and capacity
Resident pledges/load confidence for apartments, homeowner load fit, waitlist/expansion demand, projected utilization and sensitivity.
Projected returns
Monthly revenue range, payback range, downside/base/upside scenarios, utilization assumptions, downtime assumptions, reserve deductions.
Risk disclosures
No guarantee, illiquidity, construction risk, utilization risk, hardware risk, regulatory risk, data risk, currency risk, counterparty risk.
Documents
Term sheet, waterfall, valuation, project budget, contracts, warranties, inspection reports, disclosures, legal entity/SPV info if used.
Commit CTA
Invest / commit / reserve / buy out claim / join waitlist / watch only, based on eligibility.

9. Commit Flow
Commitment must not be a casual tap. It should create legal, economic, and operational consequences. A soft expression of interest can help e.mappa measure investor demand, but it should not increase DRS. DRS should increase only when the capital is actually committed under binding terms and release rules.
Tap Invest, Commit, or Buy Out Claim from an eligible project detail page.
Select instrument: infrastructure share, array/generation share, supplier-as-a-service buyout, electrician labor-as-capital buyout, expansion tranche, or portfolio allocation.
Enter amount or select full funding gap. The app checks user limits, project limits, jurisdiction, concentration risk, and minimum/maximum ticket size.
Review use of funds, asset claim, payout pool, waterfall priority, projected returns, payback scenarios, fees, reserve, and risk factors.
Review project documents, subscription/participation agreement, disclosures, conflicts, transfer restrictions, and no-guarantee acknowledgement.
Complete knowledge check for retail users or complex products: what creates payout, what does not, what happens if utilization drops, what happens if LBRS fails.
Authorize payment to escrow/custody or approved settlement account. Funds are marked reserved/escrowed, not yet released to project spending unless release conditions are met.
Commitment becomes valid after payment confirmation, compliance checks, cooling-off/withdrawal window if applicable, and project acceptance.
DRS updates only when the commitment is legally valid and available for project deployment. Soft interest, failed payments, or pending KYC do not count.
Project appears in Project Status with capital status, DRS effect, release schedule, rights, and next milestones.
Capital effect rule
A financier commitment should move DRS only to the extent it solves a real readiness gate. Example: funding the missing battery and labor escrow may move hardware and electrician-payment gates; investing in a project whose demand proof is still weak should not make DRS 100%.

10. DRS Responsibilities and Capital Readiness
Financier capital is one DRS input, not the whole DRS. A project can be fully funded but still not deployment-ready if owner access, demand proof, electrician availability, hardware package, compliance, or contracts are incomplete.
DRS area
What financier can improve
What financier cannot bypass
Hardware package
Fund missing inverter, battery, ATS, meters, Solar DB, cables, panels, monitoring, logistics.
Component compatibility, e.mappa-approved specs, electrician verification.
Stakeholder availability
Buy out supplier/provider/electrician-as-a-service claims or fund upfront payments.
Verification of those stakeholders or quality of their work.
Capital completeness
Close project budget gap and reserve escrow.
Owner authority, site inspection, resident demand proof, safety review.
Contracts and waterfall
Accept terms, sign documents, establish payout pool and priority.
Legal review, regulatory eligibility, proper disclosures.
Demand readiness
Fund expansion only when demand exists or help finance smaller phased system.
Cannot make weak demand economically viable by adding more money.
Compliance readiness
Fund required meters, monitoring, safety upgrades, or audits.
Cannot bypass regulatory, electrical, export/backfeed, or investor protection requirements.

11. LBRS and Go-Live Tracking for Financiers
After installation, financiers need visibility into LBRS because their returns begin only after the project is live and monetized kWh flows through settlement. The financier does not need electrician-level controls, but they do need transparent launch blockers.
LBRS item
Financier view
Why it matters
As-built/BOM verification
Installed assets match the financed assets, serial numbers, quantities, warranty records, and approved design.
Protects against misallocation of financed capital.
Electrical safety
Pass/fail state, not raw technical detail unless relevant.
No safe system means no live revenue.
ATS/switching and metering
Apartment/home connection status, meter mapping status, data reliability.
Settlement depends on measured delivered solar.
Inverter/battery operation
Commissioned, monitoring active, battery behavior verified, faults cleared.
Hardware must perform for revenue to exist.
Token-state and settlement dry run
Test settlement passed, no payout from unmonetized solar, data quality sufficient.
Prevents broken investor statements at launch.
Go-live signoffs
Electrician, e.mappa ops, owner/homeowner, and required stakeholder signoff status.
A missing signoff can delay returns.

12. Project Status Screen
Project state
Reality
Financier UI
F0: Watchlisted
User is interested but no capital committed.
Watchlist card, eligibility status, update alerts, no economic claim.
F1: Commitment pending
User selected investment but KYC/payment/legal acceptance incomplete.
Checklist: documents, payment, disclosures, limits, cooling-off if applicable.
F2: Escrowed / reserved
Funds are held but not released.
Escrow status, release conditions, DRS effect, cancellation/refund rules.
F3: DRS active
Capital helps project readiness but project is not installation-ready.
DRS timeline, blockers, stakeholder commitments, remaining gaps.
F4: Deployment-ready
DRS = 100%; installation can be scheduled.
Installation schedule, funded assets, release schedule, expected go-live window.
F5: Installation in progress
Funds released by milestone and hardware/labor is being deployed.
Milestone tracker, evidence acceptance, issues, budget changes.
F6: LBRS testing
Physical install complete but not live.
LBRS checklist, failed tests, retests, go-live blockers.
F7: Live and earning
System is live and prepaid solar is being consumed.
Energy performance, settlement statements, cashflow, payback progress.
F8: Live with issue
System is live but degraded or partially suspended.
Incident status, affected revenue, reserve action, expected remediation steps.
F9: Exited / bought out
Financier sold claim or was repaid/bought out under terms.
Exit statement, realized return, tax/export report, history preserved.
F10: Suspended/defaulted
Critical compliance, safety, data, demand, or contract issue.
Capital at risk notice, recovery plan, dispute/cure process.

13. Energy Generation Screen
Financiers should have an Energy Generation screen because project cashflows depend on physical energy performance. But the screen must avoid misleading ownership language. A financier who owns infrastructure does not necessarily own generation; generation data is a performance driver. A financier who bought provider/array shares does own a portion of the provider/array pool. The UI should show the difference.
Metric
Meaning
Financier interpretation
E_gen
Total solar generated by project.
Operational production signal; not the payout base by itself.
E_direct
Solar consumed immediately by eligible load.
Part of monetized solar if prepaid and measured.
E_charge
Solar sent into battery.
Potential future monetized solar after battery losses if later consumed.
E_battery_used
Stored solar later delivered to eligible load.
Part of monetized solar after efficiency losses.
E_sold
Prepaid, delivered, measured solar consumed by eligible users.
Economic base for provider/infrastructure payouts.
E_waste
Generated but not consumed/stored/monetized.
No payout unless legally exported/traded for value.
E_grid
Demand served by KPLC/grid fallback.
Service continuity but not e.mappa solar revenue.
Utilization
E_sold / E_gen.
Main driver of payback speed.
Coverage
E_sold / total demand.
Shows how much local demand e.mappa served.
Data quality
Verified, estimated, missing, disputed, or conservative.
Settlement should depend on verified readings.

Energy screen rule
Before LBRS and go-live, show projections only. After go-live, show actual measured data. Do not show projected generation as if it is cashflow. Do not show E_gen as investor revenue. The investor earns from the payout pool tied to monetized solar and external monetization, not from sunlight alone.

14. Ownership and Claim Math
Financiers need simple UI, but the math must be explicit. The app should calculate ownership/claim percentages based on contribution value, asset pool, valuation method, and the project waterfall.
Claim type
Formula / logic
Example interpretation
Infrastructure pool share
Financier infrastructure claim = financier contribution to infrastructure stack / total infrastructure stack.
If financier funds KSh 100,000 of a KSh 500,000 infra stack, they own 20% of the infra pool.
Provider/array pool share
Array claim = purchased provider share / total provider array value.
If financier buys KSh 30,000 of a KSh 300,000 array, they own 10% of provider/array pool.
Supplier-as-service buyout
Claim acquired = supplier’s existing claim percentage or value under contract.
If supplier had 15% infra-pool claim and financier buys all of it, financier receives that 15% claim.
Labor-as-capital buyout
Claim acquired = electrician’s infrastructure-pool claim, unless contract says otherwise.
If labor claim is 8% of infra pool, buyout transfers that claim, not 8% of gross revenue.
Recovery phase payout
Investor payout = E_sold x assigned KSh/kWh pool rate x investor share, after reserves and according to priority.
At KSh 10/kWh infra pool and 20% claim, investor receives KSh 2/kWh sold before fees/taxes if no shortfall.
Royalty phase payout
After target recovery, investor may receive smaller lifetime stream or stop, depending on terms.
Terms must state whether royalties continue, step down, expire, or convert.

15. Settlement Doctrine for Financiers
One-line rule
Pay on monetized solar, not generated solar. If solar is wasted, curtailed, exported for free, unpaid, uncollected, or unsupported by verified data, it does not create financier payout.

Event
Financier settlement result
Financier commits capital but project not live
No usage-linked return yet. Funds are pending, escrowed, or deployed according to milestone terms.
DRS reaches 100%
Project may schedule installation; still no usage-linked return.
LBRS reaches 100% and project goes live
Eligible for settlement once prepaid solar is actually consumed and verified.
Solar generated and consumed by prepaid users
Revenue enters settlement pool; financier receives their configured share of relevant pool.
Solar generated but wasted/curtailed/free exported
No payout unless separately monetized by approved export/trading settlement.
Resident demand spikes beyond solar
Grid fallback serves shortfall; financier earns only on e.mappa solar delivered and paid.
Resident demand drops
E_sold falls; revenue falls; payback stretches. No hidden debt should be created.
Monitoring data missing
Settlement pauses or uses conservative rules until data is verified.
Asset is bought out by another party
Financier receives buyout proceeds according to transfer rules and any required platform/legal approvals.
Project suspended for safety/compliance
Usage-linked settlement pauses; reserve/warranty/recovery process begins.

16. Wallet Screen
The Wallet should feel like a transparent investment dashboard, not a black-box balance. It must separate committed capital, deployed capital, realized cashflow, projected cashflow, principal recovery, royalty income, fees, reserves, taxes, and withdrawals.
Wallet section
Contents
Available balance
Cash available for eligible commitments or withdrawal, subject to payment rail and compliance rules.
Pending commitments
Investments selected but not yet accepted, paid, escrowed, or approved.
Escrowed funds
Funds held pending DRS, contracts, milestone release, or cancellation window.
Deployed principal
Capital released to project or asset buyout. Show by project, asset, pool, tranche, and currency.
Cashflow received
Settlement payouts from infrastructure pool, provider/array pool, buyouts, royalties, export/trading if enabled.
Projected income
Base/downside/upside modeled cashflow, clearly labeled estimates. Include assumptions.
Payback tracker
Principal recovered, remaining principal, projected payback period, actual payback velocity, scenario-adjusted payback.
Fees and reserves
Platform fees, maintenance reserve deductions, utility/wheeling fees where enabled, custody/payment fees, taxes withheld if applicable.
Risk and performance alerts
Low utilization, data missing, downtime, maintenance event, LBRS delay, stakeholder dispute, regulatory hold.
Statements and exports
Monthly statements, project-level ledger, tax docs, contract copies, audit trail, CSV/PDF export.

17. Projected Returns and Payback Period
Projected returns are necessary for financiers, but they are also the easiest way to destroy trust if handled carelessly. The app should show conservative ranges and the assumptions behind them. Payback should update as measured utilization replaces projections.
Projection rule
Never show a single guaranteed payback. Show downside, base, and upside cases. The base case should not be the most optimistic case. Use measured data after go-live and progressively replace assumptions with actuals.

Projection input
Use in model
Required display
Investment amount
Numerator of payback calculation.
Amount deployed, fees, escrow status, currency.
Payout pool rate
KSh/kWh allocated to infrastructure or provider pool.
Recovery phase and royalty phase separately.
Investor claim percentage
Share of relevant payout pool.
Asset/pool share, not gross revenue unless explicitly contracted.
E_sold
Monthly monetized solar.
Actual after live; projected before live.
Utilization
E_sold / E_gen.
Sensitivity table: 90%, 75%, 60%, 45%, 30% or project-specific bands.
Downtime
Days or percent system unavailable.
Maintenance and reliability risk.
Degradation
Panel/battery performance loss over time.
Long-term payback and royalty effect.
Reserve and fees
Maintenance reserve, platform, utility, payment/custody, taxes.
Net return after deductions.
Currency and inflation
If cross-border or multi-currency.
FX risk and local currency return vs home currency.

Generic payback formula: Payback_i = Net investment_i / Monthly net payout_i. Monthly net payout_i should be based on E_sold x pool rate x investor claim, minus relevant fees, reserve deductions, taxes/withholding, downtime, and any priority rules. If monthly payout is low or zero, payback should show “not currently recovering” rather than inventing a date.
18. Stress Testing for Financiers
Scenario
What happens
Investor-facing explanation
High utilization
More of generated solar becomes E_sold; revenue is stronger.
Payback accelerates, but still no guarantee.
Moderate utilization
System performs near model.
Base-case recovery remains plausible if costs and downtime stay controlled.
Low utilization
Solar is generated but not monetized because demand/battery/storage/trading is insufficient.
Revenue falls and payback stretches. No one should be paid from unmonetized energy.
Demand spike
Demand exceeds solar/battery; grid fallback serves the rest.
Service continues, but investor earns only on the solar portion delivered through e.mappa.
Hardware fault
Inverter/battery/ATS/meter/connectivity problem reduces operation or data quality.
Cashflow may pause; reserve/warranty process begins.
LBRS delay
Installation done but launch tests fail or signoff missing.
Usage-linked returns do not begin until live. Project may remediate or refund according to terms.
Regulatory/export delay
Net metering/trading/export not enabled.
Do not include those revenues in available return. Model only local prepaid consumption.
Currency depreciation
Local cashflows lose value in investor home currency.
Portfolio view should show local currency and converted estimate separately.

19. Buying Out Suppliers, Providers, and Electricians
The user specifically wants financiers to see how many suppliers/providers or electricians are doing an as-a-service model and choose to buy them out. This is powerful because it gives operating stakeholders liquidity. But the app must prevent confusion about what is being bought.
Buyout target
What financier buys
What stakeholder receives
What financier receives
Provider panel ownership
Provider sells part or all of their retained array claim.
Cash buyout for the sold share, subject to valuation and terms.
Provider/array pool claim from monetized kWh for the purchased share.
Supplier equipment-as-a-service
Supplier sells equipment claim or lease receivable.
Cash buyout instead of waiting for kWh-linked recovery.
Infrastructure-pool claim or lease payment stream exactly as defined.
Electrician labor-as-capital
Electrician sells deferred labor claim.
Cash liquidity for labor value they otherwise deferred.
Infrastructure-pool claim tied to labor-capital contract.
Hybrid stakeholder bundle
Stakeholder sells multiple claim types.
Cash for each asset class.
Separate claims: provider pool for panels, infra pool for hardware/labor.
Partial buyout
Only part of the claim is sold.
Immediate partial liquidity, retained remaining claim.
Pro-rata claim only for acquired percentage.

Ethical liquidity guardrail
Buying out an electrician or supplier should not exploit urgency. The app should show fair value, expected payback range, discount, risks, and stakeholder consent. A desperate stakeholder should not be tricked into selling a long-term claim for an opaque low price.

20. Cross-Border Investing
Financiers may want to invest in far-away lands and eventually other countries. The product should support the vision, but the rules must be hard. Cross-border investing adds legal offering restrictions, FX risk, tax reporting, payment rails, investor eligibility, capital controls, consumer protection, and dispute complexity.
Cross-border issue
Required product behavior
Investor jurisdiction
Determine whether the user may legally view, be solicited for, and invest in the offering.
Project jurisdiction
Show country/county rules, local utility/regulatory status, currency, tax, and local enforcement risks.
Currency
Display local currency return and converted estimate; show FX rate assumptions and potential slippage.
Tax and withholding
Collect tax residency where needed; disclose that tax treatment varies; generate statements.
Payment rails
Use compliant rails; do not accept unsupported or high-risk payment sources.
Legal vehicle
May require project SPV, licensed crowdfunding operator, broker/dealer/funding portal, fund, or private placement structure.
Investor protection
Different countries may require limits, cooling-off, risk warnings, disclosures, complaint process, and reporting.
Marketing
Do not actively solicit in jurisdictions where e.mappa lacks approval or exemption.

Cross-border rule
Distance should not block discovery, but law can block investment. The app should support global ambition with jurisdiction-aware offer visibility and investability, not by pretending one set of rules applies everywhere.

21. Portfolio View and Diversification
Even if the core screen is Wallet, financiers need a portfolio-level view. It should show concentration and risk, not just earnings.
Portfolio metric
Purpose
Total committed / escrowed / deployed
Separates selected investments from actual capital at risk.
Project count and regions
Shows geographic spread and jurisdiction exposure.
Asset class split
Infrastructure, generation, supplier claims, labor claims, expansion tranches, notes.
Stage split
Pre-DRS, DRS, installation, LBRS, live, suspended, exited.
Utilization bands
How much portfolio revenue depends on high/medium/low utilization projects.
Top 5 concentration
Warns if too much capital is in one site, stakeholder, region, or asset type.
Cashflow calendar
Expected settlement dates, actual received, delayed payments, holds.
Payback distribution
Weighted projected payback and actual principal recovered.
Risk alerts
Data gaps, downtime, legal holds, currency exposure, maintenance issues.

22. Investor Risk Controls
Risk
Control
Over-investment by retail users
Per-user and per-period limits, concentration warnings, suitability checks, hard caps.
Misleading returns
Scenario ranges, assumptions disclosure, no guaranteed ROI language, measured vs projected separation.
Project fraud
Owner verification, electrician evidence, supplier/provider verification, BOM audits, escrow release controls.
Use-of-funds misuse
Milestone release, invoice/BOM matching, serial numbers, evidence review, audit trail.
Unqualified investors
Eligibility checks and jurisdiction gates before committing.
Illiquidity surprise
Clear lockup/transfer restrictions and exit rules before commitment.
Data manipulation
Meter/inverter data validation, anomaly detection, conservative settlement when data missing.
Conflict of interest
Disclose if e.mappa, owners, suppliers, providers, electricians, or insiders have interests in the project.
Regulatory breach
Compliance engine, offering controls, records, restricted jurisdictions, legal review.
Platform custody risk
Use segregated escrow/custody/payment accounts and reconciliation.

23. Financier Notifications and Alerts
Trigger
Notification
New eligible project
A new project is available in your eligible market. DRS 68%, KSh 120,000 funding gap.
Capital gap near close
This project is KSh 25,000 away from DRS capital readiness.
As-a-service buyout opened
A supplier/electrician claim is available for buyout with disclosed terms.
Commitment accepted
Your KSh X commitment has been accepted and moved to escrow.
DRS reached 100%
Project is deployment-ready. Installation scheduling has begun.
Installation milestone funded
Milestone release approved for inverter/battery/ATS/labor.
LBRS blocker
Go-live delayed: ATS mapping failed for 2 units / settlement dry run failed.
Project live
Project has passed LBRS and is now eligible for prepaid energy settlement.
Settlement posted
KSh X received from monetized solar for period Y.
Utilization warning
Utilization dropped below model; projected payback has changed.
Data quality hold
Settlement paused pending meter/inverter data verification.
Buyout offer
Another participant offered to buy your claim; review price and terms.

24. Backend Data Model Additions
Entity
Core fields
FinancierProfile
user_id, account_type, legal_name, phone, email, country_of_residence, tax_residency, verification_status, eligibility_tier, jurisdiction_status, risk_profile, payout_account_id
InvestorEligibilityRecord
user_id, jurisdiction, investor_type, evidence_url, verified_by, limits_json, expires_at, status
RiskSuitabilityProfile
user_id, investment_experience, loss_capacity, time_horizon, liquidity_need, concentration_limit, comprehension_score, updated_at
ProjectOffering
offering_id, project_id, jurisdiction, instrument_type, target_amount, min_ticket, max_ticket, eligible_investor_types, disclosure_version, status
FinancierCommitment
commitment_id, user_id, offering_id, project_id, amount_kes, currency, status, accepted_at, escrow_status, cooling_off_until
EscrowLedger
escrow_id, commitment_id, amount, currency, status, custodian, release_condition, released_at, refunded_at
InvestmentPosition
position_id, user_id, project_id, asset_pool, claim_type, claim_percentage, principal_deployed, valuation_method, phase, acquired_at
ClaimBuyoutOffer
offer_id, seller_user_id, buyer_user_id, project_id, claim_id, asset_pool, price, discount_rate, status, signed_at
FinancierWalletLedger
ledger_id, user_id, project_id, position_id, transaction_type, amount, currency, kwh_basis, status, settlement_period_id, created_at
ReturnProjectionSnapshot
snapshot_id, project_id, position_id, utilization_case, e_sold_estimate, monthly_payout_estimate, payback_months, assumptions_json, created_at
InvestorDocument
document_id, user_id, document_type, version, file_url, signed_at, status
PortfolioRiskSnapshot
user_id, total_deployed, concentration_json, stage_split_json, geography_split_json, risk_alerts_json, generated_at

25. Screen-Level UX Requirements
Area
UX requirement
Discover
Use high-quality project cards, clear DRS labels, raised/gap progress, eligibility badges, risk badges, and return ranges. Avoid casino-like or hype design.
Project detail
Layer the data: simple summary first, then financial terms, asset rights, risks, documents, and assumptions.
Commit flow
Make it deliberate: amount, use of funds, claim type, assumptions, risks, documents, payment, confirmation.
Project Status
Show capital status, DRS/LBRS progress, milestone releases, blockers, and live health without requiring technical knowledge.
Energy Generation
Separate projections from actuals and E_gen from E_sold. Show utilization as the key economic driver.
Wallet
Separate available balance, escrowed funds, deployed principal, received cashflow, projected return, fees, reserve, tax, and withdrawals.
Profile
Make compliance status visible and understandable: verified, limited, restricted, documents needed, eligibility expired.
Risk copy
Use plain language. Say “you may lose money,” “payback can stretch,” and “returns are not guaranteed” where appropriate.

26. Non-Negotiable Decision Rules
Do not let an unverified or ineligible user commit capital to a real project.
Do not show a project as investable if the user’s jurisdiction or investor status does not permit it.
Do not treat soft interest as capital readiness. DRS should move only when legally valid, funded/escrowed, accepted commitments exist.
Do not begin installation until DRS = 100%.
Do not let a project go live until LBRS = 100%.
Do not pay usage-linked returns before the project is live and prepaid solar is actually consumed.
Do not pay financiers from generated-but-unsold solar, pledged demand, unpaid usage, unverified readings, or future trading that is not enabled.
Do not present projected payback as guaranteed. Always show assumptions and downside cases.
Do not blur infrastructure claims, provider/array claims, supplier claims, and labor-as-capital claims.
Do not allow a financier buyout to acquire more rights than the seller actually had.
Do not release escrowed funds without milestone, evidence, and contractual release conditions.
Do not hide fees, reserves, taxes, currency risk, maintenance risk, downtime, or transfer restrictions.
Do not let regulatory ambition outrun compliance. The financier product must be jurisdiction-gated and counsel-reviewed before public launch.
27. Demo Script - Financier Funds a Project
Financier opens e.mappa and selects “Financier / investor.”
They create an account, choose individual or business/entity, and complete identity/KYC or KYB requirements.
The app collects risk profile, investor eligibility, jurisdiction, tax residency, payment rail, and disclosures.
After approval, the app opens to Discover. The financier sees eligible projects with photos, DRS score, capital raised, capital gap, stakeholder-as-a-service claims, projected utilization, return range, payback range, and risk badge.
They tap a project and review use of funds: KSh X for battery, KSh Y for ATS units, KSh Z to buy out supplier equipment-as-a-service, and KSh A to fund electrician milestone escrow.
The app explains the claim: infrastructure-pool share during recovery phase, then smaller royalty phase under the contract. It shows downside/base/upside payback scenarios and no-guarantee warning.
The financier commits KSh X. The app checks limits, eligibility, concentration, legal availability, and payment method.
Funds move to escrow. DRS increases only for the readiness gates actually solved by the valid commitment.
Once all DRS gates reach 100%, installation begins. The financier tracks hardware procurement, milestone releases, and installation progress in Project Status.
After installation, LBRS begins. The financier sees safety, metering, ATS, monitoring, and settlement dry-run pass/fail status.
When LBRS reaches 100%, the project goes live. Energy Generation switches from projected to actual measured data.
Wallet begins showing settlement from prepaid monetized solar: principal recovered, cashflow received, remaining payback, fees/reserves, and updated payback projections based on actual utilization.
If utilization drops, the app updates projections honestly and shows the cause: weak demand, battery limit, downtime, weather, data quality, or grid fallback. No fake returns are displayed.
28. Open Variables Before Build
Open variable
Recommended default
Legal structure
Start with counsel-reviewed private pilot or sandbox-style structure before public retail investing.
Investor classes
Support watch-only, retail-limited, sophisticated/qualified, business/entity, and institutional.
Minimum ticket size
Keep retail tickets small if permitted; set based on compliance and payment costs.
Escrow/custody provider
Use segregated escrow/custody/payment rails; do not commingle investor funds.
Cooling-off period
Include where required by jurisdiction or as consumer-protection default for retail users.
Transferability
Start with non-transferable or platform-approved transfers only. Add secondary market later under legal structure.
Projected return assumptions
Use conservative utilization bands and measured data after go-live.
Payback phase rules
Define recovery phase, target return, royalty phase, step-down, expiry, and buyout rights per project.
Cross-border launch
Start within one jurisdiction or one controlled investor class before global participation.
Retail education
Require comprehension check before first investment and before complex buyout products.
Reserve policy
Set maintenance reserve before investor distributions; disclose reserve usage clearly.
Default/remediation rules
Define suspension, cure, refund, write-down, insurance/warranty, and dispute process.

29. Final Product Positioning
Scenario F should make financiers feel like they are participating in the buildout of local energy economies, not passively buying an abstract financial product. The product should feel polished, transparent, and data-rich, like an investment app. But its trust comes from restraint: regulatory gating, honest projections, escrow discipline, no fake returns, and precise ownership math.
Final operating principle
Financiers unlock the capital stack. e.mappa must protect the market standard. The financier product succeeds only if capital can flow broadly without turning the platform into an unregulated, overpromised, under-disclosed investment marketplace.

Source Context Used
This Scenario F document synthesizes the existing e.mappa materials for Scenario A residents, Scenario B apartment building owners, Scenario C homeowners, Scenario D electricians, Scenario E suppliers/providers, the installation/DRS/LBRS spec, the settlement/payback stress-test doctrine, the hardware architecture notes, and the AI-native operating-system framing. It also adds a stricter regulatory and investor-protection layer because financier onboarding is the highest-risk product surface in the network.
