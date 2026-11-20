// Tests du moteur géométrique : critères non mesurés exclus, score /100 = 5×/20,
// aucun score pour une vidéo inexploitable.

import { analyzeExercise, type ExerciseKey } from '../src/features/pose/analyzers';
import type { Landmark, PoseFrame } from '../src/features/pose/geometry';

let rnd = 12345;
function jitter(scale = 0.01): number {
  rnd = (rnd * 1103515245 + 12345) % 2147483648;
  return ((rnd / 2147483648) - 0.5) * 2 * scale;
}

function squatFrames(count: number, depthDeg = 85): PoseFrame[] {
  const frames: PoseFrame[] = [];
  for (let i = 0; i < count; i += 1) {
    const phase = (Math.sin((i / count) * Math.PI * 4) + 1) / 2; // oscille 2 reps
    const kneeDeg = 175 - phase * (175 - depthDeg);
    const kx = 0.5;
    const ky = 0.7 - phase * 0.12;
    const lm: Record<string, Landmark> = {
      left_shoulder: { x: 0.5 + jitter(), y: 0.3, visibility: 0.9 },
      right_shoulder: { x: 0.52 + jitter(), y: 0.3, visibility: 0.9 },
      left_hip: { x: 0.5 + jitter(), y: 0.55, visibility: 0.9 },
      right_hip: { x: 0.52 + jitter(), y: 0.55, visibility: 0.9 },
      left_knee: { x: kx, y: ky, visibility: 0.9 },
      left_ankle: { x: kx, y: 0.92, visibility: 0.9 },
      left_elbow: { x: 0.45, y: 0.35, visibility: 0.9 },
      left_wrist: { x: 0.44, y: 0.42, visibility: 0.9 },
    };
    frames.push({ landmarks: lm });
  }
  return frames;
}

describe('analyzeExercise', () => {
  it('refuse une vidéo trop courte, sans score', () => {
    const r = analyzeExercise('squat', squatFrames(8));
    expect(r.score20).toBeNull();
    expect(r.score100).toBeNull();
    expect(r.message).toBeTruthy();
  });

  it('sans pose détectée, aucun score et un message explicite', () => {
    const frames = Array.from({ length: 30 }, () => ({ landmarks: null }) as PoseFrame);
    const r = analyzeExercise('squat', frames);
    expect(r.score20).toBeNull();
    expect(r.message).toContain("pas");
  });

  it('évalue un squat visible : /20 et /100 proportionnels, reps détectées', () => {
    const r = analyzeExercise('squat', squatFrames(60));
    expect(r.score20).not.toBeNull();
    expect(r.score100).toBe(Math.round((r.score20 ?? 0) * 5));
    expect(r.reps).toBeGreaterThan(0);
    expect(r.confidence).toBeGreaterThan(0);
  });

  it('les critères non mesurés sont marqués non mesurés, pas pénalisés', () => {
    const r = analyzeExercise('squat', squatFrames(60));
    for (const c of r.criteria) {
      if (c.value === null) expect(c.ok).toBe(true);
      expect(Number.isFinite(c.value ?? 0)).toBe(true);
    }
  });
});
