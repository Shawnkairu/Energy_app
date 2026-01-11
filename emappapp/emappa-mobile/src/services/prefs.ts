import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'deduction_order';

class AppPrefs {
  async getDeductionOrder(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as string[];
      }
    } catch (e) {
      console.error('Failed to get deduction order:', e);
    }
    return ['allowance', 'tokens', 'postpaid'];
  }

  async setDeductionOrder(order: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    } catch (e) {
      console.error('Failed to set deduction order:', e);
    }
  }

  // Rotate current order forward
  // e.g. [allowance, tokens, postpaid] -> [tokens, postpaid, allowance]
  async rotateDeductionOrder(): Promise<string[]> {
    const current = await this.getDeductionOrder();
    if (current.length === 0) return current;

    const next = [...current.slice(1), current[0]];
    await this.setDeductionOrder(next);
    return next;
  }
}

// Singleton instance
export const appPrefs = new AppPrefs();
