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

let configuredBaseUrl: string | null = null;

export function configureApiClient(config: ApiClientConfig) {
  configuredBaseUrl = cleanBaseUrl(config.baseUrl);
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

  const response = await fetch(`${baseUrl}${path}`, init);
  if (!response.ok) {
    throw new Error(`e.mappa API ${path} failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
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

function persistLocalWaitlistLead(submission: WaitlistSubmission) {
  try {
    const current = globalThis.localStorage?.getItem(WAITLIST_STORAGE_KEY);
    const submissions = current ? (JSON.parse(current) as WaitlistSubmission[]) : [];
    globalThis.localStorage?.setItem(WAITLIST_STORAGE_KEY, JSON.stringify([...submissions, submission]));
  } catch {
    // Some native/runtime contexts do not expose localStorage; the resolved submission is still usable by the UI.
  }
}
