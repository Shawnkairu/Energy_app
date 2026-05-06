import { RoleTabs } from "../../components/RoleTabs";
import { RoleGuard } from "../../components/RoleGuard";

export default function FinancierLayout() {
  return (
    <RoleGuard role="financier">
      <RoleTabs role="financier" />
    </RoleGuard>
  );
}
