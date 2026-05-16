import { ImmersiveProjectHero } from "@emappa/web-immersive";
import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProjectCardList, kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";
import { ProviderCallout } from "./providerUi";

export default function ProviderDiscover({ project, data }: PortalScreenProps) {
  const visible = data.discover.length ? data.discover : [];
  const requestedPanels = visible.reduce((sum, card) => sum + (card.equipmentAsk?.panels ?? 0), 0);
  const requestedInfra = visible.flatMap((card) => card.equipmentAsk?.infrastructure ?? []);
  const capitalAsk = visible.reduce((sum, card) => sum + (card.capitalAskKes ?? 0), 0);

  return (
    <>
      <ImmersiveProjectHero project={project} mode="provider" />
      <PortalKpiBar items={[
        { label: "Qualified projects", value: String(visible.length || 1), detail: "provider-fit opportunities" },
        { label: "Panel requests", value: String(requestedPanels || Math.round(project.project.energy.arrayKw * 2)), detail: "visible in open asks" },
        { label: "Deal context", value: kes(capitalAsk || project.roleViews.financier.remainingCapitalKes), detail: "capital still being assembled" },
      ]} />
      <PortalPanel eyebrow="Discover projects" title="Equipment and panel opportunities">
        <div className="filter-bar"><span>Stage</span><span>Region</span><span>Equipment needed</span><span>Deal size</span></div>
        <ProviderCallout label="Qualification" title="Shortlist projects where equipment can unblock deployment.">
          <span>Cards emphasize DRS status, requested components, and remaining deal size so providers can decide whether to quote stock, infrastructure, or a combined package.</span>
        </ProviderCallout>
        <PortalLedger rows={[
          { label: "Infrastructure asks", value: requestedInfra.length ? requestedInfra.join(", ") : "Inverter, apartment ATS, PAYG-side metering", note: "from project feed" },
          { label: "Current project stage", value: project.project.stage, note: project.project.locationBand },
          { label: "Verified supplier quote", value: project.project.drs.hasVerifiedSupplierQuote ? "Yes" : "Needed", note: "readiness gate" },
        ]} />
        <ProjectCardList cards={data.discover} project={project} role="provider" />
      </PortalPanel>
    </>
  );
}
