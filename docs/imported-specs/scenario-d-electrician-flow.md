e.mappa
Scenario D - Electrician Network Flow
Electrician onboarding, verification, certification, project discovery, crew execution, DRS/LBRS tasking, safety signoff, wallet settlement, and live maintenance
Clearly labeled scope
This document defines the electrician experience for e.mappa. It covers solo electricians, existing crews, ad-hoc crews, lead electricians, training/certification, project discovery, project commitment, DRS work, LBRS work, go-live signoff, live-system maintenance, household requests, payments, ratings, and data structures. It is written as a canonical product and implementation spec for Scenario D only.

Internal product specification. Prepared for the e.mappa app, backend, deployment operations, and stakeholder coordination model.
1. Executive Summary
Scenario D is the electrician path. The electrician is not a passive labor listing and not merely a contractor who receives a work order. In e.mappa, the electrician is the execution bridge that converts a project from theoretical readiness into a safe, metered, switched, settlement-ready energy node.
The app must treat electricians with respect because many will already have serious field experience. At the same time, e.mappa cannot allow every electrician to improvise their own installation pattern. The product must frame the workflow as a professional standard, not as a junior checklist. Electricians are being certified into the e.mappa operating system: DRS, LBRS, ATS allocation, token-state switching, settlement evidence, component documentation, safety, and go-live accountability.
Product law
Electricians can discover and commit to projects only after they are verified and e.mappa-certified. A project can be discovered before DRS is complete, but physical installation cannot begin until DRS reaches 100%. A building or home cannot go live until LBRS reaches 100% and all required electrician signoffs are complete. Electricians are paid only through approved milestones, labor-as-capital terms, hybrid terms, or verified household requests. No one is paid from generated-but-unsold solar.

Electricians must be verified for identity, experience, credentials, work history, safety discipline, and documentation ability before they can accept e.mappa projects.
Electricians must complete e.mappa certification training covering DRS, LBRS, hardware specifications, ATS switching, token-state behavior, safety, evidence capture, and settlement consequences.
The first screen for electricians should be Discover: an Airbnb-style project marketplace showing nearby projects, DRS status, site type, required crew size, rough scope, funding status, and proximity.
The second screen should be Projects: all committed projects, current stages, assigned tasks, blockers, evidence requirements, crew roles, and signoff status.
The third screen should be Wallet: milestone earnings, labor-as-capital claims, revenue-share flows, household request income, pending payouts, dispute holds, and settlement statements.
The fourth screen should be Profile: certification status, documents, crew membership, ratings, skills, service area, insurance/compliance notes, payout account, and safety record.
2. Electrician Role in the e.mappa Network
The electrician is the party that turns coordination into reality. Building owners, homeowners, suppliers, providers, and financiers may all create readiness, but the electrician validates the site, translates requirements into deployable work, installs the physical allocation layer, proves safety, and produces the evidence that allows settlement to begin.
Role
What the electrician does
System consequence
Deployment bridge
Connects the initiated project to site inspection, hardware requirements, sourcing, installation, testing, and go-live.
DRS and LBRS become real operational gates, not abstract percentages.
Technical validator
Confirms roof/DB/meter/ATS route, cable paths, grounding, component compatibility, connectivity, and load constraints.
Prevents fantasy deployments and wrong-sized hardware.
Stakeholder coordinator
Works with suppliers/providers, financiers, owners/homeowners, residents, and e.mappa ops.
The project can move without every stakeholder manually managing technical details.
Safety authority
Completes LBRS tests and signs off that the site is safe to activate.
No go-live without verified safety and unanimous required signoff.
Evidence producer
Captures photos, serial numbers, meter maps, wiring diagrams, test results, and issue logs.
Payments and future maintenance become auditable.
Live-system responder
Receives system fault alerts and household service requests after activation.
e.mappa becomes an operating network, not a one-time electrician marketplace.

Brutal correction
A project cannot be “decentralized” by letting every electrician do whatever they usually do. The network becomes scalable only if the installation pattern, evidence capture, safety gates, and settlement handoff are standardized. The app should respect expertise, but the system cannot outsource its operating integrity to personal preference.

3. Architecture Assumptions Electricians Must Be Certified On
The electrician training and project screens must separate apartment-building architecture from homeowner architecture. The old common-bus pilot idea should not be the default apartment model because it risks free solar leakage to non-enrolled apartments and breaks token-based allocation. The canonical apartment model is a separate e.mappa solar supply path with per-apartment ATS switching. The homeowner model is home-level controlled switching and metering.
Project type
Canonical switching model
Electrician responsibility
Apartment building
Separate e.mappa solar bus, dedicated Solar DB, per-apartment ATS at or near individual meter point, apartment-level metering, KPLC fallback.
Map each apartment/meter, install or verify ATS per enrolled unit, prove no common-bus leakage, prove correct switching and settlement mapping.
Homeowner / single home
Home-level controlled supply path through approved changeover/ATS arrangement, inverter/battery system, metered home supply, KPLC fallback.
Verify property DB, switching boundary, meter context, export/backfeed discipline, component health, and home-level go-live readiness.
Mixed small compound / shop-home hybrid
Project-specific controlled switching plan approved during DRS.
Escalate to e.mappa technical review if loads, ownership, or meter topology are ambiguous.

