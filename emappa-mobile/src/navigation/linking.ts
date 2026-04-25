import { LinkingOptions } from '@react-navigation/native';
import { Platform } from 'react-native';
import type { RootStackParamList } from './AppNavigator';

/**
 * Web URLs for dev / Figma capture (e.g. http://localhost:8081/providers).
 * Native uses emappa:// scheme as fallback.
 */
export function getLinking(): LinkingOptions<RootStackParamList> {
  const prefixes =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? [window.location.origin]
      : ['emappa://'];

  return {
    prefixes,
    config: {
      screens: {
        Auth: 'auth',
        MainTabs: {
          screens: {
            HomeStack: {
              path: 'home',
              screens: {
                Home: '',
                BuyPower: 'buy-power',
                Billing: 'billing',
              },
            },
            ProvidersStack: {
              path: 'providers',
              screens: {
                Providers: '',
                Trading: 'trading',
              },
            },
            UsageStack: 'usage-tab',
            WalletStack: {
              path: 'wallet',
              screens: {
                Wallet: '',
                WalletHistory: 'history',
              },
            },
            ProfileStack: 'profile-tab',
          },
        },
      },
    },
  };
}
