import type { StakeholderRole, User } from "@emappa/shared";

const SESSION_KEY = "emappa.mobile.session";

let inMemorySession: PilotSession | null = null;

export interface PilotSession {
  email: string;
  phone?: string | null;
  role?: StakeholderRole;
  token: string;
  user?: User;
  buildingId?: string | null;
  createdAt: string;
}

export function savePilotSession(session: Omit<PilotSession, "createdAt">) {
  writeSession({ ...session, createdAt: new Date().toISOString() });
}

export function saveSelectedRole(role: StakeholderRole) {
  const session = readPilotSession() ?? {
    email: "pilot@emappa.local",
    token: "",
    createdAt: new Date().toISOString(),
  };
  writeSession({ ...session, role });
}

export function clearPilotSession() {
  inMemorySession = null;

  try {
    globalThis.localStorage?.removeItem(SESSION_KEY);
  } catch {
    // Native secure storage can replace this local fallback when the dependency is available.
  }
}

export function readPilotSession(): PilotSession | null {
  try {
    const raw = globalThis.localStorage?.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as PilotSession) : inMemorySession;
  } catch {
    return inMemorySession;
  }
}

function writeSession(session: PilotSession) {
  inMemorySession = session;

  try {
    globalThis.localStorage?.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Native secure storage can replace this local fallback when the dependency is available.
  }
}
