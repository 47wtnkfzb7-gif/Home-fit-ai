import { Card, EmptyState, Screen, ScreenHeader, SectionHeader } from '@/components/ui';

export default function CoachScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Coach IA"
        subtitle="Un coach qui observe ta technique et te fait progresser, en toute bienveillance."
      />

      <SectionHeader title="Analyse vidéo" />
      <EmptyState
        icon="videocam"
        title="Analyse technique de tes mouvements"
        message="Filme un exercice et obtiens une analyse réelle de ta technique : alignement, amplitude, stabilité et contrôle. Les vidéos ne sont jamais conservées."
        phase="Prochainement"
      />

      <SectionHeader title="Discussion" />
      <Card
        icon="chatbubble-ellipses"
        title="Discute avec ton coach"
        subtitle="« Propose-moi une séance de 30 minutes sans matériel. », « Comment améliorer mes pompes ? »… L'assistant conversationnel s'appuiera sur ton profil et ton historique."
      />

      <SectionHeader title="Conseils techniques" />
      <Card
        icon="body"
        title="La technique avant la charge"
        subtitle="Maîtrise chaque mouvement à vide (ou charge légère) avant d'augmenter la difficulté. Une bonne exécution vaut mieux qu'une charge lourde mal placée."
      />
      <Card
        icon="flame"
        title="Ne saute jamais l'échauffement"
        subtitle="5 à 8 minutes de mobilité et d'activation préparent tes articulations et réduisent le risque de blessure."
      />
      <Card
        icon="bed"
        title="La récupération fait progresser"
        subtitle="Respecte au moins un jour de repos entre deux séances intenses sur les mêmes groupes musculaires. Le sommeil et l'hydratation sont tes meilleurs alliés."
      />
      <Card
        icon="medkit"
        iconColorName="success"
        title="Douleur = stop"
        subtitle="Une douleur vive ou qui persiste après l'effort n'est jamais normale : arrête l'exercice et demande un avis médical. HOMEFIT AI ne remplace ni un médecin, ni un coach humain."
      />
    </Screen>
  );
}
