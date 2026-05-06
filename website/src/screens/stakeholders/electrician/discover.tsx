import { PortalPanel } from "../../../components/PortalPrimitives";
import { ProjectCardList } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ElectricianDiscover({ project, data }: PortalScreenProps) {
  return (
    <PortalPanel eyebrow="Discover projects" title="Install, inspection, and maintenance work">
      <div className="filter-bar"><span>Region</span><span>Scope</span><span>Pay band</span></div>
      <ProjectCardList cards={data.discover} project={project} role="electrician" />
    </PortalPanel>
  );
}
