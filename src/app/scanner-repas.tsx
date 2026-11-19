// Scanner de repas — approche honnête.
// Il n'existe pas de modèle de reconnaissance d'aliments embarqué dans ce build.
// La photo sert uniquement d'aide-mémoire : l'utilisateur identifie lui-même ses
// aliments dans la bibliothèque (60 aliments, valeurs indicatives ANSES/USDA),
// ajuste les quantités, corrige librement. Aucune estimation inventée.
// La photo est supprimée dès la sortie de l'écran.

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, PrimaryButton, Screen, ScreenHeader, SectionHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { FOODS, mealTotals, searchFoods } from '@/features/nutrition/foods';
import type { MealSlot } from '@/features/profile/labels';
import { MEAL_LABELS } from '@/features/profile/labels';
import { useTheme } from '@/hooks/use-theme';
import { addJournalEntry } from '@/services/journal';

interface PickedFood {
  slug: string;
  name: string;
  grams: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function ScannerRepasScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [meal, setMeal] = useState<MealSlot>('lunch');
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<PickedFood[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    return () => {
      if (photoUri) {
        void import('expo-file-system').then(({ deleteAsync }) =>
          deleteAsync(photoUri, { idempotent: true }).catch(() => undefined),
        );
      }
    };
  }, [photoUri]);

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
  }

  async function choosePhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
  }

  function addFood(slug: string) {
    const food = FOODS.find((f) => f.slug === slug);
    if (!food) return;
    setPicked((prev) => [
      ...prev.filter((p) => p.slug !== slug),
      { slug: food.slug, name: food.name, grams: 100, protein: food.protein, carbs: food.carbs, fat: food.fat },
    ]);
  }

  function updateGrams(slug: string, grams: number) {
    const food = FOODS.find((f) => f.slug === slug);
    if (!food) return;
    setPicked((prev) =>
      prev.map((p) =>
        p.slug === slug
          ? { ...p, grams,
              protein: Math.round(((food.protein * grams) / 100) * 10) / 10,
              carbs: Math.round(((food.carbs * grams) / 100) * 10) / 10,
              fat: Math.round(((food.fat * grams) / 100) * 10) / 10 }
          : p,
      ),
    );
  }

  const totals = mealTotals(picked.map((p) => ({ protein: p.protein, carbs: p.carbs, fat: p.fat })));

  function save() {
    for (const p of picked) {
      addJournalEntry({
        meal,
        name: p.name,
        protein: p.protein,
        carbs: p.carbs,
        fat: p.fat,
        qtyG: p.grams,
        source: 'photo-guide',
      });
    }
    setSaved(true);
    setPicked([]);
    setSearch('');
  }

  const results = searchFoods(search);

  return (
    <Screen>
      <ScreenHeader
        title="Scanner de repas"
        subtitle="Photographie ton repas comme aide-mémoire, puis identifie les aliments et les quantités. Tout est corrigeable à la main."
      />

      <Card
        icon="information-circle"
        title="Honnêteté de l'analyse"
        subtitle="Aucun modèle de reconnaissance d'aliments n'est embarqué : HOMEFIT AI ne t'affichera jamais de « détection » inventée. Tu restes maître de ce que tu enregistres."
      />

      <SectionHeader title="1 · Photo du repas" />
      <View style={styles.photoRow}>
        <PrimaryButton icon="camera" label="Prendre une photo" onPress={() => { void takePhoto(); }} />
        <PrimaryButton icon="images" variant="secondary" label="Galerie" onPress={() => { void choosePhoto(); }} />
      </View>
      {photoUri && (
        <Text style={[styles.photoNote, { color: theme.textSecondary }]}>
          Photo ajoutée — elle est supprimée automatiquement dès que tu quittes cet écran.
        </Text>
      )}

      <SectionHeader title="2 · Repas concerné" />
      <View style={styles.chipWrap}>
        {(Object.keys(MEAL_LABELS) as MealSlot[]).map((slot) => (
          <Pressable
            key={slot}
            onPress={() => setMeal(slot)}
            style={[
              styles.chip,
              { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
              meal === slot && { backgroundColor: theme.primaryMuted, borderColor: theme.primary },
            ]}>
            <Text style={[styles.chipLabel, { color: theme.text }]}>{MEAL_LABELS[slot]}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="3 · Aliments identifiés" />
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Rechercher un aliment (poulet, lentilles…)"
        placeholderTextColor={theme.textTertiary}
        style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
      />
      <View style={styles.chipWrap}>
        {results.slice(0, 12).map((f) => (
          <Pressable key={f.slug} onPress={() => addFood(f.slug)} style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="add" size={14} color={theme.primary} />
            <Text style={[styles.chipLabel, { color: theme.text }]}>{f.name}</Text>
            <Text style={[styles.chipMacro, { color: theme.textTertiary }]}>{f.protein} g prot./100 g</Text>
          </Pressable>
        ))}
      </View>

      {picked.map((p) => (
        <View key={p.slug} style={[styles.pickedRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.pickedText}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>{p.name}</Text>
            <Text style={{ color: theme.textTertiary, fontSize: 12 }}>
              Protéines {p.protein} g · Glucides {p.carbs} g · Lipides {p.fat} g
            </Text>
          </View>
          <TextInput
            value={String(p.grams)}
            onChangeText={(t) => updateGrams(p.slug, Number(t.replace(/[^0-9]/g, '')) || 0)}
            keyboardType="number-pad"
            style={[styles.grams, { borderColor: theme.border, color: theme.text }]}
          />
          <Text style={{ color: theme.textTertiary }}>g</Text>
          <Pressable onPress={() => setPicked((prev) => prev.filter((x) => x.slug !== p.slug))} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      ))}

      {picked.length > 0 && (
        <>
          <View style={[styles.totals, { backgroundColor: theme.successMuted }]}>
            <Text style={{ color: theme.text, fontWeight: '700' }}>
              Total {MEAL_LABELS[meal]} : {totals.protein.toFixed(1)} g protéines · {totals.carbs.toFixed(0)} g glucides · {totals.fat.toFixed(0)} g lipides
            </Text>
          </View>
          <PrimaryButton icon="checkmark" label="Enregistrer dans le journal" onPress={save} />
        </>
      )}
      {saved && (
        <Card
          icon="checkmark-circle"
          iconColorName="success"
          title="Enregistré"
          subtitle="Les aliments sont dans ton journal. Les valeurs sont des estimations indicatives : ajuste-les si besoin."
        />
      )}
      <PrimaryButton
        icon="journal"
        variant="secondary"
        label="Ouvrir le journal alimentaire"
        onPress={() => router.push('/journal')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  photoRow: { flexDirection: 'row' as const, gap: Spacing.md },
  photoNote: { fontSize: 12, lineHeight: 17 },
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
  chipMacro: { fontSize: 11 },
  search: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 12, fontSize: 15 },
  pickedRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pickedText: { flex: 1, gap: 2 },
  grams: { width: 64, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 6, textAlign: 'center', fontSize: 15 },
  totals: { borderRadius: 14, padding: Spacing.md },
});
