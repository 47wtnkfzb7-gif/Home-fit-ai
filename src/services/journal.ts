// Journal alimentaire : persistance SQLite des entrées réellement saisies.

import { getDb, newId } from './db';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD (local)
  meal: string; // breakfast | lunch | snack | dinner
  name: string;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  qtyG: number | null;
  source: string; // manual | off-barcode | photo-guide
  createdAt: string;
}

interface JournalRow {
  id: string;
  date: string;
  meal: string;
  name: string;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  qty_g: number | null;
  source: string;
  created_at: string;
}

function toEntry(row: JournalRow): JournalEntry {
  return {
    id: row.id,
    date: row.date,
    meal: row.meal,
    name: row.name,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    qtyG: row.qty_g,
    source: row.source,
    createdAt: row.created_at,
  };
}

export function todayIso(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface NewJournalEntry {
  date?: string;
  meal: string;
  name: string;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  qtyG?: number | null;
  source: string;
}

export function addJournalEntry(entry: NewJournalEntry): JournalEntry {
  const record: JournalEntry = {
    id: newId(),
    date: entry.date ?? todayIso(),
    meal: entry.meal,
    name: entry.name,
    protein: entry.protein ?? null,
    carbs: entry.carbs ?? null,
    fat: entry.fat ?? null,
    qtyG: entry.qtyG ?? null,
    source: entry.source,
    createdAt: new Date().toISOString(),
  };
  getDb().runSync(
    `INSERT INTO journal (id, date, meal, name, protein, carbs, fat, qty_g, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.date,
      record.meal,
      record.name,
      record.protein,
      record.carbs,
      record.fat,
      record.qtyG,
      record.source,
      record.createdAt,
    ],
  );
  return record;
}

export function listJournalDay(date: string): JournalEntry[] {
  return getDb()
    .getAllSync<JournalRow>(
      'SELECT * FROM journal WHERE date = ? ORDER BY created_at ASC',
      [date],
    )
    .map(toEntry);
}

export function deleteJournalEntry(id: string): void {
  getDb().runSync('DELETE FROM journal WHERE id = ?', [id]);
}
