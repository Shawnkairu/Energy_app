import { RoleGuard } from "../../components/RoleGuard";
import { RoleTabs } from "../../components/RoleTabs";

export default function AdminLayout() {
  return (
    <RoleGuard role="admin">
      <RoleTabs role="admin" />
    </RoleGuard>
  );
}
