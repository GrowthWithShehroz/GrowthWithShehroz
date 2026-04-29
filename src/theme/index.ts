import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useAppStore } from '@/store/app';

import { AppTheme, darkTheme, lightTheme } from './colors';
import { radius, spacing, typography } from './typography';

interface ThemeContextValue {
  theme: AppTheme;
  isDark: boolean;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themePref = useAppStore((s) => s.theme);
  const system = useColorScheme();
  const isDark = themePref === 'dark' || (themePref === 'system' && system === 'dark');
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      spacing,
      radius,
      typography,
    }),
    [isDark],
  );
  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

export { darkTheme, lightTheme } from './colors';
export type { AppTheme } from './colors';
