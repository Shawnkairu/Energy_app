import { useEffect, useState } from "react";
import { getRoleHome } from "@emappa/api-client";
import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import {
  SupplierActivityCard,
  SupplierCard,
  SupplierMetricGrid,
  SupplierRow,
  supplierView,
} from "./SupplierShared";

export function SupplierHomeScreen() {
  const [activity, setActivity] = useState<string[]>([]);

  useEffect(() => {
    getRoleHome("provider").then((home) => setActivity(home.activity));
  }, []);

  return (
    <RoleDashboardScaffold
      role="provider"
      cohesionRole="provider"
      section="Home"
      title="Supply Desk"
      subtitle="A calm operating snapshot for what needs supplier attention today."
      actions={["Triage inbox", "Check stock", "Send proof"]}
      renderHero={(building) => {
        const view = supplierView(building);
        return {
          label: "Desk pressure",
          value: `${view.openRequests}`,
          sub:
            view.openRequests === 1
              ? "One request needs a clear owner before provider lock."
              : `${view.openRequests} requests need a clear owner before provider lock.`,
        };
      }}
      renderPanels={(building) => {
        const view = supplierView(building);
        return (
          <>
            <SupplierMetricGrid
              metrics={[
                { label: "Inbox", value: `${view.openRequests}`, detail: "RFQs needing response" },
                { label: "Catalog", value: `${view.catalogItems}`, detail: "Maintained component lines" },
                { label: "Proof", value: `${view.warrantyDocuments}`, detail: "Warranty files on hand" },
                { label: "Score", value: `${view.reliabilityScore}%`, detail: "Fulfillment signal" },
              ]}
            />

            <SupplierCard
              eyebrow="Today"
              title="What needs attention first"
              body="The home screen stays at desk level: what is open, what can be answered, and what proof is missing."
            >
              <SupplierRow
                label="RFQ triage"
                detail="Reply only where availability, price, and proof can be stated cleanly."
                value={`${view.openRequests} RFQ`}
                tone={view.openRequests > 1 ? "warn" : "neutral"}
              />
              <SupplierRow
                label="Dispatch watch"
                detail="Use the orders lane for award, dispatch, and delivery proof details."
                value={`${view.leadTimeDays}d`}
                tone={view.leadTimeDays <= 7 ? "good" : "warn"}
              />
              <SupplierRow
                label="Proof queue"
                detail="Attach warranty and serial expectations before handoff gets noisy."
                value={`${view.warrantyDocuments} docs`}
                tone={view.warrantyDocuments >= 4 ? "good" : "warn"}
              />
            </SupplierCard>

            <SupplierActivityCard activity={activity} />
          </>
        );
      }}
    />
  );
}
