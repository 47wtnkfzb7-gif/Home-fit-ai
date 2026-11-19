import { Ionicons } from '@expo/vector-icons';
import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, Screen, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { PoseProviderUnavailableError, isPoseProviderAvailable, poseProvider } from '@/features/pose/provider';
import {
  analyzeExercise,
  type AnalysisResult,
  type ExerciseKey,
} from '@/features/pose/analyzers';
import { saveVideoAnalysis } from '@/services/video-analyses';
import { useTheme } from '@/hooks/use-theme';

const EXERCISE_OPTIONS: { key: ExerciseKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'pushup', label: 'Pompes', icon: 'body' },
  { key: 'squat', label: 'Squats', icon: 'accessibility' },
  { key: 'lunge', label: 'Fentes', icon: 'walk' },
  { key: 'plank', label: 'Gainage', icon: 'timer' },
  { key: 'biceps-curl', label: 'Curl biceps', icon: 'barbell' },
  { key: 'shoulder-press', label: 'Développé épaules', icon: 'arrow-up-circle' },
  { key: 'pullup', label: 'Tractions', icon: 'flag' },
  { key: 'hip-thrust', label: 'Hip thrust', icon: 'bed' },
  { key: 'crunch', label: 'Crunch', icon: 'fitness' },
  { key: 'burpee', label: 'Burpees', icon: 'flash' },
];

type Phase = 'prepare' | 'capture' | 'openedVideo' | 'analyzing' | 'result' | 'unavailable' | 'unreliable';

