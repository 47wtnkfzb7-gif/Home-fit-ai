// Extraction d'échantillons réels depuis une vidéo locale.
// Note honnête : expo-video-thumbnails ne fournit pas la durée de la vidéo.
// Nous échantillonnons donc à intervalles fixes (1 s) ; si la vidéo est plus
// courte, l'OS renvoie la dernière image accessible — le nombre de frames
// distinctes réel via la provider, qui signale toujours son estimation.
// Aucun frame n'est jamais inventé.

import * as VideoThumbnails from 'expo-video-thumbnails';

export interface ExtractedFrames {
  uris: string[];
  cleanup: () => Promise<void>;
}

export async function extractFrames(
  videoUri: string,
  count = 24,
  stepMs = 1000,
): Promise<ExtractedFrames> {
  const uris: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const result = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: i * stepMs,
      quality: 0.7,
    });
    uris.push(result.uri);
  }
  return {
    uris,
    cleanup: async () => {
      const { deleteAsync } = await import('expo-file-system');
      await Promise.all(
        uris.map((uri) =>
          deleteAsync(uri, { idempotent: true }).catch(() => undefined),
        ),
      );
    },
  };
}
