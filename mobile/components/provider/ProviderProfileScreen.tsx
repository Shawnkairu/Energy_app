import { ProfileEssentials } from "../ProfileEssentials";
import { ProviderActionPlan, ProviderDashboard, ProviderProfileSummary, ProviderRows } from "./ProviderShared";

export function ProviderProfileScreen() {
  return (
    <ProviderDashboard
      section="Profile"
      title="Profile"
      subtitle="Business identity, proof files, and support status."
      actions={["Business", "Proof", "Support"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderProfileSummary building={building} />
            <ProviderRows
              title="Business profile"
              eyebrow="Profile"
              rows={[
                { label: "Operating area", value: building.project.locationBand },
                { label: "Warranty proof", value: `${view.warrantyDocuments} files`, tone: "good" },
                { label: "Support status", value: view.openMaintenanceTickets > 0 ? "active" : "clear", tone: view.openMaintenanceTickets > 0 ? "warn" : "good" },
              ]}
            />
            <ProviderRows
              title="Supply profile"
              eyebrow="Inventory and catalog"
              rows={[
                { label: "Catalog", value: "profile", note: "Panels, infrastructure SKUs, quote terms, and delivery capability live here." },
                { label: "Warranty library", value: `${view.warrantyDocuments} files`, note: "Proof stays attached to the provider profile.", tone: "good" },
                { label: "Project matching", value: "Projects tab", note: "Current project status stays in Projects; stock records stay in Profile." },
              ]}
            />
            <ProviderActionPlan section="Profile" />
            <ProfileEssentials
              roleLabel="Provider"
              accountRows={[
                { label: "Operating area", value: building.project.locationBand, note: "project discovery scope" },
                { label: "Business type", value: "Provider", note: "panels, infrastructure, or both" },
              ]}
              supportSubject={`Provider support - ${building.project.name}`}
            />
          </>
        );
      }}
    />
  );
}
