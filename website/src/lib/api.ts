import {
  getProjects,
  getRoleHome,
} from "@emappa/api-client";
import { getSyntheticRoleTimeline, replaySyntheticScenario } from "@emappa/shared";
import type {
  BuildingRecord,
  BusinessType,
  Certification,
  EnergyReading,
  FinancierPosition,
  InventoryItem,
  Job,
  PrepaidCommitment,
  ProjectCard,
  ProjectedBuilding,
  PublicRole,
  SyntheticTimelineEvent,
  User,
  WalletTransaction,
} from "@emappa/shared";

const SESSION_KEY = "emappa_website_session";
const WAITLIST_STORAGE_KEY = "emappa.waitlist.leads";

export interface WebSession {
  token: string;
  user: User;
}

export interface WaitlistLead {
  name: string;
  email: string;
  phone?: string;
  role: PublicRole;
  neighborhood: string;
}

export interface WaitlistSubmission extends WaitlistLead {
  id: string;
  createdAt: string;
  source: "api" | "local";
}

export interface WalletBalance {
  kes: number;
  breakdown: Record<string, number | string>;
}

export interface EnergyToday {
  generation_kwh: number[];
  load_kwh: number[];
  irradiance_w_m2: number[];
}

export interface PortalData {
  roleHome: Awaited<ReturnType<typeof getRoleHome>> | null;
  projects: ProjectedBuilding[];
  energyToday: EnergyToday | null;
  energySeries: EnergyReading[];
  prepaidBalance: { confirmed_total_kes: number } | null;
  prepaidHistory: PrepaidCommitment[];
  discover: ProjectCard[];
  inventory: InventoryItem[];
  jobs: Job[];
  certifications: Certification[];
  portfolio: FinancierPosition[];
  walletBalance: WalletBalance | null;
  walletTransactions: WalletTransaction[];
  syntheticTimeline: SyntheticTimelineEvent[];
}

export function initializeApi() {
  (globalThis as { __EMAPPA_API_BASE_URL__?: string }).__EMAPPA_API_BASE_URL__ = getApiBaseUrl();
}

export function getApiBaseUrl() {
  const fromVite = (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL;
  const fromWindow = (globalThis as { __EMAPPA_API_BASE_URL__?: string }).__EMAPPA_API_BASE_URL__;
  return (fromVite || fromWindow || "").replace(/\/+$/, "");
}

export function readSession(): WebSession | null {
  try {
    const raw = globalThis.localStorage?.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as WebSession) : null;
  } catch {
    return null;
  }
}

export function persistSession(session: WebSession) {
  initializeApi();
  globalThis.localStorage?.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  initializeApi();
  globalThis.localStorage?.removeItem(SESSION_KEY);
}

export async function requestEmailOtp(email: string) {
  const remote = await apiRequest<{ ok: true }>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return remote ?? { ok: true };
}

export async function verifyEmailOtp(email: string, code: string): Promise<WebSession> {
  const remote = await apiRequest<WebSession>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });

  const session = remote ?? createFallbackSession(email);
  persistSession(session);
  return session;
}

