import type { BuildingProject, LbrsInputs, OperationalWorkflowSnapshot } from "./types";
import { calculateDrs, getDrsLabel } from "./drs";
import { calculateEnergy, calculateSavings } from "./energy";
import { calculateLbrs, getLbrsLabel } from "./lbrs";
import { calculateOwnershipPayouts } from "./ownership";
import { calculatePayback } from "./payback";
import { calculateSettlement } from "./settlement";

function defaultLbrs(project: BuildingProject): LbrsInputs {
  if (project.lbrs) return project.lbrs;
  const live = project.stage === "live";
  return {
    siteKind: project.buildingKind === "single_family" || project.buildingKind === "small_compound" ? "homeowner" : "apartment",
    asBuiltBomVerified: live,
    electricalSafetyComplete: live,
    solarBusIsolationVerified: live,
    inverterBatteryTestsComplete: live,
    atsSwitchingPerApartmentComplete: live,
    homeSwitchingFallbackComplete: live,
    meterMappingDataReliable: live,
    tokenSettlementDryRunPassed: live,
    backendTokenControlDryRunPassed: live,
    residentOwnerLaunchReadinessComplete: live,
  };
}

function defaultOperationalWorkflows(project: BuildingProject): OperationalWorkflowSnapshot[] {
  if (project.operationalWorkflows?.length) return project.operationalWorkflows;

  const live = project.stage === "live";
  const quoteReady = project.drs.hasVerifiedSupplierQuote;
  const atsReady =
    project.drs.solarApartmentCapacityFitVerified &&
    project.drs.apartmentAtsMeterMappingVerified &&
    project.drs.atsKplcSwitchingVerified;

  return [
    {
      id: "ats_activation",
      label: "ATS activation queue",
      status: live ? "ready" : atsReady ? "in_review" : "blocked",
      ownerRole: "electrician",
      detail: live
        ? "Apartment switching is verified for active units."
        : atsReady
          ? "Capacity and ATS mapping are modeled; unit activation waits for LBRS."
          : "Capacity, meter mapping, or ATS switching evidence is incomplete.",
      evidenceLabel: "Capacity plan + ATS/PAYG map",
      prototypeScope: true,
    },
    {
      id: "verification_documents",
      label: "Owner/site verification docs",
      status: project.drs.ownerPermissionsComplete ? "ready" : "in_review",
      ownerRole: project.buildingKind === "single_family" ? "homeowner" : "building_owner",
      detail: project.drs.ownerPermissionsComplete
        ? "Owner authority and site access are represented as accepted pilot evidence."
        : "Authority, roof access, or site permission documents need review.",
      evidenceLabel: "Authority packet",
      prototypeScope: true,
    },
    {
      id: "quote_reservation",
      label: "Quote reservation",
      status: quoteReady ? "ready" : "blocked",
      ownerRole: "provider",
      detail: quoteReady
        ? "Verified BOM quote is reserved in the pilot project snapshot."
        : "A valid, reviewed, reserved quote is needed before hardware readiness can pass.",
      evidenceLabel: "BOM quote lock",
      prototypeScope: true,
    },
    {
      id: "delivery_evidence",
      label: "Delivery and field evidence",
      status: live ? "ready" : quoteReady ? "in_review" : "pending",
      ownerRole: "electrician",
      detail: live
        ? "As-built, serial, and delivery proof are treated as accepted for this live snapshot."
        : quoteReady
          ? "Serials, warranty docs, delivery proof, and field photos are expected before LBRS."
          : "Delivery proof waits for approved stock and scheduling.",
      evidenceLabel: "Photo/serial pack",
      prototypeScope: true,
    },
    {
      id: "go_live_signoff",
      label: "Go-live signoff",
      status: live ? "ready" : "pending",
      ownerRole: "admin",
      detail: live
        ? "LBRS, token-state simulation, settlement dry run, and launch packet are accepted."
        : "Ops signoff waits for LBRS, token-state simulation, settlement dry run, and launch packet approval.",
      evidenceLabel: "LBRS signoff grid",
      prototypeScope: true,
    },
    {
      id: "kyc_escrow",
      label: "KYC / escrow status",
      status: "prototype",
      ownerRole: "financier",
      detail: "Capital is shown as named-building pilot commitment; real KYC/KYB and escrow rails are not integrated.",
      evidenceLabel: "Pilot disclosure",
      prototypeScope: true,
    },
    {
      id: "ai_evidence_ingestion",
      label: "AI evidence ingestion",
      status: "prototype",
      ownerRole: "admin",
      detail: "AI ingestion is visible as an ops placeholder only; it does not override accepted evidence or critical gates.",
      evidenceLabel: "Evidence queue placeholder",
      prototypeScope: true,
    },
  ];
}

