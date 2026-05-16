/**
 * Deployment Readiness Score (DRS) — gate-first model.
 * Source: docs/imported-specs/installation-process-drs-lbrs-go-live.md and scenario B/C specs.
 * Display `score` is weighted for UX; installation must not start unless every critical gate passes.
 */
import type {
  DeploymentDecision,
  DrsChecklistItem,
  DrsGateFailure,
  DrsInputs,
  DrsResult,
  DrsSiteKind,
} from "./types";

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const round = (value: number) => Number(value.toFixed(1));

function electricianScore(input: DrsInputs): number {
  return clamp(input.electricianReadiness ?? input.installerReadiness);
}

function siteKind(input: DrsInputs): DrsSiteKind {
  return input.siteKind ?? "apartment";
}

/** Display score from legacy numeric components (0–100) — UX only; never overrides gates */
function weightedDisplayScore(input: DrsInputs, elec: number): number {
  return round(
    clamp(input.demandCoverage) * 0.35 +
      clamp(input.prepaidCommitment) * 0.2 +
      clamp(input.loadProfile) * 0.15 +
      clamp(input.installationReadiness) * 0.1 +
      elec * 0.1 +
      clamp(input.capitalAlignment) * 0.1,
  );
}

function apartmentCriticalFailures(input: DrsInputs): DrsGateFailure[] {
  const failures: DrsGateFailure[] = [];
  const demandSignal = input.hasResidentDemandSignal ?? input.hasPrepaidFunds;
  const siteInspection = input.siteInspectionComplete ?? true;
  const capacityPlan = input.capacityPlanApproved ?? true;
  const stakeholders =
    input.stakeholdersVetted ?? (input.hasCertifiedLeadElectrician && input.hasVerifiedSupplierQuote);
  const electricianPaid = input.electricianLaborPaymentResolved ?? true;
  const contracts = input.contractsAndComplianceReady ?? true;

  if (!input.ownerPermissionsComplete) {
    failures.push({
      code: "OWNER_AUTH",
      message: "Owner authorization and site access permissions incomplete.",
      responsibleRole: "building_owner",
    });
  }
  if (!stakeholders) {
    failures.push({
      code: "STAKEHOLDER_VET",
      message: "Stakeholder availability and vetting incomplete (electrician / provider / capital).",
      responsibleRole: "admin",
    });
  }
  if (!siteInspection) {
    failures.push({
      code: "SITE_INSPECTION",
      message: "Site inspection not complete (meter bank, roof, cable routes, Solar DB/ATS space).",
      responsibleRole: "electrician",
    });
  }
  if (!capacityPlan) {
    failures.push({
      code: "CAPACITY_PLAN",
      message: "Capacity plan not approved (phasing, reserve margin, max apartments).",
      responsibleRole: "admin",
    });
  }
  if (input.projectedUtilization < 0.6) {
    failures.push({
      code: "DEMAND_LOW",
      message: "Demand / utilization forecast below 60% — deployment economically unsafe.",
      responsibleRole: "resident",
    });
  }
  if (!demandSignal) {
    failures.push({
      code: "DEMAND_SIGNAL",
      message: "Resident demand evidence insufficient (pledges and/or prepaid load signals).",
      responsibleRole: "resident",
    });
  }
  if (!input.hasVerifiedSupplierQuote) {
    failures.push({
      code: "HARDWARE_PKG",
      message: "Hardware package / verified BOM or quote not ready.",
      responsibleRole: "provider",
    });
  }
  if (!electricianPaid) {
    failures.push({
      code: "ELEC_PAYMENT",
      message: "Electrician payment or labor-as-capital terms not resolved.",
      responsibleRole: "financier",
    });
  }
  if (!contracts) {
    failures.push({
      code: "CONTRACTS",
      message: "Contracts, waterfall, and compliance review incomplete.",
      responsibleRole: "admin",
    });
  }
  if (!input.hasCertifiedLeadElectrician) {
    failures.push({
      code: "ELEC_LEAD",
      message: "No certified lead electrician assigned.",
      responsibleRole: "electrician",
    });
  }
  if (!input.solarApartmentCapacityFitVerified) {
    failures.push({
      code: "SOLAR_CAPACITY",
      message: "Solar/battery capacity vs participating apartments not verified (dedicated solar path).",
      responsibleRole: "electrician",
    });
  }
  if (!input.apartmentAtsMeterMappingVerified) {
    failures.push({
      code: "ATS_MAP",
      message: "Apartment ATS + PAYG meter mapping incomplete.",
      responsibleRole: "electrician",
    });
  }
  if (!input.atsKplcSwitchingVerified) {
    failures.push({
      code: "ATS_KPLC",
      message: "ATS ↔ KPLC fallback architecture not verified.",
      responsibleRole: "electrician",
    });
  }
  if (!input.monitoringConnectivityResolved) {
    failures.push({
      code: "MONITORING",
      message: "Monitoring connectivity unresolved.",
      responsibleRole: "provider",
    });
  }
  if (!input.settlementDataTrusted) {
    failures.push({
      code: "SETTLEMENT_DATA",
      message: "Settlement data cannot be trusted — pause or conservative mode.",
      responsibleRole: "admin",
    });
  }

  return failures;
}

