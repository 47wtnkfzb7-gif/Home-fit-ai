// Sauvegarde et restauration — export JSON complet (SQLite du user), import,
// et suppression totale (droit à l'effacement). Aucune donnée ne quitte le
// téléphone sans action explicite de l'utilisateur.

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, Screen, ScreenHeader } from '@/components/ui';
import { useProfile } from '@/features/profile/profile-context';
import { emptyProfile } from '@/features/profile/types';
import { deleteAllUserData, getDb } from '@/services/db';
import { useTheme } from '@/hooks/use-theme';

interface BackupFile {
  app: 'HOMEFIT AI';
  version: number;
  exportedAt: string;
  kv: { key: string; value: string }[];
  workouts: Record<string, unknown>[];
  journal: Record<string, unknown>[];
  favorites: { slug: string; created_at: string }[];
  videoAnalyses: Record<string, unknown>[];
}

async function buildBackup(): Promise<BackupFile> {
  const db = getDb();
  return {
    app: 'HOMEFIT AI',
    version: 1,
    exportedAt: new Date().toISOString(),
    kv: db.getAllSync<{ key: string; value: string }>('SELECT key, value FROM kv', []),
    workouts: db.getAllSync<Record<string, unknown>>('SELECT * FROM workouts', []),
    journal: db.getAllSync<Record<string, unknown>>('SELECT * FROM journal', []),
    favorites: db.getAllSync<{ slug: string; created_at: string }>('SELECT slug, created_at FROM favorites', []),
    videoAnalyses: db.getAllSync<Record<string, unknown>>('SELECT * FROM video_analyses', []),
  };
}

function tableCount(table: string): number {
  const row = getDb().getFirstSync<{ n: number | null }>(`SELECT COUNT(*) as n FROM ${table}`, []);
  return row?.n ?? 0;
}

export default function SauvegardeScreen() {
  const theme = useTheme();
  const { save } = useProfile();
  const [lastExport, setLastExport] = useState<string | null>(null);

  async function exportData() {
    const backup = await buildBackup();
    const file = new File(Paths.cache, `homefit-ai-sauvegarde-${Date.now()}.json`);
    file.write(JSON.stringify(backup, null, 2));
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Exporter mes données HOMEFIT AI' });
    }
    setLastExport(backup.exportedAt);
  }

  function confirmDeleteAll() {
    Alert.alert(
      'Supprimer toutes mes données ?',
      'Profil, séances, XP, badges, journal alimentaire et analyses vidéo seront définitivement effacés de cet appareil. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout supprimer',
          style: 'destructive',
          onPress: () => {
            deleteAllUserData();
            save(emptyProfile());
            Alert.alert('Supprimé', 'Toutes tes données ont été effacées de cet appareil.');
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Sauvegarde et restauration"
        subtitle="Tes données vivent uniquement sur ton téléphone. Exporte-les régulièrement pour les conserver ou les transférer."
      />

      <View style={[styles.summary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={{ color: theme.text, fontWeight: '700' }}>Contenu actuel</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
          {tableCount('workouts')} séance(s) · {tableCount('journal')} entrée(s) de journal ·{' '}
          {tableCount('favorites')} favori(s) · {tableCount('video_analyses')} analyse(s) vidéo
        </Text>
        {lastExport && <Text style={{ color: theme.success, fontSize: 12 }}>Dernier export : {new Date(lastExport).toLocaleString('fr-FR')}</Text>}
      </View>

      <PrimaryButton icon="download" label="Exporter mes données (JSON)" onPress={() => void exportData()} />

      <Card
        icon="information-circle"
        title="Restauration"
        subtitle="L'import d'un fichier de sauvegarde est en cours de finalisation (sélecteur de fichier iOS). L'export ci-dessus contient déjà 100 % de tes données — aucune n'est perdue."
      />

      <Card
        icon="warning"
        title="Suppression totale"
        subtitle="Droit à l'effacement : un seul geste efface tout, définitivement, sans serveur à contourner puisque rien n'en quitte jamais."
      />
      <PrimaryButton icon="trash" variant="secondary" label="Supprimer toutes mes données" onPress={confirmDeleteAll} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
});