Architecture guardrail
Electricians must not improvise common-bus injection for apartment buildings. If non-enrolled units can receive e.mappa solar without prepaid tokens, the installation fails the product model, the settlement model, and likely the compliance model. The correct apartment standard is allocation hardware plus verified switching per participating apartment.

4. Electrician Onboarding Flow
Onboarding must be thorough without feeling like a bureaucratic punishment. The goal is to verify the electrician and then certify them into e.mappa-specific deployment standards. The app should say: “You already know electrical work. This certifies you for the e.mappa operating model: project readiness, token-controlled allocation, settlement evidence, and go-live safety.”
Welcome: position e.mappa as a professional network for paid deployment, maintenance, and energy infrastructure work.
Role selection: user selects “Electrician.” Secondary choices: working solo, part of an existing crew, lead a crew, looking for a crew, apprentice/helper under a verified electrician.
Account setup: email/phone OTP for pilot; production path should support phone identity, M-Pesa payout details, national ID, and security settings.
Identity and eligibility: collect legal name, phone, location/service area, ID, business registration if applicable, references, and emergency contact.
Experience profile: collect years of experience, solar installation history, wiring/DB/meter experience, ATS/changeover experience, inverter/battery brands handled, photos of prior work, and specialization tags.
Credential/document upload: request licenses/certifications where applicable, training certificates, business permits if relevant, work portfolio, safety training evidence, and insurance/liability documents if available.
Background and reference checks: manual or automated review of identity, work claims, safety incidents, complaints, and references. Do not rely only on self-reported experience.
e.mappa certification training: complete modules on architecture, DRS, LBRS, safety, software integration, evidence capture, anti-fraud, and crew accountability.
Practice test and scenario simulation: user must pass a test that includes hardware selection, ATS state logic, DRS blockers, LBRS failures, and go-live signoff judgment.
Certification decision: approved, provisionally approved, needs more documents, limited to helper role, limited to certain project sizes, or rejected.
Verification layer
What to collect
Why it matters
Identity
National ID/passport, phone, email, photo, payout identity, emergency contact.
Prevents anonymous access to safety-critical infrastructure.
Experience
Years, prior solar/DB/meter work, inverter/battery brands, ATS/changeover familiarity, prior job photos.
Matches electricians to project scope and reduces training burden.
Credentials
Electrical license/certificate where available, solar training, safety certificates, business permit if operating as a company.
Creates a defensible qualification record.
References
Past clients, contractor references, supplier references, photos tied to verifiable projects.
Protects e.mappa from fake portfolios.
Safety record
Reported incidents, unsafe work history, disciplinary flags, insurance if available.
Safety risk should affect certification tier and project access.
App readiness
Smartphone, camera quality, GPS, mobile data availability, ability to upload evidence.
e.mappa depends on software-linked evidence, not verbal claims.

5. Certification Tiers
Not every electrician should see every project on day one. Certification tiers let e.mappa respect experience while protecting the network. A highly experienced electrician can move faster through review, but still has to prove they understand the e.mappa pattern.
Tier
Allowed work
Typical requirements
Helper / crew member
Assigned tasks under a verified lead or accountable signatory. No independent project commitment.
Identity verified, basic training complete, safety module passed.
Verified electrician
Can join projects, complete assigned DRS/LBRS tasks, upload evidence, and sign off on assigned work.
Identity, experience, documents, references, training, practice test.
Lead electrician
Can commit as project lead for eligible scopes, coordinate crew, submit BOM, manage schedule, request milestone release.
Verified electrician plus leadership score, prior work, stronger safety record, platform trust.
Senior / inspector
Can review blocked projects, audit LBRS evidence, train others, or serve as second signoff for complex projects.
High rating, demonstrated e.mappa completions, low incident history, technical assessment.
Restricted / probation
Can only work with supervision or on small low-risk tasks.
Incomplete documents, weak test result, incident history, or new user without enough evidence.

6. Training Design
The training must be thorough but intuitive. It should be modular, scenario-based, visual, and respectful. The aim is not to teach experienced electricians basic wiring. The aim is to make them fluent in e.mappa-specific deployment logic.
Module
Core content
Pass evidence
e.mappa operating model
Prepaid-only energy, tokens as usable kWh after activation, settlement on monetized solar, stakeholder waterfall, no payout from wasted generation.
Quiz on token vs pledge vs settlement.
Apartment architecture
Separate solar bus, Solar DB, per-apartment ATS, KPLC fallback, apartment meter mapping, no common-bus leakage.
Identify correct wiring state from diagrams.
Homeowner architecture
Home-level controlled switching, inverter/battery, load fit, export/backfeed discipline, net-metering/trading only where permitted.
Choose correct home-level activation checklist.
DRS
Site inspection, capacity plan, hardware package, stakeholder availability, funding/labor terms, owner access, demand proof, compliance review.
Classify blockers and required evidence.
LBRS
As-built verification, safety tests, isolation, inverter/battery, ATS switching, meter mapping, token-state simulation, settlement dry run, signoff.
Complete mock LBRS test from a scenario.
Hardware selection
Approved inverter/battery/ATS/meter/breaker/SPD/cable/conduit/mounting/connectivity specs, substitution process.
Build a BOM from a project brief.
Evidence capture
Photos, serials, GPS/time stamps, before/after, diagrams, meter maps, test readings, defect notes.
Upload correct evidence for a simulated task.
Safety and conduct
Lockout/tagout style discipline, PPE, no exposed conductors, labeling, household access, incident escalation, fraud prevention.
Safety test and conduct pledge.

