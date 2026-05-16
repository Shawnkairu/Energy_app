import { projectBuilding, type ProjectedBuilding } from "./projector";
import type {
  AuthSession,
  BuildingProject,
  LbrsInputs,
  OperationalWorkflowId,
  OperationalWorkflowSnapshot,
  ProjectStage,
  PublicRole,
  Role,
} from "./types";
import { demoProjects } from "./mockData";

export type SyntheticScenarioPhase =
  | "onboarding"
  | "drs"
  | "funding"
  | "supplier"
  | "install"
  | "go_live"
  | "settlement";

export type SyntheticFailureMode = "none" | "supplier_quote_lapse" | "ats_mapping_gap" | "settlement_data_gap";

export type SyntheticEventStatus = "done" | "active" | "upcoming" | "blocked";

export interface SyntheticScenarioDefinition {
  id: string;
  title: string;
  sourceSpec: string;
  description: string;
  baseProject: BuildingProject;
}

export interface SyntheticTimelineEvent {
  id: string;
  phase: SyntheticScenarioPhase;
  day: number;
  at: string;
  title: string;
  detail: string;
  roles: Array<PublicRole | "admin">;
  status: SyntheticEventStatus;
  sourceSpec: string;
}

export interface SyntheticScenarioState {
  scenarioId: string;
  title: string;
  sourceSpec: string;
  phase: SyntheticScenarioPhase;
  phaseIndex: number;
  failureMode: SyntheticFailureMode;
  project: ProjectedBuilding;
  events: SyntheticTimelineEvent[];
  roleTimelines: Record<PublicRole | "admin", SyntheticTimelineEvent[]>;
  controls: {
    canAdvance: boolean;
    nextPhase: SyntheticScenarioPhase | null;
    failureModes: SyntheticFailureMode[];
  };
  outcomes: {
    drsDecision: ProjectedBuilding["drs"]["decision"];
    lbrsDecision: ProjectedBuilding["lbrs"]["decision"];
    stage: ProjectStage;
    monetizedKwh: number;
    settlementRevenueKes: number;
    financierPaybackYears: number | null;
  };
}

export interface ReplaySyntheticScenarioOptions {
  scenarioId?: string;
  phase?: SyntheticScenarioPhase;
  failureMode?: SyntheticFailureMode;
  now?: string;
}

const publicRoles: PublicRole[] = ["resident", "homeowner", "building_owner", "provider", "financier", "electrician"];

export const syntheticScenarioPhases: SyntheticScenarioPhase[] = [
  "onboarding",
  "drs",
  "funding",
  "supplier",
  "install",
  "go_live",
  "settlement",
];

export const syntheticFailureModes: SyntheticFailureMode[] = [
  "none",
  "supplier_quote_lapse",
  "ats_mapping_gap",
  "settlement_data_gap",
];

const scenarioDefinitions: SyntheticScenarioDefinition[] = [
  {
    id: "scenario-a-apartment-operating-system",
    title: "Scenario A apartment operating-system replay",
    sourceSpec: "docs/imported-specs/scenario-a-resident-ats-capacity-ownership-trading-spec.md",
    description:
      "Synthetic apartment lifecycle from resident demand signal through readiness, funding, field execution, go-live, settlement, and payback.",
    baseProject: demoProjects[0],
  },
];

const phaseDay: Record<SyntheticScenarioPhase, number> = {
  onboarding: 0,
  drs: 7,
  funding: 14,
  supplier: 20,
  install: 28,
  go_live: 36,
  settlement: 66,
};

const phaseStage: Record<SyntheticScenarioPhase, ProjectStage> = {
  onboarding: "pre_onboarding",
  drs: "review",
  funding: "funding",
  supplier: "supplier",
  install: "install",
  go_live: "live",
  settlement: "live",
};

export function getSyntheticScenarioDefinitions() {
  return scenarioDefinitions;
}

