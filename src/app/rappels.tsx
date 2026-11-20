// Rappels d'entraînement — 100 % facultatifs, programmés localement
// (expo-notifications, aucune donnée sortante). Désactivables à tout moment.

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Card, EmptyState, PrimaryButton, Screen, ScreenHeader } from '@/components/ui';
import { getJson, setJson, removeKey } from '@/services/db';
import { useTheme } from '@/hooks/use-theme';

interface ReminderSettings {
  enabled: boolean;
  weekdays: number[]; // 1 = lundi … 7 = dimanche
  hour: number;
  minute: number;
}

async function notifs(): Promise<typeof import('expo-notifications')> {
  return import('expo-notifications');
}

const DEFAULTS: ReminderSettings = { enabled: false, weekdays: [1, 3, 5], hour: 18, minute: 30 };
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function RappelsNative() {
  const theme = useTheme();
  const [settings, setSettings] = useState<ReminderSettings>(() => getJson<ReminderSettings>('reminders') ?? DEFAULTS);
  const [permission, setPermission] = useState<boolean | null>(null);

  useEffect(() => {
    void notifs()
      .then((n) => n.getPermissionsAsync())
      .then((r) => setPermission(r.granted));
  }, []);

  async function persist(next: ReminderSettings) {
    const Notifications = await notifs();
    setSettings(next);
    setJson('reminders', next);
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!next.enabled) return;
    const current = await Notifications.getPermissionsAsync();
    if (!current.granted) {
      const req = await Notifications.requestPermissionsAsync();
      setPermission(req.granted);
      if (!req.granted) {
        setSettings({ ...next, enabled: false });
        removeKey('reminders');
        return;
      }
    }
    for (const weekday of next.weekdays) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'HOMEFIT AI',
          body: "C'est l'heure de ta séance — même courte, elle compte. 💪",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour: next.hour,
          minute: next.minute,
        },
      });
    }
  }

  function toggleDay(day: number) {
    const weekdays = settings.weekdays.includes(day)
      ? settings.weekdays.filter((d) => d !== day)
      : [...settings.weekdays, day].sort();
    void persist({ ...settings, weekdays });
  }

  return (
    <Screen>
      <ScreenHeader
        title="Rappels"
        subtitle="Totalement facultatifs. Une absence n'entraîne jamais de pénalité : HOMEFIT AI ne culpabilise personne."
      />

      <View style={[styles.switchRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="notifications" size={20} color={theme.primary} />
        <Text style={{ color: theme.text, flex: 1, fontWeight: '600' }}>Rappels hebdomadaires</Text>
        <Switch value={settings.enabled} onValueChange={(v) => void persist({ ...settings, enabled: v })} />
      </View>

      {permission === false && (
        <Card
          icon="alert-circle"
          title="Notifications désactivées au niveau iOS"
          subtitle="Autorise-les dans Réglages › Notifications › HOMEFIT AI pour que les rappels s'affichent."
        />
      )}

      <Text style={[styles.label, { color: theme.text }]}>Jours</Text>
      <View style={styles.chipWrap}>
        {DAY_LABELS.map((label, idx) => {
          const day = idx + 1;
          const active = settings.weekdays.includes(day);
          return (
            <Pressable
              key={label}
              onPress={() => toggleDay(day)}
              style={[
                styles.chip,
                { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                active && { backgroundColor: theme.primaryMuted, borderColor: theme.primary },
              ]}>
              <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: theme.text }]}>Heure du rappel</Text>
      <View style={styles.stepperRow}>
        <Pressable accessibilityRole="button" onPress={() => void persist({ ...settings, hour: (settings.hour + 23) % 24 })} style={[styles.stepBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="chevron-back" size={18} color={theme.text} />
        </Pressable>
        <Text style={{ color: theme.text, fontWeight: '700', fontSize: 18 }}>
          {String(settings.hour).padStart(2, '0')}:{String(settings.minute).padStart(2, '0')}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => void persist({ ...settings, hour: (settings.hour + 1) % 24 })} style={[styles.stepBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="chevron-forward" size={18} color={theme.text} />
        </Pressable>
      </View>

      <PrimaryButton
        icon="checkmark"
        label={settings.enabled ? 'Rappels actifs — enregistrés' : 'Activer et enregistrer'}
        onPress={() => void persist({ ...settings, enabled: true })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: { fontWeight: '700', fontSize: 15 },
  chipWrap: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  stepperRow: { flexDirection: 'row' as const, alignItems: 'center', gap: 20 },
  stepBtn: { padding: 8, borderRadius: 12 },
});

function WebUnavailable() {
  return (
    <Screen>
      <ScreenHeader title="Rappels" subtitle="Notifications locales, 100 % facultatives" />
      <Card>
        <EmptyState
          icon="phone-portrait"
          title="Disponible dans l'application mobile"
          message="Les rappels planifiés en local (notifications système) nécessitent l'application mobile iOS/Android. Ils restent 100 % facultatifs et activés uniquement avec ton accord."
        />
      </Card>
    </Screen>
  );
}

export default function RappelsScreen() {
  return Platform.OS === 'web' ? <WebUnavailable /> : <RappelsNative />;
}
