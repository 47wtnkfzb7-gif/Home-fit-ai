// Entraînements — générateur, bibliothèque, historique, favoris : tout réel.

import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Card, PrimaryButton, Screen, ScreenHeader, SectionHeader } from '@/components/ui';
import { EXERCISES } from '@/features/library/exercises';
import { FORMAT_LABELS, type WorkoutFormat } from '@/features/engine/engine';
import { useTheme } from '@/hooks/use-theme';
import { useProfile } from '@/features/profile/profile-context';
import { listWorkouts } from '@/services/workouts';

export default function EntrainementsScreen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const workouts = listWorkouts();

  return (
    <Screen>
      <ScreenHeader
        title="Entraînements"
        subtitle="Séances générées par un vrai moteur : ton matériel, ton niveau, ton historique."
      />

      <PrimaryButton label="Générer une séance" icon="sparkles" onPress={() => router.push('/generer')} />

      <SectionHeader title="Formats disponibles" />
      <Text style={[styles.formats, { color: theme.textSecondary }]}>
        {(Object.keys(FORMAT_LABELS) as WorkoutFormat[]).map((f) => FORMAT_LABELS[f]).join(' · ')}
      </Text>

      <SectionHeader title="Bibliothèque et suivi" />
      <Card
        icon="albums"
        title={`Bibliothèque d'exercices (${EXERCISES.length})`}
        subtitle="Consignes techniques, erreurs fréquentes, variantes plus faciles / plus difficiles, favoris, partage QR."
        onPress={() => router.push('/exercices')}
      />
      <Card
        icon="time"
        title="Historique des séances"
        subtitle={workouts.length ? `${workouts.length} séance(s) réellement enregistrée(s).` : 'Aucune séance terminée pour le moment.'}
        onPress={() => router.push('/historique')}
      />

      <SectionHeader title="Programme de la semaine" />
      <Card
        icon="calendar"
        title={profile ? `${profile.sessionsPerWeek ?? 3} séances · ${profile.sessionMinutes ?? 30} min` : 'Profil incomplet'}
        subtitle={
          profile
            ? `Objectifs : ${profile.goals.length} · Groupes favoris : ${profile.muscleGroups.length}. Le générateur respecte ta récupération et évite les répétitions.`
            : 'Termine le questionnaire pour des programmes hebdomadaires personnalisés.'
        }
        onPress={() => router.push('/generer')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  formats: { fontSize: 12, lineHeight: 18, marginTop: -8 },
});
