import { getCompletionRange } from '@/features/prayers/completions';
import { isAllComplete } from '@/features/prayers/completions';

function shiftDay(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

function todayInTz(tz?: string): string {
  const d = new Date();
  if (!tz) return d.toISOString().slice(0, 10);
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export async function computeStreak(tz?: string, lookback = 60): Promise<{ current: number; longest: number }> {
  const today = todayInTz(tz);
  const dates: string[] = [];
  for (let i = 0; i < lookback; i++) dates.push(shiftDay(today, -i));
  const completions = await getCompletionRange(dates);

  let current = 0;
  for (const date of dates) {
    const c = completions[date];
    if (c && isAllComplete(c)) current++;
    else break;
  }

  let longest = 0;
  let run = 0;
  for (const date of dates) {
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
