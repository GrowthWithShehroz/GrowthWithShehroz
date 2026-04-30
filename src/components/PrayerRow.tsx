import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import type { PrayerName } from '@/types';

interface Props {
  name: PrayerName;
  label: string;
  time: Date;
  notify: boolean;
  completed: boolean;
  onToggleNotify: (v: boolean) => void;
  onToggleCompleted: (v: boolean) => void;
  upcoming?: boolean;
}

function fmt(t: Date): string {
  return t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function PrayerRow({
  label,
  time,
  notify,
  completed,
  onToggleNotify,
  onToggleCompleted,
  upcoming,
}: Props) {
  const { theme, spacing, radius, typography } = useTheme();
  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: upcoming ? theme.primary : theme.surface,
          borderColor: theme.border,
          borderRadius: radius.md,
          padding: spacing.lg,
          marginBottom: spacing.sm,
        },
      ]}
    >
      <Pressable
        onPress={() => onToggleCompleted(!completed)}
        hitSlop={8}
        style={[
          styles.check,
          {
            borderColor: upcoming ? '#fff' : theme.primary,
            backgroundColor: completed ? (upcoming ? '#fff' : theme.primary) : 'transparent',
          },
        ]}
      >
        {completed ? (
          <Text
            style={{
              color: upcoming ? theme.primary : '#fff',
              fontWeight: '700',
              fontSize: 16,
              lineHeight: 20,
            }}
          >
            ✓
          </Text>
        ) : null}
      </Pressable>
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={[typography.h3, { color: upcoming ? '#fff' : theme.text }]}>{label}</Text>
        <Text
          style={[
            typography.bodySmall,
            { color: upcoming ? '#fff' : theme.textSoft, opacity: upcoming ? 0.85 : 1 },
          ]}
        >
          {fmt(time)}
        </Text>
      </View>
      <Switch
        value={notify}
        onValueChange={onToggleNotify}
        trackColor={{ true: theme.accent, false: theme.border }}
        thumbColor={'#fff'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
