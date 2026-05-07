import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FORCE_PREMIUM_FOR_TESTING, warnIfMissing } from '@/config/env';
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
        initI18n(useAppStore.getState().language);
        await hydratePremiumFromCache();
        await Promise.all([
          signInAnonymouslyIfNeeded(),
          configureIap(),
          initAds(),
        ]);
        if (FORCE_PREMIUM_FOR_TESTING) {
          useAppStore.getState().setPremium(true);
        }
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
  }, []);

  useEffect(() => {
    if (ready) initI18n(language);
  }, [language, ready]);

  if (!ready) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <ThemedShell />
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function ThemedShell() {
  const { isDark, theme } = useTheme();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const segments = useSegments();

  useEffect(() => {
    const top = segments[0] as string | undefined;
    const onOnboarding = top === 'onboarding';
    const inTabs = top === '(tabs)' || top === undefined;
    if (!hasOnboarded && inTabs) {
      router.replace('/onboarding');
    } else if (hasOnboarded && onOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hasOnboarded, segments]);

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
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
      </Stack>
    </>
  );
}