export function replaySyntheticScenario(options: ReplaySyntheticScenarioOptions = {}): SyntheticScenarioState {
  const definition = scenarioDefinitions.find((item) => item.id === options.scenarioId) ?? scenarioDefinitions[0];
  const phase = options.phase ?? "settlement";
  const failureMode = options.failureMode ?? "none";
  const phaseIndex = phaseIndexOf(phase);
  const projectInput = applyFailure(applyPhase(definition.baseProject, phase), failureMode);
  const project = projectBuilding(projectInput);
  const events = buildTimeline(definition, phase, failureMode, options.now ?? "2026-05-15T00:00:00.000Z");
  const roleTimelines = buildRoleTimelines(events);
  const nextPhase = syntheticScenarioPhases[phaseIndex + 1] ?? null;

  return {
    scenarioId: definition.id,
    title: definition.title,
    sourceSpec: definition.sourceSpec,
    phase,
    phaseIndex,
    failureMode,
    project,
    events,
    roleTimelines,
    controls: {
      canAdvance: Boolean(nextPhase),
      nextPhase,
      failureModes: syntheticFailureModes,
    },
    outcomes: {
      drsDecision: project.drs.decision,
      lbrsDecision: project.lbrs.decision,
      stage: project.project.stage,
      monetizedKwh: project.energy.E_sold,
      settlementRevenueKes: project.settlement.revenue,
      financierPaybackYears: project.financierPayback.notCurrentlyRecovering
        ? null
        : project.financierPayback.yearsToPrincipal,
    },
  };
}

export function getSyntheticRoleTimeline(role: PublicRole | "admin", state = replaySyntheticScenario()) {
  return state.roleTimelines[role] ?? [];
}

export function compareSyntheticScenarioOutcomes(
  failureMode: Exclude<SyntheticFailureMode, "none">,
  phase: SyntheticScenarioPhase = "settlement",
) {
  const base = replaySyntheticScenario({ phase, failureMode: "none" });
  const variant = replaySyntheticScenario({ phase, failureMode });
  return {
    base,
    variant,
    delta: {
      monetizedKwh: variant.outcomes.monetizedKwh - base.outcomes.monetizedKwh,
      settlementRevenueKes: variant.outcomes.settlementRevenueKes - base.outcomes.settlementRevenueKes,
      drsChanged: variant.outcomes.drsDecision !== base.outcomes.drsDecision,
      lbrsChanged: variant.outcomes.lbrsDecision !== base.outcomes.lbrsDecision,
    },
  };
}

export function createSyntheticDemoSession(role: PublicRole, options: ReplaySyntheticScenarioOptions = {}): AuthSession {
  const state = replaySyntheticScenario(options);
  const now = options.now ?? "2026-05-15T00:00:00.000Z";
  return {
    token: `synthetic-demo-${role}-${state.scenarioId}`,
    user: {
      id: `synthetic-${role}`,
      email: demoEmailForRole(role),
      phone: null,
      role,
      businessType: role === "provider" ? "both" : null,
      buildingId: state.project.project.id,
      onboardingComplete: true,
      displayName: syntheticDisplayName(role),
      profile: {
        syntheticDemo: true,
        scenarioId: state.scenarioId,
        scenarioPhase: state.phase,
        failureMode: state.failureMode,
      },
      createdAt: now,
      lastSeenAt: now,
    },
  };
}

