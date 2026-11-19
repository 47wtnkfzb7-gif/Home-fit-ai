// Géométrie du corps à partir des landmarks de pose (33 points, style ML Kit /
// MediaPipe). Toutes les mesures sont des angles 2D explicites, calculées à
// partir de positions réellement détectées — jamais devinées.

export interface Landmark {
  x: number; // 0..1 (normalisé image)
  y: number;
  z?: number;
  visibility?: number; // 0..1
}

export interface PoseFrame {
  landmarks: Record<string, Landmark> | null; // null = aucune pose détectée
}

export function angleDeg(a: Landmark, b: Landmark, c: Landmark): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magA = Math.hypot(abx, aby);
  const magC = Math.hypot(cbx, cby);
  if (magA === 0 || magC === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / (magA * magC)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);
}

export function minMax(values: number[]): { min: number; max: number; range: number } {
  if (!values.length) return { min: 0, max: 0, range: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max, range: max - min };
}
