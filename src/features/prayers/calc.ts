import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';

import type { CalcMethod, Coords, PrayerTime } from '@/types';

export { findNextPrayer, findCurrentPrayer } from './pure';

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

