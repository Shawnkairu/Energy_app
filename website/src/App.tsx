import { Suspense, lazy, useEffect, useState } from "react";
import { getProjects } from "@emappa/api-client";
import type { ProjectedBuilding } from "@emappa/shared";
import MarketingPage from "./MarketingPage";
import { LoginLayer } from "./screens/LoginLayer";
import type { WebRole } from "./types";
import "./marketing-base.css";

const stakeholderPortals = {
  resident: lazy(() => import("./screens/stakeholders/resident/ResidentPortal")),
  owner: lazy(() => import("./screens/stakeholders/owner/OwnerPortal")),
  provider: lazy(() => import("./screens/stakeholders/provider/ProviderPortal")),
  financier: lazy(() => import("./screens/stakeholders/financier/FinancierPortal")),
  installer: lazy(() => import("./screens/stakeholders/installer/InstallerPortal")),
  supplier: lazy(() => import("./screens/stakeholders/supplier/SupplierPortal")),
} satisfies Record<WebRole, ReturnType<typeof lazy>>;

type ViewState =
  | { kind: "public" }
  | { kind: "login" }
  | { kind: "dashboard"; role: WebRole };

export function App() {
  const [project, setProject] = useState<ProjectedBuilding | null>(null);
  const [view, setView] = useState<ViewState>({ kind: "public" });

  useEffect(() => {
    getProjects().then((projects) => setProject(projects[0] ?? null));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("portal-mode", view.kind !== "public");
    return () => document.body.classList.remove("portal-mode");
  }, [view.kind]);

  if (view.kind === "login") {
    return <LoginLayer onBack={() => setView({ kind: "public" })} onLogin={(role) => setView({ kind: "dashboard", role })} />;
  }

  if (view.kind === "dashboard" && project) {
    const ActivePortal = stakeholderPortals[view.role];

    return (
      <Suspense fallback={<main className="portal-loading">Opening secure portal...</main>}>
        <ActivePortal project={project} onLogout={() => setView({ kind: "public" })} />
      </Suspense>
    );
  }

  return (
    <>
      <MarketingPage />
      <button className="stakeholder-login-fab" onClick={() => setView({ kind: "login" })}>
        Stakeholder portal
      </button>
    </>
  );
}
