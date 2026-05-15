import { getAuth, isFirebaseAvailable } from '@/services/firebase';
import { setUserId } from '@/services/analytics';

export async function signInAnonymouslyIfNeeded(): Promise<string | null> {
  if (!isFirebaseAvailable()) return null;
  const auth = getAuth() as any;
  if (!auth) return null;
  try {
    if (auth.currentUser) {
      void setUserId(auth.currentUser.uid);
      return auth.currentUser.uid;
    }
    const cred = await auth.signInAnonymously();
    const uid = cred?.user?.uid ?? auth.currentUser?.uid ?? null;
    if (uid) void setUserId(uid);
    return uid;
  } catch (e) {
    if (__DEV__) console.warn('[auth] anonymous sign-in failed', e);
    return null;
  }
}

export function getCurrentUid(): string | null {
  if (!isFirebaseAvailable()) return null;
  const auth = getAuth() as any;
  return auth?.currentUser?.uid ?? null;
}
