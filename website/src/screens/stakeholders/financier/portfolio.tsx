import { PortalKpiBar, PortalPanel, PortalTable } from "../../../components/PortalPrimitives";
import { kes } from "../../../portal/PortalWidgets";
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

  return (
    <>
      <PortalKpiBar items={[
        { label: "Total deployed", value: kes(deployed), detail: "portfolio" },
        { label: "Total returns", value: kes(returns), detail: "to date" },
        { label: "Compounding curve", value: "Pilot", detail: "synthetic view" },
      ]} />
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
    </>
  );
}
