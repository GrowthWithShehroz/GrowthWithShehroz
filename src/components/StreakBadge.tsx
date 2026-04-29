import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export function StreakBadge({ current, longest }: { current: number; longest: number }) {
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
      <Text style={[typography.label, { color: theme.accent }]}>STREAK</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs }}>
        <Text style={[typography.display, { color: theme.text }]}>{current}</Text>
        <Text style={[typography.body, { color: theme.textSoft, marginLeft: spacing.sm }]}>
          day{current === 1 ? '' : 's'}
        </Text>
      </View>
      <Text style={[typography.bodySmall, { color: theme.textSoft, marginTop: spacing.xs }]}>
        Longest: {longest}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, alignSelf: 'flex-start' },
});
