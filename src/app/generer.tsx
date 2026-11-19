// Écran de génération de séance : format, durée, puis lancement.

import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { generateWorkout, FORMAT_LABELS, type WorkoutFormat } from '@/features/engine/engine';
import { useProfile } from '@/features/profile/profile-context';
import { listWorkouts } from '@/services/workouts';
import { useTheme } from '@/hooks/use-theme';
import { setPendingPlan } from '@/features/workout/session-store';

const FORMATS: WorkoutFormat[] = [
  'classic',
  'circuit',
  'fullbody',
  'upper',
  'lower',
  'noequipment',
  'short',
  'recovery',
];

export default function GenerateScreen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const params = useLocalSearchParams<{ format?: string }>();

  const [format, setFormat] = useState<WorkoutFormat>((params.format as WorkoutFormat) ?? 'classic');
  const [minutes, setMinutes] = useState<number>(profile?.sessionMinutes ?? 30);

  const recentSlugs = useMemo(
    () => listWorkouts().slice(0, 3).flatMap((w) => w.exercises.map((e) => e.slug)),
    [],
  );

  function generate() {
    if (!profile) return;
    const plan = generateWorkout({ profile, format, minutes, recentSlugs });
    setPendingPlan(plan);
    router.push('/seance');
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: theme.background }}>
      <SectionHeader title="Format" />
      <View style={styles.chipWrap}>
        {FORMATS.map((f) => (
          <PressableChip
            key={f}
            label={FORMAT_LABELS[f]}
            selected={format === f}
            onPress={() => setFormat(f)}
          />
        ))}
      </View>

      <SectionHeader title="Durée de séance" />
      <View style={styles.chipWrap}>
        {[15, 30, 45, 60].map((m) => (
          <PressableChip
            key={m}
            label={`${m} min`}
            selected={minutes === m}
            onPress={() => setMinutes(m)}
          />
        ))}
      </View>

      <Text style={[styles.note, { color: theme.textTertiary }]}>
        La séance sera construite à partir de ton profil (matériel, niveau, objectifs)
        et de tes séances récentes pour éviter de répéter les mêmes exercices :
        échauffement → principaux → complémentaires → retour au calme.
      </Text>

      <PrimaryButton label="Générer ma séance" icon="sparkles" onPress={generate} />
      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
}

function PressableChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}>
      <Text style={[styles.chipText, { color: selected ? theme.onPrimary : theme.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.md },
  chipWrap: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: Spacing.md,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  note: { fontSize: 13, lineHeight: 18, marginTop: 8 },
});
