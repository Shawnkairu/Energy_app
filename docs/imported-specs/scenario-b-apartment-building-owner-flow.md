# Scenario B - Apartment Building Owner Flow

> Source: `emappa_scenario_b_apartment_building_owner_flow.docx`. Imported into repo as Markdown so code agents can reference the canonical product spec.

e.mappa

Apartment Buildings — Scenario B

Apartment building owner onboarding, inactive/live states, dashboards, ownership, and project initiation

| Scope<br>This is a product and implementation spec for e.mappa apartment-building deployment. It assumes the canonical v3 architecture: separate e.mappa solar bus, per-apartment ATS switching, KPLC fallback, prepaid-only energy usage, and settlement only on monetized solar. |
| --- |

## 1. Executive Summary

Scenario B is the apartment building owner experience. The building owner is not treated as the infrastructure buyer by default. Their primary role is to provide verified site access: roof, meter-area access, cable-routing permission, maintenance access, and long-term hosting stability. In return, the owner can earn a host royalty from monetized solar and may optionally buy a separate ownership stake in the array or infrastructure pool.

| Product law<br>A building owner can initiate a deployment project, but initiation is not the same as installation. Installation begins only when Deployment Readiness Score (DRS) reaches 100%. The building goes live only when Live Building Readiness Score (LBRS) reaches 100%. Owner cashflow appears only after prepaid solar is actually consumed. |
| --- |

## 2. What Makes Sense vs. What Needed Correction

| Claim / design idea | Decision | Reason |
| --- | --- | --- |
| Owner verifies building ownership | Yes | Required before a project can affect residents, roof access, wiring, or revenue rights. Use ownership documents, lease/management authority, ID/KRA/PIN where applicable, and manual review for edge cases. |
| Roof capacity is checked during onboarding | Partly | A rough roof estimate can happen during onboarding, but final array sizing belongs in project qualification/DRS after site inspection, shading, structure, load, cable path, and capacity plan are reviewed. |
| Owner clicks “deploy project” and e.mappa starts cooking up a project | Yes | Good product metaphor. Keep it as a polished project-assembly state, not a promise that installation has begun. |
| DRS and LBRS must both be 100% | Yes, with care | Use them as gate checklists. The UI can show percentages, but backend should treat critical blockers as binary: one failed safety/legal/electrical item keeps the score below 100%. |
| Pre-live owner screens show energy usage vs. grid | Needs correction | Before the building is live, show projected/synthetic usage, resident pledges, load-profile confidence, and expected solar/grid split. Do not show live energy flow if no energy is flowing. |
| Owner can own a slice of infrastructure/array | Yes | But ownership is separate from host royalty. A building owner may earn host royalty as site host and separate owner payouts if they buy shares. Do not blur the two. |
| Electricians can be paid upfront or contribute labor as capital | Yes, optional | Default should be upfront payment. Installation-as-a-service is possible only if the electrician knowingly opts in, the labor value is priced fairly, and they accept revenue risk. |
| Electrician contributing 35% of infra cost gets 35% of every shilling/kWh | No | They should get 35% of the infrastructure/financier pool, not 35% of gross revenue, unless the project deliberately grants them 35% of gross revenue, which would likely starve other stakeholders. |

## 3. Owner Onboarding Flow

| Step | Owner experience | Implementation note |
| --- | --- | --- |
| Welcome | Owner sees e.mappa positioned as a way to turn roof and building access into a local energy economy without personally buying the default infrastructure. | Primary CTA: “Enroll my building.” |
| Account setup | Email/phone OTP, legal name, contact details, optional company/management entity. | Pilot can be manual-reviewed. Production should support KYC/KYB. |
| Choose role | Select “I own or manage an apartment building.” | If the user is a property manager, capture authority separately from ownership. |
| Building location | Building name, address, pin/location, number of apartments, floors, meter-bank location if known. | Do not require technical electrical knowledge at this stage. |
| Ownership / authority verification | Upload title deed, lease/management agreement, tax/utility documents, national ID/company documents, photos, and contact for manual verification. | Verification status: pending, verified, rejected, needs more info. |
| Initial building profile | Apartment count, approximate roof type, roof access, known shaded areas, available meter area, resident occupancy, current pain points. | This creates the first project shell, not final technical approval. |
| Soft capacity preview | Show rough possible array capacity and “needs inspection” badge. | Avoid pretending roof capacity is final before inspection. |
| Deploy prompt | Ask: “Are you ready to initiate a project for this building?” | Yes creates a Deployment Project and starts DRS. No keeps building enrolled but inactive. |

## 4. Owner Building State Machine

| State | Reality | Owner Home UI |
| --- | --- | --- |
| B0: Owner account created | Owner exists but no verified building yet. | Verification card, add building CTA, document checklist. |
| B1: Building submitted | Building info exists; ownership/authority review pending. | Verification progress, missing document prompts. |
| B2: Building verified, inactive | Owner is verified but has not initiated deployment. | Education, roof/site benefits, resident demand signals if residents have pledged. |
| B3: Project initiated / cooking | Owner clicked deploy; DRS is active. | DRS timeline, blockers, stakeholder assembly, demand progress, capacity plan. |
| B4: Deployment-ready | DRS = 100%; project may be scheduled for installation. | Installation schedule, contract packet, owner access obligations. |
| B5: Installation in progress | Hardware installation and apartment connection work underway. | Milestone timeline, safety notices, apartment activation sequence. |
| B6: Installed, testing / LBRS | Installation is complete but building is not live yet. | LBRS checklist, failed tests, retest dates, launch blockers. |
| B7: Live building | LBRS = 100%; eligible apartments can use e.mappa via ATS. | Live health, cashflow, solar/battery/grid, owner royalty, incidents. |
| B8: Live with maintenance issue | Building live but one or more components are degraded. | Incident status, affected apartments, reserve/maintenance action. |
| B9: Suspended / paused | Critical safety, compliance, tamper, contract, or data issue. | Clear reason, remediation checklist, KPLC fallback remains available. |