function homeownerCriticalFailures(input: DrsInputs): DrsGateFailure[] {
  const failures: DrsGateFailure[] = [];
  const propertyOk = input.propertyAuthorityComplete ?? false;
  const siteOk = input.siteFeasibilityComplete ?? false;
  const loadOk = input.loadProfileSizingComplete ?? false;
  const stakeholders =
    !!input.stakeholdersVetted ||
    (input.hasCertifiedLeadElectrician && input.hasVerifiedSupplierQuote);
  const capitalOk = input.capitalAndLaborResolved ?? false;
  const hardwareOk = input.hardwareProcurementComplete ?? input.hasVerifiedSupplierQuote;
  const legalOk = input.legalUtilityDisciplineComplete ?? false;
  const contracts = input.contractsAndComplianceReady ?? true;
  const demandSignal = input.hasResidentDemandSignal ?? input.hasPrepaidFunds;

  if (!propertyOk) {
    failures.push({ code: "PROP_AUTH", message: "Property authority not verified.", responsibleRole: "homeowner" });
  }
  if (!siteOk) {
    failures.push({ code: "SITE_FEAS", message: "Site feasibility incomplete.", responsibleRole: "electrician" });
  }
  if (!loadOk) {
    failures.push({ code: "LOAD_SIZE", message: "Load profile and sizing discipline incomplete.", responsibleRole: "homeowner" });
  }
  if (!stakeholders) {
    failures.push({ code: "STAKE_READY", message: "Stakeholder readiness incomplete.", responsibleRole: "admin" });
  }
  if (!capitalOk) {
    failures.push({ code: "CAPITAL_LABOR", message: "Capital stack and electrician payment not resolved.", responsibleRole: "financier" });
  }
  if (!hardwareOk) {
    failures.push({ code: "HW_PROC", message: "Hardware procurement path incomplete.", responsibleRole: "provider" });
  }
  if (!legalOk) {
    failures.push({ code: "LEGAL_UTIL", message: "Legal / utility / export discipline incomplete.", responsibleRole: "electrician" });
  }
  if (!contracts) {
    failures.push({ code: "CONTRACTS", message: "Contracts and compliance incomplete.", responsibleRole: "admin" });
  }
  if (!input.hasCertifiedLeadElectrician) {
    failures.push({ code: "ELEC_LEAD", message: "No certified lead electrician assigned.", responsibleRole: "electrician" });
  }
  if (input.projectedUtilization < 0.6) {
    failures.push({ code: "DEMAND_LOW", message: "Utilization forecast below credible threshold.", responsibleRole: "homeowner" });
  }
  if (!demandSignal) {
    failures.push({ code: "DEMAND_SIG", message: "Homeowner commitment / demand signal insufficient.", responsibleRole: "homeowner" });
  }
  if (!input.monitoringConnectivityResolved) {
    failures.push({ code: "MONITORING", message: "Monitoring connectivity unresolved.", responsibleRole: "provider" });
  }
  if (!input.settlementDataTrusted) {
    failures.push({ code: "SETTLEMENT_DATA", message: "Settlement data cannot be trusted.", responsibleRole: "admin" });
  }
  return failures;
}

function buildApartmentChecklist(input: DrsInputs, elec: number): DrsChecklistItem[] {
  const demandSignal = input.hasResidentDemandSignal ?? input.hasPrepaidFunds;
  return [
    { id: "owner", category: "Owner authorization", displayWeight: 10, critical: true, complete: input.ownerPermissionsComplete, label: "Owner authorization and access" },
    { id: "stake", category: "Stakeholders", displayWeight: 15, critical: true, complete: !!(input.stakeholdersVetted ?? (input.hasCertifiedLeadElectrician && input.hasVerifiedSupplierQuote)), label: "Stakeholder availability and vetting" },
    { id: "inspect", category: "Inspection", displayWeight: 15, critical: true, complete: input.siteInspectionComplete !== false, label: "Site inspection complete" },
    { id: "capplan", category: "Capacity", displayWeight: 15, critical: true, complete: input.capacityPlanApproved !== false, label: "Capacity plan approved" },
    { id: "demand", category: "Demand", displayWeight: 15, critical: true, complete: input.projectedUtilization >= 0.6 && demandSignal, label: "Demand proof / pledges / utilization" },
    { id: "hw", category: "Hardware", displayWeight: 15, critical: true, complete: input.hasVerifiedSupplierQuote, label: "Hardware package and logistics" },
    { id: "elecpay", category: "Labor", displayWeight: 10, critical: true, complete: input.electricianLaborPaymentResolved !== false, label: "Electrician payment / labor-capital" },
    { id: "legal", category: "Contracts", displayWeight: 5, critical: true, complete: input.contractsAndComplianceReady !== false, label: "Contracts and compliance" },
    { id: "ats", category: "Architecture", displayWeight: 0, critical: true, complete: input.apartmentAtsMeterMappingVerified && input.atsKplcSwitchingVerified && input.solarApartmentCapacityFitVerified, label: "Dedicated solar path + ATS mapping" },
    { id: "elec", category: "Electrician", displayWeight: 0, critical: true, complete: input.hasCertifiedLeadElectrician && elec >= 50, label: "Certified electrician readiness" },
    { id: "mon", category: "Ops", displayWeight: 0, critical: true, complete: input.monitoringConnectivityResolved && input.settlementDataTrusted, label: "Monitoring and settlement trust" },
  ];
}

