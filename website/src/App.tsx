import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { getProjects } from "@emappa/api-client";
import { getWebSections, type ProjectedBuilding, type PublicRole } from "@emappa/shared";
import MarketingPage from "./MarketingPage";
import { initializeApi, clearSession, loadPortalData, readSession, type PortalData, type WebSession, persistSession, fetchAuthMeFresh } from "./lib/api";
import { StakeholderOnboarding } from "./onboard/StakeholderOnboarding";
import { PortalShell } from "./portal/PortalShell";
import type { PortalScreenProps } from "./portal/types";
import { LoginLayer } from "./screens/LoginLayer";
import "./marketing-base.css";

const screenLoaders = {
  resident: {
    home: lazy(() => import("./screens/stakeholders/resident/home")),
    energy: lazy(() => import("./screens/stakeholders/resident/energy")),
    wallet: lazy(() => import("./screens/stakeholders/resident/wallet")),
    profile: lazy(() => import("./screens/stakeholders/resident/profile")),
  },
  homeowner: {
    home: lazy(() => import("./screens/stakeholders/homeowner/home")),
    energy: lazy(() => import("./screens/stakeholders/homeowner/energy")),
    wallet: lazy(() => import("./screens/stakeholders/homeowner/wallet")),
    profile: lazy(() => import("./screens/stakeholders/homeowner/profile")),
  },
  building_owner: {
    home: lazy(() => import("./screens/stakeholders/building-owner/home")),
    energy: lazy(() => import("./screens/stakeholders/building-owner/energy")),
    wallet: lazy(() => import("./screens/stakeholders/building-owner/wallet")),
    profile: lazy(() => import("./screens/stakeholders/building-owner/profile")),
  },
  provider: {
    discover: lazy(() => import("./screens/stakeholders/provider/discover")),
    projects: lazy(() => import("./screens/stakeholders/provider/projects")),
    generation: lazy(() => import("./screens/stakeholders/provider/generation")),
    wallet: lazy(() => import("./screens/stakeholders/provider/wallet")),
    profile: lazy(() => import("./screens/stakeholders/provider/profile")),
  },
  electrician: {
    discover: lazy(() => import("./screens/stakeholders/electrician/discover")),
    jobs: lazy(() => import("./screens/stakeholders/electrician/jobs")),
    wallet: lazy(() => import("./screens/stakeholders/electrician/wallet")),
    profile: lazy(() => import("./screens/stakeholders/electrician/profile")),
  },
  financier: {
    discover: lazy(() => import("./screens/stakeholders/financier/discover")),
    portfolio: lazy(() => import("./screens/stakeholders/financier/portfolio")),
    generation: lazy(() => import("./screens/stakeholders/financier/generation")),
    wallet: lazy(() => import("./screens/stakeholders/financier/wallet")),
    profile: lazy(() => import("./screens/stakeholders/financier/profile")),
  },
} satisfies Record<PublicRole, Record<string, React.LazyExoticComponent<(props: PortalScreenProps) => React.ReactNode>>>;

type ViewState =
  | { kind: "public" }
  | { kind: "login" }
  | { kind: "onboard"; role: PublicRole }
  | { kind: "portal"; role: PublicRole; tab: string };

export function App() {
  if (isWebsiteDisabled()) {
    return <WebsiteDisabled />;
  }

  return <WebsiteApp />;
}

