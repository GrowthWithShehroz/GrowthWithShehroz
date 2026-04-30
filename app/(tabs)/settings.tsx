import * as Localization from 'expo-localization';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/AdBanner';
import { PaywallSheet } from '@/components/PaywallSheet';
import { PremiumBadge } from '@/components/PremiumBadge';
import { deleteAllUserData } from '@/features/auth/deleteData';
import { scheduleRollingWindow, clearAllPrayerNotifications } from '@/features/notifications/scheduler';
import { requestAndGetLocation } from '@/features/prayers/location';
import { restorePurchases } from '@/features/iap/client';
import { setLanguage as setI18nLanguage } from '@/services/i18n';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
import { useTheme } from '@/theme';
import type { CalcMethod } from '@/types';

const CALC_METHODS: CalcMethod[] = [
  'Karachi',
  'MuslimWorldLeague',
  'NorthAmerica',
  'Egyptian',
  'UmmAlQura',
  'Dubai',
  'Singapore',
];

const SOUNDS = [
  { id: 'azan-default', label: 'Default Azan' },
  { id: 'silent', label: 'Silent (vibration only)' },
];

export default function SettingsScreen() {
  const { theme, spacing, radius, typography } = useTheme();
  const { theme: themePref, language, premium, setTheme, setLanguage } = useAppStore();
  const settings = useUserStore((s) => s.settings);
  const setLocation = useUserStore((s) => s.setLocation);
  const setCalcMethod = useUserStore((s) => s.setCalcMethod);
  const setNotificationSound = useUserStore((s) => s.setNotificationSound);
  const [busy, setBusy] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const handleLocationDetect = async () => {
    setBusy(true);
    try {
      const result = await requestAndGetLocation();
      if (!result) {
        Alert.alert('Location unavailable', 'Could not detect your location.');
        return;
      }
      setLocation(result.coords, result.label);
      const tz = Localization.getCalendars()[0]?.timeZone ?? settings.timezone;
      useUserStore.setState((s) => ({ settings: { ...s.settings, timezone: tz } }));
      await scheduleRollingWindow({
        coords: result.coords,
        method: settings.calcMethod,
        enabled: settings.prayerNotifications,
        sound: `${settings.notificationSound}.mp3`,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSelectSound = (id: string) => {
    if (id !== 'azan-default' && !premium) {
      setPaywallVisible(true);
      return;
    }
    setNotificationSound(id);
  };

  const handleRestore = async () => {
    setBusy(true);
    try {
      const ok = await restorePurchases();
      if (ok) Alert.alert('Restored', 'Premium has been restored.');
      else Alert.alert('No subscription', 'No active subscription found.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete all my data?',
      'This will permanently remove your prayer history, streak, favorites, and settings — both on this device and from the cloud. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            const result = await deleteAllUserData();
            setBusy(false);
            if (result.ok) {
              Alert.alert(
                'Data deleted',
                'Your data has been removed. Please close and reopen the app.',
              );
            } else {
              Alert.alert(
                'Could not finish',
                'Some data may not have been deleted. Check your connection and try again.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Section title="Premium">
          {premium ? (
            <PremiumBadge />
          ) : (
            <Pressable
              onPress={() => setPaywallVisible(true)}
              style={({ pressed }) => [
                {
                  backgroundColor: theme.primary,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.lg,
                  borderRadius: radius.md,
                  alignSelf: 'flex-start',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[typography.h3, { color: '#fff' }]}>Upgrade to Premium</Text>
            </Pressable>
          )}
          <Pressable onPress={handleRestore} disabled={busy} style={{ marginTop: spacing.sm }}>
            <Text style={[typography.body, { color: theme.textSoft }]}>Restore purchases</Text>
          </Pressable>
        </Section>

        <Section title="Location">
          <Text style={[typography.body, { color: theme.text }]}>
            {settings.location?.label ??
              (settings.location
                ? `${settings.location.latitude.toFixed(2)}, ${settings.location.longitude.toFixed(2)}`
                : 'Not set')}
          </Text>
          <Pressable
            onPress={handleLocationDetect}
            disabled={busy}
            style={({ pressed }) => [
              {
                marginTop: spacing.sm,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                backgroundColor: theme.primary,
                borderRadius: radius.md,
                alignSelf: 'flex-start',
                opacity: pressed || busy ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[typography.h3, { color: '#fff' }]}>
              {settings.location ? 'Update location' : 'Detect location'}
            </Text>
          </Pressable>
        </Section>

        <Section title="Prayer calculation method">
          {CALC_METHODS.map((m) => (
            <SelectableRow
              key={m}
              label={m}
              selected={settings.calcMethod === m}
              onPress={() => setCalcMethod(m)}
            />
          ))}
        </Section>

        <Section title="Notification sound">
          {SOUNDS.map((s) => (
            <SelectableRow
              key={s.id}
              label={s.label}
              selected={settings.notificationSound === s.id}
              onPress={() => handleSelectSound(s.id)}
              locked={s.id !== 'azan-default' && !premium}
            />
          ))}
        </Section>

        <Section title="Theme">
          {(['system', 'light', 'dark'] as const).map((t) => (
            <SelectableRow
              key={t}
              label={t.charAt(0).toUpperCase() + t.slice(1)}
              selected={themePref === t}
              onPress={() => setTheme(t)}
            />
          ))}
        </Section>

        <Section title="Language">
          {(['en', 'ur'] as const).map((l) => (
            <SelectableRow
              key={l}
              label={l === 'en' ? 'English' : 'اردو (Urdu)'}
              selected={language === l}
              onPress={() => {
                setLanguage(l);
                setI18nLanguage(l);
              }}
            />
          ))}
        </Section>

        <Section title="Notifications">
          <Switch
            value={Object.values(settings.prayerNotifications).every(Boolean)}
            onValueChange={async (v) => {
              if (!v) {
                await clearAllPrayerNotifications();
              }
              useUserStore.setState((s) => ({
                settings: {
                  ...s.settings,
                  prayerNotifications: {
                    fajr: v,
                    dhuhr: v,
                    asr: v,
                    maghrib: v,
                    isha: v,
                  },
                },
              }));
            }}
            trackColor={{ true: theme.accent, false: theme.border }}
            thumbColor="#fff"
          />
          <Text style={[typography.bodySmall, { color: theme.textSoft, marginTop: spacing.xs }]}>
            Toggle individual prayers in the Prayers tab.
          </Text>
        </Section>

        <Section title="Privacy & data">
          <Pressable
            onPress={handleDeleteData}
            disabled={busy}
            style={({ pressed }) => [
              {
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                backgroundColor: theme.cardBg,
                borderColor: theme.error,
                borderWidth: 1,
                borderRadius: radius.md,
                alignSelf: 'flex-start',
                opacity: pressed || busy ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[typography.body, { color: theme.error }]}>
              Delete all my data
            </Text>
          </Pressable>
          <Text style={[typography.bodySmall, { color: theme.textSoft, marginTop: spacing.xs }]}>
            Removes your prayer history, streak, favorites, and settings on this device and in the cloud.
          </Text>
        </Section>
      </ScrollView>
      <AdBanner />
      <PaywallSheet visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme, spacing, typography } = useTheme();
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text
        style={[
          typography.label,
          { color: theme.textSoft, marginBottom: spacing.sm, letterSpacing: 1 },
        ]}
      >
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

function SelectableRow({
  label,
  selected,
  onPress,
  locked,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  locked?: boolean;
}) {
  const { theme, spacing, radius, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          backgroundColor: selected ? theme.primary : pressed ? theme.cardBgAlt : theme.cardBg,
          borderColor: selected ? theme.primary : theme.border,
          borderWidth: 1,
          borderRadius: radius.md,
          marginBottom: spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      ]}
    >
      <Text style={[typography.body, { color: selected ? '#fff' : theme.text }]}>{label}</Text>
      {locked ? (
        <Text style={[typography.label, { color: theme.accent }]}>PREMIUM</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