## 5. Owner App Screens

| Screen | What it shows | Guardrail |
| --- | --- | --- |
| Home - pre-live | Project status, “cooking” animation/timeline, DRS progress, current blockers, resident demand/pledges, capacity estimate, next owner action. | All energy data labeled projected/synthetic. |
| Home - live | Project status, array output, battery state of charge, inverter health, Solar DB/ATS status, apartment connection summary, incidents, token flow diagram. | Show apartment building visual with roof array, inverter, battery, Solar DB, ATS nodes, and KPLC fallback path. |
| Energy - pre-live | Building load estimate, pledged demand, projected solar coverage, projected grid fallback, load-profile confidence, capacity phase plan. | No fake real-time flow. |
| Energy - live | Building load, energy served from array/battery, grid fallback, solar sold, wasted/curtailed solar, utilization, apartment-level token consumption summary. | If owner owns shares, include generation and ownership-linked earnings panels. |
| Wallet - pre-live | Host royalty education, projected ranges, no-cashflow-yet banner, optional ownership education once terms are approved. | No payout numbers before revenue exists except projections clearly labeled. |
| Wallet - live | Host royalty earned, balance, cash-out status, settlement statements, share earnings if owner owns array/infra, reserve/maintenance notices. | Separate host royalty from investment income. |
| Profile | Owner identity, building documents, bank/M-Pesa details, permissions, contacts, notification preferences, support. | Include change-of-owner and manager delegation flow later. |

## 6. Ownership for Building Owners

The owner can remain asset-light and earn only a hosting royalty, or they can buy a separate stake in the system. These are different economic identities.

| Economic role | Meaning | Payout basis |
| --- | --- | --- |
| Host royalty | Payment for roof/site access, meter-area access, maintenance cooperation, and long-term building stability. | Owner earns as building host only when monetized solar revenue exists. |
| Array share | Ownership in provider-side generation pool. | Owner receives pro-rata share of provider/array pool from monetized kWh tied to that asset. |
| Infrastructure share | Ownership in battery, inverter, Solar DB, ATS hardware, metering, wiring, monitoring, installation capital. | Owner receives pro-rata share of infrastructure/financier pool, subject to recovery/royalty phase terms. |
| Bundled project share | Blended ownership of generation and infrastructure economics. | Simpler but must disclose valuation basis and risks. |

| Owner ownership rule<br>Ownership changes who receives an existing payout pool. It does not create extra revenue. A building owner who owns 10% of the infrastructure pool receives 10% of the infrastructure pool, not 10% of gross revenue plus host royalty unless explicitly contracted. |
| --- |

## 7. Data Model Additions

| Entity | Core fields |
| --- | --- |
| BuildingOwnerProfile | user_id, legal_name, phone, email, verification_status, kyc_status, payout_account_id |
| Building | building_id, owner_user_id, address, geo_location, apartment_count, meter_bank_location, roof_type, status |
| BuildingVerification | building_id, document_type, document_url, reviewer_id, status, notes, verified_at |
| DeploymentProject | project_id, building_id, initiated_by, status, drs_score, lbrs_score, initiated_at, target_go_live_date |
| OwnerRoyaltyAccount | building_id, royalty_rate_rule, current_balance, lifetime_earned, payout_status |
| BuildingHealthSnapshot | building_id, inverter_status, battery_soc, battery_health, solar_db_status, ats_fault_count, last_updated |
| OwnerAssetShare | owner_user_id, building_id, asset_id, asset_type, percentage, acquisition_price_kes, valuation_method |

## 8. Non-Negotiable Decision Rules

Do not show live energy flow before the building is live; show projections only.

Do not imply that clicking deploy means installation has started.

Do not route solar through a shared common bus where non-enrolled apartments can receive free solar.

Do not sell owner investment shares without valuation basis, risk disclosure, and project terms.

Do not pay owner royalty from pledged demand, generated-but-unsold solar, or unpaid usage.

Do not hide DRS/LBRS blockers. The owner should see exactly what is preventing deployment or launch.

Do not make building owners responsible for default infrastructure purchase unless they voluntarily buy shares.

## 9. Demo Script - Owner Initiates a Project

Owner opens e.mappa, selects “I own or manage an apartment building,” and creates an account.

Owner adds the building location, apartment count, and uploads ownership/authority documents.

After verification, the owner sees an inactive building dashboard with resident interest signals and a deploy CTA.

Owner taps “Initiate project.” The app starts a polished “cooking up your energy economy” project timeline.

The home screen shows DRS progress: stakeholders, site inspection, capacity plan, hardware/capital, electrician payment readiness, and resident demand.

When DRS reaches 100%, installation is scheduled. Owner sees access obligations and installation timeline.

After installation, the app switches to LBRS: safety tests, ATS switching tests, metering verification, inverter/battery tests, settlement dry run.

