// Bibliothèque d'exercices HOMEFIT AI — 100+ exercices réels.
// Chaque fiche : muscles ciblés, matériel, difficulté, consignes,
// erreurs fréquentes et variantes plus facile / plus difficile.

import type { Equipment, MuscleGroup } from '@/features/profile/types';

export type ExerciseType = 'strength' | 'mobility' | 'warmup' | 'core' | 'cardio';

export interface Exercise {
  slug: string;
  name: string;
  category: MuscleGroup;
  muscles: string[];
  equipment: Equipment[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  type: ExerciseType;
  cues: string[];
  mistakes: string[];
  easier?: string;
  harder?: string;
  unilateral?: boolean;
}

export const EQUIP_SUFFIX: Partial<Record<Equipment, string>> = {
  dumbbells: 'aux haltères',
  bands: 'avec élastique',
  kettlebell: 'avec kettlebell',
  barbell: 'à la barre',
  bench: 'sur banc',
  pullupbar: 'à la barre de traction',
  other: 'variante',
};

interface Template {
  slug: string;
  name: string;
  category: MuscleGroup;
  muscles: string[];
  equipment: Equipment[];
  type: ExerciseType;
  difficulty: number; // base (poids du corps), ajusté par matériel
  cues: string[];
  mistakes: string[];
  easier?: string;
  harder?: string;
  unilateral?: boolean;
}

const TEMPLATES: Template[] = [
  // ─── Pectoraux ─────────────────────────────────────────────
  {
    slug: 'pushup', name: 'Pompes', category: 'chest',
    muscles: ['Pectoraux', 'Triceps', 'Épaules'],
    equipment: ['none'], type: 'strength', difficulty: 3,
    cues: [
      'Mains un peu plus larges que les épaules.',
      'Tête, hanches et talons alignés.',
      'Descends jusqu’à ce que la poitrine frôle le sol, coudes à environ 45°.',
    ],
    mistakes: ['Bassin qui s’affaisse.', 'Coudes écartés à 90°.', 'Amplitude partielle.'],
    easier: 'incline-pushup', harder: 'decline-pushup',
  },
  {
    slug: 'incline-pushup', name: 'Pompes inclinées', category: 'chest',
    muscles: ['Pectoraux', 'Triceps'],
    equipment: ['none'], type: 'strength', difficulty: 2,
    cues: ['Mains sur une surface stable et surélevée.', 'Corps gainé en ligne droite.', 'Amplitude complète et lente.'],
    mistakes: ['Support instable.', 'Hanches qui montent.'],
    harder: 'pushup',
  },
  {
    slug: 'decline-pushup', name: 'Pompes déclinées', category: 'chest',
    muscles: ['Haut des pectoraux', 'Épaules', 'Triceps'],
    equipment: ['none'], type: 'strength', difficulty: 4,
    cues: ['Pieds surélevés, mains au sol.', 'Gainage constant.', '2 secondes à la descente.'],
    mistakes: ['Creuser le bas du dos.', 'Vitesse excessive.'],
    easier: 'pushup',
  },
  {
    slug: 'floor-press', name: 'Développé au sol', category: 'chest',
    muscles: ['Pectoraux', 'Triceps'],
    equipment: ['dumbbells', 'barbell'], type: 'strength', difficulty: 3,
    cues: ['Allongé au sol, coudes à 45° du buste.', 'Pousse sans verrouiller violemment.', 'Poignets alignés.'],
    mistakes: ['Rebondir avec les bras au sol.', 'Écarter les coudes à 90°.'],
  },
  {
    slug: 'chest-flyes', name: 'Écartés pecs', category: 'chest',
    muscles: ['Pectoraux', 'Épaules'],
    equipment: ['dumbbells', 'bands'], type: 'strength', difficulty: 3,
    cues: ['Coudes légèrement fléchis et fixes.', 'Ouvre lentement jusqu’à un étirement confortable.', 'Ramène en « étreignant » la charge.'],
    mistakes: ['Étirement forcé.', 'Transformer en développé.'],
  },

  // ─── Dos ───────────────────────────────────────────────────
  {
    slug: 'superman', name: 'Superman', category: 'back',
    muscles: ['Lombaires', 'Spinnaux', 'Fessiers'],
    equipment: ['none'], type: 'core', difficulty: 2,
    cues: ['Allongé sur le ventre, bras tendus devant.', 'Lève poitrine et jambes doucement.', 'Regard vers le sol, nuque neutre.'],
    mistakes: ['Tirer la tête en arrière.', 'Montée brutale.'],
  },
  {
    slug: 'inverted-row', name: 'Rowing inversé', category: 'back',
    muscles: ['Dos', 'Biceps', 'Arrière d’épaule'],
    equipment: ['pullupbar', 'bench'], type: 'strength', difficulty: 3,
    cues: ['Corps en planche inclinée sous la barre.', 'Tire la poitrine vers la barre.', 'Serre les omoplates.'],
    mistakes: ['Tirer sans serrer les omoplates.', 'Bassin qui descend.'],
    easier: 'band-row', harder: 'pullup',
  },
  {
    slug: 'band-row', name: 'Rowing élastique', category: 'back',
    muscles: ['Dos', 'Biceps'],
    equipment: ['bands'], type: 'strength', difficulty: 2,
    cues: ['Élastique à hauteur de poitrine.', 'Coudes tirés le long du corps.', 'Serre les omoplates 1 seconde.'],
    mistakes: ['Hausser les épaules.', 'Se balancer.'],
  },
  {
    slug: 'dumbbell-row', name: 'Rowing haltère', category: 'back',
    muscles: ['Grand dorsal', 'Rhomboïdes', 'Biceps'],
    equipment: ['dumbbells', 'kettlebell'], type: 'strength', difficulty: 3,
    cues: ['Buste penché, dos plat.', 'Tire vers la hanche.', 'Descente contrôlée.'],
    mistakes: ['Dos arrondi.', 'Rotation du buste.'],
  },
  {
    slug: 'pullup', name: 'Tractions', category: 'back',
    muscles: ['Grand dorsal', 'Biceps'],
    equipment: ['pullupbar'], type: 'strength', difficulty: 5,
    cues: ['Prise plus large que les épaules.', 'Démarre en serrant les omoplates.', 'Menton au-dessus de la barre, descente complète.'],
    mistakes: ['Se balancer.', 'Amplitude partielle.'],
    easier: 'inverted-row',
  },
  {
    slug: 'barbell-row', name: 'Rowing barre', category: 'back',
    muscles: ['Dos', 'Biceps', 'Lombaires'],
    equipment: ['barbell'], type: 'strength', difficulty: 4,
    cues: ['Buste à 45°, dos neutre.', 'Barre vers le bas-ventre.', 'Coudes proches du corps.'],
    mistakes: ['Dos arrondi.', 'Trop lourd trop tôt.'],
  },
  {
    slug: 'bird-dog', name: 'Bird dog', category: 'back',
    muscles: ['Spinnaux', 'Fessiers', 'Gainage'],
    equipment: ['none'], type: 'core', difficulty: 1,
    cues: ['À quatre pattes, dos plat.', 'Tends bras et jambe opposés.', '3 secondes immobile avant de changer.'],
    mistakes: ['Bassin qui bascule.', 'Précipitation.'],
  },

  // ─── Épaules ───────────────────────────────────────────────
  {
    slug: 'shoulder-taps', name: 'Taps d’épaules', category: 'shoulders',
    muscles: ['Épaules', 'Gainage'],
    equipment: ['none'], type: 'core', difficulty: 2,
    cues: ['Planche haute stable.', 'Touche l’épaule opposée sans bouger les hanches.', 'Respiration calme.'],
    mistakes: ['Bassin qui oscille.', 'Vitesse excessive.'],
  },
  {
    slug: 'shoulder-press', name: 'Développé épaules', category: 'shoulders',
    muscles: ['Épaules', 'Triceps'],
    equipment: ['dumbbells', 'kettlebell', 'barbell', 'bands'], type: 'strength', difficulty: 3,
    cues: ['Debout, gainé.', 'Pousse au-dessus de la tête.', 'Descend jusqu’à hauteur des oreilles.'],
    mistakes: ['Cambrer le bas du dos.', 'Verrouillage violent.'],
  },
  {
    slug: 'pike-pushup', name: 'Pompes piquées', category: 'shoulders',
    muscles: ['Épaules', 'Triceps'],
    equipment: ['none'], type: 'strength', difficulty: 4,
    cues: ['Corps en V inversé.', 'La tête descend entre les mains.', 'Coudes vers le sol.'],
    mistakes: ['Descendre la poitrine.', 'Hanches trop basses.'],
  },
  {
    slug: 'lateral-raise', name: 'Élévations latérales', category: 'shoulders',
    muscles: ['Deltoïdes latéraux'],
    equipment: ['dumbbells', 'bands', 'kettlebell'], type: 'strength', difficulty: 2,
    cues: ['Coudes légèrement fléchis.', 'Monte à l’horizontale.', 'Descente 2-3 secondes.'],
    mistakes: ['Hausser les trapèzes.', 'Charge trop lourde.'],
  },
  {
    slug: 'pike-hold', name: 'Gainage piqué', category: 'shoulders',
    muscles: ['Épaules', 'Gainage'],
    equipment: ['none'], type: 'core', difficulty: 3,
    cues: ['Position V inversé tenue.', 'Pousse le sol loin.', 'Respire sans bloquer.'],
    mistakes: ['Épaules effondrées.'],
  },

  // ─── Bras ──────────────────────────────────────────────────
  {
    slug: 'biceps-curl', name: 'Curl biceps', category: 'arms',
    muscles: ['Biceps'],
    equipment: ['dumbbells', 'bands', 'barbell', 'kettlebell'], type: 'strength', difficulty: 2,
    cues: ['Coudes calés le long du corps.', 'Fléchis sans balancer le buste.', 'Descente 2-3 secondes.'],
    mistakes: ['Balancement du buste.', 'Amplitude courte.'],
  },
  {
    slug: 'triceps-dips', name: 'Dips triceps', category: 'arms',
    muscles: ['Triceps', 'Épaules'],
    equipment: ['bench', 'none'], type: 'strength', difficulty: 3,
    cues: ['Hanches proches du support.', 'Coudes vers l’arrière.', 'Descend jusqu’à 90° de coude max.'],
    mistakes: ['Descendre trop bas.', 'Épaules qui montent.'],
  },
  {
    slug: 'diamond-pushup', name: 'Pompes diamant', category: 'arms',
    muscles: ['Triceps', 'Pectoraux'],
    equipment: ['none'], type: 'strength', difficulty: 4,
    cues: ['Mains jointes sous la poitrine.', 'Coudes près du corps.', 'Amplitude complète.'],
    mistakes: ['Hanches qui tombent.'],
    easier: 'pushup',
  },
  {
    slug: 'band-triceps-extension', name: 'Extension triceps élastique', category: 'arms',
    muscles: ['Triceps'],
    equipment: ['bands'], type: 'strength', difficulty: 2,
    cues: ['Coude fixe.', 'Tends vers le haut ou devant.', 'Contrôle le retour.'],
    mistakes: ['Bouger le coude.', 'Momentum.'],
  },

  // ─── Jambes ────────────────────────────────────────────────
  {
    slug: 'squat', name: 'Squats', category: 'legs',
    muscles: ['Quadriceps', 'Fessiers', 'Ischios'],
    equipment: ['none', 'dumbbells', 'kettlebell', 'barbell'], type: 'strength', difficulty: 3,
    cues: ['Pieds largeur d’épaules.', 'Hanches en arrière et descend.', 'Pousse par les talons, dos neutre.'],
    mistakes: ['Genoux qui rentrent.', 'Talons qui se lèvent.'],
    easier: 'box-squat', harder: 'reverse-lunge',
  },
  {
    slug: 'box-squat', name: 'Squats assis', category: 'legs',
    muscles: ['Quadriceps', 'Fessiers'],
    equipment: ['none', 'bench'], type: 'strength', difficulty: 2,
    cues: ['Descend toucher un support stable.', 'Relève avec contrôle.', 'Torse droit.'],
    mistakes: ['S’affaisser sur le support.'],
    harder: 'squat',
  },
  {
    slug: 'lunge', name: 'Fentes avant', category: 'legs',
    muscles: ['Quadriceps', 'Fessiers', 'Équilibre'],
    equipment: ['none', 'dumbbells', 'kettlebell'], type: 'strength', difficulty: 3, unilateral: true,
    cues: ['Grand pas en avant.', 'Genou arrière proche du sol.', 'Buste droit.'],
    mistakes: ['Genou avant trop en avant.', 'Pas trop court.'],
  },
  {
    slug: 'reverse-lunge', name: 'Fentes arrière', category: 'legs',
    muscles: ['Quadriceps', 'Fessiers'],
    equipment: ['none', 'dumbbells', 'kettlebell'], type: 'strength', difficulty: 3, unilateral: true,
    cues: ['Pas arrière contrôlé.', 'Genou avant au-dessus de la cheville.', 'Remonte par le talon.'],
    mistakes: ['Buste penché.', 'Momentum.'],
  },
  {
    slug: 'wall-sit', name: 'Chaise murale', category: 'legs',
    muscles: ['Quadriceps', 'Gainage'],
    equipment: ['none'], type: 'strength', difficulty: 2,
    cues: ['Dos plaqué au mur, cuisses horizontales.', 'Genoux à 90°.', 'Respire normalement.'],
    mistakes: ['Appuyer les mains sur les cuisses.'],
  },
  {
    slug: 'calf-raise', name: 'Élévations mollets', category: 'legs',
    muscles: ['Mollets'],
    equipment: ['none', 'dumbbells', 'kettlebell'], type: 'strength', difficulty: 1,
    cues: ['Monte sur la pointe lentement.', 'Marque 1 seconde en haut.', 'Descente contrôlée.'],
    mistakes: ['Rebondir.', 'Amplitude réduite.'],
  },
  {
    slug: 'romanian-deadlift', name: 'Soulevé de terre roumain', category: 'legs',
    muscles: ['Ischios', 'Fessiers', 'Lombaires'],
    equipment: ['dumbbells', 'kettlebell', 'barbell', 'bands'], type: 'strength', difficulty: 4,
    cues: ['Charges proches des jambes.', 'Hanches en arrière, genoux légèrement fléchis.', 'Remonte en serrant les fessiers.'],
    mistakes: ['Dos arrondi.', 'Transformer en squat.'],
  },

  // ─── Fessiers ──────────────────────────────────────────────
  {
    slug: 'hip-thrust', name: 'Hip thrust', category: 'glutes',
    muscles: ['Fessiers', 'Ischios'],
    equipment: ['none', 'bench', 'dumbbells', 'barbell'], type: 'strength', difficulty: 3,
    cues: ['Haut du dos soutenu (ou au sol).', 'Pousse les hanches vers le plafond.', 'Marque 1-2 secondes en haut.'],
    mistakes: ['Cambrer les lombaires.', 'Pousser avec les orteils.'],
  },
  {
    slug: 'glute-bridge', name: 'Pont fessiers', category: 'glutes',
    muscles: ['Fessiers', 'Ischios'],
    equipment: ['none'], type: 'strength', difficulty: 2,
    cues: ['Allongé, pieds près des fessiers.', 'Lève le bassin en serrant les fessiers.', 'Descente sans tout relâcher.'],
    mistakes: ['Cambrer les lombaires en haut.'],
    harder: 'hip-thrust',
  },

  // ─── Abdominaux / gainage ──────────────────────────────────
  {
    slug: 'plank', name: 'Gainage planche', category: 'abs',
    muscles: ['Gainage profond', 'Épaules'],
    equipment: ['none'], type: 'core', difficulty: 2,
    cues: ['Coudes sous les épaules.', 'Corps aligné, fessiers actifs.', 'Respiration régulière.'],
    mistakes: ['Bassin trop haut ou trop bas.', 'Bloquer la respiration.'],
  },
  {
    slug: 'side-plank', name: 'Planche latérale', category: 'abs',
    muscles: ['Obliques', 'Gainage latéral'],
    equipment: ['none'], type: 'core', difficulty: 3,
    cues: ['Coude sous l’épaule.', 'Hanches hautes et alignées.', 'Genou au sol pour la version facile.'],
    mistakes: ['Bassin qui tombe.'],
  },
  {
    slug: 'crunch', name: 'Crunch', category: 'abs',
    muscles: ['Grands droits'],
    equipment: ['none'], type: 'core', difficulty: 1,
    cues: ['Enroule le buste sans tirer la nuque.', 'Marque 1 seconde en haut.', 'Redescends lentement.'],
    mistakes: ['Tirer la tête avec les mains.', 'Mouvement rapide et sec.'],
  },
  {
    slug: 'dead-bug', name: 'Dead bug', category: 'abs',
    muscles: ['Gainage profond'],
    equipment: ['none'], type: 'core', difficulty: 1,
    cues: ['Dos plaqué au sol.', 'Tends un bras et la jambe opposée lentement.', 'Souffle pendant l’extension.'],
    mistakes: ['Bas du dos qui se décolle.'],
  },
  {
    slug: 'russian-twist', name: 'Russian twist', category: 'abs',
    muscles: ['Obliques'],
    equipment: ['none', 'dumbbells', 'kettlebell'], type: 'core', difficulty: 3,
    cues: ['Buste gainé, incliné à 45°.', 'Tourne depuis les épaules.', 'Amplitude confortable.'],
    mistakes: ['Tordre le cou.', 'Vitesse excessive.'],
  },
  {
    slug: 'mountain-climber', name: 'Mountain climbers', category: 'abs',
    muscles: ['Gainage', 'Hanches'],
    equipment: ['none'], type: 'cardio', difficulty: 2,
    cues: ['Planche haute stable.', 'Genou vers la poitrine en alternance.', 'Hanches basses.'],
    mistakes: ['Bassin qui monte.', 'Épaules derrière les mains.'],
  },
  {
    slug: 'leg-raises', name: 'Relevés de jambes', category: 'abs',
    muscles: ['Abdos bas', 'Iliopsoas'],
    equipment: ['none'], type: 'core', difficulty: 3,
    cues: ['Mains sous le bas du dos pour le soutenir.', 'Jambes tendues ou genoux fléchis.', 'Descend sans toucher le sol.'],
    mistakes: ['Bas du dos qui se creuse.'],
  },

  // ─── Corps entier / cardio ─────────────────────────────────
  {
    slug: 'burpee', name: 'Burpees', category: 'fullbody',
    muscles: ['Corps entier'],
    equipment: ['none'], type: 'cardio', difficulty: 4,
    cues: ['Squat, mains au sol, jambes tendues derrière.', 'Pompe optionnelle puis retour.', 'Gainage maintenu au sol.'],
    mistakes: ['Bas du dos qui s’affaisse.', 'Réception raide.'],
    easier: 'squats-thrust',
  },
  {
    slug: 'squats-thrust', name: 'Squats thrust (sans saut)', category: 'fullbody',
    muscles: ['Corps entier'],
    equipment: ['none'], type: 'cardio', difficulty: 2,
    cues: ['Comme le burpee, mais sans pompe ni saut.', 'Marche les pieds en arrière.', 'Rythme régulier.'],
    mistakes: ['Vouloir aller trop vite.'],
    harder: 'burpee',
  },
  {
    slug: 'jumping-jack', name: 'Jumping jacks', category: 'fullbody',
    muscles: ['Corps entier', 'Cardio'],
    equipment: ['none'], type: 'cardio', difficulty: 1,
    cues: ['Rythme régulier.', 'Réceptions souples.', 'Bras au-dessus de la tête à chaque répétition.'],
    mistakes: ['Genoux bloqués.'],
  },
  {
    slug: 'bear-crawl', name: 'Bear crawl', category: 'fullbody',
    muscles: ['Corps entier', 'Épaules'],
    equipment: ['none'], type: 'strength', difficulty: 3,
    cues: ['Quatre pattes, genoux à 2 cm du sol.', 'Hanches basses et stables.', 'Pas courts et contrôlés.'],
    mistakes: ['Bassin qui monte.'],
  },
  {
    slug: 'skater-jumps', name: 'Sauts de patineur', category: 'fullbody',
    muscles: ['Jambes', 'Équilibre', 'Cardio'],
    equipment: ['none'], type: 'cardio', difficulty: 3, unilateral: true,
    cues: ['Grands bonds latéraux.', 'Réception sur une jambe, genou souple.', 'Bras pour l’équilibre.'],
    mistakes: ['Réception genoux bloqués.'],
  },

  // ─── Échauffement ──────────────────────────────────────────
  {
    slug: 'arm-circles', name: 'Cercles de bras', category: 'shoulders',
    muscles: ['Épaules', 'Mobilité articulaire'],
    equipment: ['none'], type: 'warmup', difficulty: 1,
    cues: ['10 cercles vers l’avant puis l’arrière.', 'Amplitude progressive.'],
    mistakes: ['Aller trop vite.'],
  },
  {
    slug: 'leg-swings', name: 'Balançons de jambe', category: 'legs',
    muscles: ['Hanches', 'Ischios'],
    equipment: ['none'], type: 'warmup', difficulty: 1, unilateral: true,
    cues: ['Appuie-toi au mur.', '10 balancements avant-arrière par jambe.', 'Ne force pas.'],
    mistakes: ['Dos arrondi.'],
  },
  {
    slug: 'hip-circles', name: 'Cercles de hanches', category: 'glutes',
    muscles: ['Hanches', 'Mobilité'],
    equipment: ['none'], type: 'warmup', difficulty: 1,
    cues: ['8 rotations complètes par sens.', 'Ample et lent.'],
    mistakes: ['Vitesse excessive.'],
  },
  {
    slug: 'neck-rolls', name: 'Rotations de nuque', category: 'shoulders',
    muscles: ['Nuque', 'Mobilité'],
    equipment: ['none'], type: 'warmup', difficulty: 1,
    cues: ['Rotations lentes de la tête.', 'Amplitude douce, jamais forcée.'],
    mistakes: ['Forcer l’étirement.'],
  },
  {
    slug: 'jumping-jack-warmup', name: 'Jumping jacks (échauffement)', category: 'fullbody',
    muscles: ['Corps entier'],
    equipment: ['none'], type: 'warmup', difficulty: 1,
    cues: ['45 secondes à rythme modéré.', 'Réveil cardio doux.'],
    mistakes: ['Partir trop vite.'],
  },
  {
    slug: 'torso-twists', name: 'Rotations de buste', category: 'back',
    muscles: ['Colonne', 'Obliques'],
    equipment: ['none'], type: 'warmup', difficulty: 1,
    cues: ['Pieds fixes, hanches stables.', '10 rotations de chaque côté, lentes.'],
    mistakes: ['Forcer avec les bras.'],
  },

  // ─── Mobilité / retour au calme ────────────────────────────
  {
    slug: 'cat-cow', name: 'Chat / vache', category: 'back',
    muscles: ['Colonne', 'Mobilité'],
    equipment: ['none'], type: 'mobility', difficulty: 1,
    cues: ['Enchaîne dos rond / dos creux avec la respiration.', '10 cycles lents.'],
    mistakes: ['Mouvements saccadés.'],
  },
  {
    slug: 'world-greatest-stretch', name: 'Étirement lunge + rotation', category: 'fullbody',
    muscles: ['Hanches', 'Épaules', 'Mobilité'],
    equipment: ['none'], type: 'mobility', difficulty: 2, unilateral: true,
    cues: ['Position de fente, main au sol.', 'Ouvre le bras vers le plafond.', '5 répétitions par côté.'],
    mistakes: ['Aller trop loin trop vite.'],
  },
  {
    slug: 'deep-squat-hold', name: 'Squat profond tenu', category: 'legs',
    muscles: ['Hanches', 'Mobilité'],
    equipment: ['none'], type: 'mobility', difficulty: 2,
    cues: ['30 secondes au plus bas confortable.', 'Coudes écartent doucement les genoux.', 'Talons au sol.'],
    mistakes: ['Forcer au-delà du confort.'],
  },
  {
    slug: 'shoulder-dislocates', name: 'Passe-barre épaules', category: 'shoulders',
    muscles: ['Épaules', 'Mobilité'],
    equipment: ['bands'], type: 'mobility', difficulty: 2,
    cues: ['Prise large, élastique léger.', 'Passe au-dessus de la tête sans douleur.', 'Élargis la prise si besoin.'],
    mistakes: ['Forcer l’amplitude.'],
  },
  {
    slug: 'hamstring-stretch', name: 'Étirement ischios', category: 'legs',
    muscles: ['Ischios', 'Mobilité'],
    equipment: ['none'], type: 'mobility', difficulty: 1, unilateral: true,
    cues: ['Jambe tendue, buste incliné doucement.', '30 secondes par jambe sans rebondir.'],
    mistakes: ['Rebondir.', 'Trop forcer.'],
  },
  {
    slug: 'child-pose', name: 'Posture de l’enfant', category: 'back',
    muscles: ['Colonne', 'Lombaires'],
    equipment: ['none'], type: 'mobility', difficulty: 1,
    cues: ['Genoux écartés, bras tendus devant.', 'Respire profondément 45 secondes.'],
    mistakes: ['Bloquer la respiration.'],
  },
  {
    slug: 'hip-flexor-stretch', name: 'Étirement psoas', category: 'glutes',
    muscles: ['Fléchisseurs de hanche'],
    equipment: ['none'], type: 'mobility', difficulty: 1, unilateral: true,
    cues: ['Genou au sol, buste droit.', 'Pousse doucement les hanches en avant.', '30 secondes par côté.'],
    mistakes: ['Creuser le bas du dos.'],
  },
  {
    slug: 'figure-four', name: 'Étirement piriforme', category: 'glutes',
    muscles: ['Fessiers', 'Hanches'],
    equipment: ['none'], type: 'mobility', difficulty: 1, unilateral: true,
    cues: ['Allongé, cheville sur le genou opposé.', 'Tire doucement la cuisse vers la poitrine.', '30 secondes par côté.'],
    mistakes: ['Tirer trop fort.'],
  },
  {
    slug: 'cobra-stretch', name: 'Étirement cobra', category: 'abs',
    muscles: ['Abdominaux', 'Lombaires'],
    equipment: ['none'], type: 'mobility', difficulty: 1,
    cues: ['Mains sous les épaules, soulève doucement la poitrine.', 'Hanches au sol.', 'Respire calmement 30 secondes.'],
    mistakes: ['Pousser trop haut trop vite.'],
  },

  // ─── Compléments (atteindre 100+ variantes utilisables) ─────
  {
    slug: 'wall-pushup', name: 'Pompes au mur', category: 'chest',
    muscles: ['Pectoraux', 'Triceps'],
    equipment: ['none'], type: 'strength', difficulty: 1,
    cues: ['Mains à hauteur d’épaules contre un mur.', 'Plie les coudes vers le mur.', 'Corps aligné.'],
    mistakes: ['Tête qui avance avant le buste.'],
    harder: 'incline-pushup',
  },
  {
    slug: 'step-up', name: 'Montées sur marche', category: 'legs',
    muscles: ['Quadriceps', 'Fessiers', 'Équilibre'],
    equipment: ['none', 'dumbbells'], type: 'strength', difficulty: 2, unilateral: true,
    cues: ['Marche ou marche stable.', 'Monte sans pousser avec la jambe au sol.', 'Descente contrôlée.'],
    mistakes: ['Rebondir.'],
  },
  {
    slug: 'glute-kickback', name: 'Kickback fessier', category: 'glutes',
    muscles: ['Fessiers', 'Ischios'],
    equipment: ['none', 'bands'], type: 'strength', difficulty: 2, unilateral: true,
    cues: ['À quatre pattes, dos plat.', 'Lève la jambe en serrant les fessiers.', 'Pas jusqu’au dos.'],
    mistakes: ['Cambrer les lombaires.'],
  },
  {
    slug: 'side-leg-raise', name: 'Élévations latérales de hanche', category: 'glutes',
    muscles: ['Fessiers moyens', 'Hanches'],
    equipment: ['none', 'bands'], type: 'strength', difficulty: 1, unilateral: true,
    cues: ['Allongé sur le côté, corps aligné.', 'Lève la jambe sans ouvrir le bassin.', 'Descente lente.'],
    mistakes: ['Bassin qui bascule.'],
  },
  {
    slug: 'clamshell', name: 'Clamshell (coquillage)', category: 'glutes',
    muscles: ['Fessiers moyens', 'Rotateurs de hanche'],
    equipment: ['none', 'bands'], type: 'strength', difficulty: 1, unilateral: true,
    cues: ['Sur le côté, genoux pliés à 45°.', 'Ouvre le genou du haut sans bouger le bassin.', '15 répétitions lentes.'],
    mistakes: ['Basculer le bassin.'],
  },
  {
    slug: 'flutter-kicks', name: 'Flutter kicks', category: 'abs',
    muscles: ['Abdos bas', 'Gainage'],
    equipment: ['none'], type: 'core', difficulty: 3,
    cues: ['Allongé, jambes tendues à 15 cm du sol.', 'Petits battements alternés.', 'Bas du dos plaqué.'],
    mistakes: ['Dos qui creuse.'],
  },
  {
    slug: 'bicycle-crunch', name: 'Crunch bicyclette', category: 'abs',
    muscles: ['Obliques', 'Grands droits'],
    equipment: ['none'], type: 'core', difficulty: 3,
    cues: ['Coude vers genou opposé.', 'Jambes pédalent lentement.', 'Enroule le buste, ne tire pas la nuque.'],
    mistakes: ['Tirer la tête.', 'Vitesse excessive.'],
  },
  {
    slug: 'high-knees', name: 'Montées de genoux', category: 'fullbody',
    muscles: ['Cardio', 'Hanches'],
    equipment: ['none'], type: 'cardio', difficulty: 2,
    cues: ['Sur place, genoux à hauteur de hanche.', 'Réceptions souples.', 'Bras actifs.'],
    mistakes: ['Se pencher en avant.'],
  },
  {
    slug: 'inchworm', name: 'Inchworm (chenille)', category: 'fullbody',
    muscles: ['Ischios', 'Gainage', 'Épaules'],
    equipment: ['none'], type: 'warmup', difficulty: 2,
    cues: ['Mains au sol, marche les mains vers l’avant.', 'Planche brièvement.', 'Ramène les pieds en marchant.'],
    mistakes: ['Bassin qui s’affaisse en planche.'],
  },
  {
    slug: 'ankle-circles', name: 'Cercles de chevilles', category: 'legs',
    muscles: ['Chevilles', 'Mobilité'],
    equipment: ['none'], type: 'warmup', difficulty: 1, unilateral: true,
    cues: ['10 cercles par sens, par pied.', 'Amplitude complète et douce.'],
    mistakes: ['Forcer.'],
  },
  {
    slug: 'wrist-warmup', name: 'Préparation des poignets', category: 'arms',
    muscles: ['Poignets', 'Avant-bras'],
    equipment: ['none'], type: 'warmup', difficulty: 1,
    cues: ['Rotations et flexions douces.', '30 secondes pour chaque main.'],
    mistakes: ['Aller trop vite sur une douleur.'],
  },
  {
    slug: 'scapula-pullup', name: 'Tirage d’omoplates', category: 'back',
    muscles: ['Grand dorsal', 'Trapèzes'],
    equipment: ['pullupbar'], type: 'strength', difficulty: 3,
    cues: ['Suspendu, bras tendus.', 'Tire les omoplates vers le bas sans plier les coudes.', 'Descente contrôlée.'],
    mistakes: ['Se balancer.'],
    harder: 'pullup',
  },
  {
    slug: 'hollow-hold', name: 'Hollow hold', category: 'abs',
    muscles: ['Gainage abdominal profond'],
    equipment: ['none'], type: 'core', difficulty: 4,
    cues: ['Allongé, bras et jambes tendus décollés.', 'Bas du dos plaqué au sol.', 'Commence avec genoux pliés.'],
    mistakes: ['Bas du dos qui creuse.'],
  },
];

export const EXERCISES: Exercise[] = buildLibrary();

function buildLibrary(): Exercise[] {
  const out: Exercise[] = [];
  const slugs = new Set<string>();
  for (const tpl of TEMPLATES) {
    for (const equip of tpl.equipment) {
      const slug =
        equip === 'none' || tpl.equipment.length === 1
          ? tpl.slug
          : `${tpl.slug}-${equip}`;
      if (slugs.has(slug)) continue;
      slugs.add(slug);
      const name = equip === 'none' ? tpl.name : `${tpl.name} ${EQUIP_SUFFIX[equip] ?? ''}`.trim();
      out.push({
        slug,
        name,
        category: tpl.category,
        muscles: tpl.muscles,
        equipment: [equip],
        difficulty: clampDifficulty(equip === 'barbell' ? tpl.difficulty + 1 : tpl.difficulty),
        type: tpl.type,
        cues: tpl.cues,
        mistakes: tpl.mistakes,
        easier: solveRelative(tpl.easier, equip),
        harder: solveRelative(tpl.harder, equip),
        unilateral: tpl.unilateral,
      });
    }
  }
  return out;
}

function clampDifficulty(n: number): 1 | 2 | 3 | 4 | 5 {
  return Math.min(5, Math.max(1, n)) as 1 | 2 | 3 | 4 | 5;
}

function solveRelative(base: string | undefined, equip: Equipment): string | undefined {
  if (!base) return undefined;
  if (equip === 'none') return base;
  // La variante cible existe-t-elle aussi déclinée pour ce matériel ?
  const target = TEMPLATES.find((t) => t.slug === base);
  if (
    target &&
    target.equipment.includes(equip) &&
    target.equipment.length > 1
  )
    return `${base}-${equip}`;
  return base;
}

const BY_SLUG = new Map(EXERCISES.map((e) => [e.slug, e]));

export function getExercise(slug: string): Exercise | undefined {
  return BY_SLUG.get(slug);
}

export function findByString(text: string): Exercise[] {
  const q = text.trim().toLowerCase();
  if (!q) return [];
  return EXERCISES.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.muscles.some((m) => m.toLowerCase().includes(q)) ||
      e.category.includes(q),
  );
}

export const DIFFICULTY_LABELS = ['', 'Très facile', 'Facile', 'Modéré', 'Difficile', 'Expert'] as const;
