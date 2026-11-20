// Statistiques réelles — calculées uniquement depuis la base locale.

import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, SectionHeader } from '@/components/ui';
import { levelFromXp, totalXp } from '@/features/gamification/xp';
import { MUSCLE_LABELS } from '@/features/profile/labels';
import { useTheme } from '@/hooks/use-theme';
import { computeStats, listWorkouts, type WorkoutRecord } from '@/services/workouts';

export default function StatsScreen() {
  const theme = useTheme();
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [week, setWeek] = useState(computeStats().week);

  useFocusEffect(
    useCallback(() => {
      const stats = computeStats();
      setWorkouts(stats.total);
      setStreak(stats.streakDays);
      setWeek(stats.week);
    }, []),
  );

  const level = useMemo(() => levelFromXp(totalXp()), [workouts.length]);
  const months = useMemo(() => buildMonthGrid(workouts), [workouts]);

  const muscleBars = Object.entries(week.musclesCounted).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(1, ...muscleBars.map(([, v]) => v));

  return (
    <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: theme.background }}>
      <SectionHeader title="Cette semaine" />
      <View style={styles.tileRow}>
        <Tile value={week.workouts} label="séances" theme={theme} />
        <Tile value={streak} label="jours de série" theme={theme} />
        <Tile value={week.totalMinutes} label="minutes" theme={theme} />
      </View>

      <SectionHeader title="Niveau et XP" />
      <Card title={`Niveau ${level.level}`} subtitle={`${level.total} XP au total`}>
        <View style={[styles.bar, { backgroundColor: theme.surfaceMuted }]}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.round(level.levelProgress * 100)}%` as `${number}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
        <Text style={{ color: theme.textTertiary, fontSize: 11 }}>
          {Math.round(level.nextLevelThreshold * (1 - level.levelProgress))} XP avant le niveau {level.level + 1}
        </Text>
      </Card>

      <SectionHeader title="Groupes musculaires (semaine)" />
      {muscleBars.length === 0 ? (
        <Text style={{ color: theme.textTertiary, fontSize: 13 }}>
          Aucune donnée cette semaine — termine une séance pour voir tes statistiques.
        </Text>
      ) : (
        <View style={styles.barsBox}>
          {muscleBars.map(([muscle, count]) => (
            <View key={muscle} style={styles.barRow}>
              <Text style={{ color: theme.text, width: 92, fontSize: 12, fontWeight: '600' }}>
                {MUSCLE_LABELS[muscle as keyof typeof MUSCLE_LABELS] ?? muscle}
              </Text>
              <View style={[styles.bar, { flex: 1, backgroundColor: theme.surfaceMuted }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.round((count / maxCount) * 100)}%` as `${number}%`, backgroundColor: theme.success },
                  ]}
                />
              </View>
              <Text style={{ color: theme.textTertiary, fontSize: 11, width: 20, textAlign: 'right' }}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      <SectionHeader title="Calendrier (30 derniers jours)" />
      <View style={styles.calendar}>
        {months.flat().map((day, i) => (
          <View
            key={i}
            style={[
              styles.dayCell,
              { backgroundColor: day ? theme.primary : theme.surface, borderColor: theme.border },
            ]}
          />
        ))}
      </View>
      <Text style={{ color: theme.textTertiary, fontSize: 11 }}>
        Les cases oranges correspondent aux jours avec au moins une séance enregistrée.
      </Text>
    </ScrollView>
  );
}

function Tile({ value, label, theme }: { value: number; label: string; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.tile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

function buildMonthGrid(workouts: WorkoutRecord[]): boolean[][] {
  const days30 = new Set<string>();
  for (const w of workouts) {
    const d = new Date(w.finishedAt);
    days30.add(d.toISOString().slice(0, 10));
  }
  const weeks: boolean[][] = [];
  let current: boolean[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    current.push(days30.has(d.toISOString().slice(0, 10)));
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length) weeks.push(current);
  return weeks;
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8 },
  tileRow: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  bar: { height: 10, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  barsBox: { gap: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayCell: {
    width: 40,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
  },
});
