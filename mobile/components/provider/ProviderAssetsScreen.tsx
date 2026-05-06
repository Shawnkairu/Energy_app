import { SoldVsWaste } from "../design-handoff";
import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderRows,
  ProviderSectionBrief,
  ProviderTruthCard,
  formatKwh,
} from "./ProviderShared";

export function ProviderAssetsScreen() {
  return (
    <ProviderDashboard
      section="Assets"
      title="Solar Asset Register"
      subtitle="Physical panel output separated from the portion residents prepaid for and consumed."
      actions={["Inspect output", "Meter proof", "Asset docs"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderSectionBrief
              section="Assets"
              title="The asset view is physical first."
              body="It shows what the array generated, what became paid solar, and what evidence keeps the asset credible."
              building={building}
            />
            <SoldVsWaste building={building} headline="Generated → Sold → Waste" />
            <ProviderRows
              title="Asset proof packet"
              eyebrow="Physical proof"
              rows={[
                { label: "Generated", value: formatKwh(view.generatedKwh), note: "Modeled monthly output from the installed array." },
                { label: "Monetized", value: formatKwh(view.monetizedKwh), note: "Prepaid solar allocation consumed by residents.", tone: "good" },
                { label: "Warranty docs", value: `${view.warrantyDocuments} files`, note: "Supplier and equipment proof attached to this asset." },
              ]}
            />
            <ProviderTruthCard
              title="Unsold output stays unpaid."
              body="Panels can generate more than the building monetizes. Wasted, curtailed, or free-exported kWh do not create provider payout."
            />
            <ProviderActionPlan section="Assets" />
          </>
        );
      }}
    />
  );
}
