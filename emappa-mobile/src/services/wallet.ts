import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletEntry } from '../types';

const STORAGE_KEY = 'wallet_ledger_v1';

class WalletService {
  private entries: WalletEntry[] = [];

  get allEntries(): WalletEntry[] {
    return [...this.entries];
  }

  get balanceKwh(): number {
    return this.entries.reduce((sum, e) => {
      return sum + (e.type === 'topup' ? e.kwh : -e.kwh);
    }, 0);
  }

  async load(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw) as WalletEntry[];
        this.entries = list.sort(
          (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
        );
      } else {
        this.entries = [];
      }
    } catch (e) {
      console.error('Failed to load wallet:', e);
      this.entries = [];
    }
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch (e) {
      console.error('Failed to save wallet:', e);
    }
  }

  async addTopUp(kwh: number, amountKsh: number, reference: string): Promise<void> {
    const entry: WalletEntry = {
      ts: new Date().toISOString(),
      type: 'topup',
      kwh,
      amount_ksh: amountKsh,
      ref: reference,
    };
    this.entries.unshift(entry);
    await this.save();
  }

  async addDeduction(kwh: number, reason?: string): Promise<void> {
    const entry: WalletEntry = {
      ts: new Date().toISOString(),
      type: 'deduct',
      kwh,
      amount_ksh: 0,
      ref: reason,
    };
    this.entries.unshift(entry);
    await this.save();
  }

  async clearAll(): Promise<void> {
    this.entries = [];
    await this.save();
  }
}

// Singleton instance
export const walletService = new WalletService();
