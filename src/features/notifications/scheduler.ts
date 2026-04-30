import * as Notifications from 'expo-notifications';

import { getPrayerTimesFor } from '@/features/prayers/calc';
import { cancelByPrefix, configureNotifications } from '@/services/notifications';
import type { CalcMethod, Coords, PrayerName } from '@/types';

const PREFIX = 'prayer-';
const DAYS = 7;

const PRAYER_LABEL: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

interface ScheduleOptions {
  coords: Coords;
  method: CalcMethod;
  enabled: Record<PrayerName, boolean>;
  sound?: string;
}

export async function scheduleRollingWindow({
  coords,
  method,
  enabled,
  sound,
}: ScheduleOptions): Promise<{ scheduled: number }> {
  configureNotifications();
  await cancelByPrefix(PREFIX);

  const now = Date.now();
  let scheduled = 0;

  for (let dayOffset = 0; dayOffset < DAYS; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const times = getPrayerTimesFor(date, coords, method);
    for (const p of times) {
      if (!enabled[p.name]) continue;
      const triggerMs = p.time.getTime();
      if (triggerMs <= now + 1000) continue;
      const id = `${PREFIX}${formatYmd(date)}-${p.name}`;
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: id,
          content: {
            title: `${PRAYER_LABEL[p.name]} Prayer`,
            body: `It's time for ${PRAYER_LABEL[p.name]}.`,
            sound: sound ?? 'azan-default.mp3',
            categoryIdentifier: 'prayer-times',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: p.time,
            channelId: 'prayer-times',
          } as Notifications.DateTriggerInput,
        });
        scheduled++;
      } catch (e) {
        if (__DEV__) console.warn('[scheduler] failed to schedule', id, e);
      }
    }
  }
  return { scheduled };
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function clearAllPrayerNotifications(): Promise<void> {
  await cancelByPrefix(PREFIX);
}
