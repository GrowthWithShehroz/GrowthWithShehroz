import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as Localization from 'expo-localization';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/AdBanner';
import { PaywallSheet } from '@/components/PaywallSheet';
import { PremiumBadge } from '@/components/PremiumBadge';
import { deleteAllUserData } from '@/features/auth/deleteData';
import { scheduleRollingWindow, clearAllPrayerNotifications } from '@/features/notifications/scheduler';
import { requestAndGetLocation } from '@/features/prayers/location';
import { restorePurchases } from '@/features/iap/client';
import { applyRtlForLanguage, setLanguage as setI18nLanguage } from '@/services/i18n';
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

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme, spacing, radius, typography } = useTheme();
  const { theme: themePref, language, premium, setTheme, setLanguage } = useAppStore();
  const SOUNDS = [
    { id: 'azan-default', label: t('settings.soundDefault') },
    { id: 'silent', label: t('settings.soundSilent') },
  ];
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
        Alert.alert(
          t('onboarding.locationUnavailableTitle'),
          t('onboarding.locationUnavailableBody'),
        );
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
      if (ok) Alert.alert(t('settings.restoredTitle'), t('settings.restoredBody'));
      else Alert.alert(t('settings.noSubTitle'), t('settings.noSubBody'));
    } finally {
      setBusy(false);
    }
  };

  const handleSendFeedback = async () => {
    const version = Constants.expoConfig?.version ?? 'unknown';
    const buildVersion =
      (Constants.expoConfig as any)?.android?.versionCode ?? 'unknown';
    const subject = `Feedback — Islamic Daily Wisdom v${version} (${buildVersion})`;
    const body =
      `Salaam,\n\n[Type your feedback here]\n\n---\n` +
      `Platform: ${Platform.OS} ${Platform.Version}\n` +
      `App version: ${version} (build ${buildVersion})\n`;
    const mailto = `mailto:growthwithshehroz.app@gmail.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    try {
      const can = await Linking.canOpenURL(mailto);
      if (can) {
        await Linking.openURL(mailto);
      } else {
        Alert.alert(t('settings.emailMissingTitle'), t('settings.emailMissingBody'));
      }
    } catch (e) {
      Alert.alert(t('settings.emailFailTitle'), t('settings.emailFailBody'));
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      t('settings.deleteConfirmTitle'),
      t('settings.deleteConfirmBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteConfirmCta'),
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            const result = await deleteAllUserData();
            setBusy(false);
            if (result.ok) {
              Alert.alert(t('settings.deleteSuccessTitle'), t('settings.deleteSuccessBody'));
            } else {
              Alert.alert(t('settings.deleteFailTitle'), t('settings.deleteFailBody'));
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Section title={t('settings.premium')}>
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
              <Text style={[typography.h3, { color: '#fff' }]}>{t('settings.upgradeToPremium')}</Text>
            </Pressable>
          )}
          <Pressable onPress={handleRestore} disabled={busy} style={{ marginTop: spacing.sm }}>
            <Text style={[typography.body, { color: theme.textSoft }]}>{t('settings.restore')}</Text>
          </Pressable>
        </Section>

        <Section title={t('settings.location')}>
          <Text style={[typography.body, { color: theme.text }]}>
            {settings.location?.label ??
              (settings.location
                ? `${settings.location.latitude.toFixed(2)}, ${settings.location.longitude.toFixed(2)}`
                : t('settings.notSet'))}
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
              {settings.location ? t('settings.update') : t('settings.detect')}
            </Text>
          </Pressable>
        </Section>

        <Section title={t('settings.calcMethod')}>
          {CALC_METHODS.map((m) => (
            <SelectableRow
              key={m}
              label={m}
              selected={settings.calcMethod === m}
              onPress={() => setCalcMethod(m)}
            />
          ))}
        </Section>

        <Section title={t('settings.sound')}>
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

        <Section title={t('settings.theme')}>
          {(['system', 'light', 'dark'] as const).map((mode) => (
            <SelectableRow
              key={mode}
              label={t(`settings.theme${mode.charAt(0).toUpperCase() + mode.slice(1)}` as 'settings.themeSystem')}
              selected={themePref === mode}
              onPress={() => setTheme(mode)}
            />
          ))}
        </Section>

        <Section title={t('settings.language')}>
          {(['en', 'ur'] as const).map((l) => (
            <SelectableRow
              key={l}
              label={l === 'en' ? t('settings.languageEn') : t('settings.languageUr')}
              selected={language === l}
              onPress={() => {
                if (language === l) return;
                setLanguage(l);
                setI18nLanguage(l);
                const directionChanged = applyRtlForLanguage(l);
                if (directionChanged) {
                  Alert.alert(
                    t('settings.restartTitle'),
                    t('settings.restartBody'),
                  );
                }
              }}
            />
          ))}
        </Section>

        <Section title={t('settings.notifications')}>
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
            {t('settings.notifHelp')}
          </Text>
        </Section>

        <Section title={t('settings.feedback')}>
          <Pressable
            onPress={handleSendFeedback}
            style={({ pressed }) => [
              {
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                backgroundColor: theme.primary,
                borderRadius: radius.md,
                alignSelf: 'flex-start',
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[typography.h3, { color: '#fff' }]}>
              {t('settings.sendFeedback')}
            </Text>
          </Pressable>
          <Text
            style={[typography.bodySmall, { color: theme.textSoft, marginTop: spacing.xs }]}
          >
            {t('settings.feedbackHelp')}
          </Text>
        </Section>

        <Section title={t('settings.privacyData')}>
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
              {t('settings.deleteData')}
            </Text>
          </Pressable>
          <Text style={[typography.bodySmall, { color: theme.textSoft, marginTop: spacing.xs }]}>
            {t('settings.deleteHelp')}
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
  const { t } = useTranslation();
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
        <Text style={[typography.label, { color: theme.accent }]}>{t('settings.premiumOnly')}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
