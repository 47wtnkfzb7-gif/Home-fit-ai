// Nutrition — scanner de repas, codes-barres Open Food Facts, journal réel.

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Screen, ScreenHeader, SectionHeader } from '@/components/ui';
import { FOODS, mealTotals } from '@/features/nutrition/foods';
import { useTheme } from '@/hooks/use-theme';
import { listJournalDay, todayIso } from '@/services/journal';

export default function NutritionScreen() {
  const theme = useTheme();
  const [totals, setTotals] = useState(() => mealTotals(listJournalDay(todayIso())));

  useFocusEffect(
    useCallback(() => {
      setTotals(mealTotals(listJournalDay(todayIso())));
    }, []),
  );

  return (
    <Screen>
      <ScreenHeader
        title="Nutrition"
        subtitle="Comprendre ce que tu manges, sans régime et sans culpabilité."
      />

      <SectionHeader title="Aujourd'hui" />
      <View style={[styles.totals, { backgroundColor: theme.successMuted }]}>
        <Text style={{ color: theme.text, fontWeight: '700' }}>
          {totals.protein.toFixed(1)} g protéines · {totals.carbs.toFixed(0)} g glucides · {totals.fat.toFixed(0)} g lipides
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          Aucun quota universel : tes besoins dépendent de ton âge et de ta situation.
        </Text>
      </View>

      <SectionHeader title="Scanner de repas" />
      <Card
        icon="camera"
        title="Photographie ton repas"
        subtitle="La photo sert d'aide-mémoire : tu identifies les aliments dans la bibliothèque de 60 aliments et ajustes les quantités. Toujours corrigeable, jamais de détection inventée."
        onPress={() => router.push('/scanner-repas')}
      />

      <SectionHeader title="Scanner de produits" />
      <Card
        icon="barcode"
        title="Codes-barres — Open Food Facts"
        subtitle="Produits réels : marque, protéines, glucides, lipides, ingrédients. Base libre et gratuite ; saisie manuelle si le produit est inconnu."
        onPress={() => router.push('/scanner-produits')}
      />

      <SectionHeader title="Journal alimentaire" />
      <Card
        icon="journal"
        title="Petit-déjeuner · déjeuner · goûter · dîner"
        subtitle="Récapitulatif par repas et par jour, avec sous-totaux de protéines."
        onPress={() => router.push('/journal')}
      />

      <Card
        icon="leaf"
        iconColorName="success"
        title="Alimentation variée et équilibrée"
        subtitle={`${FOODS.length} aliments de référence. HOMEFIT AI n'encourage aucun régime restrictif, aucun déficit calorique imposé, ni complément inutile. Prudence pour les mineurs : pas d'objectif de poids, uniquement de bonnes habitudes.`}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  totals: { borderRadius: 16, padding: 16, gap: 4 },
});
