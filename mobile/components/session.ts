import type { StakeholderRole } from "@emappa/shared";

const SESSION_KEY = "emappa.mobile.session";

interface PilotSession {
  phone: string;
  role?: StakeholderRole;
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
    return raw ? (JSON.parse(raw) as PilotSession) : null;
  } catch {
    return null;
  }
}

function writeSession(session: PilotSession) {
  try {
    globalThis.localStorage?.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Native storage can be swapped in here without changing the auth screens.
  }
}
