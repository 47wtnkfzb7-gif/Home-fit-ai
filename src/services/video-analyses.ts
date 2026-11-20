// Historique des analyses vidéo (résultats réels uniquement).

import { getDb, newId } from './db';
import type { Criterion } from '@/features/pose/analyzers';

export interface VideoAnalysisRecord {
  id: string;
  exerciseSlug: string;
  createdAt: string;
  score20: number | null;
  score100: number | null;
  confidence: number;
  details: {
    positives: string[];
    errors: string[];
    advice: string[];
    criteria: Criterion[];
    framesDetected: number;
    framesTotal: number;
    reps: number;
    message: string;
  };
}

interface VideoRow {
  id: string;
  exercise_slug: string;
  created_at: string;
  score20: number | null;
  score100: number | null;
  confidence: number;
  details_json: string;
}

function toRecord(row: VideoRow): VideoAnalysisRecord {
  return {
    id: row.id,
    exerciseSlug: row.exercise_slug,
    createdAt: row.created_at,
    score20: row.score20,
    score100: row.score100,
    confidence: row.confidence,
    details: JSON.parse(row.details_json),
  };
}

export function saveVideoAnalysis(a: Omit<VideoAnalysisRecord, 'id' | 'createdAt'>): VideoAnalysisRecord {
  const record: VideoAnalysisRecord = {
    ...a,
    id: newId(),
    createdAt: new Date().toISOString(),
  };
  getDb().runSync(
    `INSERT INTO video_analyses (id, exercise_slug, created_at, score20, score100, confidence, details_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.exerciseSlug,
      record.createdAt,
      record.score20,
      record.score100,
      record.confidence,
      JSON.stringify(record.details),
    ],
  );
  return record;
}

export function listVideoAnalyses(): VideoAnalysisRecord[] {
  return getDb()
    .getAllSync<VideoRow>(
      'SELECT * FROM video_analyses ORDER BY created_at DESC LIMIT 100',
      [],
    )
    .map(toRecord);
}
