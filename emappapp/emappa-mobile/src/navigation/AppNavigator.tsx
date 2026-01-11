import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import {
  HomeScreen,
  UsageScreen,
  WalletScreen,
  SettingsScreen,
  BuyPowerScreen,
  BillingScreen,
  WalletHistoryScreen,
  AuthScreen,
  ProvidersScreen,
  TradingScreen,
} from '../screens';

// Type definitions for navigation
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  HomeStack: undefined;
  ProvidersStack: undefined;
  UsageStack: undefined;
  WalletStack: undefined;
  SettingsStack: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  BuyPower: undefined;
  Billing: undefined;
};

export type WalletStackParamList = {
  Wallet: undefined;
  WalletHistory: undefined;
};

export type ProvidersStackParamList = {
  Providers: undefined;
  Trading: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const WalletStack = createNativeStackNavigator<WalletStackParamList>();
const ProvidersStack = createNativeStackNavigator<ProvidersStackParamList>();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '400',
        },
        headerShadowVisible: false,
        headerTransparent: true,
        headerTintColor: colors.primary,
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="BuyPower"
        component={BuyPowerScreen}
        options={{ title: 'Buy Power' }}
      />
      <HomeStack.Screen
        name="Billing"
        component={BillingScreen}
        options={{ title: 'Billing' }}
      />
    </HomeStack.Navigator>
  );
}

function WalletStackScreen() {
  return (
    <WalletStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '400',
        },
        headerShadowVisible: false,
        headerTransparent: true,
        headerTintColor: colors.primary,
      }}
    >
      <WalletStack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ headerShown: false }}
      />
      <WalletStack.Screen
        name="WalletHistory"
        component={WalletHistoryScreen}
        options={{ title: 'Wallet History' }}
      />
    </WalletStack.Navigator>
  );
}

function ProvidersStackScreen() {
  return (
    <ProvidersStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '400',
        },
        headerShadowVisible: false,
        headerTransparent: true,
        headerTintColor: colors.primary,
      }}
    >
      <ProvidersStack.Screen
        name="Providers"
        component={ProvidersScreen}
        options={{ headerShown: false }}
      />
      <ProvidersStack.Screen
        name="Trading"
        component={TradingScreen}
        options={{ title: 'Energy Trading' }}
      />
    </ProvidersStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'HomeStack':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'ProvidersStack':
              iconName = focused ? 'sunny' : 'sunny-outline';
              break;
            case 'UsageStack':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'WalletStack':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'SettingsStack':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '400',
          marginTop: -4,
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          marginHorizontal: 40,
          backgroundColor: '#FFFFFF',
          borderRadius: 30,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          elevation: 15,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStackScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ProvidersStack"
        component={ProvidersStackScreen}
        options={{ tabBarLabel: 'Providers' }}
      />
      <Tab.Screen
        name="UsageStack"
        component={UsageScreen}
        options={{ tabBarLabel: 'Usage' }}
      />
      <Tab.Screen
        name="WalletStack"
        component={WalletStackScreen}
        options={{ tabBarLabel: 'Wallet' }}
      />
      <Tab.Screen
        name="SettingsStack"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, login, loginDemo } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '400',
          },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      >
        {!user ? (
          // Auth flow
          <RootStack.Screen
            name="Auth"
            options={{ headerShown: false }}
          >
            {() => <AuthScreen onLogin={login} onDemoMode={loginDemo} />}
          </RootStack.Screen>
        ) : (
          // App flow
          <RootStack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
