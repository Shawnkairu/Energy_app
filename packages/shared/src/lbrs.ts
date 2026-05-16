/**
 * Live Building Readiness Score (LBRS) — go-live gate.
 * Source: docs/imported-specs/installation-process-drs-lbrs-go-live.md, scenario D.
 */
import type {
  DeploymentDecision,
  DrsGateFailure,
  LbrsChecklistItem,
  LbrsInputs,
  LbrsResult,
  DrsSiteKind,
} from "./types";

const round = (value: number) => Number(value.toFixed(1));

function siteKind(input: LbrsInputs): DrsSiteKind {
  return input.siteKind ?? "apartment";
}

function collectLbrsCriticalFailures(input: LbrsInputs): DrsGateFailure[] {
  const f: DrsGateFailure[] = [];
  if (!input.asBuiltBomVerified) {
    f.push({ code: "AS_BUILT", message: "As-built / BOM verification incomplete.", responsibleRole: "electrician" });
  }
  if (!input.electricalSafetyComplete) {
    f.push({ code: "ELEC_SAFE", message: "Electrical safety tests incomplete.", responsibleRole: "electrician" });
  }
  if (!input.solarBusIsolationVerified) {
    f.push({ code: "ISO", message: "Solar bus isolation / no unsafe backfeed not verified.", responsibleRole: "electrician" });
  }
  if (!input.inverterBatteryTestsComplete) {
    f.push({ code: "INV_BAT", message: "Inverter and battery commissioning tests incomplete.", responsibleRole: "electrician" });
  }
  const sk = siteKind(input);
  if (sk === "apartment") {
    if (!input.atsSwitchingPerApartmentComplete) {
      f.push({ code: "ATS_APT", message: "ATS switching tests per apartment incomplete.", responsibleRole: "electrician" });
    }
  } else if (!input.homeSwitchingFallbackComplete) {
    f.push({ code: "ATS_HOME", message: "Home changeover / ATS and grid fallback tests incomplete.", responsibleRole: "electrician" });
  }
  if (!input.meterMappingDataReliable) {
    f.push({ code: "METER_MAP", message: "Meter mapping and data reliability not verified.", responsibleRole: "electrician" });
  }
  if (!input.tokenSettlementDryRunPassed) {
    f.push({ code: "TOKEN_DRY", message: "Token control / settlement dry run failed.", responsibleRole: "admin" });
  }
  if (!input.backendTokenControlDryRunPassed) {
    f.push({ code: "BACKEND_DRY", message: "Backend / token / settlement integration dry run incomplete.", responsibleRole: "admin" });
  }
  if (!input.residentOwnerLaunchReadinessComplete) {
    f.push({ code: "LAUNCH", message: "Resident/owner launch readiness incomplete.", responsibleRole: "building_owner" });
  }
  return f;
}

function checklist(input: LbrsInputs): LbrsChecklistItem[] {
  const sk = siteKind(input);
  return [
    { id: "asbuilt", testName: "As-built/BOM", displayWeight: 10, critical: true, complete: input.asBuiltBomVerified, label: "As-built / BOM verification" },
    { id: "safe", testName: "Electrical safety", displayWeight: 20, critical: true, complete: input.electricalSafetyComplete, label: "Electrical safety tests" },
    { id: "iso", testName: "Isolation", displayWeight: 15, critical: true, complete: input.solarBusIsolationVerified, label: "Solar bus isolation / no backfeed" },
    { id: "inv", testName: "Inverter/battery", displayWeight: 10, critical: true, complete: input.inverterBatteryTestsComplete, label: "Inverter + battery tests" },
    sk === "apartment"
      ? { id: "ats", testName: "ATS apt", displayWeight: 15, critical: true, complete: !!input.atsSwitchingPerApartmentComplete, label: "ATS switching per apartment" }
      : { id: "ats", testName: "ATS home", displayWeight: 15, critical: true, complete: !!input.homeSwitchingFallbackComplete, label: "Switching / fallback tests" },
    { id: "meter", testName: "Meters", displayWeight: 10, critical: true, complete: input.meterMappingDataReliable, label: "Meter mapping + data reliability" },
    { id: "dry", testName: "Dry run", displayWeight: 10, critical: true, complete: input.tokenSettlementDryRunPassed && input.backendTokenControlDryRunPassed, label: "Backend/token/settlement dry run" },
    { id: "launch", testName: "Launch", displayWeight: 10, critical: true, complete: input.residentOwnerLaunchReadinessComplete, label: "Resident/owner launch readiness" },
  ];
}

function displayScore(items: LbrsChecklistItem[]): number {
  const crit = items.filter((i) => i.critical);
  const num = crit.reduce((s, i) => s + (i.complete ? i.displayWeight : 0), 0);
  const den = crit.reduce((s, i) => s + i.displayWeight, 0);
  return den > 0 ? round((num / den) * 100) : 0;
}

export function calculateLbrs(input: LbrsInputs): LbrsResult {
  const items = checklist(input);
  const fails = collectLbrsCriticalFailures(input);
  const warnings: string[] = [];
  const score = displayScore(items);

  let decision: DeploymentDecision;
  if (fails.length > 0) decision = "blocked";
  else if (warnings.length > 0) decision = "review";
  else decision = "deployment_ready";

  return {
    score,
    decision,
    reasons: [...fails.map((c) => c.message), ...warnings],
    criticalFailures: fails,
    warnings,
    checklist: items,
  };
}

export function getLbrsLabel(decision: DeploymentDecision): string {
  if (decision === "deployment_ready") return "Live-ready (all LBRS gates)";
  if (decision === "review") return "LBRS review";
  return "LBRS blocked";
}
