import {
  demoProjects,
  projectBuilding,
  roles,
  type BuildingProject,
  type ProjectedBuilding,
  type StakeholderRole,
} from "@emappa/shared";

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const WAITLIST_STORAGE_KEY = "emappa.waitlist.leads";

type RemoteProject = BuildingProject | ProjectedBuilding;

export interface ApiClientConfig {
  baseUrl?: string | null;
  token?: string | null;
}

export interface RoleHome {
  role: StakeholderRole;
  primary: ProjectedBuilding;
  projects: ProjectedBuilding[];
  activity: string[];
}

export interface WaitlistLead {
  role: string;
  phone: string;
  neighborhood: string;
}

export interface WaitlistSubmission extends WaitlistLead {
  id: string;
  createdAt: string;
  source: "api" | "local";
}

export interface AuthUser {
  id: string;
  phone: string;
  role: StakeholderRole;
  buildingId?: string | null;
}

export interface TokenResponse {
  token: string;
  user: AuthUser;
}

export interface PrepaidCommitment {
  id: string;
  buildingId: string;
  residentId: string;
  amountKes: number;
  status: "pending" | "confirmed" | "allocated" | "refunded";
  createdAt: string;
}

export interface PrepaidBalance {
  buildingId: string;
  confirmedKes: number;
}

export interface DrsAssessment {
  score: number;
  decision: string;
  analysis: string;
  recommendations: string[];
  toolCallsMade: string[];
}

let configuredBaseUrl: string | null = null;
let configuredToken: string | null = null;

export function configureApiClient(config: ApiClientConfig) {
  configuredBaseUrl = cleanBaseUrl(config.baseUrl);
  configuredToken = config.token ?? configuredToken;
}

export function getApiMode() {
  return getBaseUrl() ? "api" : "mock";
}

export async function getRoles() {
  const remote = await request<typeof roles>("/roles");
  if (remote) return remote;

  await delay();
  return roles;
}

export async function getProjects() {
  const remote = await request<RemoteProject[]>("/projects");
  if (remote) return remote.map(normalizeProject);

  await delay();
  return getMockProjects();
}

export async function getProject(projectId: string) {
  const remote = await request<RemoteProject>(`/projects/${encodeURIComponent(projectId)}`);
  if (remote) return normalizeProject(remote);

  await delay();
  return getMockProject(projectId);
}

export async function getRoleHome(role: StakeholderRole): Promise<RoleHome> {
  const remote = await request<RoleHome>(`/roles/${encodeURIComponent(role)}/home`);
  if (remote) return remote;

  const projects = getMockProjects();
  const primary = projects[0];

  return {
    role,
    primary,
    projects,
    activity: [
      "Resident prepaid commitment increased by KSh 18,000",
      "Supplier quote verified for inverter and battery package",
      "Installer checklist ready for Nyeri Ridge A",
      "DRS review flagged low utilization risk at Karatina Court",
    ],
  };
}

export async function submitWaitlistLead(lead: WaitlistLead): Promise<WaitlistSubmission> {
  const remote = await request<WaitlistSubmission>("/waitlist", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(lead),
  });

  if (remote) return remote;

  const submission: WaitlistSubmission = {
    ...lead,
    id: `local-${Date.now()}`,
    createdAt: new Date().toISOString(),
    source: "local",
  };
  persistLocalWaitlistLead(submission);
  await delay();
  return submission;
}

