// e.mappa API client
//
// Real-mode (baseUrl set): hits the FastAPI backend. Bearer-token auth via the
// optional `token` config field. Errors throw ApiError.
//
// Mock-mode (baseUrl null): graceful fallback to demoProjects from
// @emappa/shared so frontend dev work is never blocked. Pilot endpoints that
// have no shared-mock equivalent throw NotInMockMode in mock-mode.

import {
  demoProjects,
  projectBuilding,
  roles,
  type BuildingProject,
  type ProjectedBuilding,
  type AuthSession,
  type BuildingRecord,
  type Certification,
  type EnergyReading,
  type FinancierPosition,
  type InventoryItem,
  type Job,
  type PrepaidCommitment,
  type ProjectCard,
  type Role,
  type RoofPolygon,
  type SettlementPeriod,
  type StakeholderRole,
  type User,
  type WalletTransaction,
} from "@emappa/shared";

const WAITLIST_STORAGE_KEY = "emappa.waitlist.leads";

// ---------------------------------------------------------------------------
// Config + error types
// ---------------------------------------------------------------------------

export interface ApiClientConfig {
  baseUrl?: string | null;
  token?: string | null;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
    this.name = "ApiError";
  }
}

export class NotInMockMode extends Error {
  constructor(endpoint: string) {
    super(`Endpoint ${endpoint} requires API mode (baseUrl set).`);
    this.name = "NotInMockMode";
  }
}

// ---------------------------------------------------------------------------
// Legacy aliases preserved for migration
// ---------------------------------------------------------------------------

export interface RoleHome {
  role: StakeholderRole;
  primary: ProjectedBuilding | null;
  projects: ProjectedBuilding[];
  activity: string[];
}

export interface WaitlistLead {
  name?: string;
  email: string;
  phone?: string;
  role?: string;
  neighborhood?: string;
}