Handling electrician ego
The copy should not say “follow instructions from the app.” It should say “e.mappa projects require a shared professional standard because your work affects allocation, prepaid switching, resident safety, stakeholder payouts, and your own liability record.” The checklist is framed as protection: it proves the electrician did the job correctly and triggers payout.

7. Practice Test and Certification Exam
The practice test should not be trivia. It should simulate the real work electricians will face. A strong electrician should pass because the test rewards practical judgment, not memorized wording.
Test section
Example task
What it proves
DRS judgment
A building has funding and owner permission but no resident demand proof. Can installation start?
Understands DRS hard blockers.
ATS mapping
Match unit number, PAYG meter, solar meter, ATS output, and resident account.
Prevents wrong-apartment allocation.
Hardware substitution
Specified ATS is unavailable; choose whether to substitute, escalate, or pause.
Protects standardized component library.
Safety fault
Photos show exposed conductor or missing grounding. Decide if LBRS can pass.
Safety cannot be bypassed for schedule.
Token-state simulation
Tokens available, exhausted, solar unavailable, KPLC unavailable, maintenance pause.
Understands switching states and service continuity.
Settlement dry run
Given E_gen, E_sold, E_waste, identify which kWh trigger payout.
Understands monetized-solar doctrine.
Crew accountability
One crew member refuses signoff; decide next step.
Understands unanimous signoff and valid blocker requirement.

8. Electrician App Information Architecture
The electrician app should be four screens. The first screen is Discover because the electrician’s primary opportunity loop is finding nearby projects that need technical execution. Projects are separate because committed work should feel operational, not marketplace browsing.
Screen
Empty state
Active state
Discover
No matching projects near you. Adjust service radius, improve certification, or check later.
Airbnb-style feed of project cards with distance, DRS, funding status, required crew size, rough scope, owner/homeowner type, and urgency.
Projects
No committed projects yet. Browse Discover to attach to one.
Committed projects grouped by DRS, installation, LBRS, live maintenance, blocked, and completed.
Wallet
No earnings yet. Complete verified work to unlock payouts.
Milestone payouts, pending approvals, labor-as-capital claims, revenue-share earnings, household request income, deductions, disputes, payout account.
Profile
Complete verification to unlock projects.
Certification tier, documents, skills, crew, ratings, service radius, safety record, payout settings, training refreshers.

9. Discover Screen - Project Marketplace
Discover should feel like a polished project marketplace, not a job board. Electricians scroll through buildings and homes needing work. Each card should quickly answer: Is this near me? Is it worth my time? Is funding available? What is blocking readiness? How many people are needed? What will I be responsible for?
Project card field
Display
Why it matters
Project image
Apartment/home photo, blurred if privacy requires.
Makes project browsing tangible and Airbnb-like.
Location/proximity
Town/area and distance, not exact address until commitment or NDA/access approval.
Balances usability and privacy/security.
Project type
Apartment building, homeowner, small compound, shop-home hybrid.
Different architecture and tasks.
DRS score
Percentage plus top blockers: site inspection pending, capacity plan pending, funding missing, labor unresolved.
Shows readiness and what work can move the project forward.
Funding status
Funded, partially funded, no labor budget, labor-as-capital available, financing in progress.
Electrician can choose cash vs risk.
Crew requirement
Solo, 1-2, 3-4, 4-6+, lead required, helper slots open.
Prevents overcommitting to a scope one person cannot safely finish.
Estimated scope
DRS inspection only, installation, ATS rollout, LBRS test, maintenance audit, household request.
Clarifies type of job.
Projected payout
Milestone range or labor-as-capital estimate with risk label.
Avoids hidden economics.
Urgency
Owner access window, target go-live date, resident pressure, fault severity for live sites.
Supports prioritization.

10. Project Detail Page
A project detail page should be rich but not overwhelming. It should let the electrician understand the opportunity, the readiness state, the stakeholders, and the risks before committing.
Section
Contents
Hero
Project image, project name/code, type, distance, DRS/LBRS state, required crew size, funding status, target timeline.
Readiness summary
DRS categories, blockers, required electrician actions, documents already uploaded, owner/homeowner availability.
Site details
Apartment count or home load profile, roof type, meter/DB photos, cable-route notes, connectivity notes, access constraints.
Stakeholders
Owner/homeowner, provider/supplier commitments, financiers, e.mappa ops contact, existing crew attachments.
Hardware needs
Approved BOM draft, missing items, supplier/provider availability, substitution restrictions, logistics risks.
Payment terms
Upfront milestones, DRS payout, LBRS payout, labor-as-capital option, hybrid option, household request rate if live.
Risk and compliance
Known blockers, safety concerns, special approvals, privacy/access restrictions, dispute history.
Commit CTA
Review terms, select solo/crew mode, choose work package, accept evidence and signoff obligations.

