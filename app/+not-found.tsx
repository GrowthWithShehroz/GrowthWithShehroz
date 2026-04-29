import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

export default function NotFound() {
  const { theme, spacing, typography } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={[styles.container, { backgroundColor: theme.bg, padding: spacing.xl }]}>
        <Text style={[typography.h1, { color: theme.text }]}>This page doesn't exist.</Text>
        <Link href="/" style={{ marginTop: spacing.lg }}>
          <Text style={[typography.body, { color: theme.primary }]}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
