import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { CalcMethod, Coords, PrayerName, UserSettings } from '@/types';

const defaultPrayerNotifications: Record<PrayerName, boolean> = {
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

interface UserState {
  settings: UserSettings;
  favorites: string[];
  lastViewedDate?: string;
  setLocation: (c: Coords, label?: string) => void;
  setCalcMethod: (m: CalcMethod) => void;
  setNotificationSound: (s: string) => void;
  togglePrayerNotification: (p: PrayerName, v: boolean) => void;
  toggleFavorite: (cardId: string) => void;
  setLastViewedDate: (d: string) => void;
}

const initialSettings: UserSettings = {
  language: 'en',
  theme: 'system',
  calcMethod: 'Karachi',
  notificationSound: 'azan_default',
  prayerNotifications: defaultPrayerNotifications,
  timezone: 'UTC',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      settings: initialSettings,
      favorites: [],
      setLocation: (location, label) =>
        set((s) => ({
          settings: { ...s.settings, location: { ...location, label } },
        })),
      setCalcMethod: (calcMethod) =>
        set((s) => ({ settings: { ...s.settings, calcMethod } })),
      setNotificationSound: (notificationSound) =>
        set((s) => ({ settings: { ...s.settings, notificationSound } })),
      togglePrayerNotification: (prayer, v) =>
        set((s) => ({
          settings: {
            ...s.settings,
            prayerNotifications: { ...s.settings.prayerNotifications, [prayer]: v },
          },
        })),
      toggleFavorite: (cardId) =>
        set((s) => ({
          favorites: s.favorites.includes(cardId)
            ? s.favorites.filter((id) => id !== cardId)
            : [...s.favorites, cardId],
        })),
      setLastViewedDate: (lastViewedDate) => set({ lastViewedDate }),
    }),
    {
      name: 'idw-user',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
