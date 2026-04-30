import * as Sharing from 'expo-sharing';
import { RefObject } from 'react';
import { Alert, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

import { logEvent } from '@/services/analytics';

export interface CaptureRefHandle {
  capture: () => Promise<string>;
}

export async function captureToFile(ref: RefObject<View | ViewShot | null>): Promise<string> {
  return captureRef(ref as any, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });
}

export async function shareCard(uri: string, message?: string): Promise<void> {
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
}
