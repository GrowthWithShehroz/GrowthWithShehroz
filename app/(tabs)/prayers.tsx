import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/AdBanner';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { PrayerRow } from '@/components/PrayerRow';
import { ensureNotificationPermission } from '@/features/notifications/permissions';
import { scheduleRollingWindow } from '@/features/notifications/scheduler';
import { findCurrentPrayer } from '@/features/prayers/calc';
import { getCompletion, setPrayerCompleted, todayKey } from '@/features/prayers/completions';
import { useTodayPrayerTimes } from '@/features/prayers/store';
import { useUserStore } from '@/store/user';
import { useTheme } from '@/theme';
import { PRAYER_NAMES, type PrayerCompletion, type PrayerName } from '@/types';

const LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export default function PrayersScreen() {
  const { theme, spacing, typography } = useTheme();
  const { times, date } = useTodayPrayerTimes();
  const settings = useUserStore((s) => s.settings);
  const togglePrayerNotification = useUserStore((s) => s.togglePrayerNotification);

  const [completion, setCompletion] = useState<PrayerCompletion | null>(null);
  const todayDate = todayKey(settings.timezone) || date;

  const refreshCompletion = useCallback(() => {
    getCompletion(todayDate).then(setCompletion);
  }, [todayDate]);

  useEffect(() => {
    refreshCompletion();
  }, [refreshCompletion]);

  const reschedule = useCallback(async () => {
    if (!settings.location) return;
    await scheduleRollingWindow({
      coords: settings.location,
      method: settings.calcMethod,
      enabled: settings.prayerNotifications,
      sound: `${settings.notificationSound}.mp3`,
    });
  }, [settings.location, settings.calcMethod, settings.prayerNotifications, settings.notificationSound]);

  const handleNotifyToggle = async (p: PrayerName, v: boolean) => {
    if (v) {
      const granted = await ensureNotificationPermission();
      if (!granted) return;
    }
    togglePrayerNotification(p, v);
    void reschedule();
  };

  const handleCompletedToggle = async (p: PrayerName, v: boolean) => {
    const next = await setPrayerCompleted(todayDate, p, v);
    setCompletion(next);
  };

  if (!settings.location) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]}>
        <EmptyState
          title="Location needed"
          subtitle="Open Settings → Location to compute today's prayer times."
        />
      </SafeAreaView>
    );
  }

  if (times.length === 0) {
    return <LoadingState label="Calculating prayer times" />;
  }

  const currentPrayer = findCurrentPrayer(times);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={[typography.h1, { color: theme.text, marginBottom: spacing.xs }]}>
          Today's Prayers
        </Text>
        <Text style={[typography.bodySmall, { color: theme.textSoft, marginBottom: spacing.lg }]}>
          {settings.location.label ?? 'Current location'} · {settings.calcMethod}
        </Text>
        {PRAYER_NAMES.map((name) => {
          const t = times.find((p) => p.name === name);
          if (!t) return null;
          return (
            <PrayerRow
              key={name}
              name={name}
              label={LABELS[name]}
              time={t.time}
              notify={settings.prayerNotifications[name]}
              completed={completion ? completion[name] : false}
              upcoming={currentPrayer === name}
              onToggleNotify={(v) => handleNotifyToggle(name, v)}
              onToggleCompleted={(v) => handleCompletedToggle(name, v)}
            />
          );
        })}
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
