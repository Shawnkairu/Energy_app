// Provider info from backend
export interface ProviderInfo {
  provider: string;
  price_per_kwh: number;
  capacity_kwh: number;
}

// User configuration
export interface UserConfig {
  name: string;
  profile: string;  // e.g., "basic_lighting", "lighting_tv"
  alpha: number;    // price priority 0..1
}

// Allocation row from optimization
export interface AllocationRow {
  user: string;
  day: number;
  provider: string;
  alloc_kwh: number;
}

// Bill row from billing endpoint
export interface BillRow {
  day: number;
  used_kwh: number;
  cost: number;
  status: string;
}

// Wallet entry for local ledger
export interface WalletEntry {
  ts: string;  // ISO date string
  type: 'topup' | 'deduct';
  kwh: number;
  amount_ksh: number;
  ref?: string;
}

// Allowance state for subscription model
export interface AllowanceState {
  monthlyAllowanceKwh: number;
  remainingKwh: number;
  rollover: boolean;
  lastReset: string;  // ISO date string
}

// API responses
export interface OptimizeResponse {
  usage: Array<{
    user: string;
    day: number;
    usage_kwh: number;
    profile: string;
  }>;
  allocation: AllocationRow[];
}

export interface BillResponse {
  bill: BillRow[];
  total_cost: number;
  rollover?: number;
}

export interface BuyPowerResponse {
  status: string;
  amount_ksh: number;
  tokens_kwh: number;
  reference: string;
}

// Provider colors for charts
export const PROVIDER_COLORS: Record<string, string> = {
  SolarOne: '#64B5F6',
  GreenLight: '#81C784',
  SunStream: '#E57373',
  RayPower: '#FFB74D',
  BrightSolar: '#BA68C8',
  NovaEnergy: '#4DB6AC',
};
