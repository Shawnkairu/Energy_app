# e.mappa Mobile (React Native + Expo)

> **See [PRODUCT.md](./PRODUCT.md) for full product context, user types, and design principles.**

Provider-agnostic energy platform for Kenya - aggregating solar providers, enabling P2P trading, and empowering prosumers.

## Project Structure

```
emappa-mobile/
├── App.tsx                 # Entry point
├── PRODUCT.md              # Product context & design principles
├── src/
│   ├── api/
│   │   ├── client.ts       # API client (fetch-based)
│   │   └── repository.ts   # Data layer
│   ├── components/
│   │   ├── GlassCard.tsx   # Card component
│   │   ├── MetricCard.tsx  # Stat display
│   │   └── StatusChip.tsx  # Online/offline indicator
│   ├── context/
│   │   └── AuthContext.tsx # Authentication state
│   ├── navigation/
│   │   └── AppNavigator.tsx # Tab + stack navigation
│   ├── screens/
│   │   ├── AuthScreen.tsx      # Login/signup
│   │   ├── HomeScreen.tsx      # Energy dashboard
│   │   ├── ProvidersScreen.tsx # Provider optimization (3-way slider)
│   │   ├── UsageScreen.tsx     # Consumption charts
│   │   ├── TradingScreen.tsx   # P2P marketplace
│   │   ├── WalletScreen.tsx    # Balance & payments
│   │   ├── ProfileScreen.tsx   # Airbnb-style profile + host onboarding
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

**Development options:**
- `npx expo start --ios` - iOS Simulator
- `npx expo start --android` - Android Emulator
- `npx expo start --web` - Web browser
- Scan QR with Expo Go on your phone

## Key Screens

| Screen | Purpose | Design Inspiration |
|--------|---------|-------------------|
| Home | Energy flow dashboard | Tesla, Enphase |
| Providers | Optimize energy mix (Cost/Capacity/Reliability) | Custom 3-way slider |
| Usage | Consumption visualization | Enphase charts |
| Trading | P2P energy marketplace | Robinhood |
| Profile | User identity + "Become a Host" | Airbnb |

## Color Palette

```typescript
primary:    '#4A5C7A'  // slate blue
secondary:  '#A2BFD9'  // light blue
accent:     '#E07856'  // coral
background: '#F5F5F5'  // light gray
surface:    '#FFFFFF'  // white
text:       '#2C2C2C'  // dark gray
```

## Dependencies

- **Expo SDK 54**
- **React Navigation** (tabs + native stack)
- **AsyncStorage** for persistence
- **Expo Vector Icons** (Ionicons)
- **react-native-chart-kit** for charts
- **@react-native-community/slider** for 3-way optimization

### Animation Libraries (for premium feel)
```bash
npx expo install react-native-reanimated react-native-gesture-handler react-native-svg
```

## Backend

The app expects a Python FastAPI backend:
- Android emulator: `http://10.0.2.2:8010`
- iOS simulator: `http://127.0.0.1:8010`

```bash
cd limablu_mobile/backend
uvicorn app:app --host 0.0.0.0 --port 8010 --reload
```

## Target Users (Kenya)

1. **Consumers** - Households buying optimized energy
2. **Hosts** - Schools/churches/homes offering roof space for solar
3. **Providers** - Solar companies joining the marketplace

## Key Metrics to Display

- kWh consumed (real-time)
- KES saved vs Kenya Power
- Provider mix allocation
- P2P trading earnings
- Uptime percentage

---

*See [PRODUCT.md](./PRODUCT.md) for complete product documentation.*
