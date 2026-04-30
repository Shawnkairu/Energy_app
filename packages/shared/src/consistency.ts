import type { BuildingProject } from "./types";
import { demoProjects } from "./mockData";
import { projectBuilding } from "./projector";
import { validateSettlementRates } from "./settlement";

const near = (a: number, b: number, tolerance = 0.05) => Math.abs(a - b) <= tolerance;

export function auditProjectConsistency(project: BuildingProject) {
  const projected = projectBuilding(project);
  const issues: string[] = [];
  const rates = validateSettlementRates(project.settlementRates);

  if (!rates.isBalanced) {
    issues.push(`Settlement rates must total 100%; received ${rates.total * 100}%.`);
  }

  const energyBalance =
    projected.energy.E_sold +
    projected.energy.E_waste +
    Math.max(0, projected.energy.E_gen - projected.energy.E_sold - projected.energy.E_waste);

  if (energyBalance - projected.energy.E_gen > 0.1) {
    issues.push("Energy outputs exceed generated energy.");
  }

  const settlementTotal =
    projected.settlement.reserve +
    projected.settlement.providerPool +
    projected.settlement.financierPool +
    projected.settlement.ownerRoyalty +
    projected.settlement.emappaFee +
    projected.settlement.unallocated;

  if (!near(settlementTotal, projected.settlement.revenue)) {
    issues.push("Settlement waterfall does not reconcile to revenue.");
  }

  const providerPayoutTotal = projected.providerPayouts.reduce((sum, payout) => sum + payout.payout, 0);
  if (!near(providerPayoutTotal, projected.settlement.providerPool)) {
    issues.push("Provider ownership payouts do not reconcile to provider pool.");
  }

  const financierPayoutTotal = projected.financierPayouts.reduce((sum, payout) => sum + payout.payout, 0);
  if (!near(financierPayoutTotal, projected.settlement.financierPool)) {
    issues.push("Financier ownership payouts do not reconcile to financier pool.");
  }

  if (projected.roleViews.owner.prepaidCoverage > 1) {
    issues.push("Prepaid coverage display should be capped at 100%.");
  }

  if (projected.drs.components.demandCoverage !== Number((projected.energy.utilization * 100).toFixed(1))) {
    issues.push("DRS demand coverage should follow calculated utilization.");
  }

  return {
    projectId: project.id,
    ok: issues.length === 0,
    issues,
  };
}

export function auditAllDemoProjects(projects: BuildingProject[] = demoProjects) {
  const results = projects.map(auditProjectConsistency);
  return {
    ok: results.every((result) => result.ok),
    results,
  };
}
