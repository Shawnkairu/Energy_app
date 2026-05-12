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
            <ProviderActionPlan section="Profile" />
          </>
        );
      }}
    />
  );
}