export default function AnalyseVideoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const cameraRef = useRef<Camera.CameraView | null>(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('prepare');
  const [exercise, setExercise] = useState<ExerciseKey | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorText, setErrorText] = useState('');
  const [consent, setConsent] = useState(false);

  const reset = useCallback(() => {
    if (videoUri) {
      void import('expo-file-system').then(({ deleteAsync }) =>
        deleteAsync(videoUri, { idempotent: true }).catch(() => undefined),
      );
    }
    setVideoUri(null);
    setResult(null);
    setErrorText('');
    setProgress(0);
    setPhase('prepare');
  }, [videoUri]);

  const runAnalysis = useCallback(async (uri: string, key: ExerciseKey) => {
    setPhase('analyzing');
    setProgress(0.05);
    try {
      if (!isPoseProviderAvailable()) {
        throw new PoseProviderUnavailableError(
          "Le module natif de détection de pose n'est pas lié à ce build.",
        );
      }
      setProgress(0.15);
      const frames = await poseProvider.estimate(uri, (p) =>
        setProgress(0.15 + p * 0.7),
      );
      const analysis = analyzeExercise(key, frames);
      saveVideoAnalysis({
        exerciseSlug: key,
        score20: analysis.score20,
        score100: analysis.score100,
        confidence: analysis.confidence,
        details: {
          positives: analysis.positives,
          errors: analysis.errors,
          advice: analysis.advice,
          criteria: analysis.criteria,
          framesDetected: analysis.framesDetected,
          framesTotal: analysis.framesTotal,
          reps: analysis.reps,
          message: analysis.message,
        },
      });
      setResult(analysis);
      setPhase(analysis.score20 === null && analysis.message ? 'unreliable' : 'result');
      setProgress(1);
    } catch (err) {
      if (err instanceof PoseProviderUnavailableError) {
        setErrorText(err.message);
        setPhase('unavailable');
      } else {
        setErrorText(
          "L'analyse a échoué. Aucun résultat n'est affiché : HOMEFIT AI n'invente jamais de mesure.",
        );
        setPhase('unreliable');
      }
    } finally {
      await import('expo-file-system').then(({ deleteAsync }) =>
        deleteAsync(uri, { idempotent: true }).catch(() => undefined),
      );
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!mediaPermission.granted) {
      setErrorText("L'accès à la galerie est nécessaire pour importer une vidéo. Tu peux aussi filmer directement.");
      setPhase('unreliable');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (res.canceled || !res.assets[0]) return;
    const uri = res.assets[0].uri;
    setVideoUri(uri);
    setPhase('openedVideo');
  }, []);

  const recordOnce = useCallback(async () => {
    if (!cameraRef.current) return;
    if (recording) {
      cameraRef.current.stopRecording();
      setRecording(false);
      return;
    }
    setRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 30 });
      if (video?.uri) {
        setVideoUri(video.uri);
        setPhase('openedVideo');
      }
    } finally {
      setRecording(false);
    }
  }, [recording]);

  const openCamera = useCallback(async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setErrorText(
          "La caméra est nécessaire pour filmer. Aucun enregistrement n'est effectué sans ton accord, et la vidéo est supprimée juste après l'analyse.",
        );
        setPhase('unreliable');
        return;
      }
    }
    setPhase('capture');
    setExercise((current) => current ?? 'squat');
  }, [permission, requestPermission]);


  return (
    <Screen>
      <ScreenHeader
        title="Analyse vidéo"
        subtitle="Un coach qui observe ta technique : alignement, amplitude, stabilité. Les vidéos sont supprimées immédiatement après l'analyse."
      />

      {phase === 'prepare' && (
        <>
          <Card
            icon="shield-checkmark"
            iconColorName="success"
            title="Ton consentement d'abord"
            subtitle="La vidéo reste 100 % sur ton téléphone, n'est jamais envoyée sur un serveur, et est supprimée dès l'analyse terminée. Modifie ou refuse le consentement à tout moment."
          />
          {consent ? (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Quel exercice as-tu filmé ?</Text>
              <View style={styles.chipWrap}>
                {EXERCISE_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.key}
                    onPress={() => setExercise(opt.key)}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                      exercise === opt.key && { backgroundColor: theme.primaryMuted, borderColor: theme.primary },
                    ]}>
                    <Ionicons name={opt.icon} size={16} color={theme.primary} />
                    <Text style={[styles.chipLabel, { color: theme.text }]}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>
              <PrimaryButton icon="videocam" label="Filmer maintenant" onPress={openCamera} />
              <PrimaryButton icon="images" variant="secondary" label="Importer depuis la galerie" onPress={pickFromGallery} />
            </>
          ) : (
            <PrimaryButton
              icon="checkmark-circle"
              label="J'accepte — utiliser la caméra / la galerie"
              onPress={() => setConsent(true)}
            />
          )}
        </>
      )}

      {phase === 'capture' && (
        <View>
          <View style={[styles.cameraBox, { backgroundColor: theme.surfaceMuted }]}>
            <Camera.CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              mode="video"
              videoQuality="720p">
              <Text style={styles.cameraHint}>
                Place le téléphone de côté, corps entier visible, bon éclairage.
              </Text>
            </Camera.CameraView>
          </View>
          <PrimaryButton
            icon={recording ? 'stop-circle' : 'radio-button-on'}
            label={recording ? 'Arrêter (ou attendre 30 s)' : "Démarrer l'enregistrement"}
            onPress={() => {
              void recordOnce();
            }}
          />
          <PrimaryButton
            icon="arrow-forward"
            variant="secondary"
            label="Analyser ma vidéo"
            disabled={!videoUri}
            onPress={() => {
              if (videoUri && exercise) void runAnalysis(videoUri, exercise);
            }}
          />
        </View>
      )}

      {recording && phase === 'capture' && <Text style={[styles.note, { color: theme.textSecondary }]}>Enregistrement en cours…</Text>}

      {phase === 'openedVideo' && videoUri && (
        <>
          <Card
            icon="checkmark-circle"
            iconColorName="success"
            title="Vidéo prête"
            subtitle={exercise ? EXERCISE_OPTIONS.find((o) => o.key === exercise)?.label ?? '' : ''}
          />
          <PrimaryButton
            icon="sparkles"
            label="Lancer l'analyse"
            onPress={() => void runAnalysis(videoUri, exercise ?? 'squat')}
          />
          <PrimaryButton icon="close" variant="secondary" label="Recommencer" onPress={reset} />
        </>
      )}

      {phase === 'analyzing' && (
        <>
          <Card
            icon="analytics"
            title="Analyse en cours…"
            subtitle="Extraction des images puis détection des articulations. Ce traitement est réel : il peut prendre quelques secondes."
          />
          <View style={[styles.progressTrack, { backgroundColor: theme.surfaceMuted }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${Math.round(progress * 100)}%` as `${number}%` }]} />
          </View>
        </>
      )}

      {phase === 'result' && result && (
        <ResultView result={result} onReset={reset} />
      )}

      {phase === 'unreliable' && (
        <>
          <Card
            icon="warning"
            iconColorName="success"
            title="Analyse non fiable — aucun score affiché"
            subtitle={
              errorText ||
              "L'angle de caméra ou la qualité vidéo ne permettent pas une analyse fiable. Filme-toi de côté, corps entier visible, dans un bon éclairage."
            }
          />
          <PrimaryButton icon="refresh" label="Réessayer" onPress={reset} />
        </>
      )}

      {phase === 'unavailable' && (
        <>
          <Card
            icon="construct"
            title="Module natif requis"
            subtitle={errorText || "La détection des articulations repose sur un module natif (ML Kit / MediaPipe) qui n'est pas encore lié à ce build de l'application."}
          />
          <Card
            icon="information-circle"
            title="Pourquoi un état vide plutôt qu'un faux score"
            subtitle="HOMEFIT AI n'invente aucune mesure. Tant que l'estimation de pose n'est pas disponible sur l'appareil, l'analyse est signalée comme indisponible — jamais simulée."
          />
          <Card
            icon="terminal"
            title="Activer l'analyse (build iOS)"
            subtitle="Depuis un Mac : npx expo prebuild -p ios puis npx expo run:ios, avec le fournisseur de pose branché sur l'interface PoseProvider (src/features/pose/provider.ts). Aucune autre partie de l'application ne change."
          />
          <PrimaryButton icon="refresh" label="Retour" onPress={reset} />
        </>
      )}

      <View style={styles.footerGap} />
      {phase === 'prepare' && (
        <PrimaryButton
          icon="analytics"
          variant="secondary"
          label="Voir mon historique d'analyses"
          onPress={() => router.push('/historique')}
        />
      )}
    </Screen>
  );
}

function ResultView({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const theme = useTheme();
  const hasScore = result.score20 !== null;

  return (
    <>
      <View style={[styles.scoreCard, { backgroundColor: hasScore ? theme.primaryMuted : theme.surfaceMuted }]}>
        <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
          {hasScore ? 'Technique' : 'Aucune note'}
        </Text>
        {hasScore && (
          <>
            <Text style={[styles.score20, { color: theme.text }]}>
              {result.score20?.toFixed(1)}
              <Text style={{ fontSize: 18, color: theme.textSecondary } as const}> /20</Text>
            </Text>
            <Text style={[styles.score100, { color: theme.primary }]}>{result.score100 ?? 0} / 100</Text>
          </>
        )}
        <Text style={[styles.confidence, { color: theme.textSecondary }]}>
          Confiance de l&apos;analyse : {Math.round(result.confidence * 100)} % —
          {result.framesDetected}/{result.framesTotal} images avec pose détectée,
          {result.reps > 0 ? ` ${result.reps} répétition(s) détectée(s)` : ''}
        </Text>
      </View>

      <Section title="Points positifs" items={result.positives} success />
      <Section title="Erreurs techniques observées" items={result.errors} />
      <Section title="Conseils pour progresser" items={result.advice} />
      <Section
        title="Critères mesurés"
        items={result.criteria.map(
          (c) =>
            `${c.label} : ${
              c.value === null ? 'non mesuré sur cette vidéo' : `médiane ${Math.round(c.value * 10) / 10}`
            } — ${c.ok ? 'validé' : 'à améliorer'}`,
        )}
      />

      <PrimaryButton icon="refresh" variant="secondary" label="Nouvelle analyse" onPress={onReset} />
    </>
  );
}

function Section({ title, items, success }: { title: string; items: string[]; success?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionRow}>
        <Ionicons
          name={success ? 'checkmark-circle' : items.length ? 'alert-circle' : 'remove-circle'}
          size={16}
          color={success ? theme.success : theme.textSecondary}
        />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {items.length ? (
        items.map((item, idx) => (
          <Text key={idx} style={[styles.bullet, { color: theme.textSecondary }]}>
            • {item}
          </Text>
        ))
      ) : (
        <Text style={[styles.bullet, { color: theme.textTertiary }]}>Rien d&apos;observé sur cette vidéo.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  chipWrap: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: Spacing.sm },
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: { fontSize: 13, fontWeight: '600' },
  cameraBox: { borderRadius: 20, overflow: 'hidden' as const, height: 320 },
  camera: { flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end' as const, padding: Spacing.md },
  cameraHint: { color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.45)', padding: 8, borderRadius: 12, fontSize: 12 },
  note: { fontSize: 13 },
  progressTrack: { height: 10, borderRadius: 999, overflow: 'hidden' as const },
  progressFill: { height: 10, borderRadius: 999 },
  scoreCard: { borderRadius: 20, padding: Spacing.lg, gap: 6 },
  scoreLabel: { fontSize: 13, fontWeight: '600' },
  score20: { fontSize: 44, fontWeight: '800' as const, lineHeight: 50 },
  score100: { fontSize: 22, fontWeight: '800' as const },
  confidence: { fontSize: 12, lineHeight: 17 },
  section: { gap: 6 },
  sectionRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 6 },
  bullet: { fontSize: 13, lineHeight: 19, paddingLeft: 22 },
  footerGap: { height: Spacing.xl },
});
