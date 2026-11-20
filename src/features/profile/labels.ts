// Libellés FR centralisés — préparation de la couche i18n (fr / en).

import type {
  Equipment,
  Goal,
  MuscleGroup,
  SportLevel,
  TrainingLocation,
  WorkoutType,
} from './types';

export const LEVEL_LABELS: Record<SportLevel, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

export const GOAL_LABELS: Record<Goal, string> = {
  strength: 'Développer ma force',
  endurance: 'Améliorer mon endurance',
  muscle: 'Développer mes capacités musculaires',
  general: 'Améliorer ma condition physique générale',
  learn: 'Apprendre de nouveaux exercices',
};

export const LOCATION_LABELS: Record<TrainingLocation, string> = {
  home: 'À domicile',
  gym: 'En salle',
  both: 'Les deux',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: 'Aucun matériel',
  dumbbells: 'Haltères',
  bands: 'Élastiques',
  pullupbar: 'Barre de traction',
  bench: 'Banc de musculation',
  kettlebell: 'Kettlebell',
  barbell: 'Barre et poids',
  other: 'Autre',
};

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pectoraux',
  back: 'Dos',
  shoulders: 'Épaules',
  arms: 'Bras',
  legs: 'Jambes',
  abs: 'Abdominaux',
  glutes: 'Fessiers',
  fullbody: 'Corps entier',
};

export const TYPE_LABELS: Record<WorkoutType, string> = {
  classic: 'Musculation classique',
  bodyweight: 'Poids du corps',
  circuit: 'Circuit training',
  strengthening: 'Renforcement musculaire',
  varied: 'Entraînement varié',
};

export const MEAL_LABELS = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  snack: 'Goûter',
  dinner: 'Dîner',
} as const;

export type MealSlot = keyof typeof MEAL_LABELS;
