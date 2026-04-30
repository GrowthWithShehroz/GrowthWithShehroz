import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';

import type { CalcMethod, Coords, PrayerName, PrayerTime } from '@/types';

const METHOD_FACTORY: Record<CalcMethod, () => ReturnType<typeof CalculationMethod.MuslimWorldLeague>> = {
  MuslimWorldLeague: () => CalculationMethod.MuslimWorldLeague(),
  Egyptian: () => CalculationMethod.Egyptian(),
  Karachi: () => CalculationMethod.Karachi(),
  UmmAlQura: () => CalculationMethod.UmmAlQura(),
  Dubai: () => CalculationMethod.Dubai(),
  Qatar: () => CalculationMethod.Qatar(),
  Kuwait: () => CalculationMethod.Kuwait(),
  MoonsightingCommittee: () => CalculationMethod.MoonsightingCommittee(),
  Singapore: () => CalculationMethod.Singapore(),
  Turkey: () => CalculationMethod.Turkey(),
  Tehran: () => CalculationMethod.Tehran(),
  NorthAmerica: () => CalculationMethod.NorthAmerica(),
};

export function getPrayerTimesFor(date: Date, coords: Coords, method: CalcMethod): PrayerTime[] {
  const params = METHOD_FACTORY[method]();
  const c = new Coordinates(coords.latitude, coords.longitude);
  const pt = new PrayerTimes(c, date, params);
  return [
    { name: 'fajr', time: pt.fajr },
    { name: 'dhuhr', time: pt.dhuhr },
    { name: 'asr', time: pt.asr },
    { name: 'maghrib', time: pt.maghrib },
    { name: 'isha', time: pt.isha },
  ];
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