11. Commit Flow
Commitment cannot be a casual “I’m interested” tap. It should create accountability. The electrician should understand the scope, payout model, evidence standard, timeline, safety obligations, and consequences of abandonment.
Tap Commit or Request to Join.
Choose mode: solo, existing crew, join forming crew, bring helpers, lead role, limited work package only.
Review scope: DRS inspection, installation, ATS rollout, LBRS testing, remediation, maintenance, or household request.
Review payment model: funded milestone, labor-as-capital, hybrid, or request fee.
Review terms: safety rules, evidence requirements, hardware compliance, timeline, dispute process, no off-platform solicitation, no unauthorized substitutions.
Confirm availability and access windows.
Declare tools/transport/material handling capability.
Accept accountability: missed deadlines, false evidence, unsafe work, or unauthorized changes can affect ranking, payouts, and certification.
Project appears in Projects screen with assigned tasks and next actions.
Commitment rule
An electrician can express interest in many projects, but should not be able to commit to more active work than their certification tier, crew size, schedule, and safety record can support. The platform should prevent “claiming everything” and then delaying projects.

12. Crew System
Most serious projects will not be done by one person. The app needs a flexible crew system that supports existing crews, solo electricians, and ad-hoc teams. But there is a hard reality: even if the product avoids ego-based hierarchy, a safety-critical electrical project still needs an accountable signatory or accountable lead for compliance and operational ownership.
Crew mode
How it works
Product rule
Solo
One verified electrician handles a small scope or inspection.
Allowed only when scope score fits solo limits.
Existing crew
A lead invites verified crew members or crew members join under a known crew profile.
Crew lead is clear; individual task accountability still tracked.
Ad-hoc crew
Multiple verified electricians form around a project from Discover.
e.mappa assigns an accountable project lead or signatory based on tier, experience, proximity, and acceptance.
No formal leader, task-based work
The app delegates tasks by strengths and each person signs off their own portion.
Useful for execution, but cannot remove the need for final accountable signatory on safety-critical work.
Helper/apprentice support
Helpers assist under a verified electrician.
Helpers cannot independently sign critical LBRS sections.

Pushback / hole patched
A completely leaderless crew is risky. e.mappa can avoid ego-heavy hierarchy by assigning work based on strengths, but the project still needs one accountable lead or licensed signatory for scheduling, safety escalation, final documentation, and dispute ownership. Every electrician can still sign off their own work, and every required signoff can remain mandatory before go-live.

13. Crew Size and Scope Matching
Every project should carry a scope score. The electrician app should tell users whether the project likely needs 1 person, 2 people, 3-4 people, or 4-6+ people. This protects safety, timelines, and the electrician’s own rating.
Scope signal
Low complexity
High complexity
Site type
Single home, simple DB, short cable path.
Apartment building with many meters, multiple floors, external conduit, constrained meter bank.
ATS count
0-1 home-level changeover/ATS or few apartment units.
Many apartment ATS installations in one phase.
Cable route
Short, accessible, known route.
Long riser, roof-to-ground routing, wall penetrations, difficult conduit path.
Hardware package
Standard inverter/battery and known BOM.
Multiple supplier/provider contributions, substitutions, complex battery/inverter integration.
Testing burden
Basic home LBRS.
Apartment-level ATS testing, meter mapping, resident activation sequencing, settlement dry run.
Access window
Flexible homeowner access.
Owner, residents, meter area, roof, and crew all need coordination.

14. Electrician Project State Machine
State
Reality
Electrician UI
D0: Not verified
User account exists but cannot accept projects.
Verification checklist and training prompt.
D1: Certified, no projects
Electrician is eligible but has no commitments.
Discover feed plus empty Projects screen.
D2: Interested
Electrician saved or requested project but not committed.
Saved cards, pending approval, no work obligation yet.
D3: Committed to DRS
Electrician responsible for inspection/readiness tasks.
DRS task list, site visit schedule, evidence capture.
D4: DRS blocked
Project cannot reach 100% due to missing data, access, funding, hardware, demand, or terms.
Blocker owner, escalation actions, pause/resume options.
D5: Deployment-ready
DRS = 100%; installation can be scheduled.
Installation plan, crew roster, BOM, access windows, safety brief.
D6: Installation in progress
Hardware and allocation layer being installed.
Task board, evidence uploads, issue log, milestone tracker.
D7: LBRS testing
Physical install complete; launch tests not complete.
LBRS checklist, failed items, retests, signoff grid.
D8: Go-live pending signoff
LBRS technically complete but required signatures or ops review pending.
Signoff screen, dissent reasons, launch packet.
D9: Live monitoring
System is active and electrician can see health/fault status.
Energy flow view, component health, alerts, maintenance tasks.
D10: Completed / warranty
Project work completed but history remains.
Ratings, payout status, warranty callbacks, portfolio record.

