import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { isIapAvailable, purchasePremium, restorePurchases } from '@/features/iap/client';
import { useTheme } from '@/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function PaywallSheet({ visible, onClose }: Props) {
  const { theme, spacing, radius, typography } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setBusy(true);
    setError(null);
    try {
      const ok = await purchasePremium();
      if (ok) onClose();
      else if (!isIapAvailable())
        setError('In-app purchases are not available in this build. Use a development build with RevenueCat configured.');
    } catch {
      setError('Purchase failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    setError(null);
    try {
      const ok = await restorePurchases();
      if (ok) onClose();
      else setError('No active subscription to restore.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl },
          ]}
        >
          <Text style={[typography.h1, { color: theme.text, textAlign: 'center' }]}>
            Unlock Premium
          </Text>
          <Text
            style={[typography.body, { color: theme.textSoft, textAlign: 'center', marginTop: spacing.sm }]}
          >
            Support development. Get an ad-free experience.
          </Text>

          <View style={{ marginTop: spacing.xl }}>
            <Bullet text="Remove all ads" />
            <Bullet text="Unlock the wisdom archive" />
            <Bullet text="Custom Azan notification sounds" />
          </View>

          {error ? (
            <Text style={[typography.bodySmall, { color: theme.error, textAlign: 'center', marginTop: spacing.md }]}>
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={handlePurchase}
            disabled={busy}
            style={({ pressed }) => [
              {
                marginTop: spacing.xl,
                backgroundColor: theme.primary,
                borderRadius: radius.md,
                paddingVertical: spacing.lg,
                opacity: busy || pressed ? 0.75 : 1,
              },
            ]}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[typography.h3, { color: '#fff', textAlign: 'center' }]}>
                Subscribe — $0.99 / month
              </Text>
            )}
          </Pressable>

          <Pressable onPress={handleRestore} disabled={busy} style={{ marginTop: spacing.md }}>
            <Text style={[typography.body, { color: theme.textSoft, textAlign: 'center' }]}>
              Restore purchases
            </Text>
          </Pressable>

          <Pressable onPress={onClose} style={{ marginTop: spacing.md }}>
            <Text style={[typography.body, { color: theme.textSoft, textAlign: 'center' }]}>
              Not now
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Bullet({ text }: { text: string }) {
  const { theme, spacing, typography } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
      <Text style={[typography.h2, { color: theme.accent, marginRight: spacing.sm }]}>✦</Text>
      <Text style={[typography.body, { color: theme.text, flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { width: '100%' },
});
