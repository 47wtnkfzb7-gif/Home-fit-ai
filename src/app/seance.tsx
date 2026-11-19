// Dérouleur de séance — chronologie, minuteur de repos, remplacement d'exercice.

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EXERCISES, type Exercise } from '@/features/library/exercises';
import { useProfile } from '@/features/profile/profile-context';
import { consumePendingPlan } from '@/features/workout/session-store';
import { saveWorkoutAndXp } from '@/features/workout/workout-lifecycle';
import type { PlanItem, WorkoutPlan } from '@/features/engine/engine';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const BLOCK_LABELS: Record<PlanItem['block'], string> = {
  warmup: 'Échauffement',
  main: 'Exercices principaux',
  accessory: 'Complémentaires',
  cooldown: 'Retour au calme',
};

export default function SessionScreen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const [plan, setPlan] = useState<WorkoutPlan | null>(() => consumePendingPlan());

  const [startedAt] = useState<string>(new Date().toISOString());
  const [itemIndex, setItemIndex] = useState(0);
  const [doneSets, setDoneSets] = useState<Record<string, number>>({});
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!plan) {
      router.replace('/(tabs)');
      return;
    }
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const items = plan?.items ?? [];
  const item = items[itemIndex];

  useEffect(() => {
    if (restRemaining === null || restRemaining <= 0) return;
    const t = setTimeout(() => setRestRemaining((r) => (r === null || r <= 1 ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [restRemaining]);

  if (!plan || !item) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: theme.textSecondary }}>Séance introuvable.</Text>
      </SafeAreaView>
    );
  }

  function completeSet() {
    const done = (doneSets[item.slug] ?? 0) + 1;
    const nextSets = { ...doneSets, [item.slug]: done };
    if (done >= item.sets) {
      setDoneSets(nextSets);
      goToNext();
    } else {
      setDoneSets(nextSets);
      setRestRemaining(item.restSeconds);
    }
  }

  function skipItem() {
    const nextSets = { ...doneSets, [item.slug]: item.sets };
    setDoneSets(nextSets);
    goToNext();
  }

  function goToNext() {
    setRestRemaining(null);
    if (itemIndex + 1 >= items.length) {
      finish();
    } else {
      setItemIndex(itemIndex + 1);
    }
  }

  function finish() {
    if (!plan || !profile) return;
    setRestRemaining(null);
    const workout = saveWorkoutAndXp({
      profile,
      plan,
      doneSets,
      startedAt,
      durationSeconds: elapsed,
    });
    router.replace({ pathname: '/bilan', params: { id: workout.id } });
  }

  function replaceCurrent(newSlug: string) {
    if (!plan) return;
    const ex = EXERCISES.find((e) => e.slug === newSlug);
    if (!ex) return;
    const items2 = [...plan.items];
    items2[itemIndex] = {
      ...items2[itemIndex],
      slug: ex.slug,
      name: ex.name,
      category: ex.category,
      type: ex.type,
    };
    setPlan({ ...plan, items: items2 });
  }

  function alternatives(): Exercise[] {
    return EXERCISES.filter(
      (e) =>
        e.slug !== item.slug &&
        (e.category === item.category || e.type === item.type) &&
        e.equipment.some((eq) => eq === 'none' || profile?.equipment.includes(eq)),
    ).slice(0, 6);
  }

  const isResting = restRemaining !== null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.sessionLabel, { color: theme.textSecondary }]}>
          {plan.label} · {Math.floor(elapsed / 60)} min écoulées
        </Text>
        <Pressable accessibilityRole="button" onPress={finish}>
          <Text style={{ color: theme.primary, fontWeight: '700' }}>Terminer</Text>
        </Pressable>
      </View>

      {isResting && (
        <View style={[styles.restBanner, { backgroundColor: theme.primaryMuted }]}>
          <Ionicons name="timer" size={22} color={theme.primary} />
          <Text style={[styles.restText, { color: theme.primary }]}>Repos · {restRemaining} s</Text>
          <Pressable accessibilityRole="button" onPress={() => setRestRemaining(null)}>
            <Text style={[styles.restSkip, { color: theme.primary }]}>Passer</Text>
          </Pressable>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.block, { color: theme.textTertiary }]}>
          {BLOCK_LABELS[item.block]} · {itemIndex + 1} / {items.length}
        </Text>
        <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>

        <Text style={[styles.approach, { color: theme.textSecondary }]}>
          {item.timeSeconds
            ? `${item.sets} × ${item.timeSeconds} s`
            : `Série ${(doneSets[item.slug] ?? 0) + 1} / ${item.sets} — ${item.reps}`}
        </Text>

        <SetDots count={item.sets} done={doneSets[item.slug] ?? 0} theme={theme} />

        {!isResting && (
          <Pressable
            accessibilityRole="button"
            onPress={completeSet}
            style={[styles.primaryAction, { backgroundColor: theme.primary }]}>
            <Text style={[styles.primaryActionLabel, { color: theme.onPrimary }]}>
              Série terminée
            </Text>
          </Pressable>
        )}

        <View style={styles.rowActions}>
          <Pressable accessibilityRole="button" onPress={skipItem} style={[styles.secondary, { borderColor: theme.border }]}>
            <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Passer</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setRestRemaining((r) => (r === null ? 60 : r))} style={[styles.secondary, { borderColor: theme.border }]}>
            <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Repos +1 min</Text>
          </Pressable>
        </View>

        <View style={styles.replaceBox}>
          <Text style={[styles.replaceTitle, { color: theme.textSecondary }]}>Remplacer par :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.replaceRow}>
            {alternatives().map((ex) => (
              <Pressable
                key={ex.slug}
                accessibilityRole="button"
                onPress={() => replaceCurrent(ex.slug)}
                style={[styles.replaceChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>{ex.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SetDots({ count, done, theme }: { count: number; done: number; theme: ReturnType<typeof useTheme> }) {
  const color = theme.primary;
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i < done ? color : theme.surfaceMuted },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  sessionLabel: { fontSize: 12, fontWeight: '600' },
  restBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 10,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: 14,
    borderRadius: 16,
  },
  restText: { fontWeight: '800', fontSize: 20, flex: 1 },
  restSkip: { fontWeight: '700', fontSize: 14 },
  content: { padding: Spacing.lg, paddingBottom: 48, gap: Spacing.md },
  block: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: 1 },
  itemName: { fontSize: 26, fontWeight: '800', lineHeight: 32 },
  approach: { fontSize: 15 },
  dotsRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginTop: 6,
  },
  dot: { width: 34, height: 8, borderRadius: 4 },
  primaryAction: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 8,
  },
  primaryActionLabel: { fontSize: 16, fontWeight: '800' },
  rowActions: {
    flexDirection: 'row' as const,
    gap: Spacing.md,
  },
  secondary: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center' as const,
  },
  replaceBox: { marginTop: Spacing.lg },
  replaceTitle: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  replaceRow: { gap: 8, paddingVertical: 4 },
  replaceChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