/** POST with JSON body; throws on transport or non-2xx (for onboarding flows). */
export async function apiPostJson<T>(path: string, body: unknown): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("API base URL not configured");
  }
  const token = readSession()?.token;
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let detail: string = response.statusText;
    try {
      const data = (await response.json()) as { detail?: unknown; error?: unknown };
      detail = String(data.detail ?? data.error ?? detail);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export async function apiGetJson<T>(path: string): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("API base URL not configured");
  }
  const token = readSession()?.token;
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    let detail: string = response.statusText;
    try {
      const data = (await response.json()) as { detail?: unknown; error?: unknown };
      detail = String(data.detail ?? data.error ?? detail);
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export async function selectRole(body: {
  role: PublicRole;
  displayName?: string;
  businessType?: BusinessType;
}): Promise<{ user: User }> {
  return apiPostJson<{ user: User }>("/me/select-role", {
    role: body.role,
    displayName: body.displayName,
    businessType: body.businessType,
  });
}

export async function fetchAuthMeFresh(): Promise<User | null> {
  try {
    return await apiGetJson<User>("/auth/me");
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const remote = await apiRequest<User>("/auth/me");
  if (remote) return remote;
  return readSession()?.user ?? null;
}

export async function loadPortalData(role: PublicRole, user: User, primary: ProjectedBuilding | null): Promise<PortalData> {
  const buildingId = user.buildingId ?? primary?.project.id ?? "";
  const userId = user.id;
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 30);

  const [
    roleHome,
    projects,
    energyToday,
    energySeries,
    prepaidBalance,
    prepaidHistory,
    discover,
    inventory,
    jobs,
    certifications,
    portfolio,
    walletBalance,
    walletTransactions,
  ] = await Promise.all([
    getRoleHome(role),
    getProjects(),
    buildingId ? getEnergyToday(buildingId) : Promise.resolve(null),
    buildingId ? getEnergySeries(buildingId, "generation", from.toISOString(), today.toISOString()) : Promise.resolve([]),
    buildingId ? getPrepaidBalance(buildingId) : Promise.resolve(null),
    buildingId ? getPrepaidHistory(buildingId) : Promise.resolve([]),
    role === "provider" || role === "electrician" || role === "financier" ? getDiscover(role) : Promise.resolve([]),
    role === "provider" ? getProviderInventory(userId) : Promise.resolve([]),
    role === "electrician" ? getElectricianJobs(userId) : Promise.resolve([]),
    role === "electrician" ? getElectricianCertifications(userId) : Promise.resolve([]),
    role === "financier" ? getFinancierPortfolio(userId) : Promise.resolve([]),
    getWalletBalance(userId),
    getWalletTransactions(userId),
  ]);

  return {
    roleHome,
    projects,
    energyToday,
    energySeries,
    prepaidBalance,
    prepaidHistory,
    discover,
    inventory,
    jobs,
    certifications,
    portfolio,
    walletBalance,
    walletTransactions,
    syntheticTimeline: getSyntheticRoleTimeline(role, replaySyntheticScenario({ phase: "settlement" })),
  };
}

export async function submitWaitlistLead(lead: WaitlistLead): Promise<WaitlistSubmission> {
  const remote = await apiRequest<WaitlistSubmission>("/waitlist", {
    method: "POST",
    body: JSON.stringify(lead),
  });
  if (remote) return { ...lead, ...remote, source: "api" };

  const submission: WaitlistSubmission = {
    ...lead,
    id: `local-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: "local",
  };
  persistLocalWaitlistLead(submission);
  return submission;
}

export async function createBuildingForOnboarding(body: {
  name: string;
  address: string;
  lat: number;
  lon: number;
  unit_count: number;
  occupancy: number;
  kind: "single_family" | "apartment";
}) {
  return apiRequest<{ building: BuildingRecord }>("/buildings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function suggestRoof(lat: number, lon: number) {
  return apiRequest<{ polygon_geojson: unknown; area_m2: number; confidence: number } | { available: false }>(
    `/buildings/roof/suggest?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
  );
}

export async function saveRoof(buildingId: string, body: { polygon_geojson?: unknown; area_m2?: number; source: string }) {
  return apiRequest<{ building: BuildingRecord }>(`/buildings/${encodeURIComponent(buildingId)}/roof`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function completeOnboarding(body: {
  displayName?: string;
  businessType?: BusinessType;
  profile?: Record<string, unknown>;
}) {
  return apiPostJson<{ user: User }>("/me/onboarding-complete", {
    displayName: body.displayName,
    businessType: body.businessType,
    profile: body.profile,
  });
}

export async function joinBuildingWithCode(code: string) {
  return apiPostJson<{
    building: { id: string; name: string; address: string; kind: string; unitCount: number };
  }>("/me/join-building", { code: code.trim() });
}

export async function commitPrepaidWeb(buildingId: string, amountKes: number) {
  return apiPostJson<{ commitment: { amountKes: number; status: string } }>("/prepaid/commit", { buildingId, amountKes });
}

export async function geocodeQuery(q: string) {
  return apiGetJson<{ lat: number; lon: number; formattedAddress: string }>(
    `/geocode?q=${encodeURIComponent(q.trim())}`,
  );
}

async function getEnergyToday(buildingId: string) {
  return apiRequest<EnergyToday>(`/energy/${encodeURIComponent(buildingId)}/today`);
}

async function getEnergySeries(buildingId: string, kind: string, from: string, to: string) {
  return apiRequest<EnergyReading[]>(
    `/energy/${encodeURIComponent(buildingId)}/series?kind=${encodeURIComponent(kind)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  ).then((value) => value ?? []);
}

async function getPrepaidBalance(buildingId: string) {
  return apiRequest<{ confirmed_total_kes: number }>(`/prepaid/${encodeURIComponent(buildingId)}/balance`);
}

async function getPrepaidHistory(buildingId: string) {
  return apiRequest<PrepaidCommitment[]>(`/prepaid/${encodeURIComponent(buildingId)}/history`).then((value) => value ?? []);
}

async function getDiscover(role: "provider" | "electrician" | "financier") {
  return apiRequest<ProjectCard[]>(`/discover?role=${role}`).then((value) => value ?? []);
}

async function getProviderInventory(userId: string) {
  return apiRequest<InventoryItem[]>(`/providers/${encodeURIComponent(userId)}/inventory`).then((value) => value ?? []);
}

async function getElectricianJobs(userId: string) {
  return apiRequest<Job[]>(`/electricians/${encodeURIComponent(userId)}/jobs?status=active`).then((value) => value ?? []);
}

async function getElectricianCertifications(userId: string) {
  return apiRequest<Certification[]>(`/electricians/${encodeURIComponent(userId)}/certifications`).then((value) => value ?? []);
}

async function getFinancierPortfolio(userId: string) {
  return apiRequest<FinancierPosition[]>(`/financiers/${encodeURIComponent(userId)}/portfolio`).then((value) => value ?? []);
}

async function getWalletBalance(userId: string) {
  return apiRequest<WalletBalance>(`/wallet/${encodeURIComponent(userId)}/balance`);
}

async function getWalletTransactions(userId: string) {
  return apiRequest<WalletTransaction[]>(`/wallet/${encodeURIComponent(userId)}/transactions`).then((value) => value ?? []);
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T | null> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return null;

  try {
    const token = readSession()?.token;
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) return null;
    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

function createFallbackSession(email: string): WebSession {
  const role = inferRole(email);
  return {
    token: `demo-${Date.now()}`,
    user: {
      id: `demo-${role}`,
      email,
      phone: null,
      role,
      businessType: role === "provider" ? "both" : null,
      buildingId: null,
      onboardingComplete: true,
      displayName: displayNameFor(role),
      profile: {},
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    },
  };
}

function inferRole(email: string): PublicRole | "admin" {
  const normalized = email.toLowerCase();
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("homeowner")) return "homeowner";
  if (normalized.includes("building-owner") || normalized.includes("owner")) return "building_owner";
  if (normalized.includes("provider")) return "provider";
  if (normalized.includes("electrician") || normalized.includes("installer")) return "electrician";
  if (normalized.includes("financier")) return "financier";
  return "resident";
}

function displayNameFor(role: PublicRole | "admin") {
  return role
    .replace("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function persistLocalWaitlistLead(submission: WaitlistSubmission) {
  try {
    const current = globalThis.localStorage?.getItem(WAITLIST_STORAGE_KEY);
    const submissions = current ? (JSON.parse(current) as WaitlistSubmission[]) : [];
    globalThis.localStorage?.setItem(WAITLIST_STORAGE_KEY, JSON.stringify([...submissions, submission]));
  } catch {
    // Local fallback is best-effort only.
  }
}
