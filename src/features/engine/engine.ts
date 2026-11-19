// Moteur de génération de séances — fonction pure, sans dépendance UI.
// Entrées : profil, format, temps, historique récent. Sorties : séance structurée.

import { EXERCISES, type Exercise, type ExerciseType } from '@/features/library/exercises';
import type { Equipment, MuscleGroup, UserProfile } from '@/features/profile/types';

export type WorkoutFormat =
  | 'classic'
  | 'circuit'
  | 'fullbody'
  | 'upper'
  | 'lower'
  | 'noequipment'
  | 'short'
  | 'recovery';

export const FORMAT_LABELS: Record<WorkoutFormat, string> = {
  classic: 'Séance classique',
  circuit: 'Circuit training',
  fullbody: 'Full body',
  upper: 'Haut du corps',
  lower: 'Bas du corps',
  noequipment: 'Sans matériel',
  short: 'Séance courte',
  recovery: 'Séance de récupération',
};

export interface PlanItem {
  slug: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number; // entre les séries
  block: 'warmup' | 'main' | 'accessory' | 'cooldown';
  type: ExerciseType;
  category: MuscleGroup;
  timeSeconds?: number; // format circuit / mobilité : durée plutôt que reps
}

export interface WorkoutPlan {
  id: string;
  label: string;
  format: WorkoutFormat;
  estimatedMinutes: number;
  items: PlanItem[];
  createdAt: string;
}

export interface EngineInput {
  profile: UserProfile;
  format: WorkoutFormat;
  minutes: number;
  recentSlugs: string[];
  seed?: number;
}

const LEVEL_SETS = { beginner: 2, intermediate: 3, advanced: 4 } as const;
const LEVEL_REST = { beginner: 90, intermediate: 75, advanced: 60 } as const;

const FORMAT_TARGETS: Record<WorkoutFormat, MuscleGroup[]> = {
  classic: ['chest', 'back', 'shoulders', 'arms', 'legs', 'abs', 'glutes'],
  circuit: ['fullbody'],
  fullbody: ['fullbody', 'legs', 'chest', 'back', 'abs'],
  upper: ['chest', 'back', 'shoulders', 'arms'],
  lower: ['legs', 'glutes', 'abs'],
  noequipment: ['chest', 'back', 'legs', 'abs', 'glutes', 'fullbody'],
  short: ['fullbody', 'legs', 'chest', 'abs'],
  recovery: ['fullbody'],
};

function formatTargets(format: WorkoutFormat, profile: UserProfile): MuscleGroup[] {
  const base = FORMAT_TARGETS[format];
  const wanted = base.includes('fullbody') || format === 'classic'
    ? profile.muscleGroups.length
      ? profile.muscleGroups
      : base
    : base;
  const set = new Set<MuscleGroup>([...wanted, ...base.filter((m) => m === 'fullbody')]);
  return [...set];
}

function availableExercises(profile: UserProfile): Exercise[] {
  const equipment = new Set<Equipment>(profile.equipment.length ? profile.equipment : (['none'] as Equipment[]));
  if (profile.equipment.length === 0) equipment.add('none');
  const hasRealEquipment = profile.equipment.some((e) => e !== 'none' && e !== 'other');
  if (hasRealEquipment) equipment.add('none'); // le poids du corps est toujours dispo

  const avoidWords = profile.avoidances
    .toLowerCase()
    .split(/[,.;\n]/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2);

  const minor = (profile.age ?? 99) < 18;
  const senior = (profile.age ?? 0) >= 65;

  return EXERCISES.filter((ex) => {
    if (!ex.equipment.some((e) => equipment.has(e))) return false;
    if (minor && ex.difficulty >= 5) return false;
    if (senior && (ex.type === 'cardio' || ex.difficulty >= 5)) return false;
    if (avoidWords.length) {
      const haystack = `${ex.name} ${ex.muscles.join(' ')} ${ex.category}`.toLowerCase();
      if (avoidWords.some((w) => haystack.includes(w.split(' ').length > 1 ? w : w))) {
        // Un seul mot-clé suffit à exclure — prudent par défaut.
        const words = avoidWords.map((w) => w).filter((w) => w.length > 3);
        if (words.some((w) => haystack.includes(w))) return false;
      }
    }
    return true;
  });
}

