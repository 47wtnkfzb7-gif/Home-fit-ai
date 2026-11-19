// Coach IA — analyse vidéo réelle + assistant conversationnel + conseils.

import { router } from 'expo-router';

import { Card, PrimaryButton, Screen, ScreenHeader, SectionHeader } from '@/components/ui';
import { isPoseProviderAvailable } from '@/features/pose/provider';
import { useTheme } from '@/hooks/use-theme';

export default function CoachScreen() {
  const poseReady = isPoseProviderAvailable();

  return (
    <Screen>
      <ScreenHeader
        title="Coach IA"
        subtitle="Un coach qui observe ta technique et te fait progresser, en toute bienveillance."
      />

      <SectionHeader title="Analyse vidéo" />
      <PrimaryButton label="Analyser un exercice" icon="videocam" onPress={() => router.push('/analyse-video')} />
      <Card
        icon={poseReady ? 'checkmark-circle' : 'construct'}
        iconColorName={poseReady ? 'success' : 'primary'}
        title={poseReady ? 'Détection de pose active' : 'Détection de pose : build natif requis'}
        subtitle={
          poseReady
            ? 'Le moteur géométrique évalue uniquement des critères réellement observables.'
            : "Le moteur géométrique (critères, notes /20 et /100, confiance) est prêt et testé. L'estimation des articulations exige un build iOS natif (ML Kit / MediaPipe). Aucune analyse n'est jamais simulée."
        }
      />

      <SectionHeader title="Discussion" />
      <Card
        icon="chatbubbles"
        title="Discute avec ton coach"
        subtitle="« Propose-moi une séance de 30 minutes sans matériel. », « Comment améliorer mes pompes ? », « Analyse ma progression »… Réponses construites sur ton profil et tes statistiques réelles."
        onPress={() => router.push('/coach-chat')}
      />

      <SectionHeader title="Conseils techniques" />
      <Card
        icon="body"
        title="La technique avant la charge"
        subtitle="Maîtrise chaque mouvement à vide (ou charge légère) avant d'augmenter la difficulté."
      />
      <Card
        icon="flame"
        title="Ne saute jamais l'échauffement"
        subtitle="5 à 8 minutes de mobilité et d'activation préparent tes articulations et réduisent le risque de blessure."
      />
      <Card
        icon="bed"
        title="La récupération fait progresser"
        subtitle="Respecte au moins un jour de repos entre deux séances intenses sur les mêmes groupes musculaires."
      />
      <Card
        icon="medkit"
        iconColorName="success"
        title="Douleur = stop"
        subtitle="Une douleur vive n'est jamais normale : arrête l'exercice et demande un avis médical. HOMEFIT AI ne remplace ni un médecin, ni un coach humain."
      />
    </Screen>
  );
}
