import type { PrayerCompletion, PrayerName, PrayerTime } from '@/types';

export function isAllComplete(c: PrayerCompletion): boolean {
  return c.fajr && c.dhuhr && c.asr && c.maghrib && c.isha;
}

export function findNextPrayer(times: PrayerTime[], now = new Date()): PrayerTime | null {
  return times.find((p) => p.time.getTime() > now.getTime()) ?? null;
}

export function findCurrentPrayer(times: PrayerTime[], now = new Date()): PrayerName | null {
  let current: PrayerName | null = null;
  for (const p of times) {
    if (p.time.getTime() <= now.getTime()) current = p.name;
    else break;
  }
  return current;
}
