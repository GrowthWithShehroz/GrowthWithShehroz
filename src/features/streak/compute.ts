import { getCompletionRange } from '@/features/prayers/completions';

import { shiftDay, streakFromCompletions, todayInTz } from './pure';

export async function computeStreak(
  tz?: string,
  lookback = 60,
): Promise<{ current: number; longest: number }> {
  const today = todayInTz(tz);
  const dates: string[] = [];
  for (let i = 0; i < lookback; i++) dates.push(shiftDay(today, -i));
  const completions = await getCompletionRange(dates);
  return streakFromCompletions(dates, completions);
}
