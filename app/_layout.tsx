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
import { scheduleRollingWindow } from '@/features/notifications/scheduler';
import { initI18n, setLanguage as setI18nLanguage } from '@/services/i18n';
import { configureNotifications, requestNotificationPermission } from '@/services/notifications';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
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
      // Each step wrapped individually so one failure doesn't take out the
      // rest of bootstrap. Crashes here historically caused white-screen
      // boots — defensive isolation is more important than tidy code.
      try { warnIfMissing(); } catch (e) { if (__DEV__) console.warn('[boot] warnIfMissing', e); }
      try { configureNotifications(); } catch (e) { if (__DEV__) console.warn('[boot] configureNotifications', e); }
      try { initI18n(useAppStore.getState().language); } catch (e) { if (__DEV__) console.warn('[boot] initI18n', e); }
      try { await hydratePremiumFromCache(); } catch (e) { if (__DEV__) console.warn('[boot] hydratePremiumFromCache', e); }
      try { await signInAnonymouslyIfNeeded(); } catch (e) { if (__DEV__) console.warn('[boot] signInAnonymouslyIfNeeded', e); }
      try { await configureIap(); } catch (e) { if (__DEV__) console.warn('[boot] configureIap', e); }
      try { await initAds(); } catch (e) { if (__DEV__) console.warn('[boot] initAds', e); }
      if (FORCE_PREMIUM_FOR_TESTING) {
        try { useAppStore.getState().setPremium(true); } catch (e) { if (__DEV__) console.warn('[boot] setPremium', e); }
      }
      try { void maybeShowInterstitialOnOpen(); } catch (e) { if (__DEV__) console.warn('[boot] interstitial', e); }
      // Re-schedule prayer notifications on every cold start so the rolling
      // 7-day window stays populated. Without this, notifications silently
      // stop firing a week after the user last opened Settings.
      try {
        const settings = useUserStore.getState().settings;
        const anyEnabled = Object.values(settings.prayerNotifications).some(Boolean);
        if (settings.location && anyEnabled) {
          const granted = await requestNotificationPermission();
          if (granted) {
            await scheduleRollingWindow({
              coords: settings.location,
              method: settings.calcMethod,
              enabled: settings.prayerNotifications,
              sound: `${settings.notificationSound}.mp3`,
            });
          }
        }
      } catch (e) {
        if (__DEV__) console.warn('[boot] schedulePrayerNotifications', e);
      }
      if (mounted) {
        setReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (ready) setI18nLanguage(language);
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
