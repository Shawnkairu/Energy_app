import { RoleTabs } from "../../components/RoleTabs";
import { RoleGuard } from "../../components/RoleGuard";

export default function ElectricianLayout() {
  return (
    <RoleGuard role="electrician">
      <RoleTabs role="electrician" />
    </RoleGuard>
  );
}
