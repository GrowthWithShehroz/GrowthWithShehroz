import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';

import { env } from '@/config/env';
import { logEvent } from '@/services/analytics';

import { shareCard } from './capture';

export type ShareTarget = 'whatsapp' | 'instagram' | 'system';

export async function shareToWhatsApp(uri: string, caption: string): Promise<void> {
  const url = `whatsapp://send?text=${encodeURIComponent(caption)}`;
  const can = await Linking.canOpenURL(url);
  if (!can) {
    return shareCard(uri, caption);
  }
  await shareCard(uri, caption);
  void logEvent('share_card', { method: 'whatsapp' });
}

export async function shareToInstagramStories(uri: string): Promise<void> {
  if (Platform.OS !== 'android') {
    return shareCard(uri, 'Share to Instagram');
  }
  if (!env.facebookAppId) {
    Alert.alert(
      'Instagram share not configured',
      'Set EXPO_PUBLIC_FACEBOOK_APP_ID in your environment to enable Stories share.',
    );
    return shareCard(uri);
  }
  try {
    await IntentLauncher.startActivityAsync('com.instagram.share.ADD_TO_STORY', {
      data: uri,
      type: 'image/png',
      flags: 1,
      extra: {
        'com.facebook.platform.extra.APPLICATION_ID': env.facebookAppId,
        interactive_asset_uri: uri,
      },
    });
    void logEvent('share_card', { method: 'instagram_stories' });
  } catch {
    await shareCard(uri, 'Share to Instagram');
  }
}

export async function shareToSystem(uri: string, caption: string): Promise<void> {
  await shareCard(uri, caption);
}
