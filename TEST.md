# e.mappa — Airtight Test & Trust Checklist

> e.mappa must become the **No. 1 trusted energy app in the world**. Nothing ships because it looks good. It ships only when product invariants, financial reconciliation, database durability, security, queryability, agent behavior, user workflows, and operational controls all pass.

> **Canonical product model:** [docs/imported-specs/](docs/imported-specs/README.md). DRS decisions are `deployment_ready` | `review` | `blocked` (all critical gates required for deployment_ready). LBRS gates go-live. Settlement uses **E_sold**, not E_gen.



Use these markers:
- `[ ]` not tested
- `[x]` passing
- `[!]` failing/blocking
- `[~]` not implemented yet

Every release candidate must be tested in:
- Mock mode: no backend URL, `@emappa/api-client` falls back to local projected data.
- API mode: backend URL configured, real FastAPI/Postgres path.
- Offline/degraded mode: backend unavailable, app fails gracefully without corrupting state.
- Role-scoped mode: resident, homeowner, building_owner, provider, financier, electrician, and admin.

---

## 0. Non-Negotiable Release Gates

The release is blocked if any item below fails.

- [ ] `npm install` succeeds from a clean checkout.
- [ ] `npm run typecheck` exits 0 across all workspaces.
- [ ] `npm run test:shared` exits 0 and prints shared domain success.
- [ ] `npm run test:backend` exits 0 once backend exists.
- [ ] Backend migrations run from empty database to latest schema.
- [ ] Seed pipeline creates canonical demo data without manual patching.
- [ ] All agent evals pass once `backend/evals/` exists.
- [ ] No critical/high security findings remain open.
- [ ] No screen has a dead action button, blank state, raw stack trace, or unreachable flow.
- [ ] No financial value is displayed without provenance or a clear mock/projected/estimated label.
- [ ] No stakeholder can access another building's private data.
- [ ] Settlement, ownership, prepaid, DRS, and payout invariants reconcile.

---

## 1. Product Doctrine Invariants

### 1.1 Prepaid Only
- [ ] Zero prepaid commitment blocks solar allocation.
- [ ] Zero prepaid commitment blocks stakeholder payout eligibility.
- [ ] DRS includes "No prepaid resident commitment" when prepaid is zero.
- [ ] Resident UI shows grid fallback instead of unpaid solar allocation.
- [ ] Prepaid balance never goes negative.
- [ ] Pending commitments do not count as confirmed allocation eligibility.
- [ ] Confirmed commitments update building prepaid totals exactly once.
- [ ] Refunded commitments are excluded from allocation eligibility.

### 1.2 DRS Gates Everything
- [ ] Funding release is blocked when DRS decision is `block`.
- [ ] Supplier lock is blocked when DRS decision is `block`.
- [ ] Electrician scheduling is blocked when DRS decision is `block`.
- [ ] Go-live is blocked when DRS decision is `block`.
- [ ] Any kill switch forces `block` regardless of weighted score.
- [ ] DRS recalculates after prepaid, ownership, gate, and energy config changes.
- [ ] DRS history preserves previous scores and reasons.
- [ ] UI explains blockers without hiding risk.

### 1.3 Monetized Solar Only
- [ ] Revenue is always `E_sold * solarPriceKes`.
- [ ] `E_gen` never directly creates revenue.
- [ ] `E_waste` never creates revenue.
- [ ] Curtailed/free-exported energy never creates revenue.
- [ ] Provider, financier, owner, and e.mappa payouts derive only from sold solar revenue.
- [ ] UI labels generated, sold, wasted, grid fallback, and projected values distinctly.

### 1.4 Ownership Controls Future Cashflows
- [ ] Ownership ledger totals 100% per building and pool.
- [ ] Selling shares reduces seller's future payout proportionally.
- [ ] Buying shares increases buyer's future payout proportionally.
- [ ] Transfer of more shares than owned fails.
- [ ] Transfer of zero or negative share fails.
- [ ] Ownership changes affect future payouts, not immutable historical settlement records.
- [ ] Ownership ledger changes are audit logged with before/after values.

### 1.5 Settlement Waterfall
- [ ] Settlement rates total 100%.
- [ ] Reserve + provider pool + financier pool + owner royalty + e.mappa fee equals revenue.
- [ ] Unallocated amount is zero or within 0.01 KES tolerance.
- [ ] Provider payouts sum to provider pool.
- [ ] Financier payouts sum to financier pool.
- [ ] Settlement cannot run for non-live buildings.
- [ ] Settlement cannot run without confirmed prepaid balance.
- [ ] Settlement records are immutable after creation.

