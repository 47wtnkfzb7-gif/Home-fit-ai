import { Card, EmptyState, Screen, ScreenHeader, SectionHeader } from '@/components/ui';

export default function WorkoutsScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Entraînements"
        subtitle="Des séances construites pour toi : niveau, matériel, temps disponible et récupération."
      />

      <SectionHeader title="Programmes" />
      <EmptyState
        icon="calendar"
        title="Tes programmes hebdomadaires"
        message="Un planning adapté à ta fréquence choisie s'affichera ici dès que ton profil sera configuré."
        phase="Prochainement"
      />

      <SectionHeader title="Générateur de séances" />
      <Card
        icon="sparkles"
        title="Générateur intelligent"
        subtitle="Choisis un format (classique, circuit, full body, court…) et le moteur compose ta séance : échauffement, exercices principaux, complémentaires, retour au calme."
      />

      <SectionHeader title="Bibliothèque d'exercices" />
      <Card
        icon="library"
        title="Plus de 100 exercices guidés"
        subtitle="Chaque fiche contiendra les muscles sollicités, le matériel nécessaire, les consignes techniques, les erreurs fréquentes et des variantes plus faciles ou plus difficiles."
      />

      <SectionHeader title="Historique" />
      <EmptyState
        icon="time"
        title="Aucune séance enregistrée"
        message="Ton historique apparaîtra ici dès que tu termineras ta première séance."
      />

      <Card
        icon="medkit"
        iconColorName="success"
        title="Sécurité avant tout"
        subtitle="HOMEFIT AI n'impose jamais de programme extrême. En cas de douleur pendant un exercice, arrête-toi immédiatement et demande un avis médical adapté.">
        <Card
          icon="arrow-forward"
          title="Rappels de sécurité"
          subtitle="Échauffe-toi toujours. Progresse par petites étapes. Le repos fait partie de l'entraînement."
        />
      </Card>
    </Screen>
  );
}
