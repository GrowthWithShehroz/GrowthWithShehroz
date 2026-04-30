import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  const { theme, spacing, radius, typography } = useTheme();
  return (
    <View style={[styles.container, { padding: spacing.xl }]}>
      <Text style={[typography.h3, { color: theme.error, marginBottom: spacing.sm }]}>
        Something went wrong
      </Text>
      <Text style={[typography.body, { color: theme.textSoft, textAlign: 'center' }]}>
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            {
              marginTop: spacing.lg,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              backgroundColor: theme.primary,
              borderRadius: radius.md,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[typography.h3, { color: '#fff' }]}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