export interface WaitlistSubmission extends WaitlistLead {
  id: string;
  createdAt: string;
  source: "api" | "local";
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

async function http<T>(
  cfg: ApiClientConfig,
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  if (!cfg.baseUrl) {
    throw new NotInMockMode(`${method} ${path}`);
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cfg.token) headers["Authorization"] = `Bearer ${cfg.token}`;

  const resp = await fetch(`${cfg.baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!resp.ok) {
    let detail = resp.statusText;
    try {
      const data = await resp.json();
      detail = data?.detail ?? data?.error ?? detail;
    } catch {
      /* keep statusText */
    }
    throw new ApiError(resp.status, String(detail), `${method} ${path} → ${resp.status}`);
  }

  // Some endpoints return empty body on success
  const text = await resp.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

// ---------------------------------------------------------------------------
// Client factory — preferred entry point for new code
// ---------------------------------------------------------------------------

export function createApiClient(cfg: ApiClientConfig) {
  const get = <T>(path: string) => http<T>(cfg, "GET", path);
  const post = <T>(path: string, body?: unknown) => http<T>(cfg, "POST", path, body);

  return {
    // auth
    requestOtp: (email: string) => post<{ ok: true }>(`/auth/request-otp`, { email }),
    verifyOtp: (email: string, code: string) =>
      post<AuthSession>(`/auth/verify-otp`, { email, code }),
    me: () => get<User>(`/auth/me`),
    completeOnboarding: (body: { displayName?: string; businessType?: string }) =>
      post<{ user: User }>(`/me/onboarding-complete`, body),

    // projects
    listProjects: () => get<ProjectedBuilding[]>(`/projects`),
    getProject: (id: string) => get<ProjectedBuilding>(`/projects/${id}`),
    roleHome: (role: Role) => get<RoleHome>(`/roles/${role}/home`),

    // waitlist
    submitWaitlistLead: (lead: WaitlistLead) =>
      post<{ ok: true }>(`/waitlist`, lead),

    // pledge / prepaid
    commitPrepaid: (input: { buildingId: string; amountKes: number }) =>
      post<{ commitment: PrepaidCommitment }>(`/prepaid/commit`, input),
    getPrepaidBalance: (buildingId: string) =>
      get<{ confirmedTotalKes: number }>(`/prepaid/${buildingId}/balance`),
    getPrepaidHistory: (buildingId: string) =>
      get<PrepaidCommitment[]>(`/prepaid/${buildingId}/history`),

    // buildings
    createBuilding: (input: {
      name: string;
      address: string;
      lat: number;
      lon: number;
      unitCount: number;
      occupancy?: number;
      kind?: string;
    }) => post<{ building: BuildingRecord }>(`/buildings`, input),
    setRoof: (
      buildingId: string,
      input: { polygonGeojson?: unknown; areaM2?: number; source: string }
    ) => post<{ building: BuildingRecord }>(`/buildings/${buildingId}/roof`, input),
    suggestRoof: (buildingId: string, lat: number, lon: number) =>
      get<RoofPolygon | { available: false }>(
        `/buildings/${buildingId}/roof/suggest?lat=${lat}&lon=${lon}`
      ),

    // energy
    getEnergyToday: (buildingId: string) =>
      get<{
        generation_kwh: number[];
        load_kwh: number[];
        irradiance_w_m2: number[];
      }>(`/energy/${buildingId}/today`),
    getEnergySeries: (buildingId: string, kind: string, from?: string, to?: string) =>
      get<EnergyReading[]>(
        `/energy/${buildingId}/series?kind=${encodeURIComponent(kind)}` +
          (from ? `&from=${encodeURIComponent(from)}` : "") +
          (to ? `&to=${encodeURIComponent(to)}` : "")
      ),

    // discover
    getDiscover: (role: "provider" | "electrician" | "financier") =>
      get<ProjectCard[]>(`/discover?role=${role}`),

    // drs
    getDrsAssessment: (buildingId: string) => get<unknown>(`/drs/${buildingId}`),
    getDrsHistory: (buildingId: string) => get<unknown[]>(`/drs/${buildingId}/history`),

    // settlement
    runSettlement: (input: {
      buildingId: string;
      periodStart: string;
      periodEnd: string;
    }) => post<{ period: SettlementPeriod }>(`/settlement/run`, input),
    getLatestSettlement: (buildingId: string) =>
      get<SettlementPeriod | null>(`/settlement/${buildingId}/latest`),
    getSettlementHistory: (buildingId: string) =>
      get<SettlementPeriod[]>(`/settlement/${buildingId}/history`),

    // ownership
    getOwnership: (
      buildingId: string,
      side: "provider" | "financier" | "resident" | "homeowner"
    ) => get<unknown[]>(`/ownership/${buildingId}/${side}`),

    // providers
    getProviderInventory: (userId: string) =>
      get<InventoryItem[]>(`/providers/${userId}/inventory`),
    addProviderInventory: (
      userId: string,
      input: { sku: string; kind: "panel" | "infra"; stock: number; unitPriceKes: number }
    ) => post<{ item: InventoryItem }>(`/providers/${userId}/inventory`, input),
    getProviderOrders: (userId: string) =>
      get<unknown[]>(`/providers/${userId}/orders`),
    getProviderQuoteRequests: (userId: string) =>
      get<unknown[]>(`/providers/${userId}/quote-requests`),

    // electricians
    getElectricianJobs: (userId: string, status?: string) =>
      get<Job[]>(
        `/electricians/${userId}/jobs${status ? `?status=${encodeURIComponent(status)}` : ""}`
      ),
    getCertifications: (userId: string) =>
      get<Certification[]>(`/electricians/${userId}/certifications`),
    addCertification: (
      userId: string,
      input: {
        name: string;
        issuer: string;
        docUrl?: string;
        issuedAt: string;
        expiresAt: string;
      }
    ) =>
      post<{ certification: Certification }>(`/electricians/${userId}/certifications`, input),

    // financiers
    getPortfolio: (userId: string) =>
      get<FinancierPosition[]>(`/financiers/${userId}/portfolio`),
    pledgeCapital: (
      userId: string,
      input: { buildingId: string; amountKes: number }
    ) =>
      post<{ position: FinancierPosition }>(`/financiers/${userId}/pledge-capital`, input),

    // wallet
    getWalletBalance: (userId: string) =>
      get<{ kes: number; breakdown: Record<string, number> }>(`/wallet/${userId}/balance`),
    getWalletTransactions: (userId: string) =>
      get<WalletTransaction[]>(`/wallet/${userId}/transactions`),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

// ---------------------------------------------------------------------------
// Legacy free-function exports — back-compat for unmigrated callers.
// All defer to a default mock-mode client (no baseUrl) and produce demo data.
// ---------------------------------------------------------------------------

const mockClient = (cfg: ApiClientConfig = {}): ApiClient => createApiClient(cfg);

export async function getProjects(): Promise<ProjectedBuilding[]> {
  return demoProjects.map((p) => projectBuilding(p));
}

export async function getRoleHome(role: StakeholderRole): Promise<RoleHome> {
  const projects = await getProjects();
  return {
    role,
    primary: projects[0] ?? null,
    projects,
    activity: [],
  };
}

export async function submitWaitlistLead(lead: WaitlistLead): Promise<WaitlistSubmission> {
  const submission: WaitlistSubmission = {
    ...lead,
    id: `local-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: "local",
  };
  if (typeof localStorage !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem(WAITLIST_STORAGE_KEY) ?? "[]");
      localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify([...existing, submission]));
    } catch {
      /* ignore */
    }
  }
  return submission;
}

export { roles };
