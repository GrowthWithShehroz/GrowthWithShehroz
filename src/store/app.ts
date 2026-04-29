import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  theme: 'system' | 'light' | 'dark';
  language: 'en' | 'ur';
  premium: boolean;
  appOpens: number;
  hasOnboarded: boolean;
  setTheme: (t: AppState['theme']) => void;
  setLanguage: (l: AppState['language']) => void;
  setPremium: (p: boolean) => void;
  incrementOpens: () => void;
  setOnboarded: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'en',
      premium: false,
      appOpens: 0,
      hasOnboarded: false,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setPremium: (premium) => set({ premium }),
      incrementOpens: () => set((s) => ({ appOpens: s.appOpens + 1 })),
      setOnboarded: (hasOnboarded) => set({ hasOnboarded }),
    }),
    {
      name: 'idw-app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        theme: s.theme,
        language: s.language,
        premium: s.premium,
        appOpens: s.appOpens,
        hasOnboarded: s.hasOnboarded,
      }),
    },
  ),
);
