export const palette = {
  islamicGreen: '#0F4C3A',
  islamicGreenLight: '#1A6E55',
  islamicGreenDark: '#082C22',
  gold: '#D4AF37',
  goldLight: '#E8C656',
  goldDark: '#A88824',
  cream: '#F8F4E9',
  ink: '#0B1A14',
  inkSoft: '#1F2D27',
  white: '#FFFFFF',
  gray: {
    50: '#F7F7F7',
    100: '#EBEBEB',
    200: '#D6D6D6',
    400: '#9A9A9A',
    600: '#5C5C5C',
    800: '#2A2A2A',
  },
  error: '#C0392B',
  success: '#1F8A4F',
};

export const lightTheme = {
  mode: 'light' as const,
  bg: palette.cream,
  surface: palette.white,
  text: palette.ink,
  textSoft: palette.gray[600],
  border: palette.gray[200],
  primary: palette.islamicGreen,
  primaryAlt: palette.islamicGreenLight,
  accent: palette.gold,
  accentSoft: palette.goldLight,
  cardBg: palette.white,
  cardBgAlt: palette.cream,
  error: palette.error,
  success: palette.success,
};

export const darkTheme = {
  mode: 'dark' as const,
  bg: palette.islamicGreenDark,
  surface: palette.inkSoft,
  text: palette.cream,
  textSoft: palette.gray[200],
  border: palette.gray[800],
  primary: palette.islamicGreenLight,
  primaryAlt: palette.islamicGreen,
  accent: palette.goldLight,
  accentSoft: palette.gold,
  cardBg: palette.inkSoft,
  cardBgAlt: palette.ink,
  error: palette.error,
  success: palette.success,
};

export type AppTheme = typeof lightTheme;
