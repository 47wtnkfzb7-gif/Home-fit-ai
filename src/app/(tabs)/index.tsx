// Accueil — résumé réel : dernière séance, chiffres de la semaine, accès rapides.

import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, Screen, ScreenHeader, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/features/profile/profile-context';
import { useTheme } from '@/hooks/use-theme';
import { computeStats } from '@/services/workouts';
import { listJournalDay, todayIso } from '@/services/journal';
import { mealTotals } from '@/features/nutrition/foods';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

const QUICK_ACTIONS: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
  { label: 'Générer une séance', icon: 'barbell', route: '/generer' },
  { label: 'Analyse vidéo', icon: 'videocam', route: '/analyse-video' },
  { label: 'Scanner repas', icon: 'camera', route: '/scanner-repas' },
  { label: 'Scanner QR', icon: 'qr-code', route: '/qr' },
  { label: 'Coach IA', icon: 'chatbubbles', route: '/coach-chat' },
  { label: 'Ma progression', icon: 'trending-up', route: '/stats' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const { profile } = useProfile();
  const [week, setWeek] = useState(() => computeStats().week);
  const [streak, setStreak] = useState(() => computeStats().streakDays);
  const [lastWorkout, setLastWorkout] = useState<string | null>(null);
  const [todayMealTotals, setTodayMealTotals] = useState(() =>
    mealTotals(listJournalDay(todayIso())),
  );

  useFocusEffect(
    useCallback(() => {
      const stats = computeStats();
      setWeek(stats.week);
      setStreak(stats.streakDays);
      const last = stats.total[0];
      setLastWorkout(last ? `${last.label} · ${Math.round(last.durationSeconds / 60)} min` : null);
      setTodayMealTotals(mealTotals(listJournalDay(todayIso())));
    }, []),
  );

  return (
    <Screen>
      <ScreenHeader title={getGreeting()} subtitle="Ton corps, ton rythme, ton évolution." />

      <SectionHeader title="Prochaine séance" />
      <Card
        icon="fitness"
        title={profile ? `Séance personnalisée · ${profile.sessionMinutes ?? 30} min` : 'Configure ton profil'}
        subtitle={
          lastWorkout
            ? `Dernière séance : ${lastWorkout}. Le générateur tiendra compte de tes exercices récents pour varier.`
            : 'Réponds au questionnaire pour des séances adaptées à ton niveau, ton matériel et ton temps.'
        }>
        <PrimaryButton label="Générer ma séance" icon="sparkles" onPress={() => router.push('/generer')} />
      </Card>

      <SectionHeader title="Cette semaine" />
      <View style={styles.statsRow}>
        <View style={[styles.statTile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
          <Text style={[styles.statValue, { color: theme.text }]}>{week.workouts}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>séances</Text>
        </View>
        <View style={[styles.statTile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="flame" size={20} color={theme.primary} />
          <Text style={[styles.statValue, { color: theme.text }]}>{streak}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>jours de série</Text>
        </View>
        <View style={[styles.statTile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="time" size={20} color={theme.primary} />
          <Text style={[styles.statValue, { color: theme.text }]}>{week.totalMinutes}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>minutes</Text>
        </View>
      </View>
      <Text style={[styles.statsNote, { color: theme.textTertiary }]}>
        Calculé uniquement à partir de tes séances réellement terminées.
      </Text>

      <SectionHeader title="Nutrition du jour" />
      <Card
        icon="nutrition"
        title="Journal alimentaire"
        subtitle={`${todayMealTotals.protein.toFixed(1)} g de protéines estimées aujourd'hui — aucune cible imposée, l'estimation est indicative.`}>
        <PrimaryButton label="Ouvrir le journal" icon="journal" variant="secondary" onPress={() => router.push('/journal')} />
      </Card>

      <SectionHeader
        title="Accès rapide"
        action="Tout voir"
        onActionPress={() => router.push('/entrainements')}
      />
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => router.push(action.route as never)}
            style={styles.gridItem}>
            <View style={[styles.gridIcon, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name={action.icon} size={22} color={theme.primary} />
            </View>
            <Text style={[styles.gridLabel, { color: theme.text }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row' as const, gap: Spacing.md },
  statTile: { flex: 1, borderRadius: 16, borderWidth: 1, paddingVertical: 14, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  statsNote: { fontSize: 11 },
  grid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: Spacing.md },
  gridItem: { width: '30%' as const, alignItems: 'center', gap: 6 },
  gridIcon: { width: 54, height: 54, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' as const },
  gridLabel: { fontSize: 12, textAlign: 'center', fontWeight: '600' },
});
