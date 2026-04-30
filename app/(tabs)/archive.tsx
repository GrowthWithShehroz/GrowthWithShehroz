import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/AdBanner';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { PaywallSheet } from '@/components/PaywallSheet';
import { useWisdomArchive } from '@/features/wisdom/api';
import { toggleFavorite, useIsFavorite } from '@/features/wisdom/favorites';
import { useAppStore } from '@/store/app';
import { useTheme } from '@/theme';
import type { WisdomCard as WisdomCardType } from '@/types';

export default function ArchiveScreen() {
  const { theme, spacing, radius, typography } = useTheme();
  const premium = useAppStore((s) => s.premium);
  const { data, isLoading, isError, refetch } = useWisdomArchive(60);
  const [query, setQuery] = useState('');
  const [paywallVisible, setPaywallVisible] = useState(false);

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

  if (!premium) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]}>
        <View style={[styles.locked, { padding: spacing.xl }]}>
          <Text style={[typography.h1, { color: theme.text, textAlign: 'center' }]}>
            Wisdom Archive
          </Text>
          <Text
            style={[typography.body, { color: theme.textSoft, textAlign: 'center', marginTop: spacing.md }]}
          >
            Browse and favorite past wisdom cards. Unlock with Premium.
          </Text>
          <Pressable
            onPress={() => setPaywallVisible(true)}
            style={({ pressed }) => [
              {
                marginTop: spacing.xl,
                backgroundColor: theme.primary,
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.xl,
                borderRadius: radius.md,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[typography.h3, { color: '#fff' }]}>Unlock Premium</Text>
          </Pressable>
        </View>
        <PaywallSheet visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <View style={{ padding: spacing.lg }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by Surah, translation, reflection"
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
        <ErrorState message="Could not load archive." onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matches" />
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
          data={filtered}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => <ArchiveRow card={item} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
      <AdBanner />
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
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  search: { borderWidth: 1 },
});