function applyPhase(project: BuildingProject, phase: SyntheticScenarioPhase): BuildingProject {
  const next = cloneProject(project);
  const index = phaseIndexOf(phase);
  const reached = (target: SyntheticScenarioPhase) => index >= phaseIndexOf(target);

  next.stage = phaseStage[phase];
  next.fundedKes = reached("funding")
    ? reached("settlement")
      ? next.capitalRequiredKes
      : Math.round(next.capitalRequiredKes * 0.78)
    : Math.round(next.capitalRequiredKes * 0.18);
  next.prepaidCommittedKes = reached("drs") ? 184000 : 62000;
  next.settlementPhase = reached("settlement") ? "royalty" : "recovery";
  next.drs = {
    ...next.drs,
    demandCoverage: reached("drs") ? 82 : 38,
    prepaidCommitment: reached("drs") ? 78 : 24,
    loadProfile: reached("drs") ? 84 : 54,
    installationReadiness: reached("install") ? 92 : reached("drs") ? 78 : 44,
    installerReadiness: reached("install") ? 94 : reached("drs") ? 82 : 48,
    capitalAlignment: reached("funding") ? 88 : 42,
    projectedUtilization: reached("drs") ? 0.74 : 0.48,
    hasPrepaidFunds: reached("drs"),
    hasResidentDemandSignal: reached("drs"),
    hasCertifiedLeadElectrician: reached("drs"),
    solarApartmentCapacityFitVerified: reached("drs"),
    apartmentAtsMeterMappingVerified: reached("drs"),
    atsKplcSwitchingVerified: reached("go_live"),
    ownerPermissionsComplete: reached("onboarding"),
    hasVerifiedSupplierQuote: reached("supplier"),
    siteInspectionComplete: reached("drs"),
    capacityPlanApproved: reached("drs"),
    stakeholdersVetted: reached("funding"),
    electricianLaborPaymentResolved: reached("funding"),
    contractsAndComplianceReady: reached("funding"),
    monitoringConnectivityResolved: reached("go_live"),
    settlementDataTrusted: reached("go_live"),
  };
  next.lbrs = lbrsForPhase(phase);
  next.operationalWorkflows = workflowsForPhase(phase);
  return next;
}

function applyFailure(project: BuildingProject, failureMode: SyntheticFailureMode): BuildingProject {
  if (failureMode === "none") return project;

  const next = cloneProject(project);
  if (failureMode === "supplier_quote_lapse") {
    next.stage = "blocked";
    next.drs.hasVerifiedSupplierQuote = false;
    next.operationalWorkflows = replaceWorkflow(next.operationalWorkflows, "quote_reservation", "blocked", "Provider quote expired; procurement cannot count toward DRS until refreshed.");
    next.operationalWorkflows = replaceWorkflow(next.operationalWorkflows, "delivery_evidence", "pending", "Delivery proof waits for a valid reserved BOM quote.");
  }
  if (failureMode === "ats_mapping_gap") {
    next.stage = "blocked";
    next.drs.apartmentAtsMeterMappingVerified = false;
    next.drs.atsKplcSwitchingVerified = false;
    next.lbrs = { ...(next.lbrs ?? lbrsForPhase("settlement")), atsSwitchingPerApartmentComplete: false, meterMappingDataReliable: false };
    next.operationalWorkflows = replaceWorkflow(next.operationalWorkflows, "ats_activation", "blocked", "Apartment ATS/PAYG mapping failed evidence review; units stay on KPLC fallback.");
  }
  if (failureMode === "settlement_data_gap") {
    next.drs.settlementDataTrusted = false;
    next.lbrs = { ...(next.lbrs ?? lbrsForPhase("settlement")), tokenSettlementDryRunPassed: false, backendTokenControlDryRunPassed: false };
    next.operationalWorkflows = replaceWorkflow(next.operationalWorkflows, "go_live_signoff", "blocked", "Settlement dry run is paused because synthetic readings did not reconcile.");
  }
  return next;
}

function lbrsForPhase(phase: SyntheticScenarioPhase): LbrsInputs {
  const index = phaseIndexOf(phase);
  const reached = (target: SyntheticScenarioPhase) => index >= phaseIndexOf(target);
  return {
    siteKind: "apartment",
    asBuiltBomVerified: reached("install"),
    electricalSafetyComplete: reached("install"),
    solarBusIsolationVerified: reached("install"),
    inverterBatteryTestsComplete: reached("install"),
    atsSwitchingPerApartmentComplete: reached("go_live"),
    meterMappingDataReliable: reached("go_live"),
    tokenSettlementDryRunPassed: reached("go_live"),
    backendTokenControlDryRunPassed: reached("go_live"),
    residentOwnerLaunchReadinessComplete: reached("go_live"),
  };
}

