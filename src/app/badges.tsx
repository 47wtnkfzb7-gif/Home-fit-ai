// Badges et succès — dérivés exclusivement des données réelles.

import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui';
import { analysisSummary, awardBadgeXp, computeBadges, totalXp, type Badge } from '@/features/gamification/xp';
import { useTheme } from '@/hooks/use-theme';
import { computeStats } from '@/services/workouts';

export default function BadgesScreen() {
  const theme = useTheme();
  const [badges, setBadges] = useState<Badge[]>([]);

  useFocusEffect(
    useCallback(() => {
      const stats = computeStats();
      const summary = analysisSummary();
      const computed = computeBadges(stats, totalXp(), summary.count, summary.best);
      awardBadgeXp(computed);
      setBadges(computed);
    }, []),
  );

  const unlocked = badges.filter((b) => b.unlocked);

  return (
    <ScrollView contentContainerStyle={styles.content} style={{ backgroundColor: theme.background }}>
      {unlocked.length === 0 && (
        <EmptyState
          icon="trophy"
          title="Aucun badge débloqué"
          message="Termine des séances, maintiens des séries régulières et analyse ta technique pour débloquer des distinctions."
        />
      )}
      {badges.map((b) => (
        <View
          key={b.id}
          style={[
            styles.badgeRow,
            {
              backgroundColor: theme.surface,
              borderColor: b.unlocked ? theme.success : theme.border,
              opacity: b.unlocked ? 1 : 0.55,
            },
          ]}>
          <Text style={{ fontSize: 26 }}>{b.unlocked ? '🏅' : '🔒'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>{b.name}</Text>
            <Text style={{ color: theme.textTertiary, fontSize: 12 }}>{b.description}</Text>
          </View>
        </View>
      ))}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
});
