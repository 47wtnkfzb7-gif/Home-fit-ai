import { Card, EmptyState, Screen, ScreenHeader, SectionHeader } from '@/components/ui';

export default function NutritionScreen() {
  return (
    <Screen>
      <ScreenHeader
        title="Nutrition"
        subtitle="Comprendre ce que tu manges, sans régime et sans culpabilité."
      />

      <SectionHeader title="Scanner de repas" />
      <EmptyState
        icon="camera"
        title="Photographie ton repas"
        message="Identifie les aliments visibles et leurs sources de protéines. Les estimations resteront prudentes et toujours corrigeables à la main."
        phase="Prochainement"
      />

      <SectionHeader title="Scanner de produits" />
      <Card
        icon="barcode"
        title="Codes-barres — Open Food Facts"
        subtitle="Scanne un produit pour retrouver sa marque, ses protéines, glucides, lipides et ses ingrédients. Base de données libre et gratuite ; saisie manuelle si le produit est inconnu."
      />

      <SectionHeader title="Journal alimentaire" />
      <EmptyState
        icon="journal"
        title="Ton journal du jour"
        message="Petit-déjeuner, déjeuner, goûter, dîner : note tes repas et suis tes protéines estimées sur la journée."
        phase="Prochainement"
      />

      <Card
        icon="leaf"
        iconColorName="success"
        title="Notre approche de la nutrition"
        subtitle="HOMEFIT AI n'impose aucun quota, aucun déficit calorique et ne pousse à aucun complément alimentaire. Privilégie une alimentation variée et équilibrée : les besoins varient selon l'âge et la situation de chacun."
      />
    </Screen>
  );
}
