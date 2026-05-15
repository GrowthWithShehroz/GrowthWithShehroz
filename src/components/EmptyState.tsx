import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme, spacing, typography } = useTheme();
  return (
    <View style={[styles.container, { padding: spacing.xl }]}>
      <Text style={[typography.h3, { color: theme.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[typography.body, { color: theme.textSoft, textAlign: 'center', marginTop: spacing.sm }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
