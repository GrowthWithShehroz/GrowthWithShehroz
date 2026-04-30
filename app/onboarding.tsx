import * as Localization from 'expo-localization';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ensureNotificationPermission } from '@/features/notifications/permissions';
import { scheduleRollingWindow } from '@/features/notifications/scheduler';
import { requestAndGetLocation } from '@/features/prayers/location';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
import { useTheme } from '@/theme';

type StepId = 'welcome' | 'location' | 'notifications';
const STEPS: StepId[] = ['welcome', 'location', 'notifications'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme, spacing, radius, typography } = useTheme();
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const setLocation = useUserStore((s) => s.setLocation);
  const settings = useUserStore((s) => s.settings);

  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const step = STEPS[stepIndex] ?? 'welcome';

  const finish = (): void => {
    setOnboarded(true);
    router.replace('/(tabs)');
  };

  const next = (): void => {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
    else finish();
  };

  const handleDetectLocation = async (): Promise<void> => {
    setBusy(true);
    try {
      const result = await requestAndGetLocation();
      if (!result) {
        Alert.alert(
          'Location unavailable',
          'You can set your location later in Settings.',
        );
        return;
      }
      setLocation(result.coords, result.label);
      setLocationLabel(result.label ?? 'detected');
      const tz = Localization.getCalendars()[0]?.timeZone ?? settings.timezone;
      useUserStore.setState((s) => ({ settings: { ...s.settings, timezone: tz } }));
    } finally {
      setBusy(false);
    }
  };

  const handleEnableNotifications = async (): Promise<void> => {
    setBusy(true);
    try {
      const granted = await ensureNotificationPermission();
      setNotificationsEnabled(granted);
      if (!granted) {
        Alert.alert(
          'Notifications disabled',
          'You can enable Azan reminders later in Settings.',
        );
        return;
      }
      // If we already have a location, schedule the rolling window now.
      if (settings.location) {
        await scheduleRollingWindow({
          coords: settings.location,
          method: settings.calcMethod,
          enabled: settings.prayerNotifications,
          sound: `${settings.notificationSound}.mp3`,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]}>
      <View style={styles.dotsRow}>
        {STEPS.map((id, i) => (
          <View
            key={id}
            style={[
              styles.dot,
              {
                backgroundColor: i === stepIndex ? theme.accent : theme.border,
                width: i === stepIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.body, { paddingHorizontal: spacing.xl }]}>
        {step === 'welcome' ? (
          <View style={styles.card}>
            <Text style={[styles.bigArabic, { color: theme.accent }]}>
              ﷽
            </Text>
            <Text style={[typography.h1, { color: theme.text, textAlign: 'center', marginTop: spacing.lg }]}>
              Welcome
            </Text>
            <Text
              style={[
                typography.body,
                { color: theme.textSoft, textAlign: 'center', marginTop: spacing.md, lineHeight: 24 },
              ]}
            >
              Islamic Daily Wisdom brings you a Quranic verse each day, accurate
              prayer times, and gentle Azan reminders — built with care, ad-free
              for Premium users, and respectful of your privacy.
            </Text>
          </View>
        ) : null}

        {step === 'location' ? (
          <View style={styles.card}>
            <Text style={[styles.bigEmoji]}>📍</Text>
            <Text style={[typography.h1, { color: theme.text, textAlign: 'center', marginTop: spacing.lg }]}>
              Set your location
            </Text>
            <Text
              style={[
                typography.body,
                { color: theme.textSoft, textAlign: 'center', marginTop: spacing.md, lineHeight: 24 },
              ]}
            >
              We use your location only to compute accurate prayer times.
              Coordinates stay on your device — they're never sent to our
              servers.
            </Text>

            {locationLabel ? (
              <View
                style={{
                  marginTop: spacing.lg,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  borderRadius: radius.md,
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.success,
                }}
              >
                <Text style={[typography.body, { color: theme.success, textAlign: 'center' }]}>
                  ✓ Location set: {locationLabel}
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={handleDetectLocation}
                disabled={busy}
                style={({ pressed }) => [
                  {
                    marginTop: spacing.xl,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.xl,
                    backgroundColor: theme.primary,
                    borderRadius: radius.md,
                    opacity: pressed || busy ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[typography.h3, { color: '#fff', textAlign: 'center' }]}>
                  {busy ? 'Detecting…' : 'Detect my location'}
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {step === 'notifications' ? (
          <View style={styles.card}>
            <Text style={[styles.bigEmoji]}>🔔</Text>
            <Text style={[typography.h1, { color: theme.text, textAlign: 'center', marginTop: spacing.lg }]}>
              Azan reminders
            </Text>
            <Text
              style={[
                typography.body,
                { color: theme.textSoft, textAlign: 'center', marginTop: spacing.md, lineHeight: 24 },
              ]}
            >
              Get a gentle local notification at each of the five daily prayers.
              You can toggle individual prayers in the Prayers tab anytime.
            </Text>

            {notificationsEnabled ? (
              <View
                style={{
                  marginTop: spacing.lg,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  borderRadius: radius.md,
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.success,
                }}
              >
                <Text style={[typography.body, { color: theme.success, textAlign: 'center' }]}>
                  ✓ Notifications enabled
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={handleEnableNotifications}
                disabled={busy}
                style={({ pressed }) => [
                  {
                    marginTop: spacing.xl,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.xl,
                    backgroundColor: theme.primary,
                    borderRadius: radius.md,
                    opacity: pressed || busy ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[typography.h3, { color: '#fff', textAlign: 'center' }]}>
                  {busy ? 'Asking…' : 'Enable notifications'}
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}
      </View>

      <View style={[styles.footer, { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg }]}>
        <Pressable
          onPress={next}
          style={({ pressed }) => [
            {
              backgroundColor: theme.accent,
              paddingVertical: spacing.lg,
              borderRadius: radius.md,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[typography.h3, { color: '#000', textAlign: 'center' }]}>
            {stepIndex === STEPS.length - 1 ? 'Get started' : 'Continue'}
          </Text>
        </Pressable>
        {stepIndex < STEPS.length - 1 ? (
          <Pressable onPress={finish} style={{ marginTop: spacing.md }} hitSlop={8}>
            <Text style={[typography.bodySmall, { color: theme.textSoft, textAlign: 'center' }]}>
              Skip — set up later in Settings
            </Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 24,
  },
  dot: { height: 8, borderRadius: 4 },
  body: { flex: 1, justifyContent: 'center' },
  card: { alignItems: 'center' },
  bigArabic: { fontSize: 56, lineHeight: 72 },
  bigEmoji: { fontSize: 64 },
  footer: { paddingTop: 8 },
});
