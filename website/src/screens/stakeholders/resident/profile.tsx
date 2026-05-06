import { ProfileBlocks } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ResidentProfile({ user }: PortalScreenProps) {
  return <ProfileBlocks user={user} roleLabel="Resident" />;
}
