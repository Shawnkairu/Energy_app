import { RoleTabs } from "../../components/RoleTabs";
import { RoleGuard } from "../../components/RoleGuard";

export default function OwnerLayout() {
  return (
    <RoleGuard role="owner">
      <RoleTabs role="owner" />
    </RoleGuard>
  );
}
