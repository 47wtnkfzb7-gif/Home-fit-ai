// Scanner QR — reconnaît les QR internes HOMEFIT AI (exercice / programme).
// Un contenu externe n'est JAMAIS ouvert automatiquement : confirmation explicite.

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, PrimaryButton, Screen, ScreenHeader } from '@/components/ui';
import { generateWorkout, FORMAT_LABELS, type WorkoutFormat } from '@/features/engine/engine';
import { useProfile } from '@/features/profile/profile-context';
import { setPendingPlan } from '@/features/workout/session-store';
import { getExercise } from '@/features/library/exercises';
import { useTheme } from '@/hooks/use-theme';

type Phase = 'scan' | 'exercise' | 'program' | 'external' | 'unknown';

function QrScreenNative() {
  const theme = useTheme();
  const { profile } = useProfile();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('scan');
  const [payload, setPayload] = useState('');
  const [scanning, setScanning] = useState(true);
  const [lastCode, setLastCode] = useState('');

  function handleScan(data: string) {
    if (data === lastCode) return;
    setLastCode(data);
    setPayload(data);

    if (data.startsWith('homefitai://exercise/')) {
      const slug = data.replace('homefitai://exercise/', '');
      if (getExercise(slug)) {
        setPhase('exercise');
        setScanning(false);
        return;
      }
    }
    if (data.startsWith('homefitai://program/')) {
      setPhase('program');
      setScanning(false);
      return;
    }
    if (data.startsWith('http://') || data.startsWith('https://')) {
      setPhase('external');
      setScanning(false);
      return;
    }
    setPhase('unknown');
    setScanning(false);
  }

  if (!permission?.granted) {
    return (
      <Screen>
        <ScreenHeader title="Scanner QR" subtitle="Reconnaissance des QR codes HOMEFIT AI." />
        <Card
          icon="qr-code"
          title="Permission caméra"
          subtitle="La caméra sert uniquement à lire les QR codes. Rien n'est enregistré ni envoyé."
        />
        <PrimaryButton
          icon="camera"
          label="Autoriser la caméra"
          onPress={() => {
            void requestPermission();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Scanner QR"
        subtitle="Pointe un QR code HOMEFIT AI : fiche exercice ou programme partagé. Les liens externes demandent toujours une confirmation."
      />

      {phase === 'scan' && (
        <View style={[styles.cameraBox, { backgroundColor: theme.surfaceMuted }]}>
          {scanning ? (
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => handleScan(data)}
            />
          ) : (
            <View style={styles.cameraIdle}>
              <Ionicons name="qr-code" size={44} color={theme.textTertiary} />
              <Text style={{ color: theme.textTertiary, marginTop: 8 }}>Scan en pause</Text>
            </View>
          )}
        </View>
      )}

      {phase === 'exercise' && (
        <>
          <Card
            icon="barbell"
            iconColorName="success"
            title="QR HOMEFIT AI — fiche exercice"
            subtitle={getExercise(payload.replace('homefitai://exercise/', ''))?.name ?? payload}
          />
          <PrimaryButton
            icon="open"
            label="Ouvrir la fiche exercice"
            onPress={() => router.push(`/exercices/${payload.replace('homefitai://exercise/', '')}`)}
          />
        </>
      )}

      {phase === 'program' && (
        <>
          <Card
            icon="calendar"
            iconColorName="success"
            title="QR HOMEFIT AI — programme partagé"
            subtitle={FORMAT_LABELS[(payload.replace('homefitai://program/', '') || 'classic') as WorkoutFormat] ?? 'Format personnalisé'}
          />
          <PrimaryButton
            icon="play"
            label="Charger ce programme"
            onPress={() => {
              if (!profile) return;
              const format = (payload.replace('homefitai://program/', '') || 'classic') as WorkoutFormat;
              const plan = generateWorkout({
                profile,
                format,
                minutes: profile.sessionMinutes ?? 30,
                recentSlugs: [],
              });
              setPendingPlan(plan);
              router.push('/seance');
            }}
          />
        </>
      )}

      {phase === 'external' && (
        <>
          <Card
            icon="warning"
            title="Lien externe détecté"
            subtitle={`Ce QR code ne fait pas partie de HOMEFIT AI. Il pointe vers :\n${payload}\n\nN'ouvre un lien externe que si tu connais sa source.`}
          />
          <PrimaryButton
            icon="open-outline"
            label="Ouvrir quand même (explicitement)"
            onPress={() => {
              void Linking.openURL(payload).catch(() => undefined);
            }}
          />
        </>
      )}

      {phase === 'unknown' && (
        <Card
          icon="help-circle"
          title="Contenu non reconnu"
          subtitle={`Ce QR code n'est pas un QR HOMEFIT AI :\n${payload}`}
        />
      )}

      <PrimaryButton
        icon="refresh"
        variant="secondary"
        label={phase === 'scan' ? 'Pauser / reprendre le scan' : 'Scanner un autre QR'}
        onPress={() => {
          setLastCode('');
          setPayload('');
          setPhase('scan');
          setScanning((s) => (phase === 'scan' ? !s : true));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cameraBox: { borderRadius: 20, overflow: 'hidden' as const, height: 320 },
  camera: { flex: 1 },
  cameraIdle: { flex: 1, alignItems: 'center', justifyContent: 'center' as const },
});

function WebUnavailable() {
  return (
    <Screen>
      <ScreenHeader title="Scanner QR" subtitle="QR internes HOMEFIT AI" />
      <Card>
        <EmptyState icon="qr-code" title="Scanner QR" message="La lecture de QR codes par la caméra utilise le module natif du téléphone, indisponible dans un navigateur. Ce scanner reste pleinement fonctionnel dans l'application mobile." />
      </Card>
    </Screen>
  );
}

export default function QrScreen() {
  return Platform.OS === 'web' ? <WebUnavailable /> : <QrScreenNative />;
}
