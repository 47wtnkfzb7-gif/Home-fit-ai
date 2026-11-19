import { Card, EmptyState, Screen, ScreenHeader, SectionHeader } from '@/components/ui';

export default function ProgressionScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Progression"
        subtitle="Chaque séance terminée compte. Ta progression ne se reset jamais."
      />

      <SectionHeader title="Niveau" />
      <Card
        icon="rocket"
        title="Niveau 1"
        subtitle="0 / 100 XP — termine ta première séance pour gagner tes premiers points d'expérience."
      />

      <SectionHeader title="Mon avatar" />
      <Card
        icon="person-circle"
        title="Ton avatar évolue avec toi"
        subtitle="Coiffure, tenue, couleurs et accessoires : personnalise ton avatar et débloque de nouveaux éléments grâce à ta régularité. Jamais de régression : une pause d'entraînement ne te fait perdre aucun acquis."
      />

      <SectionHeader title="Statistiques" />
      <EmptyState
        icon="stats-chart"
        title="Pas encore de données"
        message="Séries, temps d'entraînement, notes techniques et groupes musculaires travaillés s'afficheront ici à partir de tes séances réelles."
        phase="Prochainement"
      />

      <SectionHeader title="Badges" />
      <EmptyState
        icon="trophy"
        title="0 badge débloqué"
        message="Première séance, série de 7 jours, nouveau record… Les badges célèbrent chaque étape de ta progression."
        phase="Prochainement"
      />
    </Screen>
  );
}
