// ─────────────────────────────────────────────────────────────
// mock-building.jsx
// One stable, deterministic ProjectedBuilding so every screen renders
// the same labels, percentages, and tone branches as a live demo.
// Values chosen so most copy paths land on deployment_ready / review / blocked (see packages/shared drs.ts).
// ─────────────────────────────────────────────────────────────

const MOCK = {
  project: {
    name: 'Riverside Apartments',
    locationBand: 'Nairobi · Kileleshwa',
    units: 38,
    stage: 'deployment',
    prepaidCommittedKes: 122000,
    energy: { arrayKw: 64, batteryKwh: 80 },
    drs: {
      hasVerifiedSupplierQuote: true,
      hasCertifiedLeadElectrician: true,
      ownerPermissionsComplete: true,
      solarApartmentCapacityFitVerified: true,
      apartmentAtsMeterMappingVerified: true,
      atsKplcSwitchingVerified: true,
      monitoringConnectivityResolved: true,
      settlementDataTrusted: true,
    },
  },
  drs: {
    score: 78,
    label: 'Review',
    decision: 'deployment_ready',
    reasons: [],
    components: {
      demandCoverage: 72,
      prepaidCommitment: 80,
      loadProfile: 74,
      installationReadiness: 82,
      installerReadiness: 86,
      capitalAlignment: 70,
    },
  },
  energy: {
    E_gen: 8420, E_sold: 6320, E_battery_used: 980, E_grid: 1140, E_waste: 240,
    utilization: 0.75,
  },
  settlement: { providerPool: 142000 },
  transparency: {
    privacyNote: 'Resident benchmarks are described across 38 homes without exposing individual neighbors.',
  },
  roleViews: {
    resident: {
      prepaidBalanceKes: 1240,
      averagePrepaidBalanceKes: 1850,
      monthlySolarKwh: 142,
      savingsKes: 480,
      solarCoverage: 0.62,
      ownedProviderShare: 0.08,
    },
    owner: {
      residentParticipation: 0.84,
      prepaidMonthsCovered: 2,
      prepaidCoverage: 0.81,
      monthlyRoyaltyKes: 18400,
      comparableMedianRoyaltyKes: 16200,
      gates: [
        { label: 'Demand coverage ≥ 60%', complete: true },
        { label: 'Prepaid commitment received', complete: true },
        { label: 'Provider lock', complete: true },
        { label: 'Certified lead electrician', complete: true },
        { label: 'Monitoring online', complete: true },
      ],
    },
    provider: {
      monthlyPayoutKes: 64200,
      monetizedKwh: 6320,
      generatedKwh: 8420,
      retainedOwnership: 0.74,
      soldOwnership: 0.26,
      utilization: 0.75,
      wasteKwh: 240,
      gridFallbackKwh: 1140,
      warrantyDocuments: 5,
      openMaintenanceTickets: 1,
      monitoringStatus: 'online',
      deploymentGates: [
        { label: 'DRS approval', complete: true },
        { label: 'Provider lock', complete: true },
        { label: 'Electrician lead assigned', complete: true },
        { label: 'Monitoring online', complete: true },
        { label: 'Settlement data trusted', complete: true },
      ],
    },
    financier: {
      committedCapitalKes: 4_200_000,
      remainingCapitalKes: 1_350_000,
      fundingProgress: 0.76,
      monthlyRecoveryKes: 88_000,
    },
    installer: {
      certified: true,
      checklistComplete: 8,
      checklistTotal: 9,
      maintenanceTickets: 1,
    },
    supplier: {
      openRequests: 3,
      catalogItems: 32,
      warrantyDocuments: 5,
      reliabilityScore: 88,
      leadTimeDays: 6,
      verifiedBom: true,
    },
  },
  // Owner activity (used by OwnerScreenShell)
  activity: [
    'Resident participation crossed 80% on Tuesday — provider lock window opens.',
    'Inspection access window confirmed for Thursday 09:00–13:00.',
    'Settlement readings re-aligned to inverter feed; no open exceptions.',
  ],
  // Financier project list
  projects: [
    { name: 'Riverside Apartments', locationBand: 'Nairobi · Kileleshwa', units: 38, score: 78, fundingProgress: 0.76, remaining: 'KSh 1.35M', tone: 'good' },
    { name: 'Tatu Heights', locationBand: 'Ruiru · Eastern bypass', units: 56, score: 62, fundingProgress: 0.42, remaining: 'KSh 3.8M', tone: 'warn' },
    { name: 'Highridge Court', locationBand: 'Nairobi · Westlands', units: 24, score: 84, fundingProgress: 0.95, remaining: 'KSh 0.18M', tone: 'good' },
  ],
};

window.MOCK = MOCK;
