import {
  ProviderActionPlan,
  ProviderAssetSplit,
  ProviderDashboard,
  ProviderGenerationGraphic,
  ProviderRows,
  ProviderSectionBrief,
  ProviderTruthCard,
  formatKwh,
} from "./ProviderShared";

export function ProviderAssetsScreen() {
  return (
    <ProviderDashboard
      section="Assets"
      title="Solar asset"
      subtitle="Array proof and physical output."
      actions={["Output", "Meter", "Docs"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderSectionBrief
              section="Assets"
              title="Physical first."
              body="Generated output, sold solar, warranty proof."
              building={building}
            />
            <ProviderGenerationGraphic building={building} />
            <ProviderAssetSplit building={building} />
            <ProviderRows
              title="Proof packet"
              eyebrow="Physical proof"
              rows={[
                { label: "Generated", value: formatKwh(view.generatedKwh) },
                { label: "Monetized", value: formatKwh(view.monetizedKwh), tone: "good" },
                { label: "Warranty docs", value: `${view.warrantyDocuments} files` },
              ]}
            />
            <ProviderTruthCard
              title="Unsold output stays unpaid."
              body="Wasted, curtailed, or free-exported kWh do not create provider payout."
            />
            <ProviderActionPlan section="Assets" />
          </>
        );
      }}
    />
  );
}
