// Profil — questionnaire modifiable à tout moment, rappels, sauvegarde, confidentialité.

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Screen, ScreenHeader, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/features/profile/profile-context';
import { isMinor } from '@/features/profile/types';
import { EQUIPMENT_LABELS, LEVEL_LABELS, LOCATION_LABELS } from '@/features/profile/labels';
import { useTheme } from '@/hooks/use-theme';

type Row = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  detail?: string;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const theme = useTheme();
  const { profile } = useProfile();

  const personalisation: Row[] = [
    {
      label: 'Questionnaire initial',
      icon: 'clipboard',
      detail: profile
        ? `Niveau ${LEVEL_LABELS[profile.level ?? 'beginner']} · ${profile.sessionsPerWeek ?? '—'} séances/sem · ${profile.sessionMinutes ?? '—'} min`
        : 'Configure ton profil sportif',
      onPress: () => router.push('/quiz'),
    },
    {
      label: 'Matériel et préférences',
      icon: 'barbell',
      detail: profile && profile.equipment.length
        ? profile.equipment.map((e) => EQUIPMENT_LABELS[e]).join(', ')
        : 'Haltères, élastiques, banc…',
      onPress: () => router.push('/quiz'),
    },
    {
      label: 'Lieu d\'entraînement',
      icon: 'home',
      detail: profile ? LOCATION_LABELS[profile.location ?? 'home'] : 'Domicile, salle, les deux',
      onPress: () => router.push('/quiz'),
    },
    {
      label: 'Rappels et notifications',
      icon: 'notifications',
      detail: 'Toujours facultatifs et personnalisables',
      onPress: () => router.push('/rappels'),
    },
    {
      label: 'Sauvegarde et suppression des données',
      icon: 'save',
      detail: 'Export JSON local, droit à l\'effacement total',
      onPress: () => router.push('/sauvegarde'),
    },
  ];

  const confidentialite: Row[] = [
    {
      label: 'Politique de confidentialité',
      icon: 'shield-checkmark',
      onPress: () => router.push('/confidentialite'),
    },
  ];

  const renderRow = (row: Row, mergedStyle?: StyleProp<ViewStyle>) => {
    const rowContent = (
      <>
        <View style={[styles.rowIcon, { backgroundColor: theme.surfaceMuted }]}>
          <Ionicons name={row.icon} size={18} color={theme.primary} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>{row.label}</Text>
          {row.detail && (
            <Text style={[styles.rowDetail, { color: theme.textTertiary }]}>{row.detail}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
      </>
    );

    if (!row.onPress) {
      return <View style={[styles.row, mergedStyle]}>{rowContent}</View>;
    }
    return (
      <Pressable
        accessibilityRole="button"
        onPress={row.onPress}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }, mergedStyle]}>
        {rowContent}
      </Pressable>
    );
  };

  return (
    <Screen>
      <ScreenHeader title="Profil" subtitle="Tout est stocké sur ton téléphone, sans compte." />

      <Card
        icon="person"
        title={profile ? `Ton profil — ${LEVEL_LABELS[profile.level ?? 'beginner']}` : 'Profil à compléter'}
        subtitle={
          profile
            ? `${profile.age !== null ? `${profile.age} ans · ` : ''}${isMinor(profile) ? 'Recommandations adaptées aux mineurs — jamais d\'objectif de poids. ' : ''}${profile.goals.length} objectif(s)`
            : 'Réponds aux 10 questions pour des séances et des conseils adaptés.'
        }
      />

      <SectionHeader title="Personnalisation" />
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {personalisation.map((row, idx) =>
          renderRow(row, idx > 0 ? styles.rowBorder : undefined),
        )}
      </View>

      <SectionHeader title="Confidentialité" />
      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {confidentialite.map((row, idx) =>
          renderRow(row, idx > 0 ? styles.rowBorder : undefined),
        )}
      </View>

      <Text style={[styles.footnote, { color: theme.textTertiary }]}>
        HOMEFIT AI v1.0 · Langue : français (architecture prête pour l&apos;anglais) · local-first
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(128,128,128,0.25)' },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' as const },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600' },
  rowDetail: { fontSize: 12, marginTop: 1 },
  footnote: { fontSize: 11, textAlign: 'center', paddingVertical: Spacing.sm },
});