15. DRS Responsibilities for Electricians
DRS answers whether installation should begin. Electricians should be able to move the project toward DRS = 100% by completing site inspection, capacity inputs, hardware requirements, safety observations, and installation feasibility evidence.
DRS task group
Electrician action
Evidence required
Site access
Confirm roof, DB/meter area, cable routes, equipment locations, resident/unit access needs.
Photos, GPS/time stamp, access notes, owner/homeowner confirmation.
Meter topology
Document KPLC meters, STS/PAYG context, apartment meter mapping, DB position, available space.
Meter photos, mapping table, diagram, risks.
Roof/site assessment
Assess roof type, shade, structural concerns, panel placement, safety access.
Roof photos, shading notes, rough panel layout.
Cable route
Trace feasible DC/AC routes, conduit needs, riser constraints, wall penetration risks.
Route photos, length estimate, material estimate.
Capacity inputs
Provide installable array constraints, inverter/battery placement, apartment ATS count constraints.
Capacity notes, recommended phase size, warnings.
Hardware requirements
Draft or validate BOM based on e.mappa specs.
BOM, approved substitutes, supplier/provider notes.
Labor estimate
Estimate crew size, work days, transport, access windows, safety needs.
Quote, timeline, crew requirement.
Compliance/safety risks
Flag no-go items, unsafe DB, backfeed risk, weak grounding, water ingress, access danger.
Issue report and required remediation.

16. Hardware Selection and Supplier/Provider Coordination
Electricians should pick hardware from e.mappa-approved specifications, not personal preference alone. Suppliers and providers can make equipment available, but the electrician verifies compatibility and installability. When a project has multiple suppliers/providers/financiers, the app must prevent hardware chaos.
Hardware category
Electrician decision boundary
Escalation trigger
Panels/provider arrays
Verify panel specs, stringing feasibility, roof placement, MPPT compatibility, mounting practicality.
Mixed specs, voltage/current outside inverter limits, roof mismatch, unsafe mounting.
Inverter
Must match approved project design, battery voltage, load requirements, monitoring capability, operating mode.
Unavailable model, non-approved substitution, no monitoring, questionable warranty.
Battery
Match inverter specs, usable capacity, safety placement, ventilation/clearance, warranty.
Unknown brand, poor BMS integration, undersized capacity, unsafe location.
Solar DB
Correct enclosure, breakers, SPD, labeling, isolation, cable management.
Missing protection, undersized enclosure, water ingress risk.
ATS/changeover
Use approved DIN rail ATS/changeover arrangement suitable for apartment/home switching plan.
Unapproved brand/spec, unclear failover behavior, wrong rating.
Meters/CTs
Install and map approved meters/CTs for settlement-grade readings.
Data mismatch, no unique mapping, readings unavailable.
Connectivity
Confirm WiFi/cellular signal, monitoring dongle/router, power to monitoring devices.
Weak signal, cloud/API unavailable, data gaps likely.

Hardware rule
If the approved component is unavailable, the electrician may propose a substitute, but cannot silently install it. Substitutions must pass compatibility, safety, monitoring, and settlement requirements before procurement or installation.

17. Installation Workflow
DRS reaches 100%; no physical deployment starts before this gate.
Project schedule is confirmed with owner/homeowner, crew, suppliers/providers, and any financier-funded procurement milestones.
Crew safety brief is completed in-app before site work starts.
Hardware is checked against the approved BOM: serial numbers, ratings, quantities, warranty references, source/provider/supplier labels.
Physical installation proceeds: panels/mounting, inverter/battery, Solar DB or home DB integration, ATS/changeover, meters/CTs, conduit/cabling, grounding, labeling, connectivity.
Each task owner uploads evidence as work is completed.
Any deviation from design creates an issue log item and may pause the project until e.mappa technical approval.
Installation is marked physically complete only when all planned hardware is installed and documented.
LBRS begins. Physical completion does not mean the project is live.
18. LBRS Responsibilities for Electricians
LBRS answers whether people can safely consume prepaid e.mappa energy now. It is the go-live gate. Electricians need a dedicated LBRS screen where tests are completed, photographed where useful, and signed.
LBRS test
Electrician pass condition
Criticality
As-built verification
Installed system matches approved design, BOM, serial numbers, wiring diagram, apartment/home map, and capacity plan.
Critical
Electrical safety
Breakers, SPD, grounding/earthing, polarity, insulation, cable sizing, enclosure sealing, labeling, no exposed conductors.
Critical
Solar bus / source isolation
No unintended connection to KPLC/main common bus; no unsafe backfeed; correct separation of sources.
Critical
Inverter/battery operation
Correct operating mode, charge/discharge behavior, low-battery behavior, monitoring data, fault-free state.
Critical
ATS/changeover switching
For each enrolled apartment or home path: KPLC input works, solar input works, output feeds correct load, failover works.
Critical
Meter mapping
Each meter/CT maps to the correct apartment/resident/home and records solar-side consumption accurately.
Critical
Token-state simulation
Simulate token available, token exhausted, solar unavailable, KPLC unavailable, maintenance/suspend state.
Critical
Settlement dry run
Test readings produce E_gen, E_sold, E_waste, E_grid and sample waterfall with no payout from unmonetized solar.
Critical
Launch readiness
Owner/homeowner/residents have instructions, fallback guidance, maintenance contact, and no unresolved access/safety blockers.
Operational gate