function workflowsForPhase(phase: SyntheticScenarioPhase): OperationalWorkflowSnapshot[] {
  const index = phaseIndexOf(phase);
  const reached = (target: SyntheticScenarioPhase) => index >= phaseIndexOf(target);
  return [
    workflow("ats_activation", "ATS activation queue", reached("go_live") ? "ready" : reached("drs") ? "in_review" : "pending", "electrician", reached("go_live") ? "Apartments are capacity-cleared and ATS-active for the demo cohort." : "Capacity plan and ATS/PAYG mapping are being assembled.", "Capacity plan + ATS/PAYG map"),
    workflow("verification_documents", "Owner/site verification docs", reached("onboarding") ? "ready" : "pending", "building_owner", "Owner authority, site access, and meter-area permissions are represented as pilot evidence.", "Authority packet"),
    workflow("quote_reservation", "Quote reservation", reached("supplier") ? "ready" : reached("funding") ? "in_review" : "pending", "provider", reached("supplier") ? "Verified BOM quote is reserved for this named building." : "Provider quote review waits for DRS and capital alignment.", "BOM quote lock"),
    workflow("delivery_evidence", "Delivery and field evidence", reached("install") ? "ready" : reached("supplier") ? "in_review" : "pending", "electrician", reached("install") ? "Serials, DB photos, roof photos, and switching evidence are accepted for replay." : "Field evidence waits for delivery and installation.", "Photo/serial pack"),
    workflow("go_live_signoff", "Go-live signoff", reached("go_live") ? "ready" : "pending", "admin", reached("go_live") ? "LBRS, token-state simulation, settlement dry run, and launch packet are accepted." : "Ops signoff waits for LBRS and settlement dry run.", "LBRS signoff grid"),
    workflow("kyc_escrow", "KYC / escrow status", reached("funding") ? "ready" : "prototype", "financier", reached("funding") ? "Named-building capital is committed in the simulator; real KYC/KYB remains outside this slice." : "Capital controls are visible as pilot-only placeholders.", "Pilot disclosure"),
    workflow("ai_evidence_ingestion", "AI evidence ingestion", "prototype", "admin", "AI ingestion is visible only as a queue placeholder; it does not approve gates.", "Evidence queue placeholder"),
  ];
}

function workflow(
  id: OperationalWorkflowId,
  label: string,
  status: OperationalWorkflowSnapshot["status"],
  ownerRole: OperationalWorkflowSnapshot["ownerRole"],
  detail: string,
  evidenceLabel: string,
): OperationalWorkflowSnapshot {
  return { id, label, status, ownerRole, detail, evidenceLabel, prototypeScope: true };
}

function buildTimeline(
  definition: SyntheticScenarioDefinition,
  currentPhase: SyntheticScenarioPhase,
  failureMode: SyntheticFailureMode,
  now: string,
): SyntheticTimelineEvent[] {
  const currentIndex = phaseIndexOf(currentPhase);
  const anchor = new Date(now);
  const rows = [
    event("owner-intake", "onboarding", "Building and resident intake opened", "Owner lists the site, residents pledge demand, and stakeholders receive role-scoped demo workspaces.", ["resident", "building_owner", "admin"]),
    event("drs-review", "drs", "DRS gates assembled", "Roof, demand, ATS capacity, site inspection, and stakeholder evidence move into readiness review.", ["building_owner", "resident", "electrician", "admin"]),
    event("capital-commit", "funding", "Named-building funding aligned", "Financier capital, provider participation, and electrician labor terms are tied to this building only.", ["financier", "provider", "electrician", "admin"]),
    event("bom-lock", "supplier", "Supplier/provider quote reserved", "The hardware package is locked for the deployment schedule without claiming a production stock lock.", ["provider", "building_owner", "admin"]),
    event("field-install", "install", "Electrician execution and evidence capture", "Installation proof, serials, DB photos, and ATS evidence are attached for LBRS.", ["electrician", "provider", "building_owner", "admin"]),
    event("launch", "go_live", "Go-live and token activation", "LBRS passes, resident launch instructions go out, and ATS-active apartments can consume prepaid solar.", ["resident", "building_owner", "electrician", "admin"]),
    event("settlement", "settlement", "Settlement and payback replay", "Synthetic readings produce E_sold, waterfall payouts, and financier payback ranges.", ["resident", "building_owner", "provider", "financier", "electrician", "admin"]),
  ];

  const events: SyntheticTimelineEvent[] = rows.map((row) => {
    const index = phaseIndexOf(row.phase);
    const status: SyntheticEventStatus = index < currentIndex ? "done" : index === currentIndex ? "active" : "upcoming";
    return {
      ...row,
      day: phaseDay[row.phase],
      at: addDays(anchor, phaseDay[row.phase]).toISOString(),
      status,
      sourceSpec: definition.sourceSpec,
    };
  });

  if (failureMode === "none") return events;

  const failurePhase: SyntheticScenarioPhase =
    failureMode === "supplier_quote_lapse" ? "supplier" : failureMode === "ats_mapping_gap" ? "go_live" : "settlement";
  const failureIndex = phaseIndexOf(failurePhase);
  if (failureIndex > currentIndex) return events;

  return [
    ...events.map((item) =>
      phaseIndexOf(item.phase) >= failureIndex
        ? { ...item, status: (item.phase === failurePhase ? "blocked" : "upcoming") as SyntheticEventStatus }
        : item,
    ),
    {
      id: `failure-${failureMode}`,
      phase: failurePhase,
      day: phaseDay[failurePhase],
      at: addDays(anchor, phaseDay[failurePhase]).toISOString(),
      title: failureTitle(failureMode),
      detail: failureDetail(failureMode),
      roles: failureRoles(failureMode),
      status: "blocked" as const,
      sourceSpec: definition.sourceSpec,
    },
  ];
}