function pick<T>(arr: T[], rng: () => number): T | undefined {
  return arr[Math.floor(rng() * arr.length)];
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateWorkout(input: EngineInput): WorkoutPlan {
  const { profile, format, minutes, recentSlugs } = input;
  const rng = mulberry32(input.seed ?? Date.now() % 2147483647);
  const recent = new Set(recentSlugs.slice(-40));

  const level = profile.level ?? 'beginner';
  const mainSets = LEVEL_SETS[level];
  const rest = LEVEL_REST[level];
  const pool = availableExercises(profile);

  const isRecovery = format === 'recovery';
  const isCircuit = format === 'circuit';
  const targets = formatTargets(format, profile);

  const warmupBudget = isRecovery ? 0 : minutes <= 15 ? 2 : minutes <= 30 ? 3 : 4;
  const cooldownBudget = isRecovery ? minutes >= 30 ? 3 : 2 : minutes <= 15 ? 1 : 2;
  const mainMinutes = minutes - (warmupBudget + cooldownBudget) * 2.5;
  const isShort = format === 'short' || minutes <= 15;
  const mainCount = Math.max(2, Math.min(5, Math.round(mainMinutes / (isMicroFormat(minutes) ? 8 : 12))));
  const accessoryCount = isShort ? 0 : Math.max(1, Math.min(3, Math.round(mainMinutes / 18)));

  const items: PlanItem[] = [];

  // 1. Échauffement
  const warmups = pool
    .filter((e) => e.type === 'warmup' || (e.type === 'mobility' && !isRecovery))
    .sort(sortByRecency(recent, rng));
  for (const w of warmups.slice(0, warmupBudget)) {
    items.push({
      slug: w.slug, name: w.name, block: 'warmup', type: w.type, category: w.category,
      sets: 1, reps: '1 série', restSeconds: 15, timeSeconds: 45,
    });
  }

  // 2. Exercices principaux
  const mainPool = pool
    .filter((e) => (isRecovery ? e.type === 'mobility' : e.type === 'strength' || e.type === 'cardio'))
    .filter((e) => targets.includes(e.category) || e.category === 'fullbody')
    .sort(sortByRecency(recent, rng));

  const chosen: Exercise[] = [];
  for (const target of targets) {
    const candidate = pick(mainPool.filter((e) => (e.category === target || e.category === 'fullbody') && !chosen.includes(e)), rng);
    if (candidate && chosen.length < mainCount) chosen.push(candidate);
  }
  // Complète si pas assez de cibles couvertes
  for (const candidate of mainPool) {
    if (chosen.length >= mainCount) break;
    if (!chosen.includes(candidate)) chosen.push(candidate);
  }

  for (const ex of chosen) {
    if (isCircuit) {
      items.push({
        slug: ex.slug, name: ex.name, block: 'main', type: ex.type, category: ex.category,
        sets: 3, reps: '40 s par tour', restSeconds: 20, timeSeconds: 40,
      });
    } else if (isRecovery) {
      items.push({
        slug: ex.slug, name: ex.name, block: 'main', type: ex.type, category: ex.category,
        sets: 2, reps: 'tenue 30 s', restSeconds: 20, timeSeconds: 30,
      });
    } else {
      const repsRange = level === 'advanced' ? '8-12' : level === 'intermediate' ? '10-12' : '10-15';
      items.push({
        slug: ex.slug, name: ex.name, block: 'main', type: ex.type, category: ex.category,
        sets: mainSets, reps: `${repsRange} reps`, restSeconds: rest,
      });
    }
  }

  // 3. Complémentaires
  if (accessoryCount > 0) {
    const accessoryPool = pool
      .filter((e) => e.type === 'core' || e.category === 'abs' || e.category === 'glutes')
      .filter((e) => !items.some((i) => i.slug === e.slug))
      .sort(sortByRecency(recent, rng));
    for (const ex of accessoryPool.slice(0, accessoryCount)) {
      items.push({
        slug: ex.slug, name: ex.name, block: 'accessory', type: ex.type, category: ex.category,
        sets: Math.max(2, mainSets - 1), reps: ex.type === 'cardio' ? '30-45 s' : '12-15 reps',
        restSeconds: Math.max(30, rest - 30),
      });
    }
  }

  // 4. Retour au calme
  const cooldowns = pool.filter((e) => e.type === 'mobility' || e.type === 'warmup')
    .filter((e) => !items.some((i) => i.slug === e.slug))
    .sort(sortByRecency(recent, rng));
  for (const ex of cooldowns.slice(0, cooldownBudget)) {
    items.push({
      slug: ex.slug, name: ex.name, block: 'cooldown', type: ex.type, category: ex.category,
      sets: 1, reps: 'tenue 30-45 s', restSeconds: 10, timeSeconds: 40,
    });
  }

  const estimatedMinutes = Math.max(5, Math.round(items.reduce((sum, i) => {
    if (i.timeSeconds) return sum + (i.timeSeconds * i.sets + i.restSeconds) / 60;
    return sum + (i.sets * 1.2 + (i.restSeconds * (i.sets - 1)) / 60);
  }, 0)));

  return {
    id: `plan-${Date.now().toString(36)}`,
    label: planLabel(format, profile),
    format,
    estimatedMinutes,
    items,
    createdAt: new Date().toISOString(),
  };
}

function planLabel(format: WorkoutFormat, profile: UserProfile): string {
  const day = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const level = { beginner: 'douce', intermediate: 'intense', advanced: 'spicy' }[profile.level ?? 'beginner'];
  return `${day} — ${FORMAT_LABELS[format]} (${level})`;
}

function isMicroFormat(minutes: number): boolean {
  return minutes <= 15;
}

function sortByRecency(recent: Set<string>, rng: () => number) {
  return (a: Exercise, b: Exercise): number => {
    const score = (e: Exercise) => (recent.has(e.slug) ? 1 : 0) + rng() * 0.5;
    return score(a) - score(b);
  };
}

export function engineAvailableExercises(profile: UserProfile): Exercise[] {
  return availableExercises(profile);
}
