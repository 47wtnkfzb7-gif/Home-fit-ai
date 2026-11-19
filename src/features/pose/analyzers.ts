// Analyseurs de technique par exercice.
// Chaque critère n'est évalué QUE s'il est géométriquement observable dans la
// séquence. Un critère non mesurable est noté `not_measured` et retiré du
// calcul — l'utilisateur n'est jamais pénalisé pour de l'invisible.  Le score
// sur 100 est exactement 5× le score sur 20.

import { angleDeg, median, minMax, stdDev, type PoseFrame } from './geometry';

export interface Criterion {
  label: string;
  value: number | null; // null = non mesuré
  ok: boolean;
  advice?: string;
}

export interface AnalysisResult {
  score20: number | null;
  score100: number | null;
  confidence: number; // 0..1
  positives: string[];
  errors: string[];
  advice: string[];
  criteria: Criterion[];
  framesDetected: number;
  framesTotal: number;
  reps: number;
  message: string;
}

export type ExerciseKey =
  | 'pushup'
  | 'squat'
  | 'lunge'
  | 'plank'
  | 'biceps-curl'
  | 'shoulder-press'
  | 'pullup'
  | 'hip-thrust'
  | 'crunch'
  | 'burpee';

export interface Snapshots {
  elbowAngle: number[];
  kneeAngle: number[];
  hipAngle: number[];
  shoulderAngle: number[];
  trunkInclination: number[];
  bodyLength: number[]; // taille apparente (m franchi) pour détecter zoom/luminosité
}

export function emptySnapshots(): Snapshots {
  return {
    elbowAngle: [],
    kneeAngle: [],
    hipAngle: [],
    shoulderAngle: [],
    trunkInclination: [],
    bodyLength: [],
  };
}

function get(frame: PoseFrame, key: string) {
  return frame.landmarks?.[key] ?? null;
}

export function collectSnapshots(frames: PoseFrame[]): Snapshots {
  const s = emptySnapshots();
  for (const f of frames) {
    if (!f.landmarks) continue;
    const vis = (key: string) => get(f, key) !== null && (get(f, key)?.visibility ?? 1) > 0.35;
    const needed = ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'];
    if (!needed.every(vis)) continue;

    const sh = { x: (get(f, 'left_shoulder')!.x + get(f, 'right_shoulder')!.x) / 2, y: (get(f, 'left_shoulder')!.y + get(f, 'right_shoulder')!.y) / 2 };
    const hip = { x: (get(f, 'left_hip')!.x + get(f, 'right_hip')!.x) / 2, y: (get(f, 'left_hip')!.y + get(f, 'right_hip')!.y) / 2 };

    s.hipAngle.push(angleDeg(get(f, 'left_shoulder')!, get(f, 'left_hip')!, get(f, 'left_knee')!));
    s.kneeAngle.push(angleDeg(get(f, 'left_hip')!, get(f, 'left_knee')!, get(f, 'left_ankle')!));
    s.trunkInclination.push(Math.abs(sh.x - hip.x));
    s.bodyLength.push(Math.abs(get(f, 'left_ankle')!.y - sh.y));

    const elbowL = get(f, 'left_elbow');
    if (elbowL && get(f, 'left_wrist') && vis('left_wrist')) {
      s.elbowAngle.push(angleDeg(get(f, 'left_shoulder')!, elbowL, get(f, 'left_wrist')!));
    }
    const shoulder = { x: sh.x, y: sh.y };
    if (get(f, 'left_elbow') && get(f, 'left_wrist')) {
      s.shoulderAngle.push(
        angleDeg(hip, shoulder, get(f, 'left_wrist')!),
      );
    }
  }
  return s;
}

// Détection de répétitions : basée sur l'oscillation régulière d'une signal.
function countReps(values: number[], threshold: number = 0.25): number {
  if (values.length < 6) return 0;
  const { min, max, range } = minMax(values);
  if (range < threshold) return 0; // pas d'oscillation exploitable
  const mid = (min + max) / 2;
  let reps = 0;
  let state = values[0] < mid ? 'low' : 'high';
  for (let i = 1; i < values.length; i++) {
    if (state === 'low' && values[i] > mid + range * 0.25) {
      state = 'high';
      reps += 1;
    } else if (state === 'high' && values[i] < mid - range * 0.25) {
      state = 'low';
    }
  }
  return reps;
}

