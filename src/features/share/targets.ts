import * as Linking from 'expo-linking';

import { logEvent } from '@/services/analytics';

import { shareCard } from './capture';

export type ShareTarget = 'whatsapp' | 'instagram' | 'system';

export async function shareToWhatsApp(uri: string, caption: string): Promise<void> {
  const url = `whatsapp://send?text=${encodeURIComponent(caption)}`;
  await Linking.canOpenURL(url).catch(() => false);
  await shareCard(uri, caption);
  void logEvent('share_card', { method: 'whatsapp' });
}

export async function shareToInstagramStories(uri: string): Promise<void> {
  // No Facebook App ID is configured for this build (the app is fully
  // free with no monetization-side integrations). Fall back to the
  // system share sheet — Instagram still appears there as a target
  // and the image attaches normally.
  await shareCard(uri, 'Share to Instagram');
  void logEvent('share_card', { method: 'instagram_stories' });
}

export async function shareToSystem(uri: string, caption: string): Promise<void> {
  await shareCard(uri, caption);
}