19. Signoff Rules
The user’s intuition is correct: go-live signoff should be serious. If multiple electricians worked on the project, each required electrician should sign off on their assigned scope. If any required signoff is missing or negative, the project cannot go live. But the app must distinguish a valid technical objection from an ego conflict or payout dispute.
Signoff type
Who signs
What it means
Task signoff
Electrician assigned to a specific task.
I completed this work and the uploaded evidence is accurate.
Workstream signoff
Lead for ATS, DB, inverter/battery, roof/mounting, or metering workstream.
This workstream is ready for LBRS review.
Safety signoff
Qualified lead/signatory or inspector tier.
The installation meets safety and isolation requirements.
Crew signoff
All electricians who performed critical work.
No known unresolved issue prevents go-live.
e.mappa ops signoff
Internal or delegated reviewer.
Evidence and dry run are accepted; activation can proceed.

If someone refuses signoff
Required app behavior
Technical/safety reason
They must select a blocker category, describe the issue, upload evidence, and identify remediation. Project remains blocked until resolved or overridden by higher technical review.
Missing evidence
Project remains blocked until evidence is uploaded or task is re-inspected.
Personal conflict
Escalate to dispute process. It should not automatically pass, but the objection must be converted into a concrete technical claim or rejected by review.
Payment dispute
Separate payout dispute from safety signoff. Payment holds may continue, but go-live should be blocked only if safety/technical readiness is unresolved.

20. Live System View for Electricians
After go-live, the electrician should see a live system status screen similar to the owner/homeowner view, but with technician-level detail. It should show the building or home, energy flows, component health, faults, alerts, affected apartments, and maintenance actions.
Live view element
Electrician version
Visual system map
Apartment/home render with roof array, inverter, battery, Solar DB/changeover, ATS nodes, meters, KPLC fallback, and active energy path.
Component health
Inverter status, battery SoC/health, Solar DB status, ATS faults, meter data freshness, connectivity, breaker/SPD warnings.
Energy flows
Solar generated, direct solar consumed, battery charged/discharged, grid fallback, waste/curtailment/export where enabled.
Fault prioritization
Critical safety, outage/fallback, degraded performance, data missing, household-only request, scheduled maintenance.
Action buttons
Acknowledge, request access, schedule visit, order part, escalate to e.mappa, mark resolved, generate report.
Evidence history
Original install photos, as-built diagram, serial numbers, LBRS test results, prior maintenance logs.

21. Maintenance and Household Requests
There are two maintenance lanes: system-wide issues and household-specific requests. System-wide issues affect the e.mappa energy node and may be covered by maintenance reserve or project terms. Household requests are individual service calls that households pay out of pocket through the app, unless the issue is proven to be caused by project hardware or installation warranty.
Request type
Who pays
Examples
Guardrail
System-wide issue
Maintenance reserve, warranty, project operations, or responsible party depending on cause.
Inverter fault, battery issue, Solar DB fault, data outage, multiple ATS failures.
Requires root-cause evidence before payout.
Apartment/home activation issue
Project budget or activation fee depending on terms.
ATS not verified, meter mapping mismatch, resident connection pending.
Must not sell tokens until activation passes.
Household personal request
Household pays through app.
Extra outlet/circuit request, non-e.mappa wiring issue, appliance-side concern.
Must be scoped separately so electrician cannot create problems to be paid later.
Warranty callback
Electrician/crew or warranty pool depending on terms.
Fault tied to poor workmanship or failed installation evidence.
May reduce rating or hold payouts if negligence is proven.

Anti-scam maintenance rule
Electricians should not be able to profit from problems they caused. Every maintenance request needs root-cause tagging, evidence comparison against original LBRS records, warranty rules, and review for suspicious repeat patterns.

22. Electrician Wallet and Settlement
The wallet should be transparent. Electricians need to see exactly why money is available, pending, held, released, disputed, or flowing as revenue share. This matters because electricians carry real labor, transport, safety, and liability risk.
Income type
When earned
Release condition
DRS inspection payout
After verified site survey, capacity inputs, hardware requirements, and evidence pass review.
DRS work package accepted.
Installation milestone payout
During funded installation work.
Milestone evidence accepted; may include mobilization, rough-in, hardware install, ATS completion.
LBRS payout
After testing, remediation, and signoff.
LBRS reaches required state and evidence accepted.
Labor-as-capital
When electrician elects to convert labor value into infrastructure-pool claim.
Contract signed; revenue share begins only from monetized solar under pool rules.
Hybrid payout
Partial upfront cash plus unpaid balance converted into pool claim.
Cash milestones plus signed conversion terms.
Household request income
After household request is completed and accepted.
Household approval or dispute window closes.
Maintenance reserve work
After approved system maintenance task.
Root cause and work completion accepted.

22.1 Labor-as-Capital Treatment
Labor-as-capital should be optional, never the default. Electricians are not passive financiers; they carry execution risk and immediate cash costs. If they choose labor-as-capital, their labor value should usually become a claim on the infrastructure pool, not a claim on gross revenue unless the project deliberately redesigns the economics.
Economic rule
If electrician labor is valued at 35% of the infrastructure stack, that usually means 35% of the infrastructure/financier pool, not 35% of every shilling of gross revenue. Gross-revenue claims can starve providers, owners, reserves, financiers, and e.mappa.

