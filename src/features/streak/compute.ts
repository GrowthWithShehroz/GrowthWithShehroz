import { getCompletionRange } from '@/features/prayers/completions';
import { PRAYER_NAMES } from '@/types';

import { shiftDay, streakFromCompletions, todayInTz } from './pure';

export async function computeStreak(
  tz?: string,
  lookback = 60,
): Promise<{ current: number; longest: number; todayCount: number }> {
  const today = todayInTz(tz);
  const dates: string[] = [];
  for (let i = 0; i < lookback; i++) dates.push(shiftDay(today, -i));
  const completions = await getCompletionRange(dates);
  const todayCompletion = completions[today];
  const todayCount = todayCompletion
    ? PRAYER_NAMES.filter((p) => todayCompletion[p]).length
    : 0;
  return { ...streakFromCompletions(dates, completions), todayCount };
}
