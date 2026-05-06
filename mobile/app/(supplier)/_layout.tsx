import { RoleTabs } from "../../components/RoleTabs";
import { RoleGuard } from "../../components/RoleGuard";

export default function SupplierLayout() {
  return (
    <RoleGuard role="supplier">
      <RoleTabs role="supplier" />
    </RoleGuard>
  );
}
