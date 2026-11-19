// Bilan de fin de séance — construit uniquement à partir des données réelles.

import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, SectionHeader } from '@/components/ui';
import { levelFromXp, totalXp } from '@/features/gamification/xp';
import { MUSCLE_LABELS } from '@/features/profile/labels';
import { useTheme } from '@/hooks/use-theme';
import { getWorkout } from '@/services/workouts';

export default function SummaryScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const workout = useMemo(() => (params.id ? getWorkout(params.id) : undefined), [params.id]);
  const totals = useMemo(() => levelFromXp(totalXp()), [workout?.id]);

  if (!workout) {
    return (
      <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: theme.background }}>
        <Text style={{ color: theme.textSecondary }}>
          Aucune séance à afficher pour cet identifiant.
        </Text>
      </ScrollView>
    );
  }

  const done = workout.exercises.filter((e) => e.sets.some((s) => s.done));
  const setsDone = done.reduce((s, e) => s + e.sets.filter((x) => x.done).length, 0);
  const muscles = Array.from(
    new Set(done.filter((e) => e.block !== 'warmup' && e.block !== 'cooldown').map((e) => e.category)),
  );
  const minutes = Math.round(workout.durationSeconds / 60);

  return (
    <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: theme.background }}>
      <Card
        icon="checkmark-circle"
        iconColorName="success"
        title="Séance terminée 🎉"
        subtitle={`${done.length} exercices · ${setsDone} séries · ${minutes} min`}>
        <Text style={{ color: theme.success, fontWeight: '800', fontSize: 18 }}>
          +{workout.xpEarned} XP
        </Text>
        <Text style={{ color: theme.textTertiary, fontSize: 12 }}>
          Niveau {totals.level} · {Math.round(totals.levelProgress * 100)} % vers le niveau suivant
        </Text>
      </Card>

      <SectionHeader title="Exercices effectués" />
      <Card>
        {done.map((e) => (
          <View key={e.slug + e.block} style={styles.exRow}>
            <Text style={{ color: theme.text, fontWeight: '600', flex: 1 }}>{e.name}</Text>
            <Text style={{ color: theme.textTertiary, fontSize: 12 }}>
              {e.sets.filter((s) => s.done).length}/{e.sets.length} séries
            </Text>
          </View>
        ))}
      </Card>

      <SectionHeader title="Points forts" />
      <Card
        title="Volume de travail constaté"
        subtitle={
          muscles.length
            ? `Groupes musculaires travaillés : ${muscles
                .map((m) => MUSCLE_LABELS[m as keyof typeof MUSCLE_LABELS] ?? m)
                .join(', ')}`
            : 'Échauffement et mobilité — excellent moyen de t’activer en douceur.'
        }
      />

      <SectionHeader title="Pour la prochaine séance" />
      <Card
        title="Conseil du jour"
        subtitle={
          minutes >= 30
            ? 'Bonne durée. Prévois demain une séance plus légère ou un jour de repos pour laisser tes muscles récupérer.'
            : 'Séance efficace et courte. Pense à bien t’hydrater et vise ta prochaine séance d’ici 48 h.'
        }
      />

      <PrimaryButton label="Retour à l’accueil" icon="home" onPress={() => router.replace('/(tabs)')} />
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  exRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
});
