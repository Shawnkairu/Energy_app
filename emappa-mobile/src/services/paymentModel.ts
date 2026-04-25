import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'payment_model_v1';

export type PaymentModel = 'subscription' | 'tokens' | 'postpaid';

interface PaymentModelState {
  selectedModel: PaymentModel;
  inFallbackMode: boolean; // True when user ran out of credits and fell back to postpaid
}

class PaymentModelService {
  private _state: PaymentModelState = {
    selectedModel: 'tokens',
    inFallbackMode: false,
  };

  get currentModel(): PaymentModel {
    return this._state.selectedModel;
  }

  get isInFallbackMode(): boolean {
    return this._state.inFallbackMode;
  }

  get isSubscription(): boolean {
    return this._state.selectedModel === 'subscription' && !this._state.inFallbackMode;
  }

  async load(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this._state = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load payment model:', error);
    }
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    } catch (error) {
      console.error('Failed to save payment model:', error);
    }
  }

  async setPaymentModel(model: PaymentModel): Promise<void> {
    this._state = {
      selectedModel: model,
      inFallbackMode: false,
    };
    await this.save();
  }

  // Called when user runs out of credits (subscription allowance or tokens)
  async activateFallbackMode(): Promise<void> {
    if (this._state.selectedModel !== 'postpaid') {
      this._state.inFallbackMode = true;
      await this.save();
      console.log('⚠️ Activated fallback postpaid mode');
    }
  }

  // Reset fallback when user tops up
  async clearFallbackMode(): Promise<void> {
    if (this._state.inFallbackMode) {
      this._state.inFallbackMode = false;
      await this.save();
      console.log('✅ Cleared fallback mode');
    }
  }

  // Check if user has active credits
  hasActiveCredits(allowanceKwh: number, tokenBalanceKwh: number): boolean {
    if (this._state.selectedModel === 'postpaid') {
      return true; // Postpaid always has "credits"
    }
    if (this._state.selectedModel === 'subscription') {
      return allowanceKwh > 0;
    }
    if (this._state.selectedModel === 'tokens') {
      return tokenBalanceKwh > 0;
    }
    return false;
  }
}

// Singleton instance
export const paymentModelService = new PaymentModelService();
