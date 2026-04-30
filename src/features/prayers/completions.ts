import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAuth, getFirestore, isFirebaseAvailable } from '@/services/firebase';
import type { PrayerCompletion, PrayerName } from '@/types';

export { isAllComplete } from './pure';

const KEY = (date: string) => `idw-completion-${date}`;

const empty: PrayerCompletion = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
};

export function todayKey(tz?: string): string {
  const d = new Date();
  if (!tz) return d.toISOString().slice(0, 10);
  // Best-effort: format YYYY-MM-DD in user timezone via Intl.
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz });
    return fmt.format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export async function getCompletion(date: string): Promise<PrayerCompletion> {
  try {
    const raw = await AsyncStorage.getItem(KEY(date));
    if (raw) return { ...empty, ...JSON.parse(raw) } as PrayerCompletion;
  } catch (e) {
    if (__DEV__) console.warn('[completions] read failed', e);
  }
  return empty;
}

export async function setPrayerCompleted(
  date: string,
  prayer: PrayerName,
  done: boolean,
): Promise<PrayerCompletion> {
  const current = await getCompletion(date);
  const next: PrayerCompletion = { ...current, [prayer]: done, completedAt: Date.now() };
  await AsyncStorage.setItem(KEY(date), JSON.stringify(next));
  void mirrorToFirestore(date, next);
  return next;
}

async function mirrorToFirestore(date: string, c: PrayerCompletion): Promise<void> {
  if (!isFirebaseAvailable()) return;
  const auth = getAuth() as any;
  const db = getFirestore() as any;
  const uid = auth?.currentUser?.uid;
  if (!uid) return;
  try {
    await db.collection('users').doc(uid).collection('completions').doc(date).set(c, { merge: true });
  } catch (e) {
    if (__DEV__) console.warn('[completions] mirror failed', e);
  }
}

export async function getCompletionRange(dates: string[]): Promise<Record<string, PrayerCompletion>> {
  const entries = await Promise.all(
    dates.map(async (d) => [d, await getCompletion(d)] as const),
  );
  return Object.fromEntries(entries);
}
