import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import type { StakeholderRole } from "@emappa/shared";
import { PilotSession, readPilotSession, savePilotSession, saveSelectedRole } from "./session";

export interface AuthContextValue {
  session: PilotSession | null;
  setPilotSession: (session: Omit<PilotSession, "createdAt">) => void;
  setRole: (role: StakeholderRole) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<PilotSession | null>(() => readPilotSession());

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      setPilotSession: (nextSession) => {
        savePilotSession(nextSession);
        setSession(readPilotSession());
      },
      setRole: (role) => {
        saveSelectedRole(role);
        setSession(readPilotSession());
      },
      clearSession: () => {
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