export function projectBuilding(project: BuildingProject) {
  const energy = calculateEnergy(project.energy);
  const settlement = calculateSettlement(energy.E_sold, project.solarPriceKes, project.settlementRates, {
    phase: project.settlementPhase ?? "recovery",
  });
  const prepaidMonthsCovered = settlement.revenue > 0 ? project.prepaidCommittedKes / settlement.revenue : 0;
  const prepaidCoverage = Math.min(1, prepaidMonthsCovered);
  const drsInput = {
    ...project.drs,
    siteKind:
      project.buildingKind === "single_family" || project.buildingKind === "small_compound"
        ? ("homeowner" as const)
        : ("apartment" as const),
    demandCoverage: Math.min(100, energy.utilization * 100),
    prepaidCommitment: Math.min(100, prepaidCoverage * 100),
    projectedUtilization: energy.utilization,
    hasResidentDemandSignal: project.drs.hasResidentDemandSignal ?? project.drs.hasPrepaidFunds,
  };
  const drs = calculateDrs(drsInput);
  const lbrsInput = defaultLbrs(project);
  const lbrs = calculateLbrs(lbrsInput);
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
  const killSwitches = drs.criticalFailures.map((f) => f.message);
  const deploymentGates = drs.checklist.map((c) => ({ label: c.label, complete: c.complete }));
  const operationalWorkflows = defaultOperationalWorkflows(project);
  const workflowById = Object.fromEntries(operationalWorkflows.map((item) => [item.id, item])) as Partial<
    Record<OperationalWorkflowSnapshot["id"], OperationalWorkflowSnapshot>
  >;
  const atsReady =
    project.drs.solarApartmentCapacityFitVerified &&
    project.drs.apartmentAtsMeterMappingVerified &&
    project.drs.atsKplcSwitchingVerified;

  const isHomeownerSite =
    project.buildingKind === "single_family" || project.buildingKind === "small_compound";
  const ownerHostRoyaltyKes = isHomeownerSite ? 0 : settlement.ownerRoyalty;

  return {
    project,
    energy,
    settlement,
    drs: {
      ...drs,
      label: getDrsLabel(drs.decision),
    },
    lbrs: {
      ...lbrs,
      label: getLbrsLabel(lbrs.decision),
    },
    providerPayouts,
    financierPayouts,
    operationalWorkflows,
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
        capacityQueue: {
          status: workflowById.ats_activation?.status === "ready" ? "activated" : atsReady ? "capacity_cleared" : "capacity_review",
          position: atsReady ? 4 : 11,
          detail: workflowById.ats_activation?.detail ?? "Capacity queue status unavailable.",
        },
        atsActivation: workflowById.ats_activation,
      },
      owner: {
        monthlyRoyaltyKes: ownerHostRoyaltyKes,
        prepaidCoverage,
        prepaidMonthsCovered: Number(prepaidMonthsCovered.toFixed(2)),
        residentParticipation: Math.min(1, prepaidCoverage),
        comparableMedianRoyaltyKes: Math.round(ownerHostRoyaltyKes * 0.86),
        gates: deploymentGates,
        verificationDocuments: workflowById.verification_documents,
        launchSignoff: workflowById.go_live_signoff,
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
        quoteReservation: workflowById.quote_reservation,
        deliveryEvidence: workflowById.delivery_evidence,
      },
      financier: {
        remainingCapitalKes: Math.max(0, project.capitalRequiredKes - project.fundedKes),
        committedCapitalKes: project.fundedKes,
        fundingProgress,
        monthlyRecoveryKes: settlement.financierPool,
        downsideUtilization: Math.max(0, energy.utilization - 0.18),
        baseUtilization: energy.utilization,
        kycEscrow: workflowById.kyc_escrow,
        goLiveSignoff: workflowById.go_live_signoff,
      },
      electrician: {
        checklistComplete: deploymentGates.filter((gate) => gate.complete).length,
        checklistTotal: deploymentGates.length,
        gates: deploymentGates,
        certified: project.drs.hasCertifiedLeadElectrician,
        maintenanceTickets: project.drs.monitoringConnectivityResolved ? 0 : 2,
        evidenceCapture: workflowById.delivery_evidence,
        signoff: workflowById.go_live_signoff,
        aiEvidenceIngestion: workflowById.ai_evidence_ingestion,
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
        operationalWorkflows,
      },
    },
    transparency: {
      utilizationBand: energy.utilization >= 0.75 ? "Top utilization band" : energy.utilization >= 0.6 ? "Watch band" : "Risk band",
      roiRange:
        energy.utilization >= 0.75
          ? "Downside ~8y / base ~5.5y / upside ~4y (not guaranteed)"
          : energy.utilization >= 0.6
            ? "Downside 12y+ / base ~7y / upside ~5y (not guaranteed)"
            : "Review required — low utilization stretches payback",
      privacyNote: "Benchmarks show distributions, never private counterpart finances.",
    },
    financierPayback: calculatePayback({
      investment: Math.max(project.fundedKes, 1),
      monthlyPayout: settlement.financierPool,
    }),
  };
}

export type ProjectedBuilding = ReturnType<typeof projectBuilding>;
