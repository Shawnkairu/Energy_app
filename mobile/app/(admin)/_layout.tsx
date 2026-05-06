import { RoleTabs } from "../../components/RoleTabs";
import { RoleGuard } from "../../components/RoleGuard";

export default function AdminLayout() {
  return (
    <RoleGuard role="admin">
      <RoleTabs role="admin" />
    </RoleGuard>
  );
}
