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

export type BuildingKind = "apartment" | "single_family" | "small_compound";

// Back-compat alias. New code should prefer Role.
export type StakeholderRole = Role;

/** Canonical DRS outcome — never infer deployment from display % alone (see docs/imported-specs). */
export type DeploymentDecision = "deployment_ready" | "review" | "blocked";

/** @deprecated Use `deployment_ready` — kept for archived JSON/migrations only */
export type LegacyDeploymentDecision = "approve" | "review" | "block";

export type DrsSiteKind = "apartment" | "homeowner";

export type DataQualityStatus = "verified" | "estimated" | "missing" | "delayed" | "disputed" | "conservative";

export type ExternalMonetization = "none" | "net_metering" | "export_credit" | "energy_trading" | "wheeling";

export type SettlementPhase = "recovery" | "royalty";

export type OperationalWorkflowId =
  | "ats_activation"
  | "verification_documents"
  | "quote_reservation"
  | "delivery_evidence"
  | "go_live_signoff"
  | "kyc_escrow"
  | "ai_evidence_ingestion";

export type OperationalWorkflowStatus = "pending" | "in_review" | "ready" | "blocked" | "prototype";

export interface OperationalWorkflowSnapshot {
  id: OperationalWorkflowId;
  label: string;
  status: OperationalWorkflowStatus;
  ownerRole: PublicRole | "admin";
  detail: string;
  evidenceLabel: string;
  /** Truthful pilot/prototype boundary; use when no production integration exists yet. */
  prototypeScope: boolean;
}

export interface DrsGateFailure {
  code: string;
  message: string;
  /** Who must act next; optional when internal/ops */
  responsibleRole?: PublicRole | "admin";
}

export interface DrsChecklistItem {
  id: string;
  category: string;
  displayWeight: number;
  critical: boolean;
  complete: boolean;
  label: string;
}

export interface LbrsChecklistItem {
  id: string;
  testName: string;
  displayWeight: number;
  critical: boolean;
  complete: boolean;
  label: string;
}

export type CapacityQueueStatus =
  | "interested"
  | "pledged"
  | "capacity_review"
  | "capacity_cleared"
  | "queued"
  | "waitlisted"
  | "activated";

export type QuoteState =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "reserved"
  | "committed"
  | "delivered"
  | "installed_activated"
  | "expired"
  | "cancelled";

export type ElectricianCertificationTier =
  | "helper"
  | "verified_electrician"
  | "lead_electrician"
  | "senior_inspector"
  | "restricted_probation";

export type FinancierEligibilityTier =
  | "watch_only"
  | "retail_limited"
  | "sophisticated"
  | "entity"
  | "institutional"
  | "restricted_jurisdiction";
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
  /** E_waste / E_gen (0 when E_gen is 0) */
  wasteRate: number;
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
  /** Sum of pool payouts — equals revenue when rates balanced and no shortfall */
  allocatedTotal: number;
  /** revenue - allocatedTotal when rates exceed 100% or forced cap */
  shortfallKes: number;
  phase: SettlementPhase;
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

/**
 * DRS inputs — canonical gate model in docs/imported-specs/installation-process-drs-lbrs-go-live.md.
 * Display components are advisory weights; `decision` is derived only from critical gates + warnings.
 */