function WebsiteApp() {
  const [session, setSession] = useState<WebSession | null>(() => readSession());
  const [project, setProject] = useState<ProjectedBuilding | null>(null);
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [view, setView] = useState<ViewState>(() => parseLocation(readSession()));

  useEffect(() => {
    initializeApi();
    getProjects().then((projects) => setProject(projects[0] ?? null));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("portal-mode", view.kind !== "public");
    return () => document.body.classList.remove("portal-mode");
  }, [view.kind]);

  useEffect(() => {
    if (!session || view.kind !== "portal") return;

    if (!isPublicRole(session.user.role)) {
      window.location.assign(getCockpitUrl());
      return;
    }

    const currentSections = getWebSections(view.role);
    const normalizedTab = normalizePortalTab(view.role, view.tab);
    if (normalizedTab !== view.tab) {
      routeTo({ kind: "portal", role: view.role, tab: normalizedTab });
      return;
    }

    if (session.user.role !== view.role) {
      const role = session.user.role;
      routeTo({ kind: "portal", role, tab: getWebSections(role)[0]?.id ?? "home" });
      return;
    }

    if (!currentSections.some((section) => section.id === view.tab)) {
      routeTo({ kind: "portal", role: view.role, tab: currentSections[0]?.id ?? "home" });
      return;
    }

    let cancelled = false;
    loadPortalData(view.role, session.user, project).then((data) => {
      if (!cancelled) {
        setPortalData(data);
        setProject(data.roleHome?.primary ?? data.projects[0] ?? project);
      }
    });
    return () => { cancelled = true; };
  }, [project, session, view]);

  const sections = useMemo(() => view.kind === "portal" ? getWebSections(view.role) : [], [view]);

  function routeTo(next: ViewState) {
    setView(next);
    const path = toPath(next);
    window.history.replaceState(null, "", path);
    window.scrollTo({ top: 0, left: 0 });
  }

  function handleSession(nextSession: WebSession) {
    setSession(nextSession);
    if (nextSession.user.role === "admin") {
      window.location.assign(getCockpitUrl());
      return;
    }

    const role = nextSession.user.role;
    if (!isPublicRole(role)) {
      routeTo({ kind: "login" });
      return;
    }

    if (!nextSession.user.onboardingComplete) {
      routeTo({ kind: "onboard", role });
      return;
    }

    const first = getWebSections(role)[0]?.id ?? "home";
    routeTo({ kind: "portal", role, tab: first });
  }

  function logout() {
    clearSession();
    setSession(null);
    setPortalData(null);
    routeTo({ kind: "public" });
  }

  if (view.kind === "login") {
    return <LoginLayer onBack={() => routeTo({ kind: "public" })} onSession={handleSession} />;
  }

  if (view.kind === "onboard") {
    if (!session) {
      return (
        <LoginLayer
          onBack={() => routeTo({ kind: "public" })}
          onSession={(next) => {
            handleSession(next);
          }}
        />
      );
    }
    return (
      <StakeholderOnboarding
        role={(isPublicRole(session.user.role) ? session.user.role : view.role) as PublicRole}
        onFinished={async () => {
          const user = await fetchAuthMeFresh();
          if (user) {
            const next = { ...session, user };
            persistSession(next);
            setSession(next);
          }
          const effectiveRole = (user ?? session.user).role;
          if (!isPublicRole(effectiveRole)) {
            routeTo({ kind: "login" });
            return;
          }
          routeTo({ kind: "portal", role: effectiveRole, tab: getWebSections(effectiveRole)[0]?.id ?? "home" });
        }}
      />
    );
  }

  if (view.kind === "portal" && session) {
    if (!project) {
      // Initial unauthenticated getProjects() returned nothing; the post-login
      // loadPortalData effect will populate project momentarily.
      return <PortalLoading label={`Loading your ${roleLabel(view.role)} portal`} />;
    }
    const roleScreens = screenLoaders[view.role] as Record<string, React.LazyExoticComponent<(props: PortalScreenProps) => React.ReactNode>>;
    const ActiveScreen = roleScreens[view.tab] ?? roleScreens[sections[0]?.id ?? "home"];
    const data = portalData ?? emptyPortalData();

    return (
      <PortalShell
        role={view.role}
        user={session.user}
        project={project}
        data={data}
        sections={sections}
        activeTab={view.tab}
        onNavigate={(tab) => routeTo({ kind: "portal", role: view.role, tab })}
        onLogout={logout}
      >
        <Suspense fallback={<PortalLoading compact label={`Opening ${activeTabLabel(sections, view.tab)}`} />}>
          <ActiveScreen project={project} user={session.user} data={data} />
        </Suspense>
      </PortalShell>
    );
  }

  return (
    <>
      <MarketingPage />
      <button className="stakeholder-login-fab" onClick={() => routeTo({ kind: "login" })} type="button" aria-label="Open stakeholder portal login">
        Stakeholder portal
      </button>
    </>
  );
}

