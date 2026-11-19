// Enregistrement d'une séance terminée : persistance + XP.
// Les badges sont recalculés à la demande à partir de données réelles.

import { addXpEvent, xpForWorkout } from '@/features/gamification/xp';
import type { WorkoutPlan } from '@/features/engine/engine';
import type { UserProfile } from '@/features/profile/types';
import { saveWorkout, type LoggedExercise, type WorkoutRecord } from '@/services/workouts';

export function saveWorkoutAndXp(args: {
  profile: UserProfile;
  plan: WorkoutPlan;
  doneSets: Record<string, number>;
  startedAt: string;
  durationSeconds: number;
}): WorkoutRecord {
  const { profile, plan, doneSets, startedAt, durationSeconds } = args;

  const exercises: LoggedExercise[] = plan.items
    .map((item) => ({
      slug: item.slug,
      name: item.name,
      category: String(item.category),
      block: item.block,
      sets: Array.from({ length: item.sets }, (_, idx) => ({
        done: (doneSets[item.slug] ?? 0) > idx,
        reps: item.reps,
        seconds: item.timeSeconds,
      })),
    }))
    .filter((e) => e.sets.some((s) => s.done));

  const draft: WorkoutRecord = {
    id: '',
    label: plan.label,
    format: plan.format,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationSeconds,
    exercises,
    xpEarned: 0,
    techniqueScore: null,
  };
  draft.xpEarned = xpForWorkout(draft);

  const saved = saveWorkout(draft);
  addXpEvent('workout', saved.xpEarned);

  return saved;
}
