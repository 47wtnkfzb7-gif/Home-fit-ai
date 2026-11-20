// Accès aux données d'entraînement (séances réellement terminées).

import { getDb, newId } from './db';

export interface LoggedSet {
  done: boolean;
  reps?: string;
  seconds?: number;
}

export interface LoggedExercise {
  slug: string;
  name: string;
  category: string;
  block: string;
  sets: LoggedSet[];
}

export interface WorkoutRecord {
  id: string;
  label: string;
  format: string;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  exercises: LoggedExercise[];
  xpEarned: number;
  techniqueScore: number | null;
}

export function saveWorkout(w: Omit<WorkoutRecord, 'id'>): WorkoutRecord {
  const record: WorkoutRecord = { ...w, id: newId() };
  getDb().runSync(
    `INSERT INTO workouts (id, label, format, started_at, finished_at, duration_seconds, exercises_json, xp_earned, technique_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.label,
      record.format,
      record.startedAt,
      record.finishedAt,
      record.durationSeconds,
      JSON.stringify(record.exercises),
      record.xpEarned,
      record.techniqueScore,
    ],
  );
  return record;
}

export function listWorkouts(): WorkoutRecord[] {
  const rows = getDb()
    .getAllSync<{
      id: string;
      label: string;
      format: string;
      started_at: string;
      finished_at: string;
      duration_seconds: number;
      exercises_json: string;
      xp_earned: number;
      technique_score: number | null;
    }>('SELECT * FROM workouts ORDER BY finished_at DESC');
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    format: r.format,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
    durationSeconds: r.duration_seconds,
    exercises: JSON.parse(r.exercises_json) as LoggedExercise[],
    xpEarned: r.xp_earned,
    techniqueScore: r.technique_score,
  }));
}

export function getWorkout(id: string): WorkoutRecord | undefined {
  return listWorkouts().find((w) => w.id === id);
}

export interface WeekStats {
  workouts: number;
  totalMinutes: number;
  totalXp: number;
  uniqueExercises: number;
  musclesCounted: Record<string, number>;
}

export function computeStats(sinceIso: string | null = null): {
  total: WorkoutRecord[];
  week: WeekStats;
  streakDays: number;
} {
  const total = listWorkouts();
  const weekStart = sinceIso ? new Date(sinceIso) : startOfWeek(new Date());
  const weekList = total.filter((w) => new Date(w.finishedAt) >= weekStart);

  const musclesCounted: Record<string, number> = {};
  const unique = new Set<string>();
  for (const w of weekList) {
    for (const ex of w.exercises) {
      if (ex.block === 'warmup' || ex.block === 'cooldown') continue;
      unique.add(ex.slug);
      musclesCounted[ex.category] = (musclesCounted[ex.category] ?? 0) + 1;
    }
  }

  return {
    total,
    week: {
      workouts: weekList.length,
      totalMinutes: Math.round(weekList.reduce((s, w) => s + w.durationSeconds, 0) / 60),
      totalXp: weekList.reduce((s, w) => s + w.xpEarned, 0),
      uniqueExercises: unique.size,
      musclesCounted,
    },
    streakDays: computeStreak(total),
  };
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

export function computeStreak(workouts: WorkoutRecord[]): number {
  const daySet = new Set(workouts.map((w) => w.finishedAt.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  if (!daySet.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
