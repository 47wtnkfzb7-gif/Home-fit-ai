import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useFocusEffect, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { ProfileProvider, useProfile } from '@/features/profile/profile-context';
import { isProfileComplete } from '@/features/profile/types';

function OnboardingGate() {
  const { status, profile } = useProfile();
  const segments = useSegments();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (status !== 'ready') return;
      const inQuiz = segments[0] === 'quiz';
      const complete = isProfileComplete(profile);
      if (!complete && !inQuiz) {
        router.replace('/quiz');
      } else if (complete && inQuiz) {
        router.replace('/(tabs)');
      }
    }, [status, profile, segments, router]),
  );

  return null;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <ProfileProvider>
      <ThemeProvider
        value={{
          ...(isDark ? DarkTheme : DefaultTheme),
          colors: {
            ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
            background: isDark ? Colors.dark.background : Colors.light.background,
            card: isDark ? Colors.dark.surface : Colors.light.surface,
            primary: Colors.light.primary,
          },
        }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <OnboardingGate />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="confidentialite" options={{ headerShown: true }} />
          <Stack.Screen name="quiz" options={{ gestureEnabled: false }} />
          <Stack.Screen name="generer" options={{ headerShown: true, headerTitle: 'Générer une séance' }} />
          <Stack.Screen name="seance" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="bilan" options={{ headerShown: true, headerTitle: 'Bilan de séance', gestureEnabled: false }} />
          <Stack.Screen name="exercices" options={{ headerShown: true, headerTitle: "Bibliothèque d'exercices" }} />
          <Stack.Screen name="exercices/[slug]" options={{ headerShown: true, headerTitle: 'Exercice' }} />
          <Stack.Screen name="historique" options={{ headerShown: true, headerTitle: 'Historique' }} />
          <Stack.Screen name="stats" options={{ headerShown: true, headerTitle: 'Statistiques' }} />
          <Stack.Screen name="avatar" options={{ headerShown: true, headerTitle: 'Mon avatar' }} />
          <Stack.Screen name="badges" options={{ headerShown: true, headerTitle: 'Badges et succès' }} />
          <Stack.Screen name="analyse-video" options={{ headerShown: true, headerTitle: 'Analyse vidéo' }} />
          <Stack.Screen name="coach-chat" options={{ headerShown: true, headerTitle: 'Coach IA' }} />
          <Stack.Screen name="scanner-repas" options={{ headerShown: true, headerTitle: 'Scanner de repas' }} />
          <Stack.Screen name="scanner-produits" options={{ headerShown: true, headerTitle: 'Codes-barres' }} />
          <Stack.Screen name="journal" options={{ headerShown: true, headerTitle: 'Journal alimentaire' }} />
          <Stack.Screen name="qr" options={{ headerShown: true, headerTitle: 'Scanner QR' }} />
          <Stack.Screen name="rappels" options={{ headerShown: true, headerTitle: 'Rappels' }} />
          <Stack.Screen name="sauvegarde" options={{ headerShown: true, headerTitle: 'Sauvegarde et restauration' }} />
        </Stack>
      </ThemeProvider>
    </ProfileProvider>
  );
}