23. Ranking, Reviews, and Reputation
Ranking should not be based only on speed. Fast unsafe work is worse than slow correct work. e.mappa should rank electricians by reliability, safety, evidence quality, timeliness, communication, issue resolution, customer reviews, and post-live performance.
Metric
How to measure
Risk if abused
Completion speed
Planned vs actual completion after adjusting for owner access, supplier delays, weather, and funding blockers.
Can reward shortcuts if used alone.
Safety quality
LBRS pass rate, rework rate, critical defect history, incident reports.
Must be heavily weighted.
Evidence quality
Completeness, clarity, correct mapping, serials, diagrams, photo standards.
Poor evidence breaks settlement and maintenance.
Reliability
Commitment follow-through, no-shows, response time, blocker updates.
Prevents project hoarding.
Technical scope
Project size and complexity successfully completed.
Avoid comparing small home jobs to complex apartment rollouts unfairly.
Post-live performance
Faults traced to workmanship, warranty callbacks, maintenance recurrence.
Captures hidden quality problems.
Owner/homeowner/resident reviews
Professionalism, communication, access handling, cleanliness, trust.
Needs moderation to avoid unfair retaliation.

24. Supplier, Provider, and Financier Interfaces from Electrician View
Electricians do not operate in isolation. Their project screen should expose the minimum useful information about suppliers/providers and financiers without leaking sensitive private details.
Stakeholder
Electrician should see
Electrician should not need
Suppliers
Available approved components, delivery status, substitutions, pickup/delivery contacts, warranty docs.
Supplier margins or unrelated inventory economics.
Providers
Panel specs, provider-owned array allocation, MPPT/string plan, roof-space responsibilities, serials.
Full provider financial model unless relevant to installation.
Financiers
Whether labor/equipment funding is available, milestone budget, payout hold rules, labor-as-capital terms.
Investor identities beyond what is required by contract and project governance.
Owner/homeowner
Access windows, site permissions, contact, constraints, site authority.
Private investment balances or unrelated personal data.
Residents/households
Unit/meter mapping, activation appointment, access approval, household request scope.
Personal financial details beyond token/activation state relevant to service.

25. Safety, Fraud, and Abuse Controls
Risk
Control
Fake electrician identity or portfolio
KYC, references, document review, portfolio verification, probation tier.
Project hoarding
Commitment capacity limits, active-project caps, no-show penalties, release-to-market rules.
Unsafe shortcuts
LBRS hard blockers, evidence requirements, senior review, incident penalties.
Unauthorized hardware substitution
Approved component library, substitution workflow, procurement lock, serial checks.
Wrong-apartment connection
Meter mapping, ATS test, resident/unit confirmation, token-state simulation, photo evidence.
Evidence fraud
Timestamp/GPS metadata, before/after comparison, random audits, second reviewer for high-risk items.
Maintenance scam
Root-cause audit, warranty matching, repeated issue detection, household dispute flow.
Collusion with suppliers/providers
BOM review, price reasonableness checks, alternate quotes, conflict disclosure.
Dissent abuse at signoff
Required technical reason, evidence upload, review path, separation of payment disputes from safety blockers.

26. Notifications and Alerts
Trigger
Notification
New nearby project
A project near you needs an electrician. DRS 72%, 3 blockers, 2-4 crew needed.
Project funding updated
Labor funding is now available / partial funding available / labor-as-capital option opened.
Owner access confirmed
Site access approved for Tuesday 9:00 AM - 2:00 PM.
DRS blocker assigned
Meter bank documentation is blocking DRS. Upload inspection evidence.
Hardware delivery delayed
Supplier delivery changed. Installation schedule may be affected.
LBRS failed item
ATS switching test failed for Unit B4. Remediation required.
Signoff requested
Your signoff is required before go-live. Review LBRS evidence.
Live fault detected
Battery monitoring offline / ATS fault detected / solar DB alert.
Household request
Unit A2 requested a service visit and approved estimated fee.
Payout released
KSh X released for DRS/LBRS/milestone completion.

27. Backend Data Model Additions
Entity
Core fields
ElectricianProfile
user_id, legal_name, phone, email, service_area, verification_status, certification_tier, payout_account_id, rating_summary, safety_status
ElectricianCredential
credential_id, user_id, document_type, document_url, issuing_body, expiry_date, review_status, reviewer_id, notes
TrainingProgress
user_id, module_id, status, score, attempts, completed_at, certification_result
Crew
crew_id, name, lead_user_id, status, service_area, rating_summary, verification_status
CrewMembership
crew_id, user_id, role, permissions, joined_at, status
ProjectOpportunity
project_id, site_type, geo_area, drs_score, lbrs_score, required_crew_size, funding_status, scope_tags, visibility_status
ProjectCommitment
commitment_id, project_id, electrician_user_id, crew_id, role, scope, payment_model, status, committed_at, capacity_lock_until
ElectricianTask
task_id, project_id, assigned_to, task_type, gate, status, due_at, evidence_required, blocker_status
WorkEvidence
evidence_id, task_id, uploaded_by, media_url, gps, timestamp, metadata, review_status, reviewer_notes
SignoffRecord
signoff_id, project_id, user_id, signoff_type, status, reason_if_declined, evidence_id, signed_at
ElectricianWalletLedger
ledger_id, user_id, project_id, source_type, amount_kes, status, hold_reason, payout_batch_id, created_at
LaborCapitalClaim
claim_id, user_id, project_id, labor_value_kes, pool_type, percentage_claim, terms_version, start_date, status
MaintenanceRequest
request_id, site_id, household_id, issue_type, payer_type, assigned_to, status, root_cause, invoice_id, evidence_id

