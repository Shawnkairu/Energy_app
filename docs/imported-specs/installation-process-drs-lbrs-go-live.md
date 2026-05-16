# Installation Process - DRS, LBRS, Deployment, Go-Live

> Source: `emappa_installation_process_deployment_and_go_live.docx`. Imported into repo as Markdown so code agents can reference the canonical product spec.

e.mappa

Installation Process

Project deployment, Deployment Readiness Score (DRS), Live Building Readiness Score (LBRS), electrician economics, and hardware checklists

| Scope<br>This is a product and implementation spec for e.mappa apartment-building deployment. It assumes the canonical v3 architecture: separate e.mappa solar bus, per-apartment ATS switching, KPLC fallback, prepaid-only energy usage, and settlement only on monetized solar. |
| --- |

## 1. Executive Summary

The installation process has two separate gates. First, the building owner initiates a project. That triggers DRS, which proves the project is ready to deploy. Second, after installation work is complete, LBRS proves the building is safe, tested, metered, switched, and settlement-ready. Only then can the building go live.

| Operating rule<br>DRS answers: “Should installation begin?” LBRS answers: “Can residents safely consume prepaid e.mappa energy now?” Both must be 100%. A single critical blocker keeps the score below 100%. |
| --- |

## 2. Correct Architecture Assumption

The installation process must use the v3 hardware model: separate e.mappa solar bus, dedicated Solar DB, per-apartment ATS switching at/near the individual meter point, per-apartment solar metering, and KPLC fallback. Do not design project deployment around common-bus injection.

| Layer | Canonical implementation |
| --- | --- |
| Generation | Provider-owned panels connect to hybrid inverter DC inputs. MPPT channels support provider-level production accounting. |
| Storage/conversion | Hybrid inverter manages battery charging/discharging and supplies the e.mappa solar bus. |
| Solar DB | Inverter AC output feeds a dedicated e.mappa Solar Distribution Board, not the KPLC/main common bus. |
| Per-apartment ATS | Each enrolled apartment gets an ATS between KPLC STS meter output, solar feed, and apartment cable riser. |
| KPLC fallback | When tokens run out or solar/battery is unavailable, ATS selects KPLC. KPLC and e.mappa sources do not mix. |
| Metering | System-level and apartment-level meters reconcile monetized solar for settlement. |

## 3. Deployment Readiness Score (DRS)

DRS is not part of owner onboarding. It begins only after a verified owner clicks to initiate a deployment project. DRS is a backend/project-ops gate that determines whether physical installation should proceed.

| DRS component | What must be true | Why it matters |
| --- | --- | --- |
| Owner authorization | Verified owner/manager authority, written rooftop/meter-area/cable-routing permission, access windows, site contact. | Without legal/site permission, no deployment. |
| Stakeholder availability | Vetted electricians/installers available; providers/suppliers available; financiers or equipment-as-a-service commitments available. | Stakeholders must be compliance-checked and committed to project terms. |
| Site inspection | KPLC meter bank documented, cable risers traced, roof assessed, Solar DB/ATS wall space measured, connectivity checked, structural/shading risks captured. | Electrician/site survey converts rough owner data into deployable facts. |
| Capacity plan | Array kW, battery usable kWh, inverter kW, max active apartments, ATS/meter count, reserve margin, expansion plan. | Capacity is finite. Do not promise every apartment service in phase one. |
| Demand proof | Resident pledges, load profiles, apartment mapping, expected daytime/evening demand, utilization forecast. | Under-utilization is the biggest economic risk. Demand must justify deployment. |
| Hardware package ready | Inverter, battery, Solar DB, ATS units, DIN rail meters, breakers, SPD, cable, conduit, mounting, connectivity, provider panels. | Components must match the curated checklist. No hidden missing parts. |
| Electrician payment / labor capital resolved | Labor cost funded upfront or explicitly converted into labor-as-capital terms. | Default: electricians paid upfront. Alternative requires formal opt-in and risk disclosure. |
| Contracts and waterfall terms | Provider, financier/labor-capital, owner host royalty, maintenance reserve, e.mappa fee, ownership/share terms. | Everyone must know which payout pool they are in before installation begins. |
| Regulatory/compliance review | Meter placement, zero-export/island-mode, anti-backfeed protection, electrician signoff requirements, local compliance notes. | If compliance is unresolved, do not deploy. |

