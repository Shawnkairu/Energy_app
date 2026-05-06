import { getWebSections } from "@emappa/shared";
import type { StakeholderScreenProps } from "../../../types";
import { DashboardShell } from "../DashboardShell";
import { SupplierDashboard } from "./SupplierDashboard";

export default function SupplierPortal({ project, onLogout }: StakeholderScreenProps & { onLogout: () => void }) {
  return (
    <DashboardShell role="supplier" project={project} navItems={getWebSections("supplier")} onLogout={onLogout}>
      {(activeSectionId) => <SupplierDashboard project={project} activeSectionId={activeSectionId} />}
    </DashboardShell>
  );
}
