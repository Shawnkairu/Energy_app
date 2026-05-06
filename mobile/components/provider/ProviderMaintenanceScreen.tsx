import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderMetric,
  ProviderRows,
  ProviderSectionBrief,
  ProviderTruthCard,
} from "./ProviderShared";

export function ProviderMaintenanceScreen() {
  return (
    <ProviderDashboard
      section="Maintenance"
      title="Monitoring & Warranty"
      subtitle="Service status only: connectivity, warranty evidence, and unresolved provider tickets."
      actions={["Open tickets", "Warranty docs", "Monitoring"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderSectionBrief
              section="Maintenance"
              title="Maintenance keeps proof intact."
              body="This screen is intentionally operational: monitoring continuity, warranty files, and ticket count."
              building={building}
            />
            <ProviderMetric
              label="Monitoring"
              value={view.monitoringStatus}
              detail="Connectivity must remain trusted before live settlement can continue."
            />
            <ProviderRows
              title="Support packet"
              eyebrow="Warranty and tickets"
              rows={[
                { label: "Warranty documents", value: `${view.warrantyDocuments} files`, note: "Equipment proof stays attached to the active provider asset." },
                { label: "Open tickets", value: `${view.openMaintenanceTickets}`, note: "Tickets cover monitoring, warranty, and service follow-up.", tone: view.openMaintenanceTickets > 0 ? "warn" : "good" },
                { label: "Settlement trust", value: building.project.drs.settlementDataTrusted ? "trusted" : "paused", note: "Untrusted settlement data blocks go-live or active payout.", tone: building.project.drs.settlementDataTrusted ? "good" : "bad" },
              ]}
            />
            <ProviderTruthCard
              title={view.openMaintenanceTickets > 0 ? "Tickets can pause confidence." : "No open provider tickets."}
              body={
                view.openMaintenanceTickets > 0
                  ? "Open maintenance work needs resolution before providers should treat the asset as fully reliable."
                  : "Monitoring and warranty proof are in place, so the provider asset has no visible service blockers."
              }
              tone={view.openMaintenanceTickets > 0 ? "warn" : "good"}
            />
            <ProviderActionPlan section="Maintenance" />
          </>
        );
      }}
    />
  );
}