export function analyzeExercise(
  exercise: ExerciseKey,
  frames: PoseFrame[],
): AnalysisResult {
  const framesTotal = frames.length;
  const withPose = frames.filter((f) => f.landmarks !== null).length;
  const detectRate = framesTotal ? withPose / framesTotal : 0;

  const base: AnalysisResult = {
    score20: null,
    score100: null,
    confidence: detectRate * Math.min(1, framesTotal / 40),
    positives: [],
    errors: [],
    advice: [],
    criteria: [],
    framesDetected: withPose,
    framesTotal,
    reps: 0,
    message: '',
  };

  if (framesTotal < 12) {
    return { ...base, message: 'Vidéo trop courte pour une analyse fiable (12 frames minimum).' };
  }
  if (detectRate < 0.5) {
    return {
      ...base,
      message:
        "L'analyse n'est pas fiable : la pose n'a pas été détectée sur assez d'images (angle de caméra, luminosité ou distance). Filme-toi de côté, dans un bon éclairage, corps entier visible.",
    };
  }

  const s = collectSnapshots(frames);
  const criteria: Criterion[] = [];

  function add(label: string, values: number[], ok: boolean, advice?: string) {
    if (!values.length) {
      criteria.push({ label, value: null, ok: true, advice: undefined });
      return;
    }
    criteria.push({ label, value: median(values), ok, advice });
  }

  let reps = 0;
  switch (exercise) {
    case 'squat': {
      reps = countReps(s.kneeAngle);
      const depth = minMax(s.kneeAngle);
      criteria.push({ label: 'Profondeur (flexion genou)', value: depth.min, ok: depth.min <= 95, advice: 'Descends plus bas (cuisses ≈ parallèles au sol) pour une amplitude complète.' });
      const trunk = s.trunkInclination.map(Math.abs);
      const trunkOk = trunk.length ? median(trunk) < 0.35 : true;
      criteria.push({ label: 'Franchissement du tronc', value: trunkOk ? 0 : 1, ok: trunkOk, advice: 'Redresse un peu le buste : la poitrine doit rester fière.' });
      criteria.push({ label: 'Stabilité (variance angulaire)', value: stdDev(s.kneeAngle), ok: stdDev(s.kneeAngle) < 15, advice: 'Ralentis la descente : mouvement régulier, sans à-coups.' });
      break;
    }
    case 'pushup': {
      reps = countReps(s.elbowAngle);
      const elbow = minMax(s.elbowAngle);
      criteria.push({ label: 'Amplitude coudes', value: elbow.range, ok: elbow.range >= 40, advice: 'Descends plus bas pour une vraie amplitude (~90° de coude).' });
      const sag = Math.max(...s.trunkInclination.map(Math.abs), 0);
      criteria.push({ label: 'Alignement du corps', value: sag, ok: sag < 0.12, advice: 'Rentre le bassin : le corps forme une planche rigide.' });
      break;
    }
    case 'plank': {
      const sag = s.trunkInclination.map(Math.abs);
      const sagOk = sag.length ? median(sag) < 0.1 : true;
      criteria.push({ label: 'Alignement bassin', value: sag.length ? median(sag) : null, ok: sagOk, advice: 'Bassin neutre : ni trop haut, ni trop bas.' });
      break;
    }
    case 'biceps-curl': {
      reps = countReps(s.elbowAngle);
      const elbow = minMax(s.elbowAngle);
      criteria.push({ label: 'Amplitude du curl', value: elbow.range, ok: elbow.range >= 80, advice: 'Fléchis plus complètement, coude fixe le long du corps.' });
      break;
    }
    case 'lunge': {
      reps = countReps(s.kneeAngle);
      const depth = minMax(s.kneeAngle);
      criteria.push({ label: 'Amplitude genou (répét.)', value: depth.min, ok: depth.min <= 110, advice: 'Descends plus bas — genou arrière proche du sol.' });
      break;
    }
    case 'hip-thrust': {
      const top = s.hipAngle.length ? Math.max(...s.hipAngle) : 0;
      criteria.push({ label: 'Extension de hanche en haut', value: top, ok: top >= 170, advice: 'Viens bloquer en haut (fessiers serrés, dos neutre).' });
      break;
    }
    default:
      // Critères génériques : stabilité + régularité, toujours observables.
      reps = countReps(s.elbowAngle.length ? s.elbowAngle : s.kneeAngle.length ? s.kneeAngle : s.hipAngle);
      criteria.push({
        label: 'Régularité du mouvement',
        value: stdDev(s.elbowAngle.length ? s.elbowAngle : s.hipAngle),
        ok: stdDev(s.elbowAngle.length ? s.elbowAngle : s.hipAngle) < 20,
        advice: 'Garde un rythme régulier — contrôle plutôt que vitesse.',
      });
      break;
  }

  const measurable = criteria.filter((c) => c.value !== null);
  const notMeasured = criteria.filter((c) => c.value === null);
  if (!measurable.length) {
    return { ...base, message: 'Aucun critère observable dans cette vidéo : pas de note attribuée.' };
  }

  const okCount = measurable.filter((c) => c.ok).length;
  // Score : base 12/20 + 8 × proportion de critères valides ; la note sur 100 = 5× score20.
  const raw20 = 12 + 8 * (okCount / measurable.length);
  const score20 = Math.round(Math.min(20, Math.max(0, raw20)) / 0.2) * 0.2;

  return {
    score20,
    score100: Math.round(score20 * 5),
    confidence: Math.min(1, detectRate * Math.min(1, framesTotal / 40)),
    positives: measurable.filter((c) => c.ok).map((c) => c.label),
    errors: measurable.filter((c) => !c.ok).map((c) => c.label),
    advice: measurable.filter((c) => !c.ok && c.advice).map((c) => c.advice!),
    criteria: [...measurable, ...notMeasured.map((c) => ({ ...c, advice: `Non mesurable dans cette vidéo — non comptabilisé.` }))],
    framesDetected: withPose,
    framesTotal,
    reps,
    message: '',
  };
}
