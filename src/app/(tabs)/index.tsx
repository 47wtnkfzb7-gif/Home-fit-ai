import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, Screen, ScreenHeader, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function getIsoDate(): string {
  const now = new Date();
  return now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

const QUICK_ACTIONS: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}[] = [
  { label: 'Nouvelle séance', icon: 'barbell', route: '/entrainements' },
  { label: 'Analyse vidéo', icon: 'videocam', route: '/coach' },
  { label: 'Scanner repas', icon: 'camera', route: '/nutrition' },
  { label: 'Scanner QR', icon: 'qr-code', route: '/coach' },
  { label: 'Ma progression', icon: 'trending-up', route: '/progression' },
  { label: 'Mon profil', icon: 'person', route: '/profil' },
];

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <ScreenHeader title={getGreeting()} subtitle={getIsoDate()} />

      <View style={[styles.sloganRow, { backgroundColor: theme.primaryMuted }]}>
        <Ionicons name="flame" size={16} color={theme.primary} />
        <Text style={[styles.slogan, { color: theme.primary }]}>
          Ton corps, ton rythme, ton évolution.
        </Text>
      </View>

      <SectionHeader title="Prochaine séance" />
      <Card
        icon="fitness"
        title="Ton programme personnel arrive bientôt"
        subtitle="Réponds au questionnaire initial pour qu'HOMEFIT AI construise des séances adaptées à ton niveau, ton matériel et ton temps disponible.">
        <PrimaryButton
          label="Configurer mon profil"
          icon="options"
          onPress={() => router.push('/profil')}
        />
      </Card>

      <SectionHeader title="Cette semaine" />
      <View style={styles.statsRow}>
        <View
          style={[styles.statTile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
          <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>séances</Text>
        </View>
        <View
          style={[styles.statTile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="flame" size={20} color={theme.primary} />
          <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>jours de série</Text>
        </View>
        <View
          style={[styles.statTile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="time" size={20} color={theme.primary} />
          <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>minutes</Text>
        </View>
      </View>
      <Text style={[styles.statsNote, { color: theme.textTertiary }]}>
        Les statistiques se rempliront automatiquement à partir de tes séances réellement
        enregistrées.
      </Text>

      <SectionHeader
        title="Accès rapide"
        action="Tout voir"
        onActionPress={() => router.push('/entrainements')}
      />
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => router.push(action.route as never)}
            style={[styles.gridItem, { opacity: 1 }]}>
            <View
              style={[
                styles.gridIcon,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}>
              <Ionicons name={action.icon} size={22} color={theme.primary} />
            </View>
            <Text style={[styles.gridLabel, { color: theme.text }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sloganRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  slogan: { fontSize: 13, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row' as const,
    gap: Spacing.md,
  },
  statTile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600' },
  statsNote: { fontSize: 12, lineHeight: 17, marginTop: -8 },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridItem: {
    width: '30.5%' as const,
    alignItems: 'center',
    gap: 6,
  },
  gridIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
