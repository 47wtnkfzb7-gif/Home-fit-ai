// Progression — stats réelles, XP/niveau, badges, avatar, calendrier.

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { Card, ProgressBar, Screen, ScreenHeader, SectionHeader } from '@/components/ui';
import { analysisSummary, computeBadges, levelFromXp, totalXp } from '@/features/gamification/xp';
import { computeStats } from '@/services/workouts';

export default function ProgressionScreen() {
  const [xp, setXp] = useState(() => levelFromXp(totalXp()));
  const [stats, setStats] = useState(() => computeStats());
  const [badgeCount, setBadgeCount] = useState(0);
  const [analysis, setAnalysis] = useState(() => analysisSummary());

  useFocusEffect(
    useCallback(() => {
      setXp(levelFromXp(totalXp()));
      setStats(computeStats());
      const fresh = computeStats();
      const an = analysisSummary();
      setBadgeCount(computeBadges({ total: fresh.total, streakDays: fresh.streakDays }, totalXp(), an.count, an.best).length);
      setAnalysis(an);
    }, []),
  );

  return (
    <Screen>
      <ScreenHeader
        title="Progression"
        subtitle="XP, niveau, badges et statistiques — uniquement des données réellement enregistrées."
      />

      <Card
        icon="rocket"
        title={`Niveau ${xp.level}`}
        subtitle={`${xp.total} XP cumulés · aucune régression en cas d'absence : ta progression ne redescend jamais.`}>
        <ProgressBar progress={xp.levelProgress} label="Niveau suivant" />
      </Card>

      <SectionHeader title="Statistiques" />
      <Card
        icon="stats-chart"
        title={`${stats.total.length} séances · ${stats.streakDays} jour(s) de série`}
        subtitle={`${stats.week.totalMinutes} min cette semaine · ${analysis.count} analyse(s) vidéo enregistrée(s)`}
        onPress={() => router.push('/stats')}
      />
      <Card
        icon="calendar"
        title="Calendrier et historique"
        subtitle="30 derniers jours, exercices réalisés, groupes musculaires travaillés."
        onPress={() => router.push('/historique')}
      />

      <SectionHeader title="Récompenses" />
      <Card
        icon="ribbon"
        title={`${badgeCount} badge(s) débloqué(s)`}
        subtitle="Succès calculés automatiquement à partir de tes séances, ta série et ton XP."
        onPress={() => router.push('/badges')}
      />
      <Card
        icon="person"
        title="Mon avatar évolutif"
        subtitle="Coiffure, tenue, couleurs, accessoires à débloquer avec l'XP réellement gagné."
        onPress={() => router.push('/avatar')}
      />
    </Screen>
  );
}

