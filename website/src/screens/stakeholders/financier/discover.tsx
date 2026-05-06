import { PortalPanel } from "../../../components/PortalPrimitives";
import { ProjectCardList } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function FinancierDiscover({ project, data }: PortalScreenProps) {
  return (
    <PortalPanel eyebrow="Discover deals" title="Named buildings seeking capital">
      <div className="filter-bar"><span>Deal size</span><span>Projected return</span><span>Region</span><span>Stage</span></div>
      <ProjectCardList cards={data.discover} project={project} role="financier" />
    </PortalPanel>
  );
}
