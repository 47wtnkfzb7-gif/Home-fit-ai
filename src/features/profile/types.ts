// Profil utilisateur HOMEFIT AI — modèle de données complet (quiz initial).

export type SportLevel = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'strength' | 'endurance' | 'muscle' | 'general' | 'learn';
export type TrainingLocation = 'home' | 'gym' | 'both';
export type Equipment =
  | 'none'
  | 'dumbbells'
  | 'bands'
  | 'pullupbar'
  | 'bench'
  | 'kettlebell'
  | 'barbell'
  | 'other';
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'abs'
  | 'glutes'
  | 'fullbody';
export type WorkoutType =
  | 'classic'
  | 'bodyweight'
  | 'circuit'
  | 'strengthening'
  | 'varied';

export interface UserProfile {
  age: number | null;
  level: SportLevel | null;
  goals: Goal[];
  location: TrainingLocation | null;
  equipment: Equipment[];
  sessionsPerWeek: number | null;
  sessionMinutes: number | null;
  muscleGroups: MuscleGroup[];
  workoutTypes: WorkoutType[];
  avoidances: string;
  hasOnboarded: boolean;
  updatedAt: string;
}

export function emptyProfile(): UserProfile {
  return {
    age: null,
    level: null,
    goals: [],
    location: null,
    equipment: [],
    sessionsPerWeek: null,
    sessionMinutes: null,
    muscleGroups: [],
    workoutTypes: [],
    avoidances: '',
    hasOnboarded: false,
    updatedAt: new Date().toISOString(),
  };
}

export function isMinor(profile: UserProfile | null): boolean {
  return (profile?.age ?? 99) < 18;
}

export function isProfileComplete(profile: UserProfile | null): boolean {
  return Boolean(
    profile?.hasOnboarded &&
      profile.age !== null &&
      profile.level !== null &&
      profile.location !== null &&
      profile.sessionsPerWeek !== null &&
      profile.sessionMinutes !== null,
  );
}
