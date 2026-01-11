import { Platform } from 'react-native';
import {
  ProviderInfo,
  UserConfig,
  OptimizeResponse,
  BillResponse,
  BuyPowerResponse,
} from '../types';

// Base URL - Android emulator uses 10.0.2.2, iOS uses localhost
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8010';
  }
  return 'http://127.0.0.1:8010';
};

class ApiClient {
  private baseUrl: string;
  public backendOnline: boolean = false;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  // Check if backend is reachable
  async checkBackend(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${this.baseUrl}/ping`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      this.backendOnline = res.status === 200;
      console.log(this.backendOnline ? '✅ Backend online' : '⚠️ Backend not OK');
    } catch (e) {
      this.backendOnline = false;
      console.log('❌ Backend offline, using mock where available');
    }
  }

  // GET /users
  async listUsers(): Promise<UserConfig[]> {
    const res = await fetch(`${this.baseUrl}/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`GET /users ${res.status}: ${await res.text()}`);
    }

    return res.json();
  }

  // PATCH /users/:name/prefs
  async patchUserAlpha(name: string, alpha: number): Promise<UserConfig> {
    const res = await fetch(`${this.baseUrl}/users/${name}/prefs`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_priority: alpha }),
    });

    if (!res.ok) {
      throw new Error(`PATCH /users ${name} ${res.status}: ${await res.text()}`);
    }

    return res.json();
  }

  // POST /optimize
  async optimize(
    providers: ProviderInfo[],
    users: UserConfig[],
    days: number
  ): Promise<OptimizeResponse> {
    const userPrefs: Record<string, number> = {};
    users.forEach((u) => {
      userPrefs[u.name] = u.alpha;
    });

    const body = {
      providers,
      users: users.map((u) => ({ name: u.name, profile: u.profile })),
      days,
      user_prefs: userPrefs,
    };

    const res = await fetch(`${this.baseUrl}/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`POST /optimize ${res.status}: ${await res.text()}`);
    }

    return res.json();
  }

  // POST /bill
  async bill(
    alloc: Array<Record<string, unknown>>,
    providers: ProviderInfo[],
    model: 'postpaid' | 'token' | 'subscription',
    tokenKwh?: number,
    allowanceKwh?: number,
    rollover: boolean = true
  ): Promise<BillResponse> {
    const body = {
      alloc,
      providers,
      model,
      token_kwh: tokenKwh,
      allowance_kwh: allowanceKwh,
      rollover,
    };

    const res = await fetch(`${this.baseUrl}/bill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`POST /bill ${res.status}: ${await res.text()}`);
    }

    return res.json();
  }

  // POST /payments/buy_power
  async buyPower(amountKsh: number): Promise<BuyPowerResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/payments/buy_power`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_ksh: amountKsh }),
      });

      if (res.ok) {
        return res.json();
      }
      throw new Error(`POST /payments/buy_power ${res.status}`);
    } catch (e) {
      // Fallback: simulate success so UI works when backend is down
      await new Promise((resolve) => setTimeout(resolve, 500));
      const tokensKwh = amountKsh / 50.0; // placeholder rate
      return {
        status: 'ok',
        amount_ksh: amountKsh,
        tokens_kwh: tokensKwh,
        reference: `SIM-${Date.now()}`,
      };
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();
