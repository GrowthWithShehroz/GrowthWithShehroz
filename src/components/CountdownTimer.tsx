import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function CountdownTimer({ ms, label }: { ms: number; label?: string }) {
  const { theme, spacing, typography } = useTheme();
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[typography.label, { color: theme.textSoft, marginBottom: spacing.xs }]}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <Text
        style={[
          typography.display,
          { color: theme.text, fontVariant: ['tabular-nums'] },
        ]}
      >
        {pad(h)}:{pad(m)}:{pad(s)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
});