## 4. DRS Scoring Model

The UI may show DRS as a percentage, but the backend should treat critical items as required gates. Suggested display weights are below. A critical blocker overrides the percentage and prevents “deployment-ready” status.

| Category | Display weight | Gate behavior |
| --- | --- | --- |
| Owner authorization and access | 10% | Critical |
| Stakeholder availability and vetting | 15% | Critical |
| Site inspection complete | 15% | Critical |
| Capacity plan approved | 15% | Critical |
| Demand proof / pledges / load confidence | 15% | Critical if demand below threshold |
| Hardware package and logistics ready | 15% | Critical |
| Electrician payment / labor-capital resolved | 10% | Critical |
| Contracts/compliance ready | 5% | Critical |

| DRS backend rule<br>DRS = 100 only when every required gate is complete. Example: a project can appear 90% ready, but if electrician payment is unresolved, deployment remains blocked. |
| --- |

## 5. Electrician Economics - Brutal Reality Check

Electricians are not like passive financiers. They carry execution risk, safety responsibility, liability, transport/logistics work, and local reputation risk. The default model should pay them upfront. Installation-as-a-service should be an optional advanced product, not the baseline.

| Model | How it works | Recommendation |
| --- | --- | --- |
| Model 1: Upfront labor payment | Electrician quotes labor + transport + logistics. Financiers/equipment funders/project budget pays before or during installation milestones. | Recommended default. Clean incentives; electrician is not forced to become an investor. |
| Model 2: Labor-as-capital | Electrician waives some/all upfront labor payment and receives a pro-rata claim in the infrastructure pool based on agreed labor value. | Possible, but risky. Requires signed opt-in, valuation of labor, payout risk disclosure, and no guaranteed return. |
| Model 3: Hybrid | Electrician receives partial upfront cash and converts the unpaid balance into infrastructure-pool participation. | Useful if project has partial capital but not enough to cover all labor. |

### 5.1 Correct Treatment of the “35% Labor Contribution” Example

If electrician labor/logistics is priced at 35% of total infrastructure cost, that does not automatically mean the electrician receives 35% of gross revenue. It means they contributed 35% of the infrastructure capital stack. Their claim should usually be 35% of the infrastructure/financier pool.

| Item | Example | Interpretation |
| --- | --- | --- |
| Total resident price | KSh 20/kWh | Gross revenue before waterfall. |
| Example recovery waterfall | Reserve 1, providers 6, infrastructure/financiers 10, owner 1, e.mappa 2 | The infrastructure pool is KSh 10/kWh, not KSh 20/kWh. |
| Electrician labor-as-capital share | 35% of infrastructure stack | Electrician receives 35% of the infrastructure pool. |
| Electrician payout in this example | 35% x KSh 10 = KSh 3.50/kWh | Not KSh 7/kWh unless contract grants 35% of gross. |
| Financier/provider effect | Remaining infrastructure contributors split 65% of infrastructure pool | Providers still receive provider pool; owner still receives host royalty. |

| Poke hole<br>Giving the electrician 35% of every shilling/kWh forever would likely break the economics unless the whole waterfall is redesigned. It may overpay labor relative to capital providers and starve provider, reserve, owner, or platform pools. Use pool-based claims instead. |
| --- |

## 6. Project Deployment Workflow

