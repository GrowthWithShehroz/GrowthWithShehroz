import { useEffect, useMemo, useState } from 'react';

import { useUserStore } from '@/store/user';
import type { PrayerTime } from '@/types';

import { findNextPrayer, getPrayerTimesFor } from './calc';
import { todayKey } from './completions';

export function useTodayPrayerTimes(): { times: PrayerTime[]; date: string } {
  const settings = useUserStore((s) => s.settings);
  const date = todayKey(settings.timezone);
  const times = useMemo<PrayerTime[]>(() => {
    if (!settings.location) return [];
    return getPrayerTimesFor(new Date(), settings.location, settings.calcMethod);
  }, [settings.location, settings.calcMethod, date]);
  return { times, date };
}

export function useNextPrayer(times: PrayerTime[]): {
  next: PrayerTime | null;
  countdownMs: number;
} {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const next = useMemo(() => findNextPrayer(times, new Date(now)), [times, now]);
  const countdownMs = next ? Math.max(0, next.time.getTime() - now) : 0;
  return { next, countdownMs };
}

