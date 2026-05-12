import { createApiClient, type ApiClient } from "@emappa/api-client";
import Constants from "expo-constants";
import { useAuth } from "../components/AuthContext";

type ExpoHostConfig = {
  hostUri?: string;
  debuggerHost?: string;
  extra?: {
    expoGo?: {
      debuggerHost?: string;
    };
  };
};

// Resolve a usable API base URL even when EXPO_PUBLIC_API_BASE_URL didn't bake
// into the bundle (which can happen if Metro's cache wasn't cleared with
// `expo start --clear`). Fall back to the LAN host that served the JS bundle —
// that machine is the dev's Mac, which is also running the backend on :8010.
function resolveBaseUrl(): string | null {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.length > 0) return envUrl;

  // Pull the host from Metro's hostUri (e.g. "10.197.156.54:8082")
  const expoConfig = Constants.expoConfig as ExpoHostConfig | null;
  const manifest = Constants.manifest as ExpoHostConfig | null;
  const manifest2 = Constants.manifest2 as ExpoHostConfig | null;
  const hostUri =
    expoConfig?.hostUri ??
    manifest?.debuggerHost ??
    manifest2?.extra?.expoGo?.debuggerHost ??
    null;
  if (typeof hostUri === "string" && hostUri.includes(":")) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8010`;
  }

  // Final fallback: localhost (works on iOS simulator only)
  return "http://localhost:8010";
}

const BASE_URL = resolveBaseUrl();

export function useApi(): ApiClient {
  const { session } = useAuth();
  return createApiClient({ baseUrl: BASE_URL, token: session?.token ?? null });
}

// Exposed for diagnostics; log this from a screen if mobile auth is silent.
export const __API_BASE_URL = BASE_URL;
