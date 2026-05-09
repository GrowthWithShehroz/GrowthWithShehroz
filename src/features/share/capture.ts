import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { RefObject } from 'react';
import { Alert, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

import { logEvent } from '@/services/analytics';
import i18n from '@/services/i18n';

export interface CaptureRefHandle {
  capture: () => Promise<string>;
}

/**
 * Capture the wisdom card view to a file in the app cache directory and
 * return a file:// URI guaranteed to be FileProvider-accessible to
 * expo-sharing. react-native-view-shot's `tmpfile` mode sometimes
 * returns paths under a directory that the system FileProvider can't
 * resolve to a content:// URI on Android, which causes the share sheet
 * to silently fail (apps appear but the image never attaches).
 */
export async function captureToFile(
  ref: RefObject<View | ViewShot | null>,
): Promise<string | null> {
  try {
    const tmp = await captureRef(ref as any, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    if (!tmp) return null;
    const fromUri = tmp.startsWith('file://') ? tmp : `file://${tmp}`;
    const targetUri = `${FileSystem.cacheDirectory}wisdom_${Date.now()}.png`;
    await FileSystem.copyAsync({ from: fromUri, to: targetUri });
    return targetUri;
  } catch (e) {
    if (__DEV__) console.warn('[share] capture failed', e);
    return null;
  }
}

export async function shareCard(uri: string | null, message?: string): Promise<void> {
  if (!uri) {
    Alert.alert(i18n.t('share.errorCaptureTitle'), i18n.t('share.errorCaptureBody'));
    return;
  }
  try {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert(i18n.t('share.errorUnavailableTitle'), i18n.t('share.errorUnavailableBody'));
      return;
    }
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: message ?? i18n.t('share.dialogTitle'),
      UTI: 'public.png',
    });
    void logEvent('share_card', { method: 'system' });
  } catch (e) {
    if (__DEV__) console.warn('[share] shareAsync failed', e);
    Alert.alert(i18n.t('share.errorFailedTitle'), i18n.t('share.errorFailedBody'));
  }
}
