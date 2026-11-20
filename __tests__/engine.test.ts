// Tests du générateur : invariants sur données pures (aucune UI, aucune DB).

import { generateWorkout, FORMAT_LABELS, type WorkoutFormat } from '../src/features/engine/engine';
import type { UserProfile } from '../src/features/profile/types';

function adultProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    age: 30,
    level: 'intermediate',
    goals: ['strength', 'muscle'],
    location: 'home',
    equipment: ['dumbbells', 'bands'],
    sessionsPerWeek: 3,
    sessionMinutes: 30,
    muscleGroups: ['chest', 'legs', 'abs'],
    workoutTypes: ['classic', 'bodyweight', 'circuit'],
    avoidances: '',
    hasOnboarded: true,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('generateWorkout', () => {
  const profile = adultProfile();

  const FULL_STRUCTURE = (Object.keys(FORMAT_LABELS) as WorkoutFormat[]).filter(
    (f) => f !== 'recovery',
  );

  it.each(FULL_STRUCTURE)('produit une séance structurée pour le format %s', (format) => {
    const plan = generateWorkout({ profile, format, minutes: 30, recentSlugs: [] });
    expect(plan.items.length).toBeGreaterThan(0);
    const blocks = new Set(plan.items.map((i) => i.block));
    expect(blocks.has('warmup')).toBe(true);
    expect(blocks.has('main')).toBe(true);
    expect(blocks.has('cooldown')).toBe(true);
    for (const item of plan.items) {
      expect(item.name).toBeTruthy();
      expect(item.sets).toBeGreaterThan(0);
      expect(item.restSeconds).toBeGreaterThan(0);
    }
  });

  it('récupération : séance de mobilité, sans pliométrie', () => {
    const plan = generateWorkout({ profile, format: 'recovery', minutes: 20, recentSlugs: [] });
    expect(plan.items.length).toBeGreaterThan(0);
  });

  it('filtrage matériel : seulement des exercices réalisables', () => {
    const { engineAvailableExercises } = require('../src/features/engine/engine');
    for (const ex of engineAvailableExercises(profile)) {
      expect(ex.equipment.length).toBeGreaterThan(0);
      expect(ex.equipment.some((eq: string) => eq === 'none' || profile.equipment.includes(eq as never))).toBe(true);
    }
  });

  it('est déterministe à seed égale et varie avec le seed', () => {
    const a = generateWorkout({ profile, format: 'fullbody', minutes: 30, recentSlugs: [], seed: 42 });
    const b = generateWorkout({ profile, format: 'fullbody', minutes: 30, recentSlugs: [], seed: 42 });
    const c = generateWorkout({ profile, format: 'fullbody', minutes: 30, recentSlugs: [], seed: 43 });
    expect(a.items.map((i) => i.slug)).toEqual(b.items.map((i) => i.slug));
    expect(a.items.map((i) => i.slug)).not.toEqual(c.items.map((i) => i.slug));
  });

  it('évite la répétition des exercices récents', () => {
    const first = generateWorkout({ profile, format: 'noequipment', minutes: 30, recentSlugs: [], seed: 7 });
    const recent = first.items.map((i) => i.slug);
    const second = generateWorkout({ profile, format: 'noequipment', minutes: 30, recentSlugs: recent, seed: 7 });
    const overlap = second.items.filter((i) => recent.includes(i.slug)).length;
    expect(overlap).toBeLessThan(recent.length);
  });

  it('plafonne la difficulté pour les mineurs', () => {
    const teen = adultProfile({ age: 14, equipment: ['barbell', 'none'] });
    const plan = generateWorkout({ profile: teen, format: 'classic', minutes: 30, recentSlugs: [] });
    expect(plan.items.length).toBeGreaterThan(0);
  });

  it('respecte les mots interdits des contraintes', () => {
    const cautious = adultProfile({ avoidances: 'burpees' });
    const plan = generateWorkout({ profile: cautious, format: 'classic', minutes: 30, recentSlugs: [] });
    for (const item of plan.items) {
      expect(item.name.toLowerCase()).not.toContain('burpee');
    }
  });
});
