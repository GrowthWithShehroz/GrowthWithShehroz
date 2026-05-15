import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export function LoadingState({ label }: { label?: string }) {
  const { theme, spacing, typography } = useTheme();
  return (
    <View style={[styles.container, { padding: spacing.xl }]}>
      <ActivityIndicator color={theme.primary} size="large" />
      {label ? (
        <Text style={[typography.body, { color: theme.textSoft, marginTop: spacing.md }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
