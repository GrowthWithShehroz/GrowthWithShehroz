import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { useWisdomArchive } from '@/features/wisdom/api';
import { toggleFavorite, useIsFavorite } from '@/features/wisdom/favorites';
import { useTheme } from '@/theme';
import type { WisdomCard as WisdomCardType } from '@/types';

export default function ArchiveScreen() {
  const { t } = useTranslation();
  const { theme, spacing, radius, typography } = useTheme();
  const { data, isLoading, isError, refetch } = useWisdomArchive(60);
  const [query, setQuery] = useState('');

  const filtered = useMemo<WisdomCardType[]>(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c.surah.toLowerCase().includes(q) ||
        c.translationEn.toLowerCase().includes(q) ||
        c.reflection.toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <View style={{ padding: spacing.lg }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('archive.search')}
          placeholderTextColor={theme.textSoft}
          style={[
            styles.search,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.text,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            },
          ]}
        />
      </View>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={t('archive.couldNotLoad')} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t('archive.noMatches')} />
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
          data={filtered}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <ArchiveRow card={item} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

function ArchiveRow({ card }: { card: WisdomCardType }) {
  const { theme, spacing, radius, typography } = useTheme();
  const isFav = useIsFavorite(card.id);
  return (
    <View
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: radius.md,
        padding: spacing.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.label, { color: theme.accent }]}>
            {card.surah.toUpperCase()} · {card.surahNumber}:{card.ayah}
          </Text>
          <Text
            style={[typography.body, { color: theme.text, marginTop: spacing.xs, fontStyle: 'italic' }]}
          >
            "{card.translationEn}"
          </Text>
          <Text
            style={[typography.bodySmall, { color: theme.textSoft, marginTop: spacing.sm }]}
          >
            {card.reflection}
          </Text>
        </View>
        <Pressable
          onPress={() => toggleFavorite(card.id)}
          hitSlop={8}
          style={{ marginLeft: spacing.md }}
        >
          <Text style={{ fontSize: 22, color: isFav ? theme.accent : theme.border }}>★</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  search: { borderWidth: 1 },
});