export interface DrsInputs {
  /** Apartment vs homeowner path — selects which critical gate set applies */
  siteKind?: DrsSiteKind;
  /** Demand / load confidence (0–100) — display weight only unless paired with utilization kill */
  demandCoverage: number;
  prepaidCommitment: number;
  loadProfile: number;
  installationReadiness: number;
  /** @deprecated Prefer `electricianReadiness`; retained for demo JSON */
  installerReadiness: number;
  /** Electrician crew readiness score (0–100), display weight */
  electricianReadiness?: number;
  capitalAlignment: number;
  projectedUtilization: number;
  /**
   * Resident prepaid cash on books (when applicable).
   * Pilot pledges are non-purchases; use `hasResidentDemandSignal` for demand proof.
   */
  hasPrepaidFunds: boolean;
  /** Non-binding pledges + load artifacts sufficient to treat demand as evidenced */
  hasResidentDemandSignal?: boolean;
  hasCertifiedLeadElectrician: boolean;
  /** Solar/battery capacity verified against participating apartments (dedicated solar path, not common-bus). */
  solarApartmentCapacityFitVerified: boolean;
  /** Design-stage: apartment ATS + PAYG meter mapping plan complete */
  apartmentAtsMeterMappingVerified: boolean;
  /** Design-stage: ATS / KPLC failover architecture validated */
  atsKplcSwitchingVerified: boolean;
  ownerPermissionsComplete: boolean;
  /** Hardware package / verified BOM or quote for procurement */
  hasVerifiedSupplierQuote: boolean;
  /** Site inspection evidence complete (roof, meter bank, cable routes) */
  siteInspectionComplete?: boolean;
  /** Capacity plan (phases, max apartments, reserve margin) approved */
  capacityPlanApproved?: boolean;
  /** Vetted stakeholders committed (electrician, provider, financier as required) */
  stakeholdersVetted?: boolean;
  /** Electrician labor funded upfront or signed labor-as-capital terms */
  electricianLaborPaymentResolved?: boolean;
  /** Contracts, waterfall, compliance review signed off */
  contractsAndComplianceReady?: boolean;
  /** Homeowner-only: title/site authority verified */
  propertyAuthorityComplete?: boolean;
  /** Homeowner-only: roof/DB/meter feasibility */
  siteFeasibilityComplete?: boolean;
  /** Homeowner-only: load vs sizing discipline */
  loadProfileSizingComplete?: boolean;
  /** Homeowner-only: capital stack + labor payment */
  capitalAndLaborResolved?: boolean;
  /** Homeowner-only: procurement BOM path */
  hardwareProcurementComplete?: boolean;
  /** Homeowner-only: export / anti-islanding / permits */
  legalUtilityDisciplineComplete?: boolean;
  monitoringConnectivityResolved: boolean;
  settlementDataTrusted: boolean;
}

export interface DrsResult {
  /** Weighted display score (0–100); does not authorize installation without critical gates */
  score: number;
  decision: DeploymentDecision;
  /** Human-readable reasons (blockers + warnings) */
  reasons: string[];
  criticalFailures: DrsGateFailure[];
  warnings: string[];
  checklist: DrsChecklistItem[];
  components: {
    demandCoverage: number;
    prepaidCommitment: number;
    loadProfile: number;
    installationReadiness: number;
    electricianReadiness: number;
    /** @deprecated Use `electricianReadiness` */
    installerReadiness: number;
    capitalAlignment: number;
  };
}

export interface LbrsInputs {
  siteKind?: DrsSiteKind;
  asBuiltBomVerified: boolean;
  electricalSafetyComplete: boolean;
  solarBusIsolationVerified: boolean;
  inverterBatteryTestsComplete: boolean;
  atsSwitchingPerApartmentComplete?: boolean;
  /** Home path: changeover/ATS tests */
  homeSwitchingFallbackComplete?: boolean;
  meterMappingDataReliable: boolean;
  tokenSettlementDryRunPassed: boolean;
  backendTokenControlDryRunPassed: boolean;
  residentOwnerLaunchReadinessComplete: boolean;
}

export interface LbrsResult {
  score: number;
  decision: DeploymentDecision;
  reasons: string[];
  criticalFailures: DrsGateFailure[];
  warnings: string[];
  checklist: LbrsChecklistItem[];
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
  /** True when monthly monetized payout is zero or negative — do not show a fake payback date */
  notCurrentlyRecovering: boolean;
}

export interface BuildingProject {
  id: string;
  name: string;
  locationBand: string;
  units: number;
  stage: ProjectStage;
  /** Defaults to apartment economics when omitted */
  buildingKind?: BuildingKind;
  energy: EnergyInputs;
  solarPriceKes: number;
  gridPriceKes: number;
  settlementRates: SettlementRates;
  settlementPhase?: SettlementPhase;
  /** When omitted, derived from `stage` in projector (non-live = blocked LBRS). */
  lbrs?: LbrsInputs;
  drs: DrsInputs;
  providerOwnership: OwnershipPosition[];
  financierOwnership: OwnershipPosition[];
  capitalRequiredKes: number;
  fundedKes: number;
  prepaidCommittedKes: number;
  operationalWorkflows?: OperationalWorkflowSnapshot[];
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
  profile: Record<string, unknown>;     // role-specific onboarding bag; see SPRINT_CONTRACT §4
  createdAt: string;
  lastSeenAt: string | null;
}

export interface ElectricianProfile {
  region?: string;
  scope?: Array<"install" | "inspection" | "maintenance">;
}

export interface FinancierProfile {
  investor_kind?: "individual" | "institution";
  target_deal_size_kes?: number;
  target_return_pct?: number;
}

export interface GeocodeResult {
  lat: number;
  lon: number;
  formattedAddress: string;
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
  dataQuality?: DataQualityStatus;
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
  inviteCode?: string | null;          // shown to building owners; consumed by residents via /me/join-building
  createdAt: string;
  updatedAt: string;
}
