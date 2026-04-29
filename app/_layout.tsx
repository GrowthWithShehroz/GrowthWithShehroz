import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { warnIfMissing } from '@/config/env';
import { initAds } from '@/features/ads/client';
import { maybeShowInterstitialOnOpen } from '@/features/ads/interstitial';
import { signInAnonymouslyIfNeeded } from '@/features/auth/client';
import { configureIap, hydratePremiumFromCache } from '@/features/iap/client';
import { initI18n } from '@/services/i18n';
import { configureNotifications } from '@/services/notifications';
import { useAppStore } from '@/store/app';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        warnIfMissing();
        configureNotifications();
        initI18n(language);
        await hydratePremiumFromCache();
        await Promise.all([
          signInAnonymouslyIfNeeded(),
          configureIap(),
          initAds(),
        ]);
        void maybeShowInterstitialOnOpen();
      } catch (e) {
        if (__DEV__) console.warn('[boot] init step failed', e);
      } finally {
        if (mounted) {
          setReady(true);
          SplashScreen.hideAsync().catch(() => {});
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [language]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ThemedShell />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedShell() {
  const { isDark, theme } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.bg} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.bg },
          headerTitleStyle: { color: theme.text },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
      </Stack>
    </>
  );
}
