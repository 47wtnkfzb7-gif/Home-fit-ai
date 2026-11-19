import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: '1. Aucun compte, aucune collecte obligatoire',
    body: [
      "HOMEFIT AI fonctionne intégralement sans compte utilisateur. Ton profil sportif, tes séances et ton journal alimentaire sont enregistrés uniquement sur cet appareil.",
      "Aucune donnée santé ou sportive n'est partagée publiquement, automatiquement ou non.",
    ],
  },
  {
    title: '2. Caméra et vidéos',
    body: [
      "La caméra sert uniquement à filmer un exercice pour l'analyse technique, à scanner un code-barres ou un QR code.",
      "Les vidéos utilisées pour l'analyse ne sont jamais conservées après le calcul. Le consentement est demandé avant chaque premier usage et peut être retiré à tout moment.",
    ],
  },
  {
    title: '3. Tes données',
    body: [
      "Les données nutritionnelles et sportives restent locales et protégées.",
      "Tu peux consulter et supprimer l'intégralité de tes données depuis cet écran à tout moment. La suppression est définitive.",
    ],
  },
  {
    title: '4. Services externes',
    body: [
      "Le scanner de produits interroge la base libre Open Food Facts (gratuite, sans compte).",
      "Certaines fonctions d'analyse avancée pourront nécessiter un serveur sécurisé : elles seraient alors clairement identifiées, soumises à ton accord, et jamais partagées sans ton consentement explicite.",
    ],
  },
  {
    title: '5. Mineurs et santé',
    body: [
      "HOMEFIT AI s'adresse aussi aux adolescents avec des recommandations adaptées : aucun objectif de perte de poids, aucune restriction alimentaire, aucun programme extrême.",
      "L'application ne remplace pas un avis médical. En cas de douleur, arrête l'exercice et consulte un professionnel de santé.",
    ],
  },
];

export default function PrivacyScreen() {
  const theme = useTheme();
  const routerOptions = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Confidentialité',
          headerBackTitle: 'Retour',
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.maxWidth}>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {"Dernière mise à jour : à la publication de l'application."}
          </Text>

          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {section.title}
              </Text>
              {section.body.map((paragraph) => (
                <Text key={paragraph} style={[styles.paragraph, { color: theme.textSecondary }]}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={() => routerOptions.back()}
            style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.backLabel, { color: theme.primary }]}>Retour au profil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.xl },
  maxWidth: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.xl },
  subtitle: { fontSize: 13 },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  paragraph: { fontSize: 14, lineHeight: 20 },
  backButton: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backLabel: { fontSize: 15, fontWeight: '700' },
});
