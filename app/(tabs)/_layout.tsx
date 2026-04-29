import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

import { useTheme } from '@/theme';

function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 22, color, lineHeight: 26 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSoft,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        headerStyle: { backgroundColor: theme.bg },
        headerTitleStyle: { color: theme.text },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon glyph="✦" color={color} />,
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          title: 'Prayers',
          tabBarIcon: ({ color }) => <TabIcon glyph="☪" color={color} />,
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color }) => <TabIcon glyph="❡" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon glyph="⚙" color={color} />,
        }}
      />
    </Tabs>
  );
}
