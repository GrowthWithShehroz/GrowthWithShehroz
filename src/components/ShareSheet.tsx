import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { shareCard } from '@/features/share/capture';
import { shareToInstagramStories, shareToWhatsApp } from '@/features/share/targets';
import { useTheme } from '@/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  imageUri: string | null;
  caption: string;
}

export function ShareSheet({ visible, onClose, imageUri, caption }: Props) {
  const { t } = useTranslation();
  const { theme, spacing, radius, typography } = useTheme();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    if (!imageUri || busy) return;
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderRadius: radius.lg, padding: spacing.xl },
          ]}
          onPress={() => {}}
        >
          <Text style={[typography.h2, { color: theme.text, marginBottom: spacing.lg }]}>
            {t('share.title')}
          </Text>
          <Row
            label={t('share.whatsapp')}
            onPress={() => imageUri && run(() => shareToWhatsApp(imageUri, caption))}
          />
          <Row
            label={t('share.instagram')}
            onPress={() => imageUri && run(() => shareToInstagramStories(imageUri))}
          />
          <Row
            label={t('share.more')}
            onPress={() => imageUri && run(() => shareCard(imageUri, caption))}
          />
          <Pressable onPress={onClose} style={{ alignSelf: 'center', marginTop: spacing.lg }}>
            <Text style={[typography.h3, { color: theme.textSoft }]}>{t('common.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Row({ label, onPress }: { label: string; onPress: () => void }) {
  const { theme, spacing, radius, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          marginBottom: spacing.sm,
          backgroundColor: pressed ? theme.cardBgAlt : theme.cardBg,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: theme.border,
        },
      ]}
    >
      <Text style={[typography.h3, { color: theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { width: '100%' },
});
