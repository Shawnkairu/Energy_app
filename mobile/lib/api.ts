import { createApiClient, type ApiClient } from "@emappa/api-client";
import { useAuth } from "../components/AuthContext";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? null;

export function useApi(): ApiClient {
  const { session } = useAuth();
  return createApiClient({ baseUrl: BASE_URL, token: session?.token ?? null });
}
