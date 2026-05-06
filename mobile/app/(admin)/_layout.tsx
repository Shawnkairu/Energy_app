import { RoleTabs } from "../../components/RoleTabs";
import { AuthProvider, useAuth } from "../../components/AuthContext";
import { Redirect } from "expo-router";

export default function AdminLayout() {
  return (
    <AuthProvider>
      <AdminRoleGate />
    </AuthProvider>
  );
}

function AdminRoleGate() {
  const { session } = useAuth();

  if (session?.role !== "admin") {
    return <Redirect href="/(auth)/role-select" />;
  }

  return <RoleTabs role="admin" />;
}
