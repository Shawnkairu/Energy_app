import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { PilotBanner, TokenHero, kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ResidentHome({ project, data }: PortalScreenProps) {
  const view = project.roleViews.resident;
  const history = data.prepaidHistory.slice(0, 3);

  return (
    <>
      <PilotBanner>Pledges are non-binding and no money is charged.</PilotBanner>
      <TokenHero project={project} />
      <PortalPanel eyebrow="Recent activity" title="Latest pledge rows">
        <PortalLedger
          rows={(history.length ? history : [
            { id: "demo-1", amountKes: view.prepaidBalanceKes, status: "confirmed", createdAt: new Date().toISOString() },
          ]).map((row) => ({
            label: new Date(row.createdAt).toLocaleDateString(),
            value: kes(row.amountKes),
            note: row.status,
          }))}
        />
      </PortalPanel>
      <PortalPanel eyebrow="Forecast" title="Today at home">
        <PortalLedger rows={[
          { label: "Solar coverage", value: pct(view.solarCoverage), note: kwh(view.monthlySolarKwh) },
          { label: "Net savings", value: kes(view.savingsKes), note: "vs grid-only" },
          { label: "View all pledges", value: "Wallet", note: "embedded pledge history" },
        ]} />
      </PortalPanel>
    </>
  );
}
