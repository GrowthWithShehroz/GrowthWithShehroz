import * as Sharing from 'expo-sharing';
import { RefObject } from 'react';
import { Alert, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

import { logEvent } from '@/services/analytics';

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
    Alert.alert('Could not capture wisdom card', 'Please try again in a moment.');
    return;
  }
  try {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      return;
    }
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: message ?? 'Share daily wisdom',
      UTI: 'public.png',
    });
    void logEvent('share_card', { method: 'system' });
  } catch (e) {
    if (__DEV__) console.warn('[share] shareAsync failed', e);
    Alert.alert(
      'Share failed',
      'Could not open the share sheet. Try again, or use a different app.',
    );
  }
}
