import { ImmersiveEnergyHero } from "@emappa/web-immersive";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalWorkflow } from "../../../components/PortalPrimitives";
import { PilotBanner, TokenBalanceHero, kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ResidentHome({ project, data }: PortalScreenProps) {
  const view = project.roleViews.resident;
  const history = data.prepaidHistory.slice(0, 3);
  const pledgedTotal = data.prepaidBalance?.confirmed_total_kes ?? view.prepaidBalanceKes;
  const hasPledge = pledgedTotal > 0;
  const fallbackRows = [
    { id: "demo-1", amountKes: view.prepaidBalanceKes, status: hasPledge ? "confirmed" : "pilot estimate", createdAt: new Date().toISOString() },
  ];

  return (
    <>
      <PilotBanner>Pledges are non-binding, resident balances stay separate from grid fallback, and no money is charged in this demo.</PilotBanner>
      <ImmersiveEnergyHero project={project} energyToday={data.energyToday} />
      <TokenBalanceHero project={project} title="Resident solar wallet" />

      <PortalPanel eyebrow="Today" title="What your pledge unlocks">
        <PortalKpiBar items={[
          { label: "Wallet status", value: hasPledge ? "Ready" : "Pending", detail: hasPledge ? "confirmed pledge available" : "pledge needed for allocation" },
          { label: "Solar allocation", value: kwh(view.monthlySolarKwh), detail: `${pct(view.solarCoverage)} household coverage` },
          { label: "Bill impact", value: kes(view.savingsKes), detail: "estimated savings vs grid-only" },
        ]} />
        <PortalWorkflow
          steps={[
            { label: "Pledge", detail: hasPledge ? `${kes(pledgedTotal)} confirmed for this resident wallet.` : "Add a pilot pledge to reserve prepaid solar.", status: hasPledge ? "confirmed" : "open" },
            { label: "Allocate", detail: "Confirmed pledge maps to the household solar share first.", status: pct(view.solarCoverage) },
            { label: "Fallback", detail: "Grid usage remains visible and never spends the pledge balance.", status: "protected" },
          ]}
        />
      </PortalPanel>

      <div className="portal-two-col">
        <PortalPanel eyebrow="Recent activity" title="Latest pledge rows">
          <PortalLedger
            rows={(history.length ? history : fallbackRows).map((row) => ({
              label: new Date(row.createdAt).toLocaleDateString(),
              value: kes(row.amountKes),
              note: row.status,
            }))}
          />
        </PortalPanel>
        <PortalPanel eyebrow="Home forecast" title="Energy and wallet snapshot">
          <PortalLedger rows={[
            { label: "Solar coverage", value: pct(view.solarCoverage), note: `${kwh(view.monthlySolarKwh)} prepaid solar` },
            { label: "Net savings", value: kes(view.savingsKes), note: "vs grid-only" },
            { label: "Wallet detail", value: "Open wallet", note: "pledges, credits, ownership" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
