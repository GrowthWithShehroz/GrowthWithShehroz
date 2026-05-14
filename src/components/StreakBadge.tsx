import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export function StreakBadge({
  current,
  longest,
  todayCount,
}: {
  current: number;
  longest: number;
  todayCount?: number;
}) {
  const { t } = useTranslation();
  const { theme, spacing, radius, typography } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.accent,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <Text style={[typography.label, { color: theme.accent }]}>{t('streak.label')}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs }}>
        <Text style={[typography.display, { color: theme.text }]}>{current}</Text>
        <Text style={[typography.body, { color: theme.textSoft, marginLeft: spacing.sm }]}>
          {t('streak.days', { count: current })}
        </Text>
      </View>
      {typeof todayCount === 'number' ? (
        <Text style={[typography.bodySmall, { color: theme.accent, marginTop: spacing.xs }]}>
          {t('streak.today', { n: todayCount })}
        </Text>
      ) : null}
      <Text style={[typography.bodySmall, { color: theme.textSoft, marginTop: spacing.xs }]}>
        {t('streak.longest', { n: longest })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, alignSelf: 'flex-start' },
});
