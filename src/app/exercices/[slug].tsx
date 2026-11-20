// Fiche exercice : consignes, erreurs, variantes, favoris, QR interne.

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton } from '@/components/ui';
import { DIFFICULTY_LABELS, getExercise } from '@/features/library/exercises';
import { useTheme } from '@/hooks/use-theme';
import { getDb } from '@/services/db';

export default function ExerciseDetailScreen() {
  const theme = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const exercise = slug ? getExercise(slug) : undefined;
  const [favorite, setFavorite] = useState(() => {
    if (!exercise) return false;
    const fav = getDb().getFirstSync('SELECT slug FROM favorites WHERE slug = ?', [exercise.slug]);
    return Boolean(fav);
  });

  if (!exercise) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }} style={{ backgroundColor: theme.background }}>
        <Text style={{ color: theme.textSecondary }}>Exercice introuvable.</Text>
      </ScrollView>
    );
  }

  const current = exercise;

  function toggleFavorite() {
    const db = getDb();
    const exists = db.getFirstSync('SELECT slug FROM favorites WHERE slug = ?', [current.slug]);
    if (exists) {
      db.runSync('DELETE FROM favorites WHERE slug = ?', [current.slug]);
      setFavorite(false);
    } else {
      db.runSync('INSERT OR REPLACE INTO favorites (slug, created_at) VALUES (?, ?)', [
        current.slug,
        new Date().toISOString(),
      ]);
      setFavorite(true);
    }
  }

  function shareQrTarget() {
    const internal = `homefitai://exercise/${current.slug}`;
    Share.share({ message: `HOMEFIT AI — ${current.name}\n${internal}` });
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: theme.background }}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: theme.text }]}>{exercise.name}</Text>
        <Pressable accessibilityRole="button" onPress={toggleFavorite} hitSlop={12}>
          <Ionicons name={favorite ? 'star' : 'star-outline'} size={26} color={favorite ? theme.primary : theme.textTertiary} />
        </Pressable>
      </View>

      <View style={[styles.metaRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={{ color: theme.text, fontWeight: '700' }}>
          Difficulté : {DIFFICULTY_LABELS[exercise.difficulty]} ({exercise.difficulty}/5)
        </Text>
        <Text style={{ color: theme.textTertiary, fontSize: 13 }}>Muscles : {exercise.muscles.join(', ')}</Text>
        <Text style={{ color: theme.textTertiary, fontSize: 13 }}>
          Matériel : {exercise.equipment.join(', ')}
        </Text>
      </View>

      <Card title="Consignes techniques">
        {exercise.cues.map((cue) => (
          <Text key={cue} style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20, marginVertical: 2 }}>• {cue}</Text>
        ))}
      </Card>

      <Card title="Erreurs fréquentes">
        {exercise.mistakes.map((m) => (
          <Text key={m} style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20, marginVertical: 2 }}>• {m}</Text>
        ))}
      </Card>

      {exercise.easier && (
        <Card
          title="Variante plus facile"
          subtitle={getExercise(exercise.easier)?.name ?? exercise.easier}
          onPress={() => router.push(`/exercices/${exercise.easier}`)}
        />
      )}
      {exercise.harder && (
        <Card
          title="Variante plus difficile"
          subtitle={getExercise(exercise.harder)?.name ?? exercise.harder}
          onPress={() => router.push(`/exercices/${exercise.harder}`)}
        />
      )}

      <View style={styles.actions}>
        <PrimaryButton label="Partager le QR HOMEFIT" icon="qr-code-outline" variant="secondary" onPress={shareQrTarget} />
        {exercise.type !== 'mobility' && exercise.type !== 'warmup' && (
          <PrimaryButton label="Analyser ma technique (vidéo)" icon="videocam" onPress={() => router.push({ pathname: '/analyse-video', params: { slug: exercise.slug } })} />
        )}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '800', flex: 1 },
  metaRow: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
