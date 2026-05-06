export interface MobileApiOptions {
  baseUrl?: string | null;
  token?: string | null;
  fetcher?: typeof fetch;
}

let currentOptions: MobileApiOptions = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || null,
  token: null,
};

export function configureMobileApi(options: MobileApiOptions) {
  currentOptions = { ...currentOptions, ...options };
}

export async function mobileApiFetch(path: string, init: RequestInit = {}) {
  const fetcher = currentOptions.fetcher ?? fetch;
  const headers = new Headers(init.headers);

  if (currentOptions.token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${currentOptions.token}`);
  }

  const url = buildUrl(path, currentOptions.baseUrl);

  return fetcher(url, {
    ...init,
    headers,
  });
}

function buildUrl(path: string, baseUrl?: string | null) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (!baseUrl) {
    return path;
  }

  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
