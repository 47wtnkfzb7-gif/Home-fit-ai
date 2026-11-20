// Définition des 10 questions du questionnaire initial.

import type { Ionicons } from '@expo/vector-icons';

import type {
  Equipment,
  Goal,
  MuscleGroup,
  SportLevel,
  TrainingLocation,
  UserProfile,
  WorkoutType,
} from '@/features/profile/types';

export type QuestionId =
  | 'age'
  | 'level'
  | 'goals'
  | 'location'
  | 'equipment'
  | 'sessionsPerWeek'
  | 'sessionMinutes'
  | 'muscleGroups'
  | 'workoutTypes'
  | 'avoidances';

export type Option = {
  value: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export type QuestionKind = 'single' | 'multi' | 'number' | 'text';

export interface Question {
  id: QuestionId;
  kind: QuestionKind;
  title: string;
  subtitle?: string;
  options?: Option[];
  minNumber?: number;
  maxNumber?: number;
  placeholder?: string;
  minSelections?: number;
}

export const QUESTIONS: Question[] = [
  {
    id: 'age',
    kind: 'number',
    title: 'Quel est ton âge ?',
    subtitle:
      "L'âge permet d'adapter l'intensité des recommandations. Les besoins varient à chaque étape de la vie.",
    minNumber: 10,
    maxNumber: 99,
  },
  {
    id: 'level',
    kind: 'single',
    title: 'Quel est ton niveau sportif ?',
    subtitle: "Aucun choix n'est mauvais : cela sert uniquement à calibrer ta progression.",
    options: [
      { value: 'beginner', label: 'Débutant', icon: 'leaf' },
      { value: 'intermediate', label: 'Intermédiaire', icon: 'trending-up' },
      { value: 'advanced', label: 'Avancé', icon: 'ribbon' },
    ],
  },
  {
    id: 'goals',
    kind: 'multi',
    title: 'Quels sont tes objectifs ?',
    subtitle: 'Tu peux en choisir plusieurs — ils orienteront tes séances.',
    minSelections: 1,
    options: [
      { value: 'strength', label: 'Développer ma force', icon: 'barbell' },
      { value: 'endurance', label: 'Améliorer mon endurance', icon: 'speedometer' },
      { value: 'muscle', label: 'Développer mes capacités musculaires', icon: 'body' },
      { value: 'general', label: 'Améliorer ma condition physique générale', icon: 'heart' },
      { value: 'learn', label: 'Apprendre de nouveaux exercices', icon: 'school' },
    ],
  },
  {
    id: 'location',
    kind: 'single',
    title: 'Où souhaites-tu t’entraîner ?',
    options: [
      { value: 'home', label: 'À domicile', icon: 'home' },
      { value: 'gym', label: 'En salle', icon: 'business' },
      { value: 'both', label: 'Les deux', icon: 'swap-horizontal' },
    ],
  },
  {
    id: 'equipment',
    kind: 'multi',
    title: 'Quel matériel possèdes-tu ?',
    subtitle: 'Si tu ne possèdes rien, choisis « Aucun matériel » : des séances existent aussi.',
    minSelections: 1,
    options: [
      { value: 'none', label: 'Aucun matériel', icon: 'hand-left' },
      { value: 'dumbbells', label: 'Haltères', icon: 'barbell' },
      { value: 'bands', label: 'Élastiques', icon: 'link' },
      { value: 'pullupbar', label: 'Barre de traction', icon: 'arrow-up' },
      { value: 'bench', label: 'Banc de musculation', icon: 'bed' },
      { value: 'kettlebell', label: 'Kettlebell', icon: 'flask' },
      { value: 'barbell', label: 'Barre et poids', icon: 'construct' },
      { value: 'other', label: 'Autre', icon: 'add-circle' },
    ],
  },
  {
    id: 'sessionsPerWeek',
    kind: 'single',
    title: 'Combien de séances par semaine ?',
    subtitle: 'La récupération fait partie de la progression : reste réaliste.',
    options: [
      { value: '2', label: '2 séances' },
      { value: '3', label: '3 séances' },
      { value: '4', label: '4 séances' },
      { value: '5', label: '5 séances' },
      { value: '6', label: '6 séances' },
    ],
  },
  {
    id: 'sessionMinutes',
    kind: 'single',
    title: 'Combien de temps par séance ?',
    options: [
      { value: '15', label: '15 minutes' },
      { value: '30', label: '30 minutes' },
      { value: '45', label: '45 minutes' },
      { value: '60', label: '60 minutes' },
    ],
  },
  {
    id: 'muscleGroups',
    kind: 'multi',
    title: 'Quels groupes musculaires veux-tu travailler ?',
    subtitle: 'Choisis au moins un groupe. Tu pourras modifier à tout moment.',
    minSelections: 1,
    options: [
      { value: 'chest', label: 'Pectoraux', icon: 'body' },
      { value: 'back', label: 'Dos', icon: 'git-branch' },
      { value: 'shoulders', label: 'Épaules', icon: 'water' },
      { value: 'arms', label: 'Bras', icon: 'barbell' },
      { value: 'legs', label: 'Jambes', icon: 'walk' },
      { value: 'abs', label: 'Abdominaux', icon: 'ellipse' },
      { value: 'glutes', label: 'Fessiers', icon: 'podium' },
      { value: 'fullbody', label: 'Corps entier', icon: 'accessibility' },
    ],
  },
  {
    id: 'workoutTypes',
    kind: 'multi',
    title: 'Quels types d’entraînements préfères-tu ?',
    minSelections: 1,
    options: [
      { value: 'classic', label: 'Musculation classique', icon: 'barbell' },
      { value: 'bodyweight', label: 'Poids du corps', icon: 'body' },
      { value: 'circuit', label: 'Circuit training', icon: 'infinite' },
      { value: 'strengthening', label: 'Renforcement musculaire', icon: 'shield' },
      { value: 'varied', label: 'Entraînement varié', icon: 'shuffle' },
    ],
  },
  {
    id: 'avoidances',
    kind: 'text',
    title: 'Des exercices à éviter ou des contraintes ?',
    subtitle:
      'Par exemple : mal de dos, genou fragile, épaule opérée… Ces exercices ne seront jamais proposés.',
    placeholder: 'Ex. : je préfère éviter les sauts et les exercices pour le bas du dos',
  },
];

// Cast typé des réponses vers le modèle de profil.
function coerceNumber(answer: unknown): number | null {
  if (typeof answer === 'number') return Number.isFinite(answer) ? answer : null;
  if (typeof answer === 'string' && answer.trim() !== '') {
    const parsed = Number(answer.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function applyAnswer(profile: UserProfile, question: Question, answer: unknown): UserProfile {
  const next = { ...profile };
  switch (question.id) {
    case 'age':
      next.age = typeof answer === 'number' ? answer : null;
      break;
    case 'level':
      next.level = answer as SportLevel;
      break;
    case 'goals':
      next.goals = answer as Goal[];
      break;
    case 'location':
      next.location = answer as TrainingLocation;
      break;
    case 'equipment':
      next.equipment = answer as Equipment[];
      break;
    case 'sessionsPerWeek':
      next.sessionsPerWeek = coerceNumber(answer);
      break;
    case 'sessionMinutes':
      next.sessionMinutes = coerceNumber(answer);
      break;
    case 'muscleGroups':
      next.muscleGroups = answer as MuscleGroup[];
      break;
    case 'workoutTypes':
      next.workoutTypes = answer as WorkoutType[];
      break;
    case 'avoidances':
      next.avoidances = typeof answer === 'string' ? answer : '';
      break;
  }
  return next;
}

export function getInitialAnswer(question: Question, profile: UserProfile): unknown {
  switch (question.id) {
    case 'age':
      return profile.age;
    case 'level':
      return profile.level;
    case 'goals':
      return profile.goals;
    case 'location':
      return profile.location;
    case 'equipment':
      return profile.equipment;
    case 'sessionsPerWeek':
      return profile.sessionsPerWeek;
    case 'sessionMinutes':
      return profile.sessionMinutes;
    case 'muscleGroups':
      return profile.muscleGroups;
    case 'workoutTypes':
      return profile.workoutTypes;
    case 'avoidances':
      return profile.avoidances;
  }
}
