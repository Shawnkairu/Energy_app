import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import type { AuthSession, BusinessType, StakeholderRole, User } from "@emappa/shared";
import { clearPilotSession, PilotSession, readPilotSession, savePilotSession, saveSelectedRole } from "./session";

export interface AuthContextValue {
  session: PilotSession | null;
  isHydrating: boolean;
  signIn: (authSession: AuthSession) => void;
  setRole: (role: StakeholderRole) => void;
  completeProfile: (profile: { displayName?: string; businessType?: BusinessType | null }) => void;
  refreshUser: (user: User) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<PilotSession | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    setSession(readPilotSession());
    setIsHydrating(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isHydrating,
      signIn: (authSession) => {
        const nextSession = toPilotSession(authSession);
        savePilotSession(nextSession);
        setSession(readPilotSession());
      },
      setRole: (role) => {
        saveSelectedRole(role);
        setSession(readPilotSession());
      },
      completeProfile: (profile) => {
        setSession((current) => {
          if (!current) {
            return current;
          }

          const nextSession: PilotSession = {
            ...current,
            role: current.user?.role ?? current.role,
            user: current.user
              ? {
                  ...current.user,
                  businessType: profile.businessType ?? current.user.businessType,
                  displayName: profile.displayName ?? current.user.displayName,
                  onboardingComplete: true,
                }
              : current.user,
          };
          savePilotSession(nextSession);
          return readPilotSession();
        });
      },
      refreshUser: (user) => {
        setSession((current) => {
          if (!current) {
            return current;
          }

          const nextSession: PilotSession = {
            ...current,
            email: user.email,
            phone: user.phone,
            role: user.role,
            user,
            buildingId: user.buildingId,
          };
          savePilotSession(nextSession);
          return readPilotSession();
        });
      },
      clearSession: () => {
        clearPilotSession();
        setSession(null);
      },
    }),
    [isHydrating, session],
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

function toPilotSession(authSession: AuthSession): Omit<PilotSession, "createdAt"> {
  return {
    email: authSession.user.email,
    phone: authSession.user.phone,
    token: authSession.token,
    role: authSession.user.role,
    user: authSession.user,
    buildingId: authSession.user.buildingId,
  };
}
