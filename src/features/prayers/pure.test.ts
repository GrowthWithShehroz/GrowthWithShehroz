import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import type { PrayerCompletion, PrayerTime } from '@/types';

import { findCurrentPrayer, findNextPrayer, isAllComplete } from './pure';

function pt(name: PrayerTime['name'], hour: number): PrayerTime {
  const t = new Date('2026-04-30T00:00:00Z');
  t.setUTCHours(hour);
  return { name, time: t };
}

function at(hour: number): Date {
  const t = new Date('2026-04-30T00:00:00Z');
  t.setUTCHours(hour);
  return t;
}

const TIMES: PrayerTime[] = [
  pt('fajr', 4),
  pt('dhuhr', 12),
  pt('asr', 15),
  pt('maghrib', 18),
  pt('isha', 20),
];

describe('isAllComplete', () => {
  it('true only when all five prayers are marked done', () => {
    const allDone: PrayerCompletion = {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    };
    assert.equal(isAllComplete(allDone), true);
  });

  it('false when any prayer is missing', () => {
    const missingOne: PrayerCompletion = {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: false,
    };
    assert.equal(isAllComplete(missingOne), false);
  });

  it('false when none done', () => {
    const empty: PrayerCompletion = {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    };
    assert.equal(isAllComplete(empty), false);
  });
});

describe('findNextPrayer', () => {
  it('returns the first prayer after now', () => {
    const next = findNextPrayer(TIMES, at(13));
    assert.equal(next?.name, 'asr');
  });

  it('returns Fajr before any prayer', () => {
    const next = findNextPrayer(TIMES, at(2));
    assert.equal(next?.name, 'fajr');
  });

  it('returns null after Isha (all prayers done)', () => {
    const next = findNextPrayer(TIMES, at(22));
    assert.equal(next, null);
  });

  it('returns the next prayer at exact tick', () => {
    const next = findNextPrayer(TIMES, at(12));
    assert.equal(next?.name, 'asr');
  });
});

describe('findCurrentPrayer', () => {
  it('returns null before Fajr', () => {
    assert.equal(findCurrentPrayer(TIMES, at(2)), null);
  });

  it('returns current prayer during its window', () => {
    assert.equal(findCurrentPrayer(TIMES, at(13)), 'dhuhr');
    assert.equal(findCurrentPrayer(TIMES, at(16)), 'asr');
  });

  it('returns Isha after sunset', () => {
    assert.equal(findCurrentPrayer(TIMES, at(22)), 'isha');
  });

  it('includes the prayer at the exact tick', () => {
    assert.equal(findCurrentPrayer(TIMES, at(12)), 'dhuhr');
  });
});
