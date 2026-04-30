import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import type { PrayerCompletion } from '@/types';

import { shiftDay, streakFromCompletions, todayInTz } from './pure';

const allDone: PrayerCompletion = {
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

const partial: PrayerCompletion = {
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: false,
  isha: false,
};

describe('shiftDay', () => {
  it('moves forward by N days', () => {
    assert.equal(shiftDay('2026-01-30', 2), '2026-02-01');
  });

  it('moves backward by N days', () => {
    assert.equal(shiftDay('2026-03-01', -1), '2026-02-28');
  });

  it('handles leap-year February', () => {
    assert.equal(shiftDay('2024-02-28', 1), '2024-02-29');
    assert.equal(shiftDay('2024-03-01', -1), '2024-02-29');
  });

  it('crosses year boundary', () => {
    assert.equal(shiftDay('2026-12-31', 1), '2027-01-01');
    assert.equal(shiftDay('2026-01-01', -1), '2025-12-31');
  });
});

describe('todayInTz', () => {
  it('returns YYYY-MM-DD shape', () => {
    assert.match(todayInTz(), /^\d{4}-\d{2}-\d{2}$/);
    assert.match(todayInTz('Asia/Karachi'), /^\d{4}-\d{2}-\d{2}$/);
  });

  it('falls back to UTC when timezone is invalid', () => {
    const got = todayInTz('Mars/Olympus_Mons');
    assert.match(got, /^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('streakFromCompletions', () => {
  it('returns zeros when no data', () => {
    const dates = ['2026-04-30', '2026-04-29', '2026-04-28'];
    const result = streakFromCompletions(dates, {});
    assert.deepEqual(result, { current: 0, longest: 0 });
  });

  it('counts current streak from today (first date) backwards', () => {
    const dates = ['2026-04-30', '2026-04-29', '2026-04-28', '2026-04-27'];
    const completions = {
      '2026-04-30': allDone,
      '2026-04-29': allDone,
      '2026-04-28': partial,
      '2026-04-27': allDone,
    };
    const result = streakFromCompletions(dates, completions);
    assert.equal(result.current, 2);
  });

  it('breaks current streak at first incomplete day', () => {
    const dates = ['2026-04-30', '2026-04-29', '2026-04-28'];
    const completions = {
      '2026-04-30': partial,
      '2026-04-29': allDone,
      '2026-04-28': allDone,
    };
    const result = streakFromCompletions(dates, completions);
    assert.equal(result.current, 0);
    assert.equal(result.longest, 2);
  });

  it('tracks longest streak across gaps', () => {
    const dates = [
      '2026-04-30',
      '2026-04-29',
      '2026-04-28',
      '2026-04-27',
      '2026-04-26',
      '2026-04-25',
      '2026-04-24',
    ];
    const completions = {
      '2026-04-30': allDone,
      '2026-04-29': partial,
      '2026-04-28': allDone,
      '2026-04-27': allDone,
      '2026-04-26': allDone,
      '2026-04-25': partial,
      '2026-04-24': allDone,
    };
    const result = streakFromCompletions(dates, completions);
    assert.equal(result.current, 1);
    assert.equal(result.longest, 3);
  });

  it('handles missing entries as incomplete', () => {
    const dates = ['2026-04-30', '2026-04-29', '2026-04-28'];
    const completions = { '2026-04-30': allDone };
    const result = streakFromCompletions(dates, completions);
    assert.equal(result.current, 1);
    assert.equal(result.longest, 1);
  });
});
