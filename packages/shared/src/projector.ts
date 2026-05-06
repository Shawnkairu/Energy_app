import type { BuildingProject } from "./types";
import { calculateDrs, getDrsLabel } from "./drs";
import { calculateEnergy, calculateSavings } from "./energy";
import { calculateOwnershipPayouts } from "./ownership";
import { calculatePayback } from "./payback";
import { calculateSettlement } from "./settlement";

export function projectBuilding(project: BuildingProject) {
  const energy = calculateEnergy(project.energy);
  const settlement = calculateSettlement(energy.E_sold, project.solarPriceKes, project.settlementRates);
  const prepaidMonthsCovered = settlement.revenue > 0 ? project.prepaidCommittedKes / settlement.revenue : 0;
  const prepaidCoverage = Math.min(1, prepaidMonthsCovered);
  const drsInput = {
    ...project.drs,
    demandCoverage: Math.min(100, energy.utilization * 100),
    prepaidCommitment: Math.min(100, prepaidCoverage * 100),
    projectedUtilization: energy.utilization,
    hasPrepaidFunds: project.prepaidCommittedKes > 0,
  };
  const drs = calculateDrs(drsInput);
  const providerPayouts = calculateOwnershipPayouts(settlement.providerPool, project.providerOwnership);
  const financierPayouts = calculateOwnershipPayouts(settlement.financierPool, project.financierOwnership);
  const savingsKes = calculateSavings(energy.E_sold, project.gridPriceKes, project.solarPriceKes);
  const fundingProgress = project.capitalRequiredKes > 0 ? project.fundedKes / project.capitalRequiredKes : 0;
  const residentMonthlySolarKwh = energy.E_sold / project.units;
  const residentSavingsKes = savingsKes / project.units;
  const retainedProviderOwnership = project.providerOwnership
    .filter((position) => position.ownerRole === "provider")
    .reduce((sum, position) => sum + position.percentage, 0);
  const residentOwnedProviderShare = project.providerOwnership
    .filter((position) => position.ownerRole === "resident")
    .reduce((sum, position) => sum + position.percentage, 0);
  const killSwitches = drs.reasons;
  const deploymentGates = [
    { label: "Demand qualified", complete: drsInput.projectedUtilization >= 0.6 },
    { label: "Prepaid committed", complete: drsInput.hasPrepaidFunds },
    { label: "Supplier quote verified", complete: drsInput.hasVerifiedSupplierQuote },
    { label: "Certified electrician assigned", complete: drsInput.hasCertifiedLeadElectrician },
    { label: "Monitoring ready", complete: drsInput.monitoringConnectivityResolved },
    { label: "Settlement data trusted", complete: drsInput.settlementDataTrusted },
  ];

  return {
    project,
    energy,
    settlement,
    drs: {
      ...drs,
      label: getDrsLabel(drs.decision),
    },
    providerPayouts,
    financierPayouts,
    savingsKes,
    fundingProgress,
    roleViews: {
      resident: {
        prepaidBalanceKes: Math.round(project.prepaidCommittedKes / project.units),
        averagePrepaidBalanceKes: Math.round(project.prepaidCommittedKes / project.units),
        monthlySolarKwh: Number(residentMonthlySolarKwh.toFixed(1)),
        savingsKes: Math.round(residentSavingsKes),
        solarCoverage: energy.coverage,
        ownedProviderShare: residentOwnedProviderShare,
      },
      owner: {
        monthlyRoyaltyKes: settlement.ownerRoyalty,
        prepaidCoverage,
        prepaidMonthsCovered: Number(prepaidMonthsCovered.toFixed(2)),
        residentParticipation: Math.min(1, prepaidCoverage),
        comparableMedianRoyaltyKes: Math.round(settlement.ownerRoyalty * 0.86),
        gates: deploymentGates,
      },
      provider: {
        retainedOwnership: retainedProviderOwnership,
        soldOwnership: residentOwnedProviderShare,
        monthlyPayoutKes: providerPayouts
          .filter((position) => position.ownerRole === "provider")
          .reduce((sum, position) => sum + position.payout, 0),
        monetizedKwh: energy.E_sold,
        generatedKwh: energy.E_gen,
        utilization: energy.utilization,
        wasteKwh: energy.E_waste,
        gridFallbackKwh: energy.E_grid,
        deploymentGates,
        monitoringStatus: project.drs.monitoringConnectivityResolved ? "Monitoring online" : "Connectivity blocked",
        warrantyDocuments: project.drs.hasVerifiedSupplierQuote ? 4 : 1,
        openMaintenanceTickets: project.drs.monitoringConnectivityResolved ? 0 : 2,
      },
      financier: {
        remainingCapitalKes: Math.max(0, project.capitalRequiredKes - project.fundedKes),
        committedCapitalKes: project.fundedKes,
        fundingProgress,
        monthlyRecoveryKes: settlement.financierPool,
        downsideUtilization: Math.max(0, energy.utilization - 0.18),
        baseUtilization: energy.utilization,
      },
      installer: {
        checklistComplete: deploymentGates.filter((gate) => gate.complete).length,
        checklistTotal: deploymentGates.length,
        gates: deploymentGates,
        certified: project.drs.hasCertifiedLeadElectrician,
        maintenanceTickets: project.drs.monitoringConnectivityResolved ? 0 : 2,
      },
      supplier: {
        openRequests: project.drs.hasVerifiedSupplierQuote ? 1 : 3,
        verifiedBom: project.drs.hasVerifiedSupplierQuote,
        leadTimeDays: project.drs.hasVerifiedSupplierQuote ? 6 : 14,
        catalogItems: project.drs.hasVerifiedSupplierQuote ? 42 : 24,
        warrantyDocuments: project.drs.hasVerifiedSupplierQuote ? 4 : 1,
        reliabilityScore: project.drs.hasVerifiedSupplierQuote ? 94 : 72,
      },
      admin: {
        alertCount: killSwitches.length,
        blockedReasonCount: killSwitches.length,
        settlementHealth: project.drs.settlementDataTrusted ? "trusted" : "paused",
        gates: deploymentGates,
      },
    },
    transparency: {
      utilizationBand: energy.utilization >= 0.75 ? "Top utilization band" : energy.utilization >= 0.6 ? "Watch band" : "Risk band",
      roiRange: energy.utilization >= 0.75 ? "4.8-6.2 years" : energy.utilization >= 0.6 ? "6.1-8.4 years" : "Review required",
      privacyNote: "Benchmarks show distributions, never private counterpart finances.",
    },
    financierPayback: calculatePayback({
      investment: Math.max(project.fundedKes, 1),
      monthlyPayout: settlement.financierPool,
    }),
  };
}

export type ProjectedBuilding = ReturnType<typeof projectBuilding>;
