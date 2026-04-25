import { apiClient } from './client';
import {
  ProviderInfo,
  UserConfig,
  OptimizeResponse,
  BillResponse,
  BuyPowerResponse,
} from '../types';

class Repository {
  // Default providers (match Flutter app)
  defaultProviders(): ProviderInfo[] {
    return [
      { provider: 'SolarOne', price_per_kwh: 0.12, capacity_kwh: 500 },
      { provider: 'GreenLight', price_per_kwh: 0.10, capacity_kwh: 400 },
      { provider: 'SunStream', price_per_kwh: 0.14, capacity_kwh: 300 },
      { provider: 'RayPower', price_per_kwh: 0.16, capacity_kwh: 250 },
      { provider: 'BrightSolar', price_per_kwh: 0.11, capacity_kwh: 350 },
      { provider: 'NovaEnergy', price_per_kwh: 0.13, capacity_kwh: 280 },
    ];
  }

  // Fetch users from backend, fallback to default
  async fetchUsers(): Promise<UserConfig[]> {
    try {
      const list = await apiClient.listUsers();
      return list.map((m) => ({
        name: m.name || '',
        profile: m.profile || 'basic_lighting',
        alpha: m.alpha ?? 0.5,
      }));
    } catch (e) {
      // Fallback single user
      return [{ name: 'Amina', profile: 'basic_lighting', alpha: 0.5 }];
    }
  }

  // Optimize allocation
  async optimize(
    providers: ProviderInfo[],
    users: UserConfig[],
    days: number
  ): Promise<OptimizeResponse> {
    return apiClient.optimize(providers, users, days);
  }

  // Get billing
  async bill(
    alloc: Array<Record<string, unknown>>,
    providers: ProviderInfo[],
    model: 'postpaid' | 'token' | 'subscription',
    tokenKwh?: number,
    allowanceKwh?: number,
    rollover: boolean = true
  ): Promise<BillResponse> {
    return apiClient.bill(alloc, providers, model, tokenKwh, allowanceKwh, rollover);
  }

  // Update user preference
  async patchUserAlpha(name: string, alpha: number): Promise<UserConfig> {
    try {
      const result = await apiClient.patchUserAlpha(name, alpha);
      return {
        name: result.name,
        profile: result.profile || 'basic_lighting',
        alpha: result.alpha ?? alpha,
      };
    } catch (e) {
      // Offline echo so UI updates
      return { name, profile: 'basic_lighting', alpha };
    }
  }

  // Buy power tokens
  async buyPower(amountKsh: number): Promise<BuyPowerResponse> {
    return apiClient.buyPower(amountKsh);
  }
}

// Singleton instance
export const repository = new Repository();
