export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_NAMES: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export interface PrayerTime {
  name: PrayerName;
  time: Date;
}

export interface PrayerCompletion {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  completedAt?: number;
}

export interface WisdomCard {
  id: string;
  date: string;
  surah: string;
  surahNumber: number;
  ayah: number;
  arabic: string;
  translationEn: string;
  translationUr?: string;
  reflection: string;
  source: string;
}

export interface UserSettings {
  language: 'en' | 'ur';
  theme: 'system' | 'light' | 'dark';
  calcMethod: CalcMethod;
  notificationSound: string;
  prayerNotifications: Record<PrayerName, boolean>;
  timezone: string;
  location?: { latitude: number; longitude: number; label?: string };
}

export type CalcMethod =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'MoonsightingCommittee'
  | 'Singapore'
  | 'Turkey'
  | 'Tehran'
  | 'NorthAmerica';

export interface UserProfile {
  uid: string;
  createdAt: number;
  premium: boolean;
  settings: UserSettings;
  streak: { current: number; longest: number; lastDay?: string };
  favorites: string[];
  lastViewedDate?: string;
}

export interface Coords {
  latitude: number;
  longitude: number;
}
