// Coach IA conversationnel — sans LLM, sans cloud.
// Réponses construites à partir de données réelles : profil, bibliothèque
// d'exercices, moteur de séances et statistiques enregistrées. Hors périmètre :
// tout diagnostic médical (réorienté avec prudence).

import { EXERCISES, findByString } from '@/features/library/exercises';
import {
  computeStats,
  listWorkouts,
} from '@/services/workouts';
import { generateWorkout, FORMAT_LABELS, type WorkoutFormat, type WorkoutPlan } from '@/features/engine/engine';
import { EQUIPMENT_LABELS } from '@/features/profile/labels';
import { levelFromXp, totalXp } from '@/features/gamification/xp';
import type { UserProfile } from '@/features/profile/types';

export interface CoachReply {
  text: string;
  plan?: WorkoutPlan;
}

const MIN_RE = /(\d{1,3})\s*(?:min|minutes)/i;

function recentSlugs(): string[] {
  return listWorkouts()
    .slice(0, 3)
    .flatMap((w) => w.exercises.map((e) => e.slug));
}

export function coachReply(input: string, profile: UserProfile | null): CoachReply {
  const text = input.toLowerCase().trim();

  if (/douleur|blessure|bless[ée]|j'ai mal/.test(text)) {
    return {
      text:
        "Si tu ressens une douleur : arrête l'exercice immédiatement, repose la zone, et demande un avis médical si elle persiste. Une douleur vive n'est jamais « normale ». " +
        'Je ne remplace ni un médecin, ni un coach humain.',
    };
  }

  const wantsWorkout = /(séance|entraînement|programme|propose-moi|génère)/.test(text);
  const minutesMatch = text.match(MIN_RE);
  if (wantsWorkout && profile) {
    const minutes = minutesMatch
      ? Math.min(120, Math.max(10, Number(minutesMatch[1])))
      : (profile.sessionMinutes ?? 30);
    let format: WorkoutFormat = 'classic';
    if (/circuit/.test(text)) format = 'circuit';
    else if (/full ?body|corps entier/.test(text)) format = 'fullbody';
    else if (/haut/.test(text)) format = 'upper';
    else if (/bas/.test(text)) format = 'lower';
    else if (/sans mat[ée]riel|poids du corps/.test(text)) format = 'noequipment';
    else if (/court|rapide/.test(text)) format = 'short';
    else if (/r[ée]cup[ée]ration|séance légère/.test(text)) format = 'recovery';

    const plan = generateWorkout({ profile, format, minutes, recentSlugs: recentSlugs() });
    const materialText = profile.equipment.some((e) => e !== 'none')
      ? profile.equipment.map((e) => EQUIPMENT_LABELS[e]).join(', ')
      : 'sans matériel';
    const lines = plan.items
      .slice(0, 6)
      .map((i) => `• ${i.name} — ${i.sets}×${i.reps ?? `${i.timeSeconds ?? 0} s`}`);
    return {
      plan,
      text:
        `Voici une séance « ${FORMAT_LABELS[format]} » de ~${plan.estimatedMinutes} min, construite avec ton profil (${materialText}) :\n` +
        lines.join('\n') +
        (plan.items.length > 6 ? `\n… et ${plan.items.length - 6} autre(s) exercice(s).` : '') +
        '\nTu peux la lancer directement, et remplacer n’importe quel exercice en cours de séance.',
    };
  }

  if (/remplace|alternativ|pas d.halt|pas de mat[ée]riel|je n'ai pas/.test(text)) {
    const mentioned = findByString(text)[0];
    if (mentioned) {
      const pool = profile
        ? EXERCISES.filter(
            (e) =>
              e.slug !== mentioned.slug &&
              (e.category === mentioned.category || e.type === mentioned.type) &&
              e.equipment.some((eq) => eq === 'none' || profile.equipment.includes(eq)),
          ).slice(0, 3)
        : EXERCISES.filter(
            (e) =>
              e.slug !== mentioned.slug &&
              (e.category === mentioned.category || e.type === mentioned.type) &&
              e.equipment.includes('none'),
          ).slice(0, 3);
      if (pool.length) {
        return {
          text:
            `Alternatives à « ${mentioned.name} » compatibles avec ton matériel :\n` +
            pool.map((a) => `• ${a.name} (difficulté ${a.difficulty}/5)`).join('\n') +
            '\nTu peux aussi remplacer un exercice en un tap pendant la séance.',
        };
      }
    }
    if (profile?.equipment.every((e) => e === 'none')) {
      return {
        text: 'Ton profil indique "aucun matériel" : le générateur ne te propose déjà que des exercices au poids du corps. Tu peux le modifier dans le questionnaire à tout moment.',
      };
    }
    return {
      text: 'Dis-moi quel exercice remplacer (ex. « remplace le curl biceps, je n’ai pas d’haltères ») et je propose des alternatives réellement compatibles avec ton matériel.',
    };
  }

  if (/progression|progrès|statistique|^stats|analyse ma progression/.test(text)) {
        const stats = computeStats();
    const xp = levelFromXp(totalXp());
    const last = stats.total[0];
    return {
      text:
        'Voici tes chiffres réels :\n' +
        `• Séances terminées : ${stats.total.length} (dont ${stats.week.workouts} cette semaine)\n` +
        `• Minutes cette semaine : ${stats.week.totalMinutes}\n` +
        `• Série de jours consécutifs : ${stats.streakDays}\n` +
        `• Niveau ${xp.level} — progression ${Math.round(xp.levelProgress * 100)} % vers le niveau suivant\n` +
        (last
          ? `• Dernière séance : « ${last.label} » (${last.exercises.length} exercices, ${Math.round(last.durationSeconds / 60)} min).`
          : '• Aucune séance enregistrée — une première séance courte est un excellent départ.'),
    };
  }

  const exercise = findByString(text)[0];
  if (/comment|explique|technique|correctement|améliorer|progresser/.test(text) && exercise) {
    return {
      text:
        `« ${exercise.name} » — difficulté ${exercise.difficulty}/5.\n` +
        exercise.cues.map((c) => `• ${c}`).join('\n') +
        (exercise.mistakes.length
          ? `\nErreurs fréquentes :\n${exercise.mistakes.map((m) => `• ${m}`).join('\n')}`
          : '') +
        (exercise.harder ? `\nPour progresser : ${exercise.harder}.` : '') +
        '\n\nDouleur vive = stop, et avis médical si elle persiste. Je ne remplace pas un professionnel de santé.',
    };
  }

  if (/récup|sommeil|repos/.test(text)) {
    return {
      text:
        "La récupération fait partie de l'entraînement : au moins un jour de repos entre deux séances intenses sur les mêmes groupes musculaires, un sommeil régulier, de l'hydratation. " +
        "Le moteur évite déjà de re-proposer les mêmes groupes deux jours de suite.",
    };
  }

  return {
    text:
      'Je peux :\n' +
      '• générer une séance adaptée à ton profil et ton matériel (« propose-moi une séance de 30 minutes sans matériel ») ;\n' +
      '• expliquer la technique d’un exercice (« comment faire des pompes ? ») ;\n' +
      '• proposer des remplacements (« remplace le curl, je n’ai pas d’haltères ») ;\n' +
      '• analyser ta progression réelle (« analyse ma progression »).\n\n' +
      'Je m’appuie uniquement sur tes données locales — je ne remplace ni un médecin, ni un coach humain.',
  };
}
