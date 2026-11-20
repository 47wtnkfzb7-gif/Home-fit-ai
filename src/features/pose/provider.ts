// fournisseur d'estimation de pose — couture d'abstraction.
// Aujourd'hui : aucun module natif ML Kit n'est lié tant que l'app n'a pas de
// development build iOS. L'écran d'analyse vérifie `available()` et affiche un
// état honnête — jamais d'analyse simulée. Choisir un fournisseur réel
// (MediaPipe Pose Landmarker natif, ou ML Kit via react-native-vision-camera)
// ne nécessite QUE d'implémenter cette interface : aucun autre fichier à modifier.

import type { PoseFrame } from './geometry';

export class PoseProviderUnavailableError extends Error {}

export interface PoseProvider {
  id: string;
  label: string;
  needsNativeBuild: boolean;
  estimate(videoUri: string, onProgress?: (p: number) => void): Promise<PoseFrame[]>;
}

// Fournisseur réel requis : build dev iOS + ML Kit / MediaPipe.
class AwaitingNativeProvider implements PoseProvider {
  id = 'awaiting-native';
  label = 'Module natif de pose à intégrer (build iOS requis)';
  needsNativeBuild = true;

  async estimate(): Promise<PoseFrame[]> {
    throw new PoseProviderUnavailableError(
      "Le module natif de détection de pose (MediaPipe Pose Landmarker / ML Kit) n'est pas encore lié à ce build. " +
        'Il nécessite un development build iOS (npx expo run:ios) — voir docs/ARCHITECTURE.md.',
    );
  }
}

export const poseProvider: PoseProvider = new AwaitingNativeProvider();

export function isPoseProviderAvailable(): boolean {
  const test = poseProvider as unknown as { needsNativeBuild?: boolean };
  return !(test.needsNativeBuild ?? false) && Boolean(poseProvider.estimate);
}
