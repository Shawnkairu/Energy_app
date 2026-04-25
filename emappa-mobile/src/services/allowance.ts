import AsyncStorage from '@react-native-async-storage/async-storage';
import { AllowanceState } from '../types';

const STORAGE_KEY = 'allowance_state_v1';

class AllowanceService {
  private _state: AllowanceState | null = null;

  get state(): AllowanceState | null {
    return this._state;
  }

  async load(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        this._state = JSON.parse(raw) as AllowanceState;
      } else {
        // Sensible defaults for a new user
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        this._state = {
          monthlyAllowanceKwh: 100,
          remainingKwh: 100,
          rollover: true,
          lastReset: startOfMonth.toISOString(),
        };
        await this.save();
      }
    } catch (e) {
      console.error('Failed to load allowance:', e);
    }
  }

  private async save(): Promise<void> {
    if (!this._state) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch (e) {
      console.error('Failed to save allowance:', e);
    }
  }

  // If we've crossed into a new month, reset period
  async ensureCurrentPeriod(): Promise<void> {
    if (!this._state) return;

    const now = new Date();
    const currentPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastReset = new Date(this._state.lastReset);
    const lastPeriod = new Date(lastReset.getFullYear(), lastReset.getMonth(), 1);

    if (currentPeriod > lastPeriod) {
      // New month
      let newRemaining = this._state.monthlyAllowanceKwh;
      if (this._state.rollover) {
        newRemaining += this._state.remainingKwh; // carryover unused
      }
      this._state = {
        ...this._state,
        remainingKwh: newRemaining,
        lastReset: currentPeriod.toISOString(),
      };
      await this.save();
    }
  }

  // Update plan settings
  async setPlan(
    monthlyAllowanceKwh: number,
    rollover: boolean,
    newPlan: boolean = false
  ): Promise<void> {
    if (!this._state) await this.load();
    if (!this._state) return;

    // If selecting a brand-new plan, reset remaining to the plan amount
    const newRemaining = newPlan
      ? monthlyAllowanceKwh
      : this._state.remainingKwh;

    this._state = {
      ...this._state,
      monthlyAllowanceKwh,
      rollover,
      remainingKwh: newRemaining,
    };
    await this.save();
  }

  // Deduct used allowance. Returns how much was actually deducted.
  async consume(kwh: number): Promise<number> {
    if (!this._state) await this.load();
    if (!this._state) return 0;

    const deduct = Math.min(Math.max(kwh, 0), this._state.remainingKwh);
    this._state = {
      ...this._state,
      remainingKwh: this._state.remainingKwh - deduct,
    };
    await this.save();
    return deduct;
  }
}

// Singleton instance
export const allowanceService = new AllowanceService();