28. Screen-Level UX Requirements
Area
UX requirement
Discover feed
Use high-quality cards, clear DRS/LBRS labels, proximity, crew need, funding status, and visual project photos. Avoid dense spreadsheet energy.
Project details
Layer complexity: summary first, then expandable technical sections. Electricians need depth without overload.
Task board
Make required actions obvious: what to do, why it matters, what evidence is needed, what happens after upload.
Evidence capture
Camera-first workflow with checklists, photo examples, serial scanning, meter mapping prompts, and offline-friendly draft saving.
LBRS
Must feel serious. Use red/yellow/green states, hard blockers, retest loops, and signoff screen.
Wallet
Separate cash milestones, pending review, labor-as-capital, revenue-share, maintenance, household requests, and disputes.
Profile
Make certification feel valuable. Show tier, badges, skills, crew, completed projects, safety record, and opportunities unlocked.

29. Non-Negotiable Decision Rules
Do not let an unverified electrician accept e.mappa projects.
Do not let a verified-but-uncertified electrician perform critical e.mappa work without completing the relevant training module.
Do not begin installation until DRS = 100%.
Do not go live until LBRS = 100%.
Do not allow UI percentages to override critical blockers.
Do not use common-bus injection as the apartment-building default.
Do not allow token purchases for apartments or homes that are not physically activation-ready.
Do not let an electrician silently substitute hardware outside approved specifications.
Do not treat labor-as-capital as default compensation. Upfront or milestone labor payment should be the default.
Do not pay labor-as-capital from gross revenue unless the entire waterfall is deliberately redesigned and disclosed.
Do not let one electrician block go-live without a concrete technical, safety, evidence, or compliance reason.
Do not let payment disputes masquerade as safety objections. Separate them while preserving true safety blockers.
Do not pay from generated solar, pledged demand, unpaid usage, or unverified readings.
Do not hide electrician ratings, safety record, certification limits, or scope restrictions from internal matching logic.
30. Demo Script - Electrician Joins and Moves a Project
Electrician opens e.mappa and selects “Electrician.”
They create an account, upload identity and work documents, enter experience, service area, and whether they work solo or with a crew.
They complete e.mappa certification training on DRS, LBRS, ATS allocation, hardware specs, safety, evidence capture, and settlement logic.
They pass the practice test and become a verified e.mappa electrician.
The app opens to Discover. They see nearby projects with photos, proximity, DRS score, funding status, required crew size, and scope.
They tap a project, review site details, current blockers, financier status, supplier/provider commitments, hardware needs, payment terms, and risk notes.
They commit as a lead, crew member, or task-specific electrician after accepting terms and evidence obligations.
The project appears in Projects. The electrician completes DRS tasks: site inspection, meter/DB photos, cable route, hardware requirements, capacity notes, and labor estimate.
When DRS reaches 100%, installation is scheduled. The crew completes the installation using approved hardware and uploads evidence throughout.
After physical completion, LBRS begins. The electrician completes safety, isolation, ATS, meter mapping, token-state, monitoring, and settlement dry-run tests.
Every required electrician signs off. One refusal must include a valid reason and evidence. If unresolved, the building/home does not go live.
When LBRS reaches 100% and signoffs pass, the project goes live. The electrician sees live system health, energy flows, and future maintenance alerts.
Wallet shows released DRS/LBRS/milestone payouts, labor-as-capital claims if selected, and any household request income.
31. Open Variables Before Build
Open variable
Recommended default
Exact verification documents by country/county
Start with flexible manual review in pilot; formalize by jurisdiction later.
Certification passing score
Require at least 80% overall and 100% on critical safety/no-backfeed/go-live questions.
Active project limits
Limit based on tier, crew size, distance, and completion history.
Lead selection in ad-hoc crews
Use certification tier + relevant experience + rating + schedule + acceptance. Require accountable signatory.
Milestone percentages
Define per project type; include mobilization, DRS completion, installation completion, LBRS completion, and retention/warranty hold.
Warranty hold
Consider holding 5-10% of labor payout for a short post-live defect window, but avoid making this punitive.
Household request pricing
Use visible quote + household approval before work begins, with e.mappa dispute window.
Maintenance reserve rules
Define what is covered by reserve, warranty, household payment, supplier warranty, or electrician negligence.

32. Final Product Positioning
Scenario D should make electricians feel like essential professionals in a new energy operating network. The app should help them find work, prove quality, get paid, build reputation, and participate in infrastructure economics when they choose. But the system must be strict where it matters: verification, certification, architecture, hardware standards, evidence, safety, go-live signoff, and settlement discipline.
Final operating principle
Electricians move the project. e.mappa governs the standard. The product succeeds only if experienced electricians feel respected while the platform still enforces the same safe, metered, prepaid, settlement-ready deployment pattern everywhere.

Source Context Used
This Scenario D document synthesizes the pasted electrician brief and the existing e.mappa materials for Scenario A residents, Scenario B apartment building owners, Scenario C homeowners, the installation/DRS/LBRS spec, the hardware architecture notes, the settlement/payback stress-test blueprint, and the AI-native operating-system framing.
