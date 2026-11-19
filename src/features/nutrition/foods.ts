// Bibliothèque d'aliments usuels (valeurs indicatives pour 100 g, sources
// publiques type ANSES / USDA). Ce ne sont pas des mesures de la photo :
// l'utilisateur choisit ses aliments et ajuste les quantités.

export interface Food {
  slug: string;
  name: string;
  protein: number; // g / 100 g
  carbs: number;
  fat: number;
  isProteinSource: boolean;
}

export const FOODS: Food[] = [
  { slug: 'poulet', name: 'Poulet (blanc cuit)', protein: 31, carbs: 0, fat: 3.6, isProteinSource: true },
  { slug: 'dinde', name: 'Dinde (escalope)', protein: 29, carbs: 0.1, fat: 2, isProteinSource: true },
  { slug: 'boeuf', name: 'Bœuf haché 5 %', protein: 26, carbs: 0, fat: 5, isProteinSource: true },
  { slug: 'thon', name: 'Thon au naturel', protein: 25, carbs: 0, fat: 1, isProteinSource: true },
  { slug: 'saumon', name: 'Saumon', protein: 20, carbs: 0, fat: 12, isProteinSource: true },
  { slug: 'oeuf', name: 'Œuf', protein: 13, carbs: 0.6, fat: 9.5, isProteinSource: true },
  { slug: 'fromage-blanc', name: 'Fromage blanc 3 %', protein: 8, carbs: 4, fat: 3, isProteinSource: true },
  { slug: 'yaourt-nature', name: 'Yaourt nature', protein: 5, carbs: 5, fat: 3.5, isProteinSource: false },
  { slug: 'skyr', name: 'Skyr', protein: 11, carbs: 4, fat: 0.3, isProteinSource: true },
  { slug: 'lait', name: 'Lait demi-écrémé', protein: 3.3, carbs: 4.8, fat: 1.5, isProteinSource: false },
  { slug: 'lentilles', name: 'Lentilles cuites', protein: 9, carbs: 20, fat: 0.5, isProteinSource: true },
  { slug: 'pois-chiches', name: 'Pois chiches cuits', protein: 8.9, carbs: 22, fat: 2.6, isProteinSource: true },
  { slug: 'haricots-rouges', name: 'Haricots rouges cuits', protein: 8.7, carbs: 23, fat: 0.5, isProteinSource: true },
  { slug: 'tofu', name: 'Tofu ferme', protein: 15, carbs: 1.5, fat: 9, isProteinSource: true },
  { slug: 'tempeh', name: 'Tempeh', protein: 19, carbs: 8, fat: 11, isProteinSource: true },
  { slug: 'edamame', name: 'Edamame', protein: 11, carbs: 9, fat: 5, isProteinSource: true },
  { slug: 'quinoa', name: 'Quinoa cuit', protein: 4.4, carbs: 21, fat: 1.9, isProteinSource: false },
  { slug: 'riz', name: 'Riz blanc cuit', protein: 2.6, carbs: 28, fat: 0.3, isProteinSource: false },
  { slug: 'pates', name: 'Pâtes cuites', protein: 3.6, carbs: 26, fat: 0.5, isProteinSource: false },
  { slug: 'avoine', name: 'Flocons d’avoine', protein: 13, carbs: 58, fat: 7, isProteinSource: false },
  { slug: 'pain-complet', name: 'Pain complet', protein: 9, carbs: 43, fat: 3, isProteinSource: false },
  { slug: 'patate-douce', name: 'Patate douce cuite', protein: 1.6, carbs: 20, fat: 0.1, isProteinSource: false },
  { slug: 'pomme-de-terre', name: 'Pomme de terre cuite', protein: 2, carbs: 17, fat: 0.1, isProteinSource: false },
  { slug: 'banane', name: 'Banane', protein: 1.1, carbs: 22, fat: 0.3, isProteinSource: false },
  { slug: 'pomme', name: 'Pomme', protein: 0.3, carbs: 13, fat: 0.2, isProteinSource: false },
  { slug: 'orange', name: 'Orange', protein: 0.9, carbs: 9, fat: 0.1, isProteinSource: false },
  { slug: 'myrtilles', name: 'Myrtilles', protein: 0.7, carbs: 12, fat: 0.3, isProteinSource: false },
  { slug: 'fraises', name: 'Fraises', protein: 0.8, carbs: 6, fat: 0.3, isProteinSource: false },
  { slug: 'brocoli', name: 'Brocoli cuit', protein: 2.4, carbs: 5, fat: 0.4, isProteinSource: false },
  { slug: 'epinards', name: 'Épinards', protein: 2.9, carbs: 1.4, fat: 0.4, isProteinSource: false },
  { slug: 'carotte', name: 'Carotte', protein: 0.9, carbs: 7, fat: 0.2, isProteinSource: false },
  { slug: 'tomate', name: 'Tomate', protein: 0.9, carbs: 3, fat: 0.2, isProteinSource: false },
  { slug: 'poivron', name: 'Poivron', protein: 1, carbs: 5, fat: 0.3, isProteinSource: false },
  { slug: 'concombre', name: 'Concombre', protein: 0.7, carbs: 2.2, fat: 0.1, isProteinSource: false },
  { slug: 'avocat', name: 'Avocat', protein: 2, carbs: 8, fat: 15, isProteinSource: false },
  { slug: 'amandes', name: 'Amandes', protein: 21, carbs: 9, fat: 50, isProteinSource: true },
  { slug: 'noix', name: 'Noix', protein: 15, carbs: 7, fat: 65, isProteinSource: true },
  { slug: 'jus-dolive', name: 'Huile d’olive', protein: 0, carbs: 0, fat: 100, isProteinSource: false },
  { slug: 'beurre-de-cacahuete', name: 'Beurre de cacahuète', protein: 25, carbs: 14, fat: 50, isProteinSource: true },
  { slug: 'gruyere', name: 'Gruyère', protein: 30, carbs: 0, fat: 31, isProteinSource: true },
  { slug: 'mozzarella', name: 'Mozzarella', protein: 22, carbs: 1, fat: 22, isProteinSource: true },
  { slug: 'cabanossi', name: 'Saucisse sèche', protein: 35, carbs: 1, fat: 45, isProteinSource: true },
  { slug: 'shrimp', name: 'Crevettes cuites', protein: 24, carbs: 0.5, fat: 0.4, isProteinSource: true },
  { slug: 'sardines', name: 'Sardines à l’huile', protein: 25, carbs: 0, fat: 11, isProteinSource: true },
  { slug: 'pain-blanc', name: 'Pain blanc', protein: 8, carbs: 49, fat: 1.5, isProteinSource: false },
  { slug: 'muesli', name: 'Muesli', protein: 10, carbs: 65, fat: 9, isProteinSource: false },
  { slug: 'chocolat-noir', name: 'Chocolat noir 70 %', protein: 7.8, carbs: 34, fat: 42, isProteinSource: false },
  { slug: 'pizza-fromage', name: 'Pizza au fromage', protein: 11, carbs: 30, fat: 10, isProteinSource: true },
  { slug: 'spaghetti-bolognaise', name: 'Spaghettis bolognaise', protein: 6.5, carbs: 18, fat: 4, isProteinSource: true },
  { slug: 'poke-bowl-saumon', name: 'Poke bowl saumon', protein: 10, carbs: 20, fat: 5, isProteinSource: true },
  { slug: 'omelette', name: 'Omelette', protein: 12, carbs: 1, fat: 12, isProteinSource: true },
  { slug: 'salade-cesar', name: 'Salade César', protein: 9, carbs: 6, fat: 9, isProteinSource: true },
  { slug: 'soupe-legumes', name: 'Soupe de légumes', protein: 1.5, carbs: 5, fat: 1, isProteinSource: false },
  { slug: 'sushi-saumon', name: 'Sushi au saumon', protein: 6, carbs: 25, fat: 2, isProteinSource: false },
  { slug: 'burger-boeuf', name: 'Burger au bœuf', protein: 14, carbs: 25, fat: 14, isProteinSource: true },
  { slug: 'yogourt-grec', name: 'Yaourt grec', protein: 10, carbs: 4, fat: 5, isProteinSource: true },
  { slug: 'houmous', name: 'Houmous', protein: 8, carbs: 14, fat: 18, isProteinSource: true },
  { slug: 'lait-soja', name: 'Lait de soja', protein: 3.5, carbs: 2.5, fat: 2, isProteinSource: false },
  { slug: 'couscous', name: 'Semoule de couscous', protein: 3.8, carbs: 23, fat: 0.2, isProteinSource: false },
  { slug: 'crepe', name: 'Crêpe', protein: 5, carbs: 33, fat: 7, isProteinSource: false },
  { slug: 'croissant', name: 'Croissant', protein: 8, carbs: 45, fat: 21, isProteinSource: false },
];

export function findFood(slug: string): Food | undefined {
  return FOODS.find((f) => f.slug === slug);
}

export function proteinsFor(f: Food, grams: number): number {
  return Math.round(((f.protein * grams) / 100) * 10) / 10;
}

export function searchFoods(text: string): Food[] {
  const q = text.trim().toLowerCase();
  if (!q) return FOODS.slice(0, 30);
  return FOODS.filter((f) => f.name.toLowerCase().includes(q));
}

export function mealTotals(
  entries: { protein: number | null; carbs: number | null; fat: number | null }[],
): { protein: number; carbs: number; fat: number } {
  return entries.reduce<{ protein: number; carbs: number; fat: number }>(
    (acc, e) => ({
      protein: acc.protein + (e.protein ?? 0),
      carbs: acc.carbs + (e.carbs ?? 0),
      fat: acc.fat + (e.fat ?? 0),
    }),
    { protein: 0, carbs: 0, fat: 0 },
  );
}
