import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { StyleProp, ViewStyle } from 'react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Screen, ScreenHeader, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Row = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  detail?: string;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const theme = useTheme();

  const personalisation: Row[] = [
    {
      label: 'Questionnaire initial',
      icon: 'clipboard',
      detail: 'Configure ton profil sportif',
    },
    {
      label: 'Matériel disponible',
      icon: 'barbell',
      detail: 'Haltères, élastiques, banc…',
    },
    {
      label: 'Préférences et objectifs',
      icon: 'options',
      detail: 'Niveau, fréquence, durées de séance',
    },
    {
      label: 'Rappels et notifications',
      icon: 'notifications',
      detail: 'Toujours facultatifs et personnalisables',
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
            <Text style={[styles.rowDetail, { color: theme.textTertiary }]}>
              {row.detail}
            </Text>
          )}
        </View>
        {row.onPress && (
          <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
        )}
      </>
    );

    return (
      <View key={row.label} style={[styles.rowItem, mergedStyle]}>
        {row.onPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={row.label}
            onPress={row.onPress}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
            {rowContent}
          </Pressable>
        ) : (
          <View style={styles.row}>{rowContent}</View>
        )}
      </View>
    );
  };

  return (
    <Screen>
      <ScreenHeader
        title="Profil"
        subtitle="Ton profil reste stocké sur cet appareil. Aucun compte n'est requis."
      />

      <SectionHeader title="Personnalisation" />
      <Card>
        {personalisation.map((row, index) =>
          renderRow(
            row,
            index < personalisation.length - 1 ? styles.rowDivider : undefined,
          ),
        )}
      </Card>

      <SectionHeader title="Confidentialité" />
      <Card>{confidentialite.map((row) => renderRow(row))}</Card>

      <Text style={[styles.version, { color: theme.textTertiary }]}>
        HOMEFIT AI — version 1.0.0
      </Text>
      <Text style={[styles.version, { color: theme.textTertiary }]}>
        {Platform.OS === 'ios'
          ? 'Conçu pour iPhone et iPad'
          : `Conçu pour ${Platform.OS === 'android' ? 'Android' : 'le Web'}`}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  rowItem: { paddingVertical: 0 },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowDetail: { fontSize: 12 },
  version: { fontSize: 12, textAlign: 'center', marginTop: 4 },
});
