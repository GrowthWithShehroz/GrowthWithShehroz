import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearAllPrayerNotifications } from '@/features/notifications/scheduler';
import { getAuth, getFirestore, isFirebaseAvailable } from '@/services/firebase';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';

export async function deleteAllUserData(): Promise<{ ok: boolean; reason?: string }> {
  try {
    await clearAllPrayerNotifications();
  } catch (e) {
    if (__DEV__) console.warn('[deleteData] cancel notifications failed', e);
  }

  if (isFirebaseAvailable()) {
    try {
      const auth = getAuth() as any;
      const db = getFirestore() as any;
      const uid = auth?.currentUser?.uid;
      if (uid) {
        const userDoc = db.collection('users').doc(uid);
        const completionsSnap = await userDoc.collection('completions').get();
        const batch = db.batch();
        completionsSnap.docs.forEach((d: any) => batch.delete(d.ref));
        batch.delete(userDoc);
        await batch.commit();
        if (typeof auth.currentUser?.delete === 'function') {
          try {
            await auth.currentUser.delete();
          } catch (e) {
            if (__DEV__) console.warn('[deleteData] auth user delete failed', e);
          }
        }
      }
    } catch (e) {
      if (__DEV__) console.warn('[deleteData] firestore wipe failed', e);
      return { ok: false, reason: 'remote-failed' };
    }
  }

  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith('idw-'));
    await AsyncStorage.multiRemove(ours);
  } catch (e) {
    if (__DEV__) console.warn('[deleteData] local wipe failed', e);
    return { ok: false, reason: 'local-failed' };
  }

  try {
    useUserStore.persist.clearStorage?.();
    useAppStore.persist.clearStorage?.();
  } catch {}

  return { ok: true };
}