function buildHomeownerChecklist(input: DrsInputs, elec: number): DrsChecklistItem[] {
  const demandSignal = input.hasResidentDemandSignal ?? input.hasPrepaidFunds;
  return [
    { id: "prop", category: "Authority", displayWeight: 12, critical: true, complete: !!(input.propertyAuthorityComplete ?? false), label: "Property authority" },
    { id: "site", category: "Feasibility", displayWeight: 12, critical: true, complete: !!(input.siteFeasibilityComplete ?? false), label: "Site feasibility" },
    { id: "load", category: "Load", displayWeight: 12, critical: true, complete: !!(input.loadProfileSizingComplete ?? false), label: "Load profile and sizing" },
    {
      id: "stake",
      category: "Stakeholders",
      displayWeight: 12,
      critical: true,
      complete:
        !!input.stakeholdersVetted ||
        (input.hasCertifiedLeadElectrician && input.hasVerifiedSupplierQuote),
      label: "Stakeholder readiness",
    },
    { id: "cap", category: "Capital", displayWeight: 12, critical: true, complete: !!(input.capitalAndLaborResolved ?? false), label: "Capital and electrician payment" },
    { id: "hw", category: "Hardware", displayWeight: 12, critical: true, complete: !!(input.hardwareProcurementComplete ?? input.hasVerifiedSupplierQuote), label: "Hardware procurement" },
    { id: "legal", category: "Utility", displayWeight: 12, critical: true, complete: !!(input.legalUtilityDisciplineComplete ?? false), label: "Legal and utility discipline" },
    { id: "ready", category: "Activation", displayWeight: 8, critical: false, complete: demandSignal && input.projectedUtilization >= 0.6, label: "Homeowner consumption readiness (pre-activation)" },
    { id: "elec", category: "Electrician", displayWeight: 8, critical: true, complete: input.hasCertifiedLeadElectrician && elec >= 50, label: "Certified electrician" },
    { id: "mon", category: "Ops", displayWeight: 0, critical: true, complete: input.monitoringConnectivityResolved && input.settlementDataTrusted, label: "Monitoring and settlement trust" },
  ];
}

function collectWarnings(input: DrsInputs): string[] {
  const w: string[] = [];
  if (input.projectedUtilization >= 0.6 && input.projectedUtilization < 0.75) {
    w.push("Utilization in watch band (60–75%).");
  }
  if (clamp(input.loadProfile) < 70) {
    w.push("Load profile confidence is moderate — improve estimates before scaling.");
  }
  return w;
}

export function calculateDrs(input: DrsInputs): DrsResult {
  const elec = electricianScore(input);
  const sk = siteKind(input);
  const criticalFailures = sk === "homeowner" ? homeownerCriticalFailures(input) : apartmentCriticalFailures(input);
  const warnings = collectWarnings(input);
  const checklist = sk === "homeowner" ? buildHomeownerChecklist(input, elec) : buildApartmentChecklist(input, elec);

  const components = {
    demandCoverage: clamp(input.demandCoverage),
    prepaidCommitment: clamp(input.prepaidCommitment),
    loadProfile: clamp(input.loadProfile),
    installationReadiness: clamp(input.installationReadiness),
    electricianReadiness: elec,
    installerReadiness: elec,
    capitalAlignment: clamp(input.capitalAlignment),
  };

  const score = Math.min(100, weightedDisplayScore(input, elec));

  let decision: DeploymentDecision;
  if (criticalFailures.length > 0) {
    decision = "blocked";
  } else if (warnings.length > 0) {
    decision = "review";
  } else {
    decision = "deployment_ready";
  }

  const reasons = [...criticalFailures.map((f) => f.message), ...warnings];

  return {
    score,
    decision,
    reasons,
    criticalFailures,
    warnings,
    checklist,
    components,
  };
}

export function getDrsLabel(decision: DeploymentDecision): string {
  if (decision === "deployment_ready") return "Deployment-ready (all critical gates)";
  if (decision === "review") return "Review — non-critical warnings";
  return "Blocked — critical gate failed";
}

/** Map legacy API values to canonical decisions */
export function normalizeDeploymentDecision(raw: string): DeploymentDecision {
  if (raw === "approve") return "deployment_ready";
  if (raw === "review") return "review";
  return "blocked";
}