| Step | Action | System status |
| --- | --- | --- |
| 1. Owner initiates | Verified owner clicks deploy; DeploymentProject is created. | Project status = initiated/cooking. |
| 2. Stakeholders notified | Network receives project opportunity: providers/suppliers, financiers, electricians. | Each party sees building summary, rough capacity, location, terms, and readiness blockers. |
| 3. Electrician/site survey | Vetted electrician inspects meter bank, roof, cable routes, Solar DB/ATS locations, connectivity, safety constraints. | Inspection report becomes part of DRS. |
| 4. Capacity + BOM finalized | e.mappa/electrician/provider generates capacity plan and bill of materials. | Array size and apartment phase plan become concrete. |
| 5. Demand checked | Resident pledges and load profiles are evaluated against capacity and utilization target. | If demand weak, project remains cooking or paused. |
| 6. Funding/equipment/labor resolved | Providers/suppliers/equipment-as-a-service/financiers/labor-capital terms fill the cost stack. | Electrician payment must be solved before deployment. |
| 7. Contracts signed | Owner access, provider terms, financier/labor-capital terms, settlement waterfall, maintenance responsibilities. | No installation before the economics are agreed. |
| 8. DRS reaches 100% | All required gates green. | Project may be scheduled. |
| 9. Installation begins | Hardware installed, ATS connected, meters installed, app/backoffice records created. | Project status = installation in progress. |
| 10. Installation complete | Electrician marks physical work complete. | This does not mean building is live. LBRS begins. |

## 7. Hardware Checklist for DRS / Procurement

| Checklist group | Required items |
| --- | --- |
| Core system | Hybrid inverter (Growatt SPF 5000ES or Deye 5kW equivalent), 48V lithium battery, WiFi/GPRS monitoring dongle, provider panels, MPPT-compatible strings. |
| Solar DB | IP65 enclosure with DIN rail, main input breaker, individual apartment breakers, Type 2 SPD, total solar output meter. |
| Per-apartment switching | DIN rail ATS per enrolled apartment, per-apartment DIN rail energy meter or CT metering, short Solar DB-to-ATS cabling. |
| Cabling/mounting | PV DC cable, inverter-to-Solar-DB AC cable, PVC conduit/fittings, panel mounting rails/brackets, cable glands, earth bonding, connectors. |
| Connectivity | 4G router/Safaricom MiFi or reliable WiFi/cellular connectivity for inverter/backend monitoring. |
| Documentation | Photos, serial numbers, meter mapping, apartment mapping, wiring diagram, as-built diagram, signed electrician report. |

## 8. Live Building Readiness Score (LBRS)

LBRS starts after installation is physically complete. It is the go-live gate. Electricians should have a dedicated test screen where every required test is completed, photographed where useful, and signed off. A building should not go live if any required test fails.

| LBRS test | Pass condition | Why it matters |
| --- | --- | --- |
| As-built verification | Installed system matches approved design, BOM, serial numbers, wiring diagram, apartment map, and capacity plan. | Mismatch blocks launch until reconciled. |
| Electrical safety | Correct breakers, SPD, grounding/earthing, insulation, polarity, cable sizing, enclosure sealing, labeling, no exposed conductors. | Critical safety gate. |
| Solar bus isolation | Solar DB has no unintended connection to KPLC/main common bus. No backfeed into KPLC meter bank. | Critical compliance/safety gate. |
| Inverter/battery operation | Inverter powers solar bus in correct mode; battery charges/discharges; low-battery behavior works; monitoring reports. | Confirms controllable e.mappa supply. |
| ATS switching per apartment | For each enrolled apartment: KPLC input works, solar input works, output feeds correct apartment, switching is clean, failover works. | Prevents wrong-apartment allocation and unsafe switching. |
| Per-apartment meter mapping | Each apartment meter/CT maps to correct resident/unit and records solar-side consumption accurately. | Settlement depends on this. |
| Token-state switching simulation | Simulate token available, token exhausted, solar unavailable, KPLC unavailable, maintenance/suspend state. | Confirms app/backend logic can control or interpret source state. |
| Settlement dry run | Generate test readings; calculate E_gen, E_sold, E_waste, E_grid; run sample waterfall; verify no payout from unmonetized solar. | Prevents broken economics at launch. |
| Resident activation readiness | Capacity-cleared apartments mapped, residents notified, support instructions ready, no buy/top-up until apartment is activated. | Avoids selling undeliverable energy. |
| Owner/building launch packet | Owner sees live dashboard, maintenance contact, incident rules, host royalty statement format, access obligations. | Sets long-term operating expectations. |

