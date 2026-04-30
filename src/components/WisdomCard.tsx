import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

import { useTheme } from '@/theme';
import type { WisdomCard as WisdomCardType } from '@/types';

interface Props {
  card: WisdomCardType;
  language?: 'en' | 'ur';
}

export const WisdomCard = forwardRef<ViewShot, Props>(function WisdomCard({ card, language = 'en' }, ref) {
  const { theme, spacing, radius, typography } = useTheme();
  const translation =
    language === 'ur' && card.translationUr ? card.translationUr : card.translationEn;
  return (
    <ViewShot ref={ref} options={{ format: 'png', quality: 1 }} style={styles.shotWrap}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.accent,
            borderRadius: radius.lg,
            padding: spacing.xl,
          },
        ]}
      >
        <View style={[styles.headerRule, { backgroundColor: theme.accent }]} />
        <Text style={[typography.label, { color: theme.accent, textAlign: 'center' }]}>
          DAILY WISDOM
        </Text>
        <Text
          style={[
            typography.arabic,
            {
              color: theme.text,
              textAlign: 'center',
              marginTop: spacing.lg,
              writingDirection: 'rtl',
            },
          ]}
        >
          {card.arabic}
        </Text>
        <Text
          style={[
            typography.body,
            {
              color: theme.textSoft,
              textAlign: 'center',
              marginTop: spacing.lg,
              fontStyle: 'italic',
            },
          ]}
        >
          “{translation}”
        </Text>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Text style={[typography.bodySmall, { color: theme.text, textAlign: 'center' }]}>
          {card.reflection}
        </Text>
        <Text
          style={[
            typography.label,
            { color: theme.accent, textAlign: 'center', marginTop: spacing.lg },
          ]}
        >
          {card.surah.toUpperCase()} · {card.surahNumber}:{card.ayah}
        </Text>
        <Text
          style={[typography.bodySmall, { color: theme.textSoft, textAlign: 'center', marginTop: spacing.xs }]}
        >
          {card.source}
        </Text>
        <View style={[styles.headerRule, { backgroundColor: theme.accent, marginTop: spacing.lg }]} />
      </View>
    </ViewShot>
  );
});

const styles = StyleSheet.create({
  shotWrap: { backgroundColor: 'transparent' },
  card: {
    borderWidth: 2,
    minHeight: 380,
  },
  headerRule: {
    height: 2,
    width: 80,
    alignSelf: 'center',
    marginBottom: 12,
    borderRadius: 1,
  },
  divider: {
    height: 1,
    marginVertical: 16,
    alignSelf: 'stretch',
  },
});
