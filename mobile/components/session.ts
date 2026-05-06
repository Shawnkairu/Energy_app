import type { StakeholderRole } from "@emappa/shared";

const SESSION_KEY = "emappa.mobile.session";

let inMemorySession: PilotSession | null = null;

export interface PilotSession {
  phone: string;
  role?: StakeholderRole;
  token?: string;
  buildingId?: string | null;
  createdAt: string;
}

export function savePilotSession(session: Omit<PilotSession, "createdAt">) {
  writeSession({ ...session, createdAt: new Date().toISOString() });
}

export function saveSelectedRole(role: StakeholderRole) {
  const session = readPilotSession() ?? {
    phone: "+254 7XX XXX XXX",
    createdAt: new Date().toISOString(),
  };
  writeSession({ ...session, role });
}

export function readPilotSession() {
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
    // Native storage can be swapped in here without changing the auth screens.
  }
}
