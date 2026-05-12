import { PortalKpiBar, PortalLedger, PortalPanel, PortalTable, PortalWorkflow } from "../../../components/PortalPrimitives";
import { kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function FinancierPortfolio({ project, data }: PortalScreenProps) {
  const positions = data.portfolio.length ? data.portfolio : [
    {
      buildingId: project.project.id,
      committedKes: project.roleViews.financier.committedCapitalKes,
      deployedKes: project.project.fundedKes,
      returnsToDateKes: project.settlement.financierPool,
      irrPct: 13.8,
      milestonesHit: [project.drs.decision],
    },
  ];
  const deployed = positions.reduce((sum, row) => sum + row.deployedKes, 0);
  const returns = positions.reduce((sum, row) => sum + row.returnsToDateKes, 0);
  const committed = positions.reduce((sum, row) => sum + row.committedKes, 0);
  const averageIrr = positions.reduce((sum, row) => sum + row.irrPct, 0) / positions.length;
  const deployedRatio = committed ? deployed / committed : 0;
  const currentValue = deployed + returns;
  const returnMultiple = deployed ? currentValue / deployed : 0;
  const recoveryMonths = Number.isFinite(project.financierPayback.principalMonths)
    ? `${project.financierPayback.principalMonths} mo`
    : "Review";
  const positionHealth = project.drs.decision === "approve" ? "performing" : project.drs.decision === "review" ? "watch" : "held";

  return (
    <>
      <PortalKpiBar items={[
        { label: "Current value", value: kes(currentValue), detail: `${returnMultiple.toFixed(2)}x deployed` },
        { label: "Total returns", value: kes(returns), detail: "settled to date" },
        { label: "Weighted IRR", value: `${averageIrr.toFixed(1)}%`, detail: "pilot model" },
        { label: "Payback view", value: recoveryMonths, detail: project.transparency.roiRange },
      ]} />
      <div className="portal-main-grid">
        <PortalPanel eyebrow="Positions" title="Per-deal investment and return">
          <PortalTable
            columns={["Building", "Committed", "Current value", "Payout YTD", "IRR"]}
            rows={positions.map((position) => [
              position.buildingId,
              kes(position.committedKes),
              kes(position.deployedKes + position.returnsToDateKes),
              kes(position.returnsToDateKes),
              `${position.irrPct}%`,
            ])}
          />
        </PortalPanel>
        <PortalPanel eyebrow="Portfolio control" title="Capital deployment discipline">
          <PortalLedger rows={[
            { label: "Committed", value: kes(committed), note: "signed pilot capital" },
            { label: "Deployed", value: pct(deployedRatio), note: "released against gates" },
            { label: "Monthly recovery", value: kes(project.settlement.financierPool), note: `${kwh(project.energy.E_sold)} monetized` },
            { label: "Position state", value: positionHealth, note: positions[0]?.milestonesHit.join(", ") ?? "Pending" },
          ]} />
          <PortalWorkflow steps={[
            { label: "Capital reserved", detail: `${kes(committed)} committed across ${positions.length} deal${positions.length === 1 ? "" : "s"}.`, status: "booked" },
            { label: "Gate released", detail: `${pct(deployedRatio)} deployed against readiness proof.`, status: project.drs.decision },
            { label: "Recovery tracked", detail: `${kes(returns)} returned from sold solar settlements.`, status: positionHealth },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
