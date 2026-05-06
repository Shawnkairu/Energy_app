import { PortalPanel } from "../../../components/PortalPrimitives";
import { ProjectCardList } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ProviderDiscover({ project, data }: PortalScreenProps) {
  return (
    <>
      <PortalPanel eyebrow="Discover projects" title="Equipment and panel opportunities">
        <div className="filter-bar"><span>Stage</span><span>Region</span><span>Equipment needed</span><span>Deal size</span></div>
        <ProjectCardList cards={data.discover} project={project} role="provider" />
      </PortalPanel>
    </>
  );
}
