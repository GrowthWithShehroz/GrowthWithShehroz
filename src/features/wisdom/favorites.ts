import { getAuth, getFirestore, isFirebaseAvailable } from '@/services/firebase';
import { useUserStore } from '@/store/user';

export function useIsFavorite(cardId: string): boolean {
  return useUserStore((s) => s.favorites.includes(cardId));
}

export async function toggleFavorite(cardId: string): Promise<void> {
  useUserStore.getState().toggleFavorite(cardId);
  if (!isFirebaseAvailable()) return;
  const auth = getAuth() as any;
  const db = getFirestore() as any;
  const uid = auth?.currentUser?.uid;
  if (!uid) return;
  try {
    const favorites = useUserStore.getState().favorites;
    await db.collection('users').doc(uid).set({ favorites }, { merge: true });
  } catch (e) {
    if (__DEV__) console.warn('[favorites] sync failed', e);
  }
}
