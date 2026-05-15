import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let configured = false;

export function configureNotifications(): void {
  if (configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    // NOTE: Android notification channels are IMMUTABLE — once a channel is
    // created on a device, its sound/importance/etc. cannot be modified.
    // Earlier builds created `prayer-times` with a broken sound reference,
    // so existing testers had a soundless channel that we cannot repair
    // in-place. The fix is to ship a NEW channel ID — `prayer-times-v2` —
    // which Android creates fresh with the (now correct) azan_default
    // resource. The old `prayer-times` channel just becomes an unused
    // orphan in the system notification settings; users can ignore it.
    //
    // Also: the `sound` property must be the resource name WITHOUT the
    // `.mp3` extension — Android resolves it via R.raw.<sound>.
    Notifications.setNotificationChannelAsync('prayer-times-v2', {
      name: 'Prayer Times',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'azan_default',
      enableVibrate: true,
      bypassDnd: false,
      showBadge: false,
    }).catch(() => {});
    // Best-effort cleanup of the old broken channel (silently fails on
    // devices where it never existed).
    Notifications.deleteNotificationChannelAsync('prayer-times').catch(() => {});
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

export async function listScheduled(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

export async function cancelByPrefix(prefix: string): Promise<void> {
  const all = await listScheduled();
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith(prefix))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}
