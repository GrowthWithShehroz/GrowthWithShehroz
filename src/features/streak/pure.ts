import { isAllComplete } from '@/features/prayers/pure';
import type { PrayerCompletion } from '@/types';

export function shiftDay(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

export function todayInTz(tz?: string): string {
  const d = new Date();
  if (!tz) return d.toISOString().slice(0, 10);
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function streakFromCompletions(
  orderedDates: string[],
  completions: Record<string, PrayerCompletion>,
): { current: number; longest: number } {
  let current = 0;
  for (const date of orderedDates) {
    const c = completions[date];
    if (c && isAllComplete(c)) current++;
    else break;
  }

  let longest = 0;
  let run = 0;
  for (const date of orderedDates) {
    const c = completions[date];
    if (c && isAllComplete(c)) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
  }
  return { current, longest };
}
