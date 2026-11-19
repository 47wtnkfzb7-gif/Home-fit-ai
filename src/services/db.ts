// HOMEFIT AI — couche de persistance locale (SQLite)
// Toutes les données utilisateur vivent ici, sans serveur et sans compte.

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('homefit.db');
    db.execSync(`PRAGMA journal_mode = WAL;`);
    db.execSync(`
      CREATE TABLE IF NOT EXISTS kv (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY NOT NULL,
        label TEXT NOT NULL,
        format TEXT NOT NULL,
        started_at TEXT NOT NULL,
        finished_at TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        exercises_json TEXT NOT NULL,
        xp_earned INTEGER NOT NULL DEFAULT 0,
        technique_score INTEGER
      );
      CREATE TABLE IF NOT EXISTS xp_events (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS favorites (
        slug TEXT PRIMARY KEY NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS journal (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL,
        meal TEXT NOT NULL,
        name TEXT NOT NULL,
        protein REAL,
        carbs REAL,
        fat REAL,
        qty_g REAL,
        source TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS video_analyses (
        id TEXT PRIMARY KEY NOT NULL,
        exercise_slug TEXT NOT NULL,
        created_at TEXT NOT NULL,
        score20 REAL,
        score100 REAL,
        confidence REAL NOT NULL,
        details_json TEXT NOT NULL
      );
    `);
  }
  return db;
}

export function getJson<T>(key: string): T | null {
  const row = getDb().getFirstSync<{ value: string }>(
    'SELECT value FROM kv WHERE key = ?',
    [key],
  );
  if (!row) return null;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export function setJson(key: string, value: unknown): void {
  getDb().runSync('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', [
    key,
    JSON.stringify(value),
  ]);
}

export function removeKey(key: string): void {
  getDb().runSync('DELETE FROM kv WHERE key = ?', [key]);
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function deleteAllUserData(): void {
  const d = getDb();
  d.execSync(
    'DELETE FROM kv; DELETE FROM workouts; DELETE FROM xp_events; DELETE FROM favorites; DELETE FROM journal; DELETE FROM video_analyses;',
  );
}