function event(
  id: string,
  phase: SyntheticScenarioPhase,
  title: string,
  detail: string,
  roles: Array<PublicRole | "admin">,
) {
  return { id, phase, title, detail, roles };
}

function buildRoleTimelines(events: SyntheticTimelineEvent[]): Record<PublicRole | "admin", SyntheticTimelineEvent[]> {
  const entries = [...publicRoles, "admin" as const].map((role) => [
    role,
    events.filter((event) => event.roles.includes(role)),
  ]);
  return Object.fromEntries(entries) as Record<PublicRole | "admin", SyntheticTimelineEvent[]>;
}

function replaceWorkflow(
  workflows: OperationalWorkflowSnapshot[] | undefined,
  id: OperationalWorkflowId,
  status: OperationalWorkflowSnapshot["status"],
  detail: string,
) {
  return (workflows ?? []).map((item) => (item.id === id ? { ...item, status, detail } : item));
}

function failureTitle(failureMode: Exclude<SyntheticFailureMode, "none">) {
  const titles: Record<Exclude<SyntheticFailureMode, "none">, string> = {
    supplier_quote_lapse: "Failure injected: quote expired",
    ats_mapping_gap: "Failure injected: ATS mapping gap",
    settlement_data_gap: "Failure injected: settlement data gap",
  };
  return titles[failureMode];
}

function failureDetail(failureMode: Exclude<SyntheticFailureMode, "none">) {
  const details: Record<Exclude<SyntheticFailureMode, "none">, string> = {
    supplier_quote_lapse: "Provider quote reservation is invalidated, so procurement and DRS readiness fall back to blocked.",
    ats_mapping_gap: "Apartment ATS/PAYG mapping fails review, keeping resident activation and LBRS blocked.",
    settlement_data_gap: "Token and settlement dry runs do not reconcile; payouts pause until readings are trusted.",
  };
  return details[failureMode];
}

function failureRoles(failureMode: Exclude<SyntheticFailureMode, "none">): Array<PublicRole | "admin"> {
  const roles: Record<Exclude<SyntheticFailureMode, "none">, Array<PublicRole | "admin">> = {
    supplier_quote_lapse: ["provider", "building_owner", "admin"],
    ats_mapping_gap: ["resident", "electrician", "building_owner", "admin"],
    settlement_data_gap: ["resident", "provider", "financier", "building_owner", "admin"],
  };
  return roles[failureMode];
}

function phaseIndexOf(phase: SyntheticScenarioPhase) {
  return syntheticScenarioPhases.indexOf(phase);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function demoEmailForRole(role: PublicRole) {
  return `${role.replace("_", "-")}@emappa.test`;
}

function syntheticDisplayName(role: Role) {
  return `Synthetic ${role.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}`;
}

function cloneProject(project: BuildingProject): BuildingProject {
  return JSON.parse(JSON.stringify(project)) as BuildingProject;
}
