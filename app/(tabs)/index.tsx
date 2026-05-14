import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type ViewShot from 'react-native-view-shot';

import { AdBanner } from '@/components/AdBanner';
import { CountdownTimer } from '@/components/CountdownTimer';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { PaywallSheet } from '@/components/PaywallSheet';
import { ShareSheet } from '@/components/ShareSheet';
import { StreakBadge } from '@/components/StreakBadge';
import { WisdomCard } from '@/components/WisdomCard';
import { captureToFile } from '@/features/share/capture';
import { computeStreak } from '@/features/streak/compute';
import { useDailyGate } from '@/features/wisdom/dailyGate';
import { useDailyWisdom } from '@/features/wisdom/api';
import { useNextPrayer, useTodayPrayerTimes } from '@/features/prayers/store';
import { logEvent } from '@/services/analytics';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme, spacing, radius, typography } = useTheme();
  const cardRef = useRef<ViewShot>(null);
  const language = useAppStore((s) => s.language);
  const tz = useUserStore((s) => s.settings.timezone);
  const location = useUserStore((s) => s.settings.location);

  const { times } = useTodayPrayerTimes();
  const { next, countdownMs } = useNextPrayer(times);
  const wisdom = useDailyWisdom();
  const gate = useDailyGate();

  const [streak, setStreak] = useState({ current: 0, longest: 0, todayCount: 0 });
  const [shareVisible, setShareVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Recompute streak every time the Home tab regains focus, not only when
  // tz changes — otherwise marking prayers complete on the Prayers tab
  // and returning here leaves the streak stale.
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      computeStreak(tz).then((s) => {
        if (mounted) setStreak(s);
      });
      return () => {
        mounted = false;
      };
    }, [tz]),
  );

  useEffect(() => {
    if (gate.canView && wisdom.data) {
      gate.markViewed();
      void logEvent('view_wisdom', { date: wisdom.data.date });
    }
  }, [gate.canView, wisdom.data]);

  const handleShare = async () => {
    if (!cardRef.current || !wisdom.data) return;
    if (!gate.canView) {
      setPaywallVisible(true);
      return;
    }
    const uri = await captureToFile(cardRef);
    if (!uri) return;
    setImageUri(uri);
    setShareVisible(true);
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            {next ? (
              <CountdownTimer ms={countdownMs} label={t('home.nextPrayer', { name: t(`prayers.${next.name}`) })} />
            ) : !location ? (
              <Text style={[typography.body, { color: theme.textSoft }]}>
                {t('home.locationNeeded')}
              </Text>
            ) : (
              <Text style={[typography.body, { color: theme.textSoft }]}>
                {t('home.allComplete')}
              </Text>
            )}
          </View>
          <StreakBadge
            current={streak.current}
            longest={streak.longest}
            todayCount={streak.todayCount}
          />
        </View>

        <View style={{ marginTop: spacing.xl }}>
          {wisdom.isLoading ? (
            <LoadingState label={t('home.loadingWisdom')} />
          ) : wisdom.isError ? (
            <ErrorState
              message={t('home.loadError')}
              onRetry={() => wisdom.refetch()}
            />
          ) : !gate.canView ? (
            <View
              style={{
                padding: spacing.xl,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: radius.lg,
                backgroundColor: theme.cardBg,
              }}
            >
              <Text style={[typography.h2, { color: theme.text, textAlign: 'center' }]}>
                {t('home.viewedToday')}
              </Text>
              <Text
                style={[typography.body, { color: theme.textSoft, textAlign: 'center', marginTop: spacing.sm }]}
              >
                {t('home.comeBackTomorrow')}
              </Text>
              <Pressable
                onPress={() => setPaywallVisible(true)}
                style={({ pressed }) => [
                  {
                    marginTop: spacing.lg,
                    backgroundColor: theme.primary,
                    paddingVertical: spacing.md,
                    borderRadius: radius.md,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={[typography.h3, { color: '#fff', textAlign: 'center' }]}>
                  {t('home.unlockPremium')}
                </Text>
              </Pressable>
            </View>
          ) : wisdom.data ? (
            <WisdomCard ref={cardRef} card={wisdom.data} language={language} />
          ) : (
            <EmptyState title={t('home.noWisdom')} />
          )}
        </View>

        {gate.canView && wisdom.data ? (
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              {
                marginTop: spacing.xl,
                backgroundColor: theme.accent,
                paddingVertical: spacing.lg,
                borderRadius: radius.md,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[typography.h3, { color: '#000', textAlign: 'center' }]}>
              {t('home.shareWisdom')}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <AdBanner />

      <ShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        imageUri={imageUri}
        caption={
          wisdom.data
            ? `${wisdom.data.translationEn}\n\n— ${wisdom.data.surah} ${wisdom.data.surahNumber}:${wisdom.data.ayah}`
            : ''
        }
      />
      <PaywallSheet visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
