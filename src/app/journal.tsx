// Journal alimentaire — 4 repas, totaux du jour, entrées réellement enregistrées.
// Aucun quota protéique universel : les besoins varient selon l'âge et la situation.

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, PrimaryButton, Screen, ScreenHeader, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { mealTotals } from '@/features/nutrition/foods';
import type { MealSlot } from '@/features/profile/labels';
import { MEAL_LABELS } from '@/features/profile/labels';
import { useTheme } from '@/hooks/use-theme';
import { deleteJournalEntry, listJournalDay, todayIso } from '@/services/journal';

export default function JournalScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [date, setDate] = useState(todayIso());
  const [entries, setEntries] = useState(() => listJournalDay(todayIso()));

  const reload = useCallback(() => setEntries(listJournalDay(date)), [date]);
  useFocusEffect(reload);

  function shiftDay(delta: number) {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    const iso = todayIso(d);
    setDate(iso);
    setEntries(listJournalDay(iso));
  }

  const slots = Object.keys(MEAL_LABELS) as MealSlot[];
  const totals = mealTotals(entries);

  function remove(id: string) {
    deleteJournalEntry(id);
    setEntries(listJournalDay(date));
  }

  return (
    <Screen>
      <ScreenHeader
        title="Journal alimentaire"
        subtitle="Note librement tes repas. Aucun quota n'est imposé : les besoins varient selon l'âge et la situation individuelle."
      />

      <View style={styles.dayNav}>
        <Pressable accessibilityRole="button" onPress={() => shiftDay(-1)} style={[styles.dayBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={{ color: theme.text, fontWeight: '700', flex: 1, textAlign: 'center' }}>
          {date === todayIso() ? "Aujourd'hui" : date}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => shiftDay(1)} style={[styles.dayBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </Pressable>
      </View>

      <View style={[styles.totals, { backgroundColor: theme.successMuted }]}>
        <Text style={{ color: theme.text, fontWeight: '700' }}>
          Total du jour : {totals.protein.toFixed(1)} g protéines · {totals.carbs.toFixed(0)} g glucides · {totals.fat.toFixed(0)} g lipides
        </Text>
      </View>

      {slots.map((slot) => {
        const mealEntries = entries.filter((e) => e.meal === slot);
        const mealTotals2 = mealTotals(mealEntries);
        return (
          <View key={slot}>
            <SectionHeader title={MEAL_LABELS[slot]} />
            {mealEntries.length === 0 ? (
              <Text style={[styles.empty, { color: theme.textTertiary }]}>Rien enregistré pour ce repas.</Text>
            ) : (
              mealEntries.map((e) => (
                <View key={e.id} style={[styles.entry, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.entryText}>
                    <Text style={{ color: theme.text, fontWeight: '600' }}>{e.name}</Text>
                    <Text style={{ color: theme.textTertiary, fontSize: 12 }}>
                      {e.qtyG !== null ? `${e.qtyG} g · ` : ''}
                      {e.protein !== null ? `${e.protein} g prot.` : ''}
                      {e.carbs !== null ? ` · ${e.carbs} g gluc.` : ''}
                      {e.fat !== null ? ` · ${e.fat} g lip.` : ''}
                      {` · ${e.source === 'off-barcode' ? 'Open Food Facts' : e.source === 'photo-guide' ? 'guide photo' : 'saisie manuelle'}`}
                    </Text>
                  </View>
                  <Pressable accessibilityRole="button" onPress={() => remove(e.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
                  </Pressable>
                </View>
              ))
            )}
            {mealEntries.length > 0 && (
              <Text style={[styles.mealTotal, { color: theme.textSecondary }]}>
                Sous-total : {mealTotals2.protein.toFixed(1)} g protéines
              </Text>
            )}
          </View>
        );
      })}

      <PrimaryButton
        icon="add"
        label="Ajouter via le scanner de repas"
        onPress={() => router.push('/scanner-repas')}
      />
      <PrimaryButton
        icon="barcode"
        variant="secondary"
        label="Scanner un code-barres"
        onPress={() => router.push('/scanner-produits')}
      />

      <Card
        icon="leaf"
        iconColorName="success"
        title="Privilégie la variété"
        subtitle="Une alimentation variée et équilibrée suffit pour la majorité des pratiquants. HOMEFIT AI n'encourage aucun régime restrictif ni complément inutile."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  dayNav: { flexDirection: 'row' as const, alignItems: 'center', gap: Spacing.sm },
  dayBtn: { padding: 8, borderRadius: 12 },
  totals: { borderRadius: 14, padding: Spacing.md },
  empty: { fontSize: 13 },
  entry: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  entryText: { flex: 1, gap: 2 },
  mealTotal: { fontSize: 12, marginLeft: 4 },
});