## 9. LBRS Scoring Model

| Category | Display weight | Gate behavior |
| --- | --- | --- |
| As-built/BOM verification | 10% | Critical |
| Electrical safety tests | 20% | Critical |
| Solar bus isolation / no backfeed | 15% | Critical |
| Inverter + battery tests | 10% | Critical |
| ATS switching tests | 15% | Critical per apartment |
| Meter mapping + data reliability | 10% | Critical |
| Backend/token/settlement dry run | 10% | Critical |
| Resident/owner launch readiness | 10% | Operational gate |

## 10. Failure and Blocker Rules

| Blocker | Gate impact | Response |
| --- | --- | --- |
| No vetted electrician available | DRS blocked | Wait for vetted installer or onboard one. |
| Owner documents not verified | DRS blocked | Resolve authority before project can affect building. |
| Roof/meter area unsuitable | DRS blocked or redesign | Revise capacity, use different mounting/routing, or reject building. |
| Demand too low | DRS blocked/paused | Gather more pledges, reduce system size, or wait. |
| Electrician payment unresolved | DRS blocked | Raise capital, get provider/supplier financing, or use formal labor-as-capital opt-in. |
| Missing ATS/meter hardware | DRS blocked | Do not start installation with incomplete switching/metering package. |
| ATS maps to wrong apartment | LBRS blocked | Correct mapping and retest. |
| Solar DB backfeeds KPLC/common bus | LBRS blocked | Stop launch; redesign/rewire. |
| Inverter data missing | LBRS blocked or conservative operation | Fix connectivity/API or define manual fallback before go-live. |
| Settlement dry run fails | LBRS blocked | Fix accounting before residents can buy usable tokens. |

## 11. Backend Data Model

| Entity | Core fields |
| --- | --- |
| DeploymentProject | project_id, building_id, owner_id, status, drs_score, lbrs_score, blockers, initiated_at, installed_at, live_at |
| DRSChecklistItem | project_id, category, required, weight, status, blocker_type, evidence_url, reviewer_id, completed_at |
| LBRSChecklistItem | project_id, test_name, required, weight, status, measured_value, pass_threshold, evidence_url, signed_by |
| StakeholderCommitment | project_id, stakeholder_user_id, role, contribution_type, contribution_value_kes, payout_pool, status |
| ElectricianWorkOrder | project_id, electrician_id, labor_quote_kes, transport_kes, payment_model, upfront_paid_kes, labor_capital_kes |
| HardwareBOM | project_id, component_type, model, quantity, source, price_estimate_kes, serial_number, installed_status |
| ApartmentActivation | project_id, apartment_id, resident_id, ats_id, meter_id, capacity_status, switching_verified, activated_at |
| TestEvidence | project_id, item_id, file_url, notes, uploaded_by, timestamp |

## 12. Non-Negotiable Decision Rules

Do not begin installation until DRS = 100%.

Do not go live until LBRS = 100%.

Do not let UI percentages override critical blockers.

Do not assume electrician labor can be deferred; default to upfront payment.

Do not give labor-as-capital participants a gross-revenue claim unless the economics are intentionally redesigned.

Do not connect e.mappa solar to a common bus that serves non-enrolled apartments.

Do not allow token purchases for apartments that are not capacity-cleared, ATS-installed, meter-mapped, and switching-verified.

