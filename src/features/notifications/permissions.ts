import { requestNotificationPermission } from '@/services/notifications';

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    return await requestNotificationPermission();
  } catch (e) {
    if (__DEV__) console.warn('[notifications] permission failed', e);
    return false;
  }
}
