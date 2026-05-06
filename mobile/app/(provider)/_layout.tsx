import { RoleTabs } from "../../components/RoleTabs";
import { RoleGuard } from "../../components/RoleGuard";

export default function ProviderLayout() {
  return (
    <RoleGuard role="provider">
      <RoleTabs role="provider" />
    </RoleGuard>
  );
}
