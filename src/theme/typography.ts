import { TextStyle } from 'react-native';

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' } satisfies TextStyle,
  h1: { fontSize: 26, lineHeight: 32, fontWeight: '700' } satisfies TextStyle,
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' } satisfies TextStyle,
  h3: { fontSize: 16, lineHeight: 22, fontWeight: '600' } satisfies TextStyle,
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' } satisfies TextStyle,
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: '400' } satisfies TextStyle,
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.5 } satisfies TextStyle,
  arabic: { fontSize: 26, lineHeight: 44, fontWeight: '500' } satisfies TextStyle,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
};
