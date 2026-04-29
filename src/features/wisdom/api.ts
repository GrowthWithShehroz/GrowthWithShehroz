import { useQuery } from '@tanstack/react-query';

import { getFirestore, isFirebaseAvailable } from '@/services/firebase';
import type { WisdomCard } from '@/types';

import { fallbackCards, fallbackCardForDate } from './fallback';

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useDailyWisdom(date: string = todayDate()) {
  return useQuery<WisdomCard>({
    queryKey: ['wisdom', date],
    queryFn: () => fetchWisdomForDate(date),
    staleTime: 1000 * 60 * 60 * 6,
  });
}

export function useWisdomArchive(limit = 30) {
  return useQuery<WisdomCard[]>({
    queryKey: ['wisdom-archive', limit],
    queryFn: () => fetchArchive(limit),
    staleTime: 1000 * 60 * 60,
  });
}

export async function fetchWisdomForDate(date: string): Promise<WisdomCard> {
  if (isFirebaseAvailable()) {
    try {
      const db = getFirestore() as any;
      const snap = await db.collection('wisdom').doc(date).get();
      if (snap.exists) {
        return { id: date, date, ...(snap.data() as Omit<WisdomCard, 'id' | 'date'>) };
      }
    } catch (e) {
      if (__DEV__) console.warn('[wisdom] firestore fetch failed, using fallback', e);
    }
  }
  return fallbackCardForDate(date);
}

export async function fetchArchive(limit = 30): Promise<WisdomCard[]> {
  if (isFirebaseAvailable()) {
    try {
      const db = getFirestore() as any;
      const snap = await db.collection('wisdom').orderBy('date', 'desc').limit(limit).get();
      const out: WisdomCard[] = [];
      snap.forEach((doc: any) => {
        out.push({ id: doc.id, date: doc.id, ...doc.data() });
      });
      if (out.length > 0) return out;
    } catch (e) {
      if (__DEV__) console.warn('[wisdom] archive fetch failed, using fallback', e);
    }
  }
  return fallbackCards();
}
