import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

export default function PrayersScreen() {
  const { t } = useTranslation();
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
          title={t('prayers.locationNeededTitle')}
          subtitle={t('prayers.locationNeededSubtitle')}
        />
      </SafeAreaView>
    );
  }

  if (times.length === 0) {
    return <LoadingState label={t('prayers.calculating')} />;
  }

  const currentPrayer = findCurrentPrayer(times);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={[typography.h1, { color: theme.text, marginBottom: spacing.xs }]}>
          {t('prayers.title')}
        </Text>
        <Text style={[typography.bodySmall, { color: theme.textSoft, marginBottom: spacing.lg }]}>
          {settings.location.label ?? t('settings.location')} · {settings.calcMethod}
        </Text>
        {PRAYER_NAMES.map((name) => {
          const pt = times.find((p) => p.name === name);
          if (!pt) return null;
          return (
            <PrayerRow
              key={name}
              name={name}
              label={t(`prayers.${name}`)}
              time={pt.time}
              notify={settings.prayerNotifications[name]}
              completed={completion ? completion[name] : false}
              upcoming={currentPrayer === name}
              onToggleNotify={(v) => handleNotifyToggle(name, v)}
              onToggleCompleted={(v) => handleCompletedToggle(name, v)}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
