// Scanner de codes-barres — données réelles Open Food Facts (aucune clé requise).

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, PrimaryButton, Screen, ScreenHeader } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import type { MealSlot } from '@/features/profile/labels';
import { MEAL_LABELS } from '@/features/profile/labels';
import { useTheme } from '@/hooks/use-theme';
import { addJournalEntry } from '@/services/journal';

interface OffProduct {
  name: string;
  brand: string;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  ingredients: string | null;
}

type Phase = 'scan' | 'found' | 'notfound';

async function fetchOffProduct(code: string): Promise<OffProduct | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments,ingredients_text`,
      { headers: { 'User-Agent': 'HOMEFIT-AI - Android - Version 1.0' } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      status?: number;
      product?: {
        product_name?: string;
        brands?: string;
        ingredients_text?: string;
        nutriments?: Record<string, number | undefined>;
      };
    };
    if (json.status !== 1 || !json.product) return null;
    const n = json.product.nutriments ?? {};
    return {
      name: json.product.product_name || 'Produit sans nom',
      brand: json.product.brands || 'Marque inconnue',
      protein: n.proteins_100g ?? n.proteins ?? null,
      carbs: n.carbohydrates_100g ?? n.carbohydrates ?? null,
      fat: n.fat_100g ?? n.fat ?? null,
      ingredients: json.product.ingredients_text || null,
    };
  } catch {
    return null;
  }
}

export default function ScannerProduitsScreen() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('scan');
  const [product, setProduct] = useState<OffProduct | null>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [meal, setMeal] = useState<MealSlot>('lunch');
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(true);

  async function handleCode(code: string) {
    if (!code || code === scannedCode) return;
    setScannedCode(code);
    setScanning(false);
    const found = await fetchOffProduct(code);
    if (found) {
      setProduct(found);
      setPhase('found');
    } else {
      setPhase('notfound');
    }
  }

  function saveToJournal() {
    if (!product) return;
    addJournalEntry({
      meal,
      name: `${product.name} — ${product.brand}`,
      protein: product.protein,
      carbs: product.carbs,
      fat: product.fat,
      qtyG: 100,
      source: 'off-barcode',
    });
    setSaving(true);
  }

  if (!permission?.granted) {
    return (
      <Screen>
        <ScreenHeader title="Codes-barres" subtitle="Scanner un produit avec la caméra." />
        <Card
          icon="camera"
          title="Permission caméra"
          subtitle="La caméra sert uniquement à lire le code-barres, en local. Aucune image n'est conservée ni envoyée."
        />
        <PrimaryButton
          icon="camera"
          label="Autoriser la caméra"
          onPress={() => {
            void requestPermission();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Codes-barres"
        subtitle="Données réelles issues d'Open Food Facts — base ouverte et gratuite, aucune clé requise."
      />

      {phase === 'scan' && (
        <>
          <View style={[styles.cameraBox, { backgroundColor: theme.surfaceMuted }]}>
            {scanning ? (
              <CameraView
                style={styles.camera}
                barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
                onBarcodeScanned={({ data }) => {
                  void handleCode(data);
                }}
              />
            ) : (
              <View style={styles.cameraIdle}>
                <Ionicons name="barcode" size={44} color={theme.textTertiary} />
                <Text style={{ color: theme.textTertiary, marginTop: 8 }}>Scan en pause</Text>
              </View>
            )}
          </View>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Approche le code-barres du cadre. Dernier code lu : {scannedCode || '—'}
          </Text>
        </>
      )}

      {phase === 'found' && product && (
        <>
          <Card
            icon="fast-food"
            title={product.name}
            subtitle={`${product.brand} · pour 100 g : protéines ${product.protein ?? '?'} g, glucides ${product.carbs ?? '?'} g, lipides ${product.fat ?? '?'} g`}
          />
          {product.ingredients && (
            <Card icon="list" title="Ingrédients" subtitle={product.ingredients} />
          )}
          <Text style={[styles.label, { color: theme.text }]}>Ajouter au journal comme :</Text>
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
                <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{MEAL_LABELS[slot]}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton icon="checkmark" label="Ajouter au journal" onPress={saveToJournal} />
          {saving && (
            <Card
              icon="checkmark-circle"
              iconColorName="success"
              title="Ajouté"
              subtitle="Valeurs pour 100 g. Ajuste la quantité dans le journal si besoin."
            />
          )}
        </>
      )}

      {phase === 'notfound' && (
        <>
          <Card
            icon="help-circle"
            title="Produit absent de la base Open Food Facts"
            subtitle="Ce code-barres n'est pas dans la base libre. Tu peux le saisir manuellement ci-dessous."
          />
          <ManualForm onSubmit={(p) => { setProduct(p); setPhase('found'); }} />
        </>
      )}

      <PrimaryButton
        icon="refresh"
        variant="secondary"
        label="Scanner un autre produit"
        onPress={() => {
          setScannedCode('');
          setProduct(null);
          setPhase('scan');
          setScanning(true);
          setSaving(false);
        }}
      />
      <PrimaryButton
        icon="open-outline"
        variant="secondary"
        label="Consulter openfoodfacts.org"
        onPress={() => {
          void Linking.openURL('https://world.openfoodfacts.org').catch(() => undefined);
        }}
      />
    </Screen>
  );
}

function ManualForm({ onSubmit }: { onSubmit: (p: OffProduct) => void }) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  return (
    <View style={styles.form}>
      <TextInput value={name} onChangeText={setName} placeholder="Nom du produit" placeholderTextColor={theme.textTertiary} style={[styles.input, { borderColor: theme.border, color: theme.text }]} />
      <View style={styles.row3}>
        <TextInput value={protein} onChangeText={setProtein} placeholder="Protéines g" keyboardType="decimal-pad" placeholderTextColor={theme.textTertiary} style={[styles.input, { borderColor: theme.border, color: theme.text }]} />
        <TextInput value={carbs} onChangeText={setCarbs} placeholder="Glucides g" keyboardType="decimal-pad" placeholderTextColor={theme.textTertiary} style={[styles.input, { borderColor: theme.border, color: theme.text }]} />
        <TextInput value={fat} onChangeText={setFat} placeholder="Lipides g" keyboardType="decimal-pad" placeholderTextColor={theme.textTertiary} style={[styles.input, { borderColor: theme.border, color: theme.text }]} />
      </View>
      <PrimaryButton
        icon="checkmark"
        label="Utiliser ce produit"
        onPress={() =>
          onSubmit({
            name: name || 'Produit manuel',
            brand: 'Saisie manuelle',
            protein: protein ? Number(protein.replace(',', '.')) : null,
            carbs: carbs ? Number(carbs.replace(',', '.')) : null,
            fat: fat ? Number(fat.replace(',', '.')) : null,
            ingredients: null,
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cameraBox: { borderRadius: 20, overflow: 'hidden' as const, height: 300 },
  camera: { flex: 1 },
  cameraIdle: { flex: 1, alignItems: 'center', justifyContent: 'center' as const },
  hint: { fontSize: 12 },
  label: { fontWeight: '700', fontSize: 15 },
  chipWrap: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: Spacing.sm },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  form: { gap: Spacing.md },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, fontSize: 15 },
  row3: { flexDirection: 'row' as const, gap: Spacing.sm },
});
