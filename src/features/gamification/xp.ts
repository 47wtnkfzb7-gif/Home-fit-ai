// XP, niveaux et badges — calculés exclusivement à partir de données réelles.

import { Ionicons } from '@expo/vector-icons';

import { getDb, getJson, newId, setJson } from '@/services/db';
import type { WorkoutRecord } from '@/services/workouts';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface XpTotals {
  total: number;
  level: number;
  levelProgress: number;
  nextLevelThreshold: number;
}

export function xpForWorkout(workout: WorkoutRecord): number {
  const base = 20;
  const perExercise = 4 * new Set(workout.exercises.map((e) => e.slug)).size;
  const timeBonus = Math.min(workout.durationSeconds / 60 / 2, 15);
  return Math.round(base + perExercise + timeBonus);
}

export function addXpEvent(type: string, amount: number): void {
  getDb().runSync(
    'INSERT INTO xp_events (id, type, amount, created_at) VALUES (?, ?, ?, ?)',
    [newId(), type, Math.round(amount), new Date().toISOString()],
  );
}

export function totalXp(): number {
  const row = getDb().getFirstSync<{ total: number | null }>(
    'SELECT SUM(amount) as total FROM xp_events',
  );
  return row?.total ?? 0;
}

// Le niveau n demande 100 + 50×(n−1) points — progression douce, jamais punitive.
export function levelFromXp(xp: number): XpTotals {
  let level = 0;
  let remaining = xp;
  let requiredForNext = 100;
  while (remaining >= requiredForNext && level < 99) {
    remaining -= requiredForNext;
    level += 1;
    requiredForNext = 100 + level * 50;
  }
  return {
    total: xp,
    level: level + 1,
    levelProgress: requiredForNext > 0 ? remaining / requiredForNext : 0,
    nextLevelThreshold: requiredForNext,
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  unlocked: boolean;
}

type StatsLike = { total: WorkoutRecord[]; streakDays: number };

export function computeBadges(
  stats: StatsLike,
  xp: number,
  analysisCount: number,
  bestAnalysis: number | null,
): Badge[] {
  const workouts = stats.total.length;
  const allExercises = new Set(stats.total.flatMap((w) => w.exercises.map((e) => e.slug)));
  const badge = (id: string, name: string, description: string, icon: IconName, unlocked: boolean): Badge => ({
    id,
    name,
    description,
    icon,
    unlocked,
  });
  return [
    badge('first-workout', 'Première séance', 'Ta toute première séance terminée', 'flag', workouts >= 1),
    badge('workout5', 'Régulier', '5 séances terminées', 'calendar', workouts >= 5),
    badge('workout10', 'Champion en herbe', '10 séances terminées', 'medal', workouts >= 10),
    badge('workout30', 'Bêcheur de fer', '30 séances terminées', 'trophy', workouts >= 30),
    badge('streak3', 'Série de 3 jours', '3 jours consécutifs avec séance', 'flame', stats.streakDays >= 3),
    badge('streak7', 'Habitat solide', '7 jours consécutifs avec séance', 'flame-outline', stats.streakDays >= 7),
    badge('explorer', 'Explorateur', '5 exercices différents pratiqués', 'compass', allExercises.size >= 5),
    badge('xp500', 'Acteur énergique', '500 XP cumulés', 'flash', xp >= 500),
    badge('first-analysis', 'Œil technique', 'Première analyse vidéo', 'eye', analysisCount >= 1),
    badge(
      'good-technique',
      'Technique solide',
      'Une analyse vidéo à 15/20 ou plus',
      'checkmark-circle',
      bestAnalysis !== null && bestAnalysis >= 15,
    ),
  ];
}

// Chaque badge débloqué rapporte 25 XP — une seule fois, tracé dans kv.
export function awardBadgeXp(badges: Badge[]): void {
  const awarded = new Set(getJson<string[]>('badge_xp_awarded') ?? []);
  const newly = badges.filter((b) => b.unlocked && !awarded.has(b.id));
  if (!newly.length) return;
  for (const b of newly) {
    addXpEvent('badge', 25);
    awarded.add(b.id);
  }
  setJson('badge_xp_awarded', Array.from(awarded));
}

export function analysisSummary(): { count: number; best: number | null } {
  const rows = getDb()
    .getAllSync<{ score20: number | null }>(
      'SELECT score20 FROM video_analyses WHERE score20 IS NOT NULL',
    );
  const scores = rows.map((r) => r.score20).filter((s): s is number => s !== null);
  return {
    count: scores.length,
    best: scores.length ? Math.max(...scores) : null,
  };
}
