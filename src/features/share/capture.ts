import * as Sharing from 'expo-sharing';
import { RefObject } from 'react';
import { Alert, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

import { logEvent } from '@/services/analytics';
import i18n from '@/services/i18n';

export interface CaptureRefHandle {
  capture: () => Promise<string>;
}

export async function captureToFile(
  ref: RefObject<View | ViewShot | null>,
): Promise<string | null> {
  try {
    const path = await captureRef(ref as any, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    if (!path) return null;
    return path.startsWith('file://') ? path : `file://${path}`;
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