export async function requestOtp(phone: string) {
  const remote = await request<{ status: string; channel: string }>("/auth/request-otp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  await delay();
  return remote ?? { status: "sent", channel: "demo" };
}

export async function verifyOtp(phone: string, code: string): Promise<TokenResponse> {
  const remote = await request<TokenResponse>("/auth/verify-otp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });

  if (remote) {
    configuredToken = remote.token;
    return remote;
  }

  await delay();
  return {
    token: `demo-${Date.now()}`,
    user: { id: "pilot-user", phone, role: "resident", buildingId: "nyeri-ridge-a" },
  };
}

export async function commitPrepaid(buildingId: string, amountKes: number, residentId = "pilot-resident") {
  const remote = await request<PrepaidCommitment>("/prepaid/commit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ buildingId, amountKes, residentId }),
  });

  if (remote) return remote;
  await delay();
  return {
    id: `local-prepaid-${Date.now()}`,
    buildingId,
    residentId,
    amountKes,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };
}

export async function confirmPrepaid(commitmentId: string) {
  return request<PrepaidCommitment>(`/prepaid/${encodeURIComponent(commitmentId)}/confirm`, {
    method: "POST",
  });
}

export async function getPrepaidBalance(buildingId: string): Promise<PrepaidBalance> {
  const remote = await request<PrepaidBalance>(`/prepaid/${encodeURIComponent(buildingId)}/balance`);
  if (remote) return remote;

  const project = getMockProject(buildingId);
  await delay();
  return { buildingId, confirmedKes: project?.project.prepaidCommittedKes ?? 0 };
}

export async function getPrepaidHistory(buildingId: string): Promise<PrepaidCommitment[]> {
  const remote = await request<PrepaidCommitment[]>(`/prepaid/${encodeURIComponent(buildingId)}/history`);
  if (remote) return remote;

  await delay();
  return [];
}

export async function getDrs(buildingId: string) {
  const remote = await request<ProjectedBuilding["drs"]>(`/drs/${encodeURIComponent(buildingId)}`);
  if (remote) return remote;
  return getMockProject(buildingId)?.drs ?? null;
}

export async function getDrsAssessment(buildingId: string) {
  return request<DrsAssessment>(`/drs/${encodeURIComponent(buildingId)}/assess`, {
    method: "POST",
  });
}

function getMockProjects() {
  return demoProjects.map(projectBuilding);
}

function getMockProject(projectId: string) {
  const project = demoProjects.find((item) => item.id === projectId);
  return project ? projectBuilding(project) : null;
}

function normalizeProject(project: RemoteProject): ProjectedBuilding {
  return isProjectedProject(project) ? project : projectBuilding(project);
}

function isProjectedProject(project: RemoteProject): project is ProjectedBuilding {
  return "settlement" in project && "roleViews" in project;
}

async function request<T>(path: string, init?: RequestInit) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) return null;

  try {
    const response = await fetch(`${baseUrl}${path}`, withAuthHeaders(init));
    if (!response.ok) {
      console.warn(`e.mappa API ${path} failed with ${response.status}; using local demo data when available.`);
      return null;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.warn(`e.mappa API ${path} unavailable; using local demo data when available.`, error);
    return null;
  }
}

function getBaseUrl() {
  if (configuredBaseUrl) return configuredBaseUrl;
  const globalBaseUrl = (globalThis as { __EMAPPA_API_BASE_URL__?: string }).__EMAPPA_API_BASE_URL__;
  return cleanBaseUrl(globalBaseUrl);
}

function cleanBaseUrl(baseUrl: string | null | undefined) {
  const trimmed = baseUrl?.trim();
  return trimmed ? trimmed.replace(/\/+$/, "") : null;
}

function withAuthHeaders(init?: RequestInit): RequestInit | undefined {
  if (!configuredToken) return init;
  return {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      authorization: `Bearer ${configuredToken}`,
    },
  };
}

function persistLocalWaitlistLead(submission: WaitlistSubmission) {
  try {
    const current = globalThis.localStorage?.getItem(WAITLIST_STORAGE_KEY);
    const submissions = current ? (JSON.parse(current) as WaitlistSubmission[]) : [];
    globalThis.localStorage?.setItem(WAITLIST_STORAGE_KEY, JSON.stringify([...submissions, submission]));
  } catch {
    // Some native/runtime contexts do not expose localStorage; the resolved submission is still usable by the UI.
  }
}
