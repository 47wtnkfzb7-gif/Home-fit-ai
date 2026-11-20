// Store mémoire temporaire pour passer un plan généré à l'écran de séance.

import type { WorkoutPlan } from '@/features/engine/engine';

let currentPlan: WorkoutPlan | null = null;

export function setPendingPlan(plan: WorkoutPlan): void {
  currentPlan = plan;
}

export function consumePendingPlan(): WorkoutPlan | null {
  const plan = currentPlan;
  currentPlan = null;
  return plan;
}
