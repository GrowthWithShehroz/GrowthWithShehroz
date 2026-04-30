import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export function PremiumBadge() {
  const { theme, spacing, radius, typography } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.accent,
          borderRadius: radius.full,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
        },
      ]}
    >
      <Text style={[typography.label, { color: '#000' }]}>PREMIUM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start' },
});
