// Bibliothèque d'exercices : recherche, filtres, favoris.

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MUSCLE_LABELS } from '@/features/profile/labels';
import type { MuscleGroup } from '@/features/profile/types';
import { EXERCISES, type Exercise } from '@/features/library/exercises';
import { useTheme } from '@/hooks/use-theme';
import { getDb } from '@/services/db';

const CATEGORIES: (MuscleGroup | 'all' | 'favorites')[] = [
  'all', 'favorites', 'chest', 'back', 'shoulders', 'arms', 'legs', 'abs', 'glutes', 'fullbody',
];

export default function LibraryScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ category?: string; q?: string }>();
  const [query, setQuery] = useState<string>(params.q ?? '');
  const [category, setCategory] = useState<string>(params.category ?? 'all');
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());

  const filtered = EXERCISES.filter((ex) => {
    if (category === 'favorites' && !favorites.includes(ex.slug)) return false;
    if (category !== 'all' && category !== 'favorites' && ex.category !== category) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.muscles.some((m) => m.toLowerCase().includes(q))
      );
    }
    return true;
  });

  function toggleFavorite(slug: string) {
    const db = getDb();
    const exists = db.getFirstSync('SELECT slug FROM favorites WHERE slug = ?', [slug]);
    if (exists) {
      db.runSync('DELETE FROM favorites WHERE slug = ?', [slug]);
      setFavorites((prev) => prev.filter((s) => s !== slug));
    } else {
      db.runSync('INSERT OR REPLACE INTO favorites (slug, created_at) VALUES (?, ?)', [
        slug,
        new Date().toISOString(),
      ]);
      setFavorites((prev) => [...prev, slug]);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.searchBar}>
        <TextInput
          accessibilityLabel="Rechercher un exercice"
          placeholder="Rechercher (nom, muscle…)"
          placeholderTextColor={theme.textTertiary}
          value={query}
          onChangeText={setQuery}
          style={[
            styles.search,
            { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
          ]}
        />
        <Ionicons name="search" size={18} color={theme.textTertiary} />
      </View>

      <View style={styles.chipRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {CATEGORIES.map((cat) => (
            <RNPressable
              key={cat}
              accessibilityRole="button"
              onPress={() => setCategory(cat)}
              style={[
                styles.chip,
                {
                  backgroundColor: category === cat ? theme.primary : theme.surface,
                  borderColor: category === cat ? theme.primary : theme.border,
                },
              ]}>
              <Text style={{ color: category === cat ? theme.onPrimary : theme.text, fontSize: 12, fontWeight: '600' }}>
                {cat === 'all' ? 'Tout' : cat === 'favorites' ? 'Favoris ★' : MUSCLE_LABELS[cat as MuscleGroup]}
              </Text>
            </RNPressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.length === 0 && (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
            Aucun exercice trouvé. Essaie un autre mot-clé.
          </Text>
        )}
        {filtered.map((ex) => (
          <ExerciseRow key={ex.slug} exercise={ex} isFavorite={favorites.includes(ex.slug)} onToggleFavorite={() => toggleFavorite(ex.slug)} theme={theme} />
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function loadFavorites(): string[] {
  return getDb().getAllSync<{ slug: string }>('SELECT slug FROM favorites').map((r) => r.slug);
}

function ExerciseRow({
  exercise,
  isFavorite,
  onToggleFavorite,
  theme,
}: {
  exercise: Exercise;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <RNPressable accessibilityRole="button" style={{ flex: 1 }} onPress={() => router.push(`/exercices/${exercise.slug}`)}>
        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>{exercise.name}</Text>
        <Text style={{ color: theme.textTertiary, fontSize: 12, marginTop: 2 }}>
          {exercise.muscles.join(' · ')} — difficulté {exercise.difficulty}/5
        </Text>
      </RNPressable>
      <RNPressable accessibilityRole="button" onPress={onToggleFavorite} hitSlop={12}>
        <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={22} color={isFavorite ? theme.primary : theme.textTertiary} />
      </RNPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  search: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  chipRow: { paddingVertical: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  list: { padding: 16, gap: 8 },
  row: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
