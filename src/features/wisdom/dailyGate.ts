import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';

import { todayDate } from './api';

export interface GateResult {
  canView: boolean;
  reason: 'premium' | 'first-of-day' | 'limit-reached';
  nextResetAt?: number;
}

export function useDailyGate(): GateResult & { markViewed: () => void } {
  const premium = useAppStore((s) => s.premium);
  const lastViewed = useUserStore((s) => s.lastViewedDate);
  const setLastViewed = useUserStore((s) => s.setLastViewedDate);

  const today = todayDate();
  if (premium) {
    return { canView: true, reason: 'premium', markViewed: () => setLastViewed(today) };
  }

  if (lastViewed === today) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return {
      canView: false,
      reason: 'limit-reached',
      nextResetAt: tomorrow.getTime(),
      markViewed: () => setLastViewed(today),
    };
  }

  return {
    canView: true,
    reason: 'first-of-day',
    markViewed: () => setLastViewed(today),
  };
}