function WebsiteDisabled() {
  return (
    <main className="website-disabled" aria-labelledby="website-disabled-title">
      <section className="website-disabled-card">
        <span className="website-disabled-mark">e</span>
        <p className="website-disabled-eyebrow">e.mappa web</p>
        <h1 id="website-disabled-title">Website temporarily offline.</h1>
        <p>
          We are making updates to the web experience. Mobile, backend services,
          and internal operations remain separate from this temporary pause.
        </p>
      </section>
    </main>
  );
}

function isWebsiteDisabled() {
  const value = import.meta.env.VITE_WEBSITE_DISABLED;
  return value === "true" || value === "1";
}

function PortalLoading({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <main className={`portal-loading ${compact ? "compact" : ""}`} aria-live="polite">
      <div>
        <span>e.mappa</span>
        <strong>{label}</strong>
        <small>Preparing role-specific data, screens, and controls.</small>
      </div>
    </main>
  );
}

function roleLabel(role: PublicRole) {
  return role === "building_owner" ? "building owner" : role;
}

function activeTabLabel(sections: ReadonlyArray<{ id: string; label: string }>, tab: string) {
  return sections.find((section) => section.id === tab)?.label ?? tab;
}

function isPublicRole(role: WebSession["user"]["role"]): role is PublicRole {
  return role === "resident"
    || role === "homeowner"
    || role === "building_owner"
    || role === "provider"
    || role === "financier"
    || role === "electrician";
}

function parseLocation(session: WebSession | null): ViewState {
  const path = window.location.pathname;
  if (path === "/login") {
    return { kind: "login" };
  }
  if (path.startsWith("/portal/") && (!session || session.user.role === "admin")) {
    return { kind: "login" };
  }
  if (path.startsWith("/portal/") && session) {
    const [, , rawRole, rawTab] = path.split("/");
    const role = fromUrlRole(rawRole);
    return { kind: "portal", role, tab: rawTab || getWebSections(role)[0]?.id || "home" };
  }
  if (path.startsWith("/onboard/")) {
    if (!session) {
      return { kind: "login" };
    }
    const role = fromUrlRole(path.split("/")[2]);
    return { kind: "onboard", role };
  }
  return { kind: "public" };
}

function toPath(view: ViewState) {
  if (view.kind === "portal") return `/portal/${toUrlRole(view.role)}/${view.tab}`;
  if (view.kind === "onboard") return `/onboard/${toUrlRole(view.role)}`;
  if (view.kind === "login") return "/login";
  return "/";
}

function toUrlRole(role: PublicRole) {
  return role === "building_owner" ? "building-owner" : role;
}

function fromUrlRole(role: string | undefined): PublicRole {
  if (role === "building-owner") return "building_owner";
  if (role === "homeowner" || role === "provider" || role === "electrician" || role === "financier" || role === "resident") return role;
  return "resident";
}

function normalizePortalTab(role: PublicRole, tab: string) {
  if (role === "provider" && tab === "inventory") return "projects";
  return tab;
}

function getCockpitUrl() {
  const host = window.location.hostname.includes("localhost") || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5174/"
    : `https://cockpit.emappa.${window.location.hostname.split(".").slice(-1)[0]}/`;
  return host;
}

function emptyPortalData(): PortalData {
  return {
    roleHome: null,
    projects: [],
    energyToday: null,
    energySeries: [],
    prepaidBalance: null,
    prepaidHistory: [],
    discover: [],
    inventory: [],
    jobs: [],
    certifications: [],
    portfolio: [],
    walletBalance: null,
    walletTransactions: [],
    syntheticTimeline: [],
  };
}