---

## 2. Build, Toolchain & Workspace Health

### 2.1 Commands
- [ ] `npm install`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:shared`
- [ ] `npm run test:backend`
- [ ] `npm run build --workspace @emappa/mobile`
- [ ] `npm run build --workspace @emappa/website`
- [ ] `npm run build --workspace @emappa/cockpit`

### 2.2 Type Safety
- [ ] No implicit `any` in production TypeScript.
- [ ] All API responses are typed at the client boundary.
- [ ] All mobile screen props and component props are typed.
- [ ] Shared domain functions expose stable exported types.
- [ ] Backend Pydantic schemas match API client contracts.

### 2.3 Repo Hygiene
- [ ] Generated artifacts are ignored.
- [ ] `.env`, secrets, tokens, and credentials are not committed.
- [ ] New dependencies are justified and scoped.
- [ ] No duplicate formula logic exists in UI files.
- [ ] No unrelated visual or metadata churn is included in a release branch.

---

## 3. Shared Domain Logic

### 3.1 Energy
- [ ] `calculateEnergy` matches expected outputs for Nyeri Ridge A.
- [ ] `calculateEnergy` matches expected outputs for Karatina Court.
- [ ] `E_sold = E_direct + E_battery_used`.
- [ ] `E_grid = max(0, monthlyDemandKwh - E_sold)`.
- [ ] `E_waste` never becomes negative.
- [ ] Utilization is bounded between 0 and 1.
- [ ] Coverage is bounded between 0 and 1 unless explicitly modeled otherwise.
- [ ] Edge case: zero array size returns zero solar and full grid fallback.
- [ ] Edge case: zero demand does not divide by zero.
- [ ] Edge case: battery larger than excess solar does not invent energy.

### 3.2 Settlement
- [ ] Balanced rates pass validation.
- [ ] Unbalanced rates fail validation.
- [ ] All pool amounts round consistently.
- [ ] Waterfall reconciles to revenue within 0.01 KES.
- [ ] Zero sold energy produces zero revenue and zero payouts.
- [ ] Negative sold energy is rejected or normalized by invariant.

### 3.3 Ownership
- [ ] Valid ledgers total 100%.
- [ ] Invalid ledgers fail tests.
- [ ] Payouts are proportional to percentage.
- [ ] Transfer updates sender and recipient.
- [ ] Transfer preserves total ledger.
- [ ] Tiny decimal transfers do not break reconciliation.

### 3.4 DRS
- [ ] Score is between 0 and 100.
- [ ] Score weights are correct: demand 35%, prepaid 20%, load profile 15%, installation 10%, electrician/labor 10%, capital 10%.
- [ ] Score >= 80 with no kill switches approves.
- [ ] Score 65-79 with no kill switches reviews.
- [ ] Score < 65 blocks.
- [ ] Any kill switch blocks.
- [ ] Reasons list includes every active blocker.
- [ ] Reason text is stable enough for UI and tests.

### 3.5 Projector
- [ ] `projectBuilding` returns `project`, `energy`, `settlement`, `drs`, payouts, savings, funding progress, role views, transparency, and financier payback.
- [ ] Role views exist for all 7 roles.
- [ ] Resident view caps prepaid coverage appropriately.
- [ ] Owner view includes DRS gates.
- [ ] Provider view separates generated, monetized, waste, and grid fallback.
- [ ] Financier view includes committed capital, remaining capital, recovery, and utilization scenarios.
- [ ] Admin view includes alert/blocker count and settlement health.
- [ ] `auditAllDemoProjects` passes.

---

## 4. Backend & Database

### 4.1 FastAPI Contract
- [ ] `GET /health` returns `{status: "ok", db: "connected"}`.
- [ ] `GET /roles` returns exactly 7 role records.
- [ ] `GET /projects` returns projected buildings.
- [ ] `GET /projects/{id}` returns one projected building.
- [ ] Unknown project returns 404.
- [ ] `GET /roles/{role}/home` returns role, primary, projects, and activity.
- [ ] Unknown role returns 404.
- [ ] `POST /waitlist` validates input and persists lead.
- [ ] API responses use camelCase where the frontend expects camelCase.
- [ ] Numeric fields return numbers, not strings.

### 4.2 Postgres Durability
- [ ] Production endpoints use Postgres, not in-memory store.
- [ ] Alembic migrations create every required table from empty DB.
- [ ] Migrations are reversible where safe.
- [ ] Seed script is idempotent.
- [ ] Test DB fixtures isolate tests.
- [ ] Database constraints enforce non-negative amounts.
- [ ] Database constraints enforce valid project stages.
- [ ] Database constraints or transactional checks enforce ownership totals.
- [ ] Database constraints or transactional checks enforce settlement rate totals.
- [ ] Settlement records cannot be updated or deleted through API.

### 4.3 Auth & Authorization (Pilot: email OTP)
- [ ] `POST /auth/request-otp` accepts valid email addresses.
- [ ] OTP expires after configured TTL (10 minutes default).
- [ ] Wrong OTP returns 401.
- [ ] Expired OTP returns 401.
- [ ] Verified OTP returns JWT and user.
- [ ] Rate limit: same email cannot request more than 3 codes per 10-minute window.
- [ ] OTP delivery uses configured email provider in non-dev environments (no console fallback in staging/prod).
- [ ] `GET /auth/me` requires valid JWT.
- [ ] Protected endpoints reject missing token.
- [ ] Protected endpoints reject invalid token.
- [ ] Users only see buildings they are authorized for.
- [ ] Admin-only endpoints reject non-admin users.
- [ ] Agent tools enforce the same role/building scope as APIs.
- [ ] SMS-based OTP via Africa's Talking / Twilio.
- [ ] Phone-as-primary-identifier login.

### 4.4 Pledge API (Pilot mode for Prepaid)
- [ ] `POST /prepaid/commit` with `payment_method='pledge'` creates a confirmed pledge in one step.
- [ ] Amount <= 0 returns 400 or validation error.
- [ ] Unknown building returns 404.
- [ ] Pledge insert updates building pledged total.
- [ ] Balance endpoint returns confirmed pledge total.
- [ ] History endpoint returns sorted records, all tagged `payment_method='pledge'`.
- [ ] Pledge insert emits event/audit log.
- [ ] No UI string says "charge", "pay", "top up", or implies cash transfer.
- [ ] Every pledge / wallet screen renders the synthetic-data banner ("pledges are non-binding and no money is charged").
- [ ] Settlement run on a pledged building tags the resulting period `simulation=true` and produces no payout instruction.
- [ ] `POST /prepaid/{id}/confirm` two-step flow gated on real cash receipt.
- [ ] M-Pesa Daraja STK push, callback handling, idempotent confirmation.
- [ ] Refund and partial-commitment flows.
- [ ] Payout instructions to provider/financier/owner wallets.

### 4.4.1 Synthetic Energy Data
- [ ] Every `EnergyReading` carries `source ∈ {synthetic, measured}` and a non-empty `provenance` string.
- [ ] PVWatts adapter returns deterministic 8,760 hourly kWh for a given `(lat, lon, kw, tilt, azimuth)` and caches for 90 days.
- [ ] NASA POWER adapter returns hourly irradiance for any Kenyan lat/lon over the requested date range.
- [ ] Open-Meteo adapter returns today's hourly shortwave radiation per building lat/lon and caches for 30 minutes.
- [ ] Resident load profile generator is deterministic per `resident_id` and randomized only at the daily-total level.
- [ ] Cockpit and admin views render a "synthetic" badge on every chart fed by synthetic streams.
- [ ] Cockpit toggle hides / shows / mixes synthetic vs measured readings without breaking layout.
- [ ] Settlement period output records `data_source='synthetic'` when any contributing reading is synthetic.

### 4.4.2 Roof Footprint Capture
- [ ] Microsoft GlobalMLBuildingFootprints adapter returns a polygon and confidence for a known Nairobi address within 3 seconds.
- [ ] Owner can confirm an auto-suggested polygon → record stored with `roof_source='microsoft_footprints'`.
- [ ] Owner can tap roof corners on a satellite tile and the polygon closes correctly → `roof_source='owner_traced'`.
- [ ] Owner can type a manual sqm value → `roof_source='owner_typed'` with a low default `roof_confidence`.
- [ ] Shoelace area calculation matches a known reference polygon within ±2%.
- [ ] DRS surfaces a blocker if proposed array kWp exceeds the 5.5 m²/kWp rooftop budget.
- [ ] Cockpit building card renders the roof polygon overlay on the satellite tile.
- [ ] Google Solar API roof segmentation, tilt, azimuth, and shade analysis (when Kenya is added to Google coverage).

### 4.5 DRS API
- [ ] `GET /drs/{building_id}` returns current DRS.
- [ ] `GET /drs/{building_id}/history` returns sorted snapshots.
- [ ] `POST /drs/{building_id}/update` updates allowed gates only.
- [ ] DRS recalculates after update.
- [ ] DRS update is audit logged.
- [ ] DRS endpoint output matches shared formula parity tests.

### 4.6 Settlement API
- [ ] `POST /settlement/run` succeeds for live building with confirmed prepaid and balanced rates.
- [ ] Non-live building returns 400.
- [ ] Zero prepaid returns 400.
- [ ] Unbalanced rates return 400.
- [ ] History is sorted newest first.
- [ ] Latest returns most recent settlement.
- [ ] Waterfall endpoint returns current rates and projected monthly split.
- [ ] Provider and financier payout records reconcile to pools.

### 4.7 Ownership API
- [ ] `GET /ownership/{building_id}/provider` returns provider pool.
- [ ] `GET /ownership/{building_id}/financier` returns financier pool.
- [ ] Transfer succeeds with valid sender, recipient, pool, and percentage.
- [ ] Transfer rejects insufficient shares.
- [ ] Transfer rejects invalid pool.
- [ ] Transfer rejects zero/negative percentage.
- [ ] Transfer writes audit log.
- [ ] Projected payouts change after transfer.

### 4.8 WebSocket/Event API
- [ ] WebSocket connects by building ID.
- [ ] Unauthorized building WebSocket connection is rejected.
- [ ] Prepaid confirmation emits event.
- [ ] DRS recalculation emits event.
- [ ] Settlement run emits event.
- [ ] Ownership transfer emits event.
- [ ] Client reconnects after disconnect.
- [ ] Events include type, building ID, data, timestamp, and correlation ID.

---

## 5. API Client Boundary

### 5.1 Mock Mode
- [ ] `getApiMode()` returns `mock` with no base URL.
- [ ] Roles return from shared mock data.
- [ ] Projects return projected shared mock data.
- [ ] Role home works for every role.
- [ ] Waitlist stores local submission with `source: "local"`.
- [ ] Prepaid balance derives from mock project when API unavailable.
- [ ] Mock calls are deterministic enough for tests.

### 5.2 API Mode
- [ ] `configureApiClient({ baseUrl })` strips trailing slash.
- [ ] `getApiMode()` returns `api`.
- [ ] All remote calls use `baseUrl + path`.
- [ ] Auth token is sent when configured.
- [ ] API failures fall back to mock only where safe.
- [ ] Mutating calls show explicit success/failure feedback.
- [ ] No unhandled promise rejections.
- [ ] API and mock response shapes match.

### 5.3 Contract Drift
- [ ] TypeScript client types match backend schemas.
- [ ] Contract tests compare mock and API payloads.
- [ ] Missing fields fail tests.
- [ ] Extra backend fields do not break clients.
- [ ] Date/time formats are consistent.

---

## 6. Mobile App

### 6.1 App Shell
- [ ] App launches without red screen.
- [ ] Root gradient/surface matches official e.mappa palette.
- [ ] Status bar is readable.
- [ ] Safe areas are respected.
- [ ] App config can set `EXPO_PUBLIC_API_URL`.
- [ ] App works with API URL unset.
- [ ] App works with API URL set.
- [ ] App handles backend down without crash.

### 6.2 Auth Flow
- [ ] Landing screen routes to login.
- [ ] Phone input validates empty/invalid phone.
- [ ] Request OTP calls API in API mode.
- [ ] Mock mode can continue with demo OTP behavior.
- [ ] OTP input accepts 6 digits.
- [ ] Wrong OTP displays friendly error.
- [ ] Correct OTP stores session token/user.
- [ ] Role select appears after verification.
- [ ] Selected role persists.
- [ ] RoleGuard redirects unauthorized role route.
- [ ] Logout clears token/session once logout exists.

### 6.3 Role Navigation
- [ ] All 7 roles have home routes.
- [ ] All visible tabs navigate.
- [ ] Hidden flow screens are reachable through action buttons.
- [ ] No action rail button is inert.
- [ ] Back navigation works from every hidden flow screen.
- [ ] Tab switching preserves stable layout.
- [ ] Every route has a meaningful title/header or intentional hidden header.

### 6.4 Resident
- [ ] Home shows prepaid balance, solar coverage, savings, and building context.
- [ ] Wallet shows prepaid-only rule.
- [ ] Wallet top-up creates/confirm commitment in API mode.
- [ ] Wallet top-up shows success/error feedback.
- [ ] Usage separates solar, battery, grid fallback, and waste.
- [ ] Ownership explains provider-share ownership and future payout caveat.
- [ ] Profile shows building/session trust status.
- [ ] Support routes wallet, power, and share questions.

### 6.5 Owner
- [ ] Home shows building readiness and host economics.
- [ ] DRS screen shows score, decision, components, blockers, and gates.
- [ ] Deployment screen makes DRS gate status obvious.
- [ ] Earnings screen shows owner royalty from settlement output.
- [ ] Resident roster/invite flow is reachable.
- [ ] Approval/terms flow requires confirmation before mutation.

### 6.6 Provider
- [ ] Home shows provider payout and posture.
- [ ] Assets screen shows generated vs monetized output.
- [ ] Shares screen shows retained/sold ownership and impact.
- [ ] Earnings screen states payout only follows monetized kWh.
- [ ] Capacity commitment flow validates input and confirmation.
- [ ] Maintenance screen shows monitoring/warranty issues.

### 6.7 Financier
- [ ] Home shows named deal exposure, not pooled fund ambiguity.
- [ ] Deals screen lists building-specific opportunities.
- [ ] Deal detail shows DRS evidence, risks, and milestones.
- [ ] Portfolio shows recovery and remaining capital.
- [ ] Tranche release requires DRS/evidence gate.
- [ ] Stress-test route or equivalent scenario view is reachable.

### 6.8 Electrician
- [ ] Home shows assigned site/readiness.
- [ ] Checklist is interactive when backend supports it.
- [ ] Job detail captures proof/readings flow.
- [ ] Certification shows lead electrician gate.
- [ ] Maintenance tickets are reachable.
- [ ] Upload/photo actions request permission and handle denial.

### 6.9 Supplier
- [ ] Home shows RFQ/open request state.
- [ ] Quote requests can submit quote details when backend supports it.
- [ ] Orders can confirm delivery with tracking/proof.
- [ ] Catalog shows components, warranty, substitutes.
- [ ] Reliability shows proof gaps and score history.
- [ ] Supplier quote gate updates DRS when verified by authorized actor.

### 6.10 Admin
- [ ] Home shows ops command summary.
- [ ] Projects screen shows DRS and project stages.
- [ ] Alerts screen shows settlement/data/monitoring risks.
- [ ] Admin can toggle allowed DRS gates when backend supports it.
- [ ] Admin mutations require confirmation.
- [ ] Admin-only actions are hidden or rejected for non-admin users.

### 6.11 Mobile State Quality
- [ ] Every screen has loading state.
- [ ] Every screen has empty state.
- [ ] Every screen has error state.
- [ ] No raw error messages are shown to users.
- [ ] Minimum touch target is 44x44.
- [ ] Inputs have accessible labels.
- [ ] Color is never the only state indicator.
- [ ] Scroll performance is smooth on representative device.

---

## 7. Website

### 7.1 Public Trust Surface
- [ ] Marketing page loads.
- [ ] Copy states prepaid, DRS, monetized solar, ownership, and settlement truth clearly.
- [ ] Copy states that e.mappa aims to be the No. 1 trusted energy app in the world without making unverifiable performance claims.
- [ ] Public pages explain what is actual, projected, estimated, benchmarked, or mock.
- [ ] Public pages explain role boundaries and privacy boundaries.
- [ ] Public pages do not expose private building data.
- [ ] Public pages do not expose private counterparty finances.
- [ ] Public pages do not expose internal tickets, security findings, or agent audit logs.

### 7.2 Role Previews & Onboarding
- [ ] Role previews are consistent with mobile role data.
- [ ] Waitlist works in mock mode.
- [ ] Waitlist persists to backend in API mode.
- [ ] API failure shows graceful fallback.
- [ ] Waitlist submissions validate role, phone, and neighborhood.
- [ ] Waitlist duplicate handling is clear.
- [ ] Onboarding copy routes users to the right stakeholder path.
- [ ] If public "Ask e.mappa" exists, it answers only public product/onboarding questions.
- [ ] Public "Ask e.mappa" refuses building-specific private questions.

### 7.3 Website Quality
- [ ] SEO metadata is present.
- [ ] Responsive layouts work on mobile, tablet, desktop, and wide screens.
- [ ] Performance target: initial load under 3 seconds on representative network.
- [ ] Website works in API mode.
- [ ] Website works in mock mode.
- [ ] Website handles backend outage without blank page.

---

## 8. Cockpit

### 8.1 Internal Command Center
- [ ] Command center shows project pipeline.
- [ ] DRS queue lists blockers and clear gates.
- [ ] Settlement monitor reconciles waterfall integrity.
- [ ] Alert inbox shows unresolved risks.
- [ ] Stress test updates calculations from sliders.
- [ ] Stress test never treats wasted/generated energy as payout basis.
- [ ] Cockpit data comes from API mode when configured.
- [ ] Cockpit handles backend outage.
- [ ] Admin-only access is enforced once auth exists.
- [ ] Cockpit distinguishes actual, projected, estimated, benchmarked, and mock data.

### 8.2 Operations Queues
- [ ] Ticket queues show severity, owner, SLA, evidence, and agent summary once implemented.
- [ ] DRS blocker queue is filterable by building, severity, stage, and blocker type.
- [ ] Settlement queue shows reconciliation failures and unbalanced waterfalls.
- [ ] Monitoring queue shows connectivity outages and stale data.
- [ ] Ownership queue shows disputes, transfers, and approval state.
- [ ] Security queue shows findings, severity, evidence, owner, and status.
- [ ] Support queue shows resident/provider/owner/electrician/supplier issues by role.

### 8.3 Agent & Approval Workbench
- [ ] Cockpit shows agent run history by building.
- [ ] Cockpit shows tools called, citations/provenance, confidence, latency, and output.
- [ ] Cockpit allows human approval/rejection for high-risk agent recommendations.
- [ ] Cockpit blocks unapproved agent mutations for financial, ownership, settlement, deployment, and security actions.
- [ ] Cockpit records approver, timestamp, reason, and before/after state.

### 8.4 Cockpit Security
- [ ] Non-admin users cannot access cockpit.
- [ ] Admin actions require valid token and role.
- [ ] Sensitive exports are logged.
- [ ] Permission-denied clusters create security findings.
- [ ] Cockpit never exposes secrets or raw environment values.

---

## 9. Queryable e.mappa

### 9.1 Query Tools
- [ ] `query_building_state(building_id)` returns current project, DRS, prepaid, settlement, and ownership summary.
- [ ] `query_drs_status(building_id)` returns score, decision, components, reasons, gates, history provenance.
- [ ] `query_prepaid_ledger(building_id)` returns commitments with status and totals.
- [ ] `query_settlement_history(building_id)` returns immutable settlement records.
- [ ] `query_ownership_ledger(building_id, pool)` returns positions and total.
- [ ] `query_agent_audit_trail(building_id)` returns agent run history.
- [ ] `query_security_findings(scope)` returns scoped findings only.
- [ ] `query_open_tickets(scope, role)` returns authorized tickets only.

### 9.2 Provenance
- [ ] Every query response includes record IDs.
- [ ] Every query response includes timestamps.
- [ ] Every query response includes source system.
- [ ] Every query response includes permission scope.
- [ ] Every query response distinguishes actual, mock, projected, estimated, and benchmarked values.
- [ ] "Ask e.mappa" answers cite source records/tool outputs.
- [ ] "Ask e.mappa" refuses unauthorized data.
- [ ] "Ask e.mappa" says when data is missing or stale.

---

## 10. AI Agents & Evals

### 10.1 Agent Runtime
- [ ] Agent registry exists.
- [ ] Tool registry has typed input/output schemas.
- [ ] Tool calls enforce role/building permissions.
- [ ] Agent runs persist prompt version, model, actor, scope, input, output, tools, citations, latency, and approval state.
- [ ] High-risk mutations require human approval.
- [ ] Agent failures degrade gracefully.
- [ ] Agent timeouts are enforced.
- [ ] Agent retries are bounded and logged.

### 10.2 DRS Assessment Agent
- [ ] Calls `get_building_data`.
- [ ] Calls `calculate_drs`.
- [ ] Uses prepaid, ownership, settlement, and comparable data when relevant.
- [ ] Identifies approve/review/block correctly.
- [ ] Lists active blockers exactly.
- [ ] Provides at least two actionable recommendations.
- [ ] Does not hallucinate numbers.
- [ ] Labels output as AI assessment, not authoritative decision.

### 10.3 Query Assistant Agent
- [ ] Answers role-scoped building questions.
- [ ] Cites records/tool outputs.
- [ ] Refuses private counterparty finances.
- [ ] Handles "I don't know" when data is unavailable.
- [ ] Does not cross tenant/building boundaries.

### 10.4 Ticket-Routing Agent
- [ ] Routes DRS blockers to DRS queue.
- [ ] Routes prepaid/payment issues to payment/support queue.
- [ ] Routes supplier quote gaps to supplier ops queue.
- [ ] Routes electrician readiness to electrician ops queue.
- [ ] Routes monitoring outages to technical ops queue.
- [ ] Routes settlement anomalies to finance ops queue.
- [ ] Routes ownership disputes to governance queue.
- [ ] Assigns severity correctly.
- [ ] Requires evidence for resolution.

### 10.5 Security-Triage Agent
- [ ] Detects auth bypass risk.
- [ ] Detects tenant isolation risk.
- [ ] Detects exposed secret risk.
- [ ] Detects missing audit log risk.
- [ ] Detects unsafe CORS/config risk.
- [ ] Detects rate-limit risk.
- [ ] Produces severity, evidence, impact, and recommended fix.
- [ ] Routes critical findings for human review.

### 10.6 Code-Review Agent
- [ ] Flags formula drift.
- [ ] Flags missing tests for backend endpoints.
- [ ] Flags UI recomputation of shared formulas.
- [ ] Flags insecure token/session handling.
- [ ] Flags unauthorized data access.
- [ ] Flags unhandled promise rejections.
- [ ] Flags dead action buttons.
- [ ] Produces file/symbol-grounded findings.

### 10.7 Eval Harness
- [ ] DRS evals cover approve, review, block, no prepaid, missing electrician, missing supplier quote, low utilization.
- [ ] Query evals cover correct answer, refusal, stale data, missing data, and private data.
- [ ] Ticket evals cover all queues and severity levels.
- [ ] Security evals cover auth, RBAC, tenant isolation, secrets, audit, rate limits.
- [ ] Code-review evals cover formula drift, missing tests, auth bypass, privacy leak.
- [ ] Hallucination eval checks every numeric claim against tool output.
- [ ] Privacy eval checks no unauthorized private finances are disclosed.
- [ ] Eval regressions fail CI.

---

## 11. Security, Privacy & Compliance

- [ ] JWT secret is not default in production.
- [ ] Secrets are loaded only from environment/secret manager.
- [ ] CORS is restricted in production.
- [ ] Rate limiting protects auth and mutating endpoints.
- [ ] All inputs are validated.
- [ ] All mutations are audit logged.
- [ ] Audit logs include actor, role, endpoint/tool, before/after, reason, timestamp, request ID.
- [ ] Tenant isolation tests cover every API and agent tool.
- [ ] Admin routes reject non-admin users.
- [ ] Private counterparty financials are never exposed to unauthorized roles.
- [ ] Data export attempts are logged.
- [ ] Failed auth spikes create security findings.
- [ ] Dependency vulnerability scan has no critical open issues.
- [ ] Mobile session storage does not leak token in logs.
- [ ] No secret appears in bundle, logs, screenshots, or committed files.

---

## 12. Operations, Tickets & Incident Response

- [ ] Ticket model includes ID, building, role scope, severity, category, status, owner, evidence, agent summary, timestamps, and resolution.
- [ ] DRS blocker tickets are created from unresolved gates.
- [ ] Settlement anomaly tickets are created from reconciliation failures.
- [ ] Monitoring outage tickets are created from connectivity events.
- [ ] Ownership dispute tickets require governance approval.
- [ ] Security findings create security tickets.
- [ ] Ticket status transitions are validated.
- [ ] Resolution requires evidence.
- [ ] Agent-drafted resolutions require human approval for financial/security/deployment/ownership impact.
- [ ] Cockpit shows queue health and SLA.
- [ ] Incident timeline is reconstructable from events and audit logs.

---

## 13. Reconciliation & Drift Prevention

- [ ] TypeScript and Python energy outputs match within 0.01.
- [ ] TypeScript and Python settlement outputs match within 0.01.
- [ ] TypeScript and Python DRS outputs match.
- [ ] TypeScript and Python ownership payouts match within 0.01.
- [ ] TypeScript and Python payback outputs match.
- [ ] TypeScript and Python projector role views match for all roles.
- [ ] Reconciliation job detects prepaid mismatch.
- [ ] Reconciliation job detects settlement waterfall mismatch.
- [ ] Reconciliation job detects ownership ledger mismatch.
- [ ] Reconciliation job detects payout pool mismatch.
- [ ] Reconciliation job detects stale DRS blockers.
- [ ] Formula changes require updated tests and migration notes if persisted data is affected.

---

## 14. Accessibility, Performance & Reliability

### 14.1 Accessibility
- [ ] All controls have accessible names.
- [ ] Form errors are announced/readable.
- [ ] Text contrast passes WCAG AA.
- [ ] Touch targets are at least 44x44.
- [ ] State is conveyed by text/icon, not color alone.
- [ ] Screen reader navigation follows logical order.

### 14.2 Performance
- [ ] Mobile cold start under 3 seconds on representative device.
- [ ] Website initial load under 3 seconds.
- [ ] Cockpit initial load under 3 seconds.
- [ ] `GET /health` under 50ms.
- [ ] Read endpoints under 200ms average.
- [ ] Settlement run under 500ms for demo-sized project.
- [ ] Agent DRS assessment returns under 15 seconds.
- [ ] No obvious memory leaks in WebSocket/event flows.

### 14.3 Reliability
- [ ] Backend restart does not lose persisted data.
- [ ] Mobile handles network loss.
- [ ] Mobile retries or refreshes without duplicate mutation.
- [ ] Mutating endpoints are idempotent or protected from double-submit.
- [ ] Event delivery handles reconnect.
- [ ] Empty states guide next action.
- [ ] Error states are user-friendly and logged.

---

## 15. Demo Walkthroughs

### 15.1 Resident Demo
- [ ] Login with phone/OTP.
- [ ] Select resident role.
- [ ] View prepaid balance.
- [ ] Top up prepaid.
- [ ] Confirm balance update.
- [ ] View usage split.
- [ ] View ownership education.
- [ ] Ask e.mappa why allocation is or is not available.

### 15.2 Owner Demo
- [ ] Login/select owner.
- [ ] View DRS.
- [ ] See blockers and gates.
- [ ] Invite residents.
- [ ] Start deployment only when DRS allows.
- [ ] Ask e.mappa what blocks deployment.

### 15.3 Provider Demo
- [ ] Login/select provider.
- [ ] View monetized vs generated energy.
- [ ] View retained/sold ownership.
- [ ] Track payout.
- [ ] Sell shares with confirmation when implemented.

### 15.4 Financier Demo
- [ ] Login/select financier.
- [ ] View named building deal.
- [ ] Review DRS evidence.
- [ ] Track recovery.
- [ ] Release tranche only when gates pass.

### 15.5 Electrician Demo
- [ ] Login/select electrician.
- [ ] View job.
- [ ] Complete checklist.
- [ ] Upload proof/readings.
- [ ] Confirm certified electrician gate.

### 15.6 Supplier Demo
- [ ] Login/select supplier.
- [ ] View RFQ.
- [ ] Submit quote.
- [ ] Confirm delivery.
- [ ] Upload warranty/proof.

### 15.7 Admin/Ops Demo
- [ ] Login/select admin.
- [ ] Review project pipeline.
- [ ] Resolve DRS alert.
- [ ] Pause unsafe settlement.
- [ ] Review ticket queue.
- [ ] Review agent audit trail.
- [ ] Review security finding.

---

## 16. Required Execution Order

Run in this order. Do not continue after a blocking failure unless the task is specifically to fix that failure.

1. Install and workspace health.
2. Shared domain tests.
3. Backend unit/API/database tests.
4. TypeScript typecheck.
5. API client mock/API contract tests.
6. Security and tenant isolation tests.
7. Formula parity and reconciliation tests.
8. Agent evals.
9. Mobile mock-mode walkthrough.
10. Mobile API-mode walkthrough.
11. Website walkthrough.
12. Cockpit walkthrough.
13. Operations/ticket/security triage walkthrough.
14. Performance/accessibility pass.
15. Final full demo walkthrough across all roles.

---

## 17. Ship-Ready Definition

e.mappa is ship-ready only when:

- [ ] All roadmap benchmarks pass.
- [ ] All tests in this file pass or are explicitly marked not implemented with owner/date.
- [ ] All critical/high security issues are closed.
- [ ] All financial and energy invariants reconcile.
- [ ] All agent evals pass.
- [ ] All role workflows complete without dead ends.
- [ ] All material claims are traceable to source data.
- [ ] A fresh checkout can install, migrate, seed, test, and run without undocumented steps.

