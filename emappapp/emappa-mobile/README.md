# e.mappa Mobile (React Native + Expo)

Rewrite of the Flutter/Dart LimaBlu app in React Native with TypeScript.

## Project Structure

```
emappa-mobile/
├── App.tsx                 # Entry point
├── src/
│   ├── api/
│   │   ├── client.ts       # API client (fetch-based)
│   │   └── repository.ts   # Data layer
│   ├── components/
│   │   ├── GlassCard.tsx   # Card component
│   │   ├── MetricCard.tsx  # Stat display
│   │   └── StatusChip.tsx  # Online/offline indicator
│   ├── navigation/
│   │   └── AppNavigator.tsx # Tab + stack navigation
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── UsageScreen.tsx
│   │   ├── WalletScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── BuyPowerScreen.tsx
│   │   ├── BillingScreen.tsx
│   │   └── WalletHistoryScreen.tsx
│   ├── services/
│   │   ├── wallet.ts       # Token wallet (AsyncStorage)
│   │   ├── allowance.ts    # Subscription allowance
│   │   └── prefs.ts        # User preferences
│   ├── theme/
│   │   ├── colors.ts       # Brand palette
│   │   └── spacing.ts      # Design tokens
│   └── types/
│       └── models.ts       # TypeScript interfaces
```

## Quick Start

```bash
cd emappa-mobile
npm install
npx expo start
```

Then scan the QR code with Expo Go on your phone.

## Backend

The app expects your Python FastAPI backend running at:
- Android emulator: `http://10.0.2.2:8010`
- iOS simulator: `http://127.0.0.1:8010`

Start the backend:
```bash
cd limablu_mobile/backend
uvicorn app:app --host 0.0.0.0 --port 8010 --reload
```

## What's Ported

| Flutter File | React Native File | Status |
|--------------|-------------------|--------|
| `api_client.dart` | `src/api/client.ts` | ✅ |
| `repository.dart` | `src/api/repository.ts` | ✅ |
| `wallet.dart` | `src/services/wallet.ts` | ✅ |
| `allowance.dart` | `src/services/allowance.ts` | ✅ |
| `prefs.dart` | `src/services/prefs.ts` | ✅ |
| `home_mobile.dart` | `src/screens/HomeScreen.tsx` | ✅ |
| `usage_mobile.dart` | `src/screens/UsageScreen.tsx` | ✅ (placeholder charts) |
| `wallet_mobile.dart` | `src/screens/WalletScreen.tsx` | ✅ |
| `settings_screen.dart` | `src/screens/SettingsScreen.tsx` | ✅ |
| `buy_power_screen.dart` | `src/screens/BuyPowerScreen.tsx` | ✅ |
| `billing_screen.dart` | `src/screens/BillingScreen.tsx` | ✅ |
| `wallet_screen.dart` | `src/screens/WalletHistoryScreen.tsx` | ✅ |
| `glass_card.dart` | `src/components/GlassCard.tsx` | ✅ |
| `app_theme.dart` | `src/theme/colors.ts` | ✅ |
| `shell.dart` | `src/navigation/AppNavigator.tsx` | ✅ |

## Next Steps

1. **Add charts** - Install `victory-native` or `react-native-chart-kit` for usage visualization
2. **M-Pesa integration** - Add payment SDK when ready
3. **Auth flow** - Add login/signup screens (Tesla-inspired design)
4. **Push notifications** - For low balance alerts

## Dependencies

- Expo SDK 52
- React Navigation (tabs + native stack)
- AsyncStorage for persistence
- Expo Vector Icons (Ionicons)

## Color Palette

```typescript
primary:    '#89B0AE'  // teal
secondary:  '#BEE3DB'  // pale teal  
accent:     '#FFD6BA'  // peach
background: '#FAF9F9'  // off-white
surface:    '#FFFFFF'  // white
```
