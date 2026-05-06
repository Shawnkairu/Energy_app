import { RoleTabs } from "../../components/RoleTabs";
import { RoleGuard } from "../../components/RoleGuard";

export default function ResidentLayout() {
  return (
    <RoleGuard role="resident">
      <RoleTabs role="resident" />
    </RoleGuard>
  );
}
