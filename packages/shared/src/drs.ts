import type { DeploymentDecision, DrsInputs, DrsResult } from "./types";

const clampScore = (value: number) => Math.max(0, Math.min(100, value));
const round = (value: number) => Number(value.toFixed(1));

export function calculateDrs(input: DrsInputs): DrsResult {
  const components = {
    demandCoverage: clampScore(input.demandCoverage),
    prepaidCommitment: clampScore(input.prepaidCommitment),
    loadProfile: clampScore(input.loadProfile),
    installationReadiness: clampScore(input.installationReadiness),
    installerReadiness: clampScore(input.installerReadiness),
    capitalAlignment: clampScore(input.capitalAlignment),
  };

  const weightedScore =
    components.demandCoverage * 0.35 +
    components.prepaidCommitment * 0.2 +
    components.loadProfile * 0.15 +
    components.installationReadiness * 0.1 +
    components.installerReadiness * 0.1 +
    components.capitalAlignment * 0.1;

  const reasons: string[] = [];
  if (input.projectedUtilization < 0.6) reasons.push("Projected utilization below 60%.");
  if (!input.hasPrepaidFunds) reasons.push("No prepaid resident commitment.");
  if (!input.hasCertifiedLeadElectrician) reasons.push("No certified lead electrician assigned.");
  if (!input.meterInverterMatchResolved) reasons.push("Meter/inverter mismatch unresolved.");
  if (!input.ownerPermissionsComplete) reasons.push("Building owner permissions incomplete.");
  if (!input.hasVerifiedSupplierQuote) reasons.push("Critical supplier quote/BOM missing.");
  if (!input.monitoringConnectivityResolved) reasons.push("Monitoring connectivity unresolved.");
  if (!input.settlementDataTrusted) reasons.push("Settlement data cannot be trusted.");

  const score = round(weightedScore);
  const decision: DeploymentDecision =
    reasons.length > 0 ? "block" : score >= 80 ? "approve" : score >= 65 ? "review" : "block";

  return {
    score,
    decision,
    reasons,
    components,
  };
}

export function getDrsLabel(decision: DeploymentDecision) {
  if (decision === "approve") return "Ready for deployment";
  if (decision === "review") return "Manual review required";
  return "Blocked";
}
