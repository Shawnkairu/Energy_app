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
import { spacing } from "@emappa/ui";
import { View } from "react-native";
import { PilotBanner } from "../PilotBanner";
import { SystemProjectImmersiveHero } from "../energy/SystemImmersiveOverview";

export function ProviderAssetsScreen() {
  return (
    <ProviderDashboard
      section="Assets"
      title="Solar asset"
      subtitle="Array proof and physical output."
      actions={["Output", "Meter", "Docs"]}
      minimalChrome
      renderPanels={(building) => {
        const view = building.roleViews.provider;
        const drs = building.drs;
        const drsProgress = drs.score <= 1 ? drs.score : drs.score / 100;

        return (
          <>
            <PilotBanner
              title="Pilot mode"
              message="Projected figures use synthetic building data until a named asset is fully live in settlement."
            />
            <View style={{ marginHorizontal: -spacing.lg, marginTop: spacing.sm }}>
              <SystemProjectImmersiveHero
                siteName={building.project.name}
                weatherHint="Inventory & fulfillment pulse"
                ringLabel={`Deployment readiness tracks DRS, then BOM proof and warranty attestations.`}
                ringProgress={drsProgress}
                ringCenterHint="DRS"
                statusLine={drs.label ?? drs.decision}
                primaryCtaHint="Quote coverage & open asks"
                callouts={[
                  { label: "DRS", value: `${Math.round(drsProgress * 100)}` },
                  { label: "Sold solar", value: formatKwh(view.monetizedKwh) },
                  { label: "Waste", value: formatKwh(view.wasteKwh) },
                  { label: "Gates", value: `${view.deploymentGates.filter((g) => g.complete).length}/${view.deploymentGates.length}` },
                ]}
                summaryCards={[
                  { label: "Generated", value: formatKwh(view.generatedKwh), hint: "Array output", icon: "flash-outline" },
                  { label: "Monetized", value: formatKwh(view.monetizedKwh), hint: "Payout basis", icon: "cash-outline" },
                  { label: "Utilization", value: `${Math.round(view.utilization * 100)}%`, hint: "Load quality", icon: "pulse-outline" },
                ]}
              />
            </View>
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
