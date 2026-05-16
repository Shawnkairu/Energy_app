import { ImmersiveProjectHero } from "@emappa/web-immersive";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalWorkflow } from "../../../components/PortalPrimitives";
import { ProjectCardList, kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function FinancierDiscover({ project, data }: PortalScreenProps) {
  const view = project.roleViews.financier;
  const visibleDeals = data.discover.length || 1;
  const askCoverage = project.project.capitalRequiredKes ? view.remainingCapitalKes / project.project.capitalRequiredKes : 0;
  const recoveryYield = view.committedCapitalKes ? view.monthlyRecoveryKes / view.committedCapitalKes : 0;
  const gateStatus = project.drs.decision === "deployment_ready" ? "clear" : project.drs.decision === "review" ? "review" : "paused";

  return (
    <>
      <ImmersiveProjectHero project={project} mode="financier" portfolio={data.portfolio} />
      <PortalKpiBar items={[
        { label: "Open ask", value: kes(view.remainingCapitalKes), detail: `${pct(askCoverage)} of stack still open` },
        { label: "Recovery pool", value: kes(view.monthlyRecoveryKes), detail: `${kwh(project.energy.E_sold)} sold solar` },
        { label: "Readiness", value: String(project.drs.score), detail: `${project.drs.label} / ${gateStatus}` },
        { label: "Visible deals", value: String(visibleDeals), detail: "matched to filters" },
      ]} />
      <div className="portal-main-grid">
        <PortalPanel eyebrow="Discover deals" title="Named buildings seeking capital">
          <div className="filter-bar">
            <span>{kes(view.remainingCapitalKes)} max open ask</span>
            <span>{project.transparency.roiRange}</span>
            <span>{project.project.locationBand}</span>
            <span>{project.project.stage}</span>
          </div>
          <ProjectCardList cards={data.discover} project={project} role="financier" />
        </PortalPanel>
        <PortalPanel eyebrow="Investment lens" title="Why this deal is visible">
          <PortalLedger rows={[
            { label: "Capital stack", value: `${kes(view.committedCapitalKes)} committed`, note: `${kes(view.remainingCapitalKes)} still available` },
            { label: "Indicative recovery", value: kes(view.monthlyRecoveryKes), note: `${pct(recoveryYield)} of committed per month` },
            { label: "Utilization band", value: project.transparency.utilizationBand, note: "load quality signal" },
            { label: "Payout rule", value: "Sold kWh only", note: "unsold generation is excluded" },
          ]} />
          <PortalWorkflow steps={[
            { label: "Screen", detail: "Review demand, DRS score, and capital stack.", status: "visible" },
            { label: "Reserve", detail: "Pilot pledge stays non-binding until go-live.", status: "pilot" },
            { label: "Release", detail: "Capital unlocks only after readiness evidence clears.", status: gateStatus },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
