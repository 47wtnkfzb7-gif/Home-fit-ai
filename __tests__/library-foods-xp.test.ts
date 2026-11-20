// Bibliothèque, nutrition, gamification — invariants de données réelles.

import { EXERCISES, getExercise, findByString, DIFFICULTY_LABELS } from '../src/features/library/exercises';
import { FOODS, findFood, proteinsFor, searchFoods, mealTotals } from '../src/features/nutrition/foods';
import { levelFromXp, xpForWorkout } from '../src/features/gamification/xp';
import type { WorkoutRecord } from '../src/services/workouts';

jest.mock('../src/services/db', () => ({
  getDb: () => { throw new Error('DB non disponible dans les tests purs'); },
  newId: () => 'test-id',
}));

describe('bibliothèque', () => {
  it('contient au moins 100 exercices', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(100);
  });

  it('les slugs sont uniques', () => {
    const slugs = new Set(EXERCISES.map((e) => e.slug));
    expect(slugs.size).toBe(EXERCISES.length);
  });

  it('les variantes easier/harder pointent vers des exercices existants', () => {
    for (const e of EXERCISES) {
      if (e.easier) expect(getExercise(e.easier)).toBeDefined();
      if (e.harder) expect(getExercise(e.harder)).toBeDefined();
    }
  });

  it('chaque exercice a consignes, erreurs, difficulté valide', () => {
    for (const e of EXERCISES) {
      expect(e.cues.length).toBeGreaterThan(0);
      expect(e.mistakes.length).toBeGreaterThan(0);
      expect(e.difficulty).toBeGreaterThanOrEqual(1);
      expect(e.difficulty).toBeLessThanOrEqual(5);
      expect(DIFFICULTY_LABELS[e.difficulty]).toBeTruthy();
    }
  });

  it('findByString retrouve par nom', () => {
    expect(findByString('pompes').length).toBeGreaterThan(0);
  });
});

describe('nutrition', () => {
  it('les macros restent cohérentes par 100 g', () => {
    for (const f of FOODS) {
      expect(f.protein).toBeGreaterThanOrEqual(0);
      expect(f.name).toBeTruthy();
    }
    expect(findFood('poulet')?.isProteinSource).toBe(true);
  });

  it('proteinsFor est proportionnel aux grammes', () => {
    const poulet = findFood('poulet')!;
    expect(proteinsFor(poulet, 100)).toBe(31);
    expect(proteinsFor(poulet, 200)).toBe(62);
    expect(proteinsFor(poulet, 50)).toBe(15.5);
  });

  it('mealTotals additionne réellement', () => {
    const t = mealTotals([
      { protein: 10, carbs: 20, fat: 5 },
      { protein: null, carbs: 0, fat: 0 },
    ]);
    expect(t.protein).toBe(10);
    expect(t.carbs).toBe(20);
  });

  it('searchFoods filtre', () => {
    expect(searchFoods('poulet').length).toBeGreaterThan(0);
    expect(searchFoods('zzzznexistepas')).toHaveLength(0);
  });
});

describe('gamification', () => {
  const workout = (exCount: number, seconds: number): WorkoutRecord => ({
    id: 'w1',
    label: 'Test',
    format: 'classic',
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    durationSeconds: seconds,
    exercises: Array.from({ length: exCount }, (_, i) => ({
      slug: `ex-${i}`,
      name: `Exercice ${i}`,
      category: 'chest',
      block: 'main',
      sets: [{ done: true }],
    })),
    xpEarned: 0,
    techniqueScore: null,
  });

  it('xpForWorkout récompense durée et volume', () => {
    expect(xpForWorkout(workout(5, 40 * 60))).toBeGreaterThan(xpForWorkout(workout(2, 10 * 60)));
  });

  it('levelFromXp croît strictement', () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(500).level).toBeGreaterThan(1);
    const a = levelFromXp(100);
    const b = levelFromXp(500);
    expect(b.level).toBeGreaterThan(a.level);
  });
});
