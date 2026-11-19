// Historique des séances réellement enregistrées.

import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { listWorkouts, type WorkoutRecord } from '@/services/workouts';

export default function HistoryScreen() {
  const theme = useTheme();
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      setWorkouts(listWorkouts());
    }, []),
  );

  if (!workouts.length) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }} style={{ backgroundColor: theme.background }}>
        <EmptyState
          icon="time"
          title="Aucune séance enregistrée"
          message="Termine ta première séance : elle apparaîtra ici avec sa durée, ses exercices et ses séries."
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: theme.background }}>
      {workouts.map((w) => {
        const date = new Date(w.finishedAt).toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long',
        });
        const minutes = Math.round(w.durationSeconds / 60);
        return (
          <View key={w.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ color: theme.text, fontWeight: '800', fontSize: 16 }}>{w.label}</Text>
            <Text style={{ color: theme.textTertiary, fontSize: 12, marginTop: 2 }}>
              {date} · {minutes} min · +{w.xpEarned} XP
            </Text>
            <View style={{ marginTop: 8, gap: 2 }}>
              {w.exercises.map((e) => (
                <Text key={e.slug + e.block} style={{ color: theme.textSecondary, fontSize: 13 }}>
                  • {e.name} — {e.sets.filter((s) => s.done).length} série(s)
                </Text>
              ))}
            </View>
          </View>
        );
      })}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
});
