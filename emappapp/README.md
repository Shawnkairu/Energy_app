# README.md


## Project Overview

This is **e.mappa**, an energy management mobile application built with React Native and Expo. The app is a rewrite of a previous Flutter/Dart implementation (LimaBlu) and provides energy usage tracking, token-based power purchasing, and subscription management for users accessing solar power through multiple providers.

## Development Commands

### Mobile App (emappa-mobile/)

```bash
# Install dependencies
cd emappa-mobile
npm install

# Start development server
npm start           # Opens Expo dev tools
npm run android     # Run on Android emulator
npm run ios         # Run on iOS simulator
npm run web         # Run in web browser

# Start with Expo CLI directly
npx expo start
```

### Backend Requirements

The mobile app expects a Python FastAPI backend running on port 8010. The backend should be started separately:

```bash
# Expected backend location (not in this repo)
cd limablu_mobile/backend
uvicorn app:app --host 0.0.0.0 --port 8010 --reload
```

**Backend URLs by platform:**
- Android emulator: `http://10.0.2.2:8010`
- iOS simulator: `http://127.0.0.1:8010`

These are configured in [src/api/client.ts:11-16](emappa-mobile/src/api/client.ts#L11-L16).

## Architecture

### Data Flow Pattern

The app uses a Repository pattern with three layers:

1. **API Client** ([src/api/client.ts](emappa-mobile/src/api/client.ts)) - Raw HTTP fetch calls to backend
2. **Repository** ([src/api/repository.ts](emappa-mobile/src/api/repository.ts)) - Business logic layer with fallback handling
3. **Services** - State management and local persistence using AsyncStorage

### Key Services

**Wallet Service** ([src/services/wallet.ts](emappa-mobile/src/services/wallet.ts))
- Manages token-based power balance (kWh)
- Persists transaction ledger to AsyncStorage
- Tracks top-ups and deductions
- Storage key: `wallet_ledger_v1`

**Allowance Service** ([src/services/allowance.ts](emappa-mobile/src/services/allowance.ts))
- Handles subscription-based power allowances
- Manages monthly allowances with rollover support
- Auto-resets at start of each month
- Storage key: `allowance_state_v1`

**Preferences Service** ([src/services/prefs.ts](emappa-mobile/src/services/prefs.ts))
- Stores user preferences (billing model, selected user)
- Storage key: `user_prefs_v1`

### Navigation Structure

Two-level navigation using React Navigation:

```
Stack Navigator (root)
└── MainTabs
    ├── Home (tab)
    ├── Usage (tab)
    ├── Wallet (tab)
    └── Settings (tab)
└── BuyPower (modal stack screen)
└── Billing (modal stack screen)
└── WalletHistory (modal stack screen)
```

Defined in [src/navigation/AppNavigator.tsx](emappa-mobile/src/navigation/AppNavigator.tsx).

### Backend API Endpoints

The app communicates with these FastAPI endpoints:

- `GET /ping` - Backend health check
- `GET /users` - Fetch user configurations
- `PATCH /users/:name/prefs` - Update user price priority (alpha)
- `POST /optimize` - Get optimized energy allocation across providers
- `POST /bill` - Calculate billing for given allocation
- `POST /payments/buy_power` - Purchase power tokens (M-Pesa integration)

The API client has offline fallback behavior for `buyPower` and `fetchUsers` endpoints.

### Type System

All TypeScript interfaces are defined in [src/types/models.ts](emappa-mobile/src/types/models.ts):

- `ProviderInfo` - Solar provider data (name, price, capacity)
- `UserConfig` - User profile with price priority (alpha 0-1)
- `AllocationRow` - Optimized energy allocation per day/user/provider
- `BillRow` - Daily billing breakdown
- `WalletEntry` - Transaction ledger entry (topup/deduct)
- `AllowanceState` - Subscription allowance tracking
- `OptimizeResponse`, `BillResponse`, `BuyPowerResponse` - API responses

### Billing Models

The app supports three billing models (selectable in Settings):

1. **Postpaid** - Pay monthly bill after usage
2. **Token/Prepaid** - Buy tokens upfront, deduct as used
3. **Subscription** - Fixed monthly allowance with optional rollover

## Design System

**Brand Colors** ([src/theme/colors.ts](emappa-mobile/src/theme/colors.ts)):
- Primary: `#89B0AE` (teal)
- Secondary: `#BEE3DB` (pale teal)
- Accent: `#FFD6BA` (peach)
- Background: `#FAF9F9` (off-white)
- Surface: `#FFFFFF` (white cards)

**Reusable Components**:
- `GlassCard` - Frosted glass effect card with blur
- `MetricCard` - Stat display with label/value
- `StatusChip` - Online/offline indicator badge

## State Management

This app uses React hooks and local state (no Redux/Zustand). Services are singleton instances that persist to AsyncStorage:

```typescript
// Services are initialized in App.tsx on mount
await Promise.all([
  apiClient.checkBackend(),
  walletService.load(),
  allowanceService.load(),
]);
```

Screens access services directly via imports and manage their own UI state with `useState`.

## Known Limitations

1. **Charts are placeholders** - Usage screen needs `victory-native` or `react-native-chart-kit` integration
2. **No authentication** - Auth flow (login/signup) not yet implemented
3. **M-Pesa integration incomplete** - Payment endpoint has simulated fallback
4. **No push notifications** - Low balance alerts not implemented
5. **Backend is external** - FastAPI backend must be running separately

## Development Notes

- The app uses **Expo SDK 54** with React Native 0.81.5
- **New Architecture** enabled in app.json (`newArchEnabled: true`)
- All persistence uses `@react-native-async-storage/async-storage`
- Icons use `@expo/vector-icons` (Ionicons set)
- Linear gradients via `expo-linear-gradient`
- Backend connectivity is checked on app initialization; offline mode provides fallback data for key features

## Migration Context

This React Native app is a port from a Flutter/Dart codebase. The original Flutter files and their React Native equivalents are documented in the README. When adding features, maintain consistency with the existing architecture patterns (Repository → Service → Screen).
