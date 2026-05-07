import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { getProjects } from "@emappa/api-client";
import { getWebSections, type ProjectedBuilding, type PublicRole } from "@emappa/shared";
import MarketingPage from "./MarketingPage";
import { initializeApi, clearSession, loadPortalData, readSession, type PortalData, type WebSession } from "./lib/api";
import { HomeownerOnboarding } from "./onboard/homeowner/HomeownerOnboarding";
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
    inventory: lazy(() => import("./screens/stakeholders/provider/inventory")),
    generation: lazy(() => import("./screens/stakeholders/provider/generation")),
    wallet: lazy(() => import("./screens/stakeholders/provider/wallet")),
    profile: lazy(() => import("./screens/stakeholders/provider/profile")),
  },
  electrician: {
    discover: lazy(() => import("./screens/stakeholders/electrician/discover")),
    jobs: lazy(() => import("./screens/stakeholders/electrician/jobs")),
    wallet: lazy(() => import("./screens/stakeholders/electrician/wallet")),
    compliance: lazy(() => import("./screens/stakeholders/electrician/compliance")),
    profile: lazy(() => import("./screens/stakeholders/electrician/profile")),
  },
  financier: {
    discover: lazy(() => import("./screens/stakeholders/financier/discover")),
    portfolio: lazy(() => import("./screens/stakeholders/financier/portfolio")),
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
    return <HomeownerOnboarding onExit={() => routeTo({ kind: "portal", role: view.role, tab: getWebSections(view.role)[0]?.id ?? "home" })} />;
  }

  if (view.kind === "portal" && session && project) {
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
        <Suspense fallback={<main className="portal-loading">Opening {view.tab}...</main>}>
          <ActiveScreen project={project} user={session.user} data={data} />
        </Suspense>
      </PortalShell>
    );
  }

  return (
    <>
      <MarketingPage />
      <button className="stakeholder-login-fab" onClick={() => routeTo({ kind: "login" })}>
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
  };
}
