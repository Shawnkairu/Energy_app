// Per docs/SPRINT_CONTRACT.md §4 and docs/IA_SPEC.md §1
// - 'supplier' merged into 'provider' (with BusinessType for differentiation)
// - 'installer' renamed to 'electrician'
// - 'owner' renamed to 'building_owner'
// - 'homeowner' added: single-family-home owner who is also the sole resident
//   of their own building. Combines building_owner project lifecycle with
//   resident token/consumption flow. Backed by buildings.kind='single_family'.
// Admin is intentionally last; role-select UI must filter to PublicRole only.
export type Role =
  | "resident"
  | "homeowner"
  | "building_owner"
  | "provider"
  | "financier"
  | "electrician"
  | "admin";

export type PublicRole = Exclude<Role, "admin">;

export type BusinessType = "panels" | "infrastructure" | "both";

export type BuildingKind = "apartment" | "single_family";

// Back-compat alias. New code should prefer Role.
export type StakeholderRole = Role;

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

// =============================================================================
// SPRINT_CONTRACT additions — per docs/SPRINT_CONTRACT.md §4
// These are the locked types all three sprint agents code against.
// =============================================================================

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: Role;
  businessType: BusinessType | null;   // only meaningful when role === 'provider'
  buildingId: string | null;
  onboardingComplete: boolean;
  displayName: string | null;
  createdAt: string;
  lastSeenAt: string | null;
}

export interface PrepaidCommitment {
  id: string;
  buildingId: string;
  userId: string;
  amountKes: number;
  paymentMethod: "pledge" | "mpesa";
  status: "pending" | "confirmed" | "failed";
  createdAt: string;
  confirmedAt: string | null;
}

export interface EnergyReading {
  buildingId: string;
  timestamp: string;
  kind: "generation" | "load" | "irradiance";
  value: number;
  unit: string;
  source: "synthetic" | "measured";
  provenance: string;
}

// Geo polygon. Loosely typed as GeoJSON-like; full GeoJSON typing not pulled in to avoid a dep.
export interface PolygonCoord {
  lat: number;
  lon: number;
}

export interface RoofPolygon {
  geojson: { type: "Polygon"; coordinates: number[][][] };
  areaM2: number;
  source: "microsoft_footprints" | "owner_traced" | "owner_typed";
  confidence: number;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface ProjectCard {
  buildingId: string;
  name: string;
  address: string;
  photoUrl: string | null;
  drsScore: number;
  drsDecision: DeploymentDecision;
  stage: "listed" | "qualifying" | "funding" | "installing" | "live" | "retired";
  gapSummary: string;
  capitalAskKes?: number;
  equipmentAsk?: { panels?: number; infrastructure?: string[] };
  electricianAsk?: { scope: "install" | "inspection" | "maintenance"; payEstimateKes: number };
}

export interface InventoryItem {
  id: string;
  providerUserId: string;
  sku: string;
  kind: "panel" | "infra";
  stock: number;
  unitPriceKes: number;
  reliabilityScore: number;
}

export interface Certification {
  id: string;
  electricianUserId: string;
  name: string;
  issuer: string;
  docUrl: string;
  issuedAt: string;
  expiresAt: string;
  status: "valid" | "expiring" | "expired";
}

export interface JobChecklistItem {
  id: string;
  label: string;
  status: "pending" | "done" | "failed";
  photoUrl?: string;
  reading?: string;
}

export interface Job {
  id: string;
  electricianUserId: string;
  buildingId: string;
  scope: "install" | "inspection" | "maintenance";
  status: "active" | "completed";
  checklist: JobChecklistItem[];
  payEstimateKes: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface FinancierPosition {
  buildingId: string;
  committedKes: number;
  deployedKes: number;
  returnsToDateKes: number;
  irrPct: number;
  milestonesHit: string[];
}

export interface WalletTransaction {
  id: string;
  userId: string;
  at: string;
  kind: "pledge" | "royalty" | "equipment_sale" | "job_payment" | "capital_deploy" | "capital_return";
  amountKes: number;       // signed: negative = out, positive = in
  reference: string;
}

// Persisted settlement record (distinct from SettlementOutputs which is computed/projected).
export interface SettlementPeriod {
  id: string;
  buildingId: string;
  periodStart: string;
  periodEnd: string;
  eGen: number;
  eSold: number;
  eWaste: number;
  revenueKes: number;
  payouts: {
    provider: number;
    financier: number;
    owner: number;
    emappa: number;
    reserve: number;
  };
  simulation: boolean;        // pilot: always true
  dataSource: "synthetic" | "measured" | "mixed";
  createdAt: string;
}

// Building extension fields per IA + roof capture flow.
// Existing BuildingProject is the projector domain object; this is the persisted-record shape
// used by /buildings endpoints.
export interface BuildingRecord {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  unitCount: number;
  occupancy: number | null;
  kind: BuildingKind;     // 'single_family' is required when owner role is 'homeowner'
  stage: "listed" | "qualifying" | "funding" | "installing" | "live" | "retired";
  roofAreaM2?: number;
  roofPolygonGeojson?: { type: "Polygon"; coordinates: number[][][] };
  roofSource?: "microsoft_footprints" | "owner_traced" | "owner_typed";
  roofConfidence?: number;
  dataSource: "synthetic" | "measured" | "mixed";
  createdAt: string;
  updatedAt: string;
}
