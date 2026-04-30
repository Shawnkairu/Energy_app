export type StakeholderRole =
  | "resident"
  | "owner"
  | "provider"
  | "financier"
  | "installer"
  | "supplier"
  | "admin";

export type DeploymentDecision = "approve" | "review" | "block";
export type ProjectStage =
  | "lead"
  | "inspection"
  | "pre_onboarding"
  | "review"
  | "funding"
  | "supplier"
  | "install"
  | "verification"
  | "live"
  | "blocked";

export interface EnergyInputs {
  arrayKw: number;
  peakSunHours: number;
  systemEfficiency: number;
  batteryKwh: number;
  batteryDepthOfDischarge: number;
  batteryRoundTripEfficiency: number;
  monthlyDemandKwh: number;
  daytimeDemandFraction: number;
}

export interface EnergyOutputs {
  E_gen: number;
  E_direct: number;
  E_charge: number;
  E_battery_used: number;
  E_sold: number;
  E_waste: number;
  E_grid: number;
  utilization: number;
  coverage: number;
}

export interface SettlementRates {
  reserve: number;
  providers: number;
  financiers: number;
  owner: number;
  emappa: number;
}

export interface SettlementOutputs {
  revenue: number;
  reserve: number;
  providerPool: number;
  financierPool: number;
  ownerRoyalty: number;
  emappaFee: number;
  unallocated: number;
}

export interface OwnershipPosition {
  ownerId: string;
  ownerRole: StakeholderRole;
  percentage: number;
}

export interface OwnershipPayout {
  ownerId: string;
  ownerRole: StakeholderRole;
  percentage: number;
  payout: number;
}

export interface DrsInputs {
  demandCoverage: number;
  prepaidCommitment: number;
  loadProfile: number;
  installationReadiness: number;
  installerReadiness: number;
  capitalAlignment: number;
  projectedUtilization: number;
  hasPrepaidFunds: boolean;
  hasCertifiedLeadElectrician: boolean;
  meterInverterMatchResolved: boolean;
  ownerPermissionsComplete: boolean;
  hasVerifiedSupplierQuote: boolean;
  monitoringConnectivityResolved: boolean;
  settlementDataTrusted: boolean;
}

export interface DrsResult {
  score: number;
  decision: DeploymentDecision;
  reasons: string[];
  components: {
    demandCoverage: number;
    prepaidCommitment: number;
    loadProfile: number;
    installationReadiness: number;
    installerReadiness: number;
    capitalAlignment: number;
  };
}

export interface PaybackInputs {
  investment: number;
  monthlyPayout: number;
  targetMultiple?: number;
}

export interface PaybackResult {
  principalMonths: number;
  targetMonths: number;
  yearsToPrincipal: number;
  yearsToTarget: number;
}

export interface BuildingProject {
  id: string;
  name: string;
  locationBand: string;
  units: number;
  stage: ProjectStage;
  energy: EnergyInputs;
  solarPriceKes: number;
  gridPriceKes: number;
  settlementRates: SettlementRates;
  drs: DrsInputs;
  providerOwnership: OwnershipPosition[];
  financierOwnership: OwnershipPosition[];
  capitalRequiredKes: number;
  fundedKes: number;
  prepaidCommittedKes: number;
}
