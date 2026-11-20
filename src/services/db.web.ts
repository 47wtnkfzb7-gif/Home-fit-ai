// Adaptateur web de la couche de persistance.
// Metro résout automatiquement ce fichier (db.web.ts) à la place de db.ts
// lors d'un export web. La même API est offerte au reste de l'app, les
// données vivent dans le localStorage du navigateur (aucun serveur).

type Row = Record<string, unknown>;

const PREFIX = 'homefit.web.';
const PRIMARY_KEYS: Record<string, string> = {
  kv: 'key',
  workouts: 'id',
  xp_events: 'id',
  favorites: 'slug',
  journal: 'id',
  video_analyses: 'id',
};

let memory: Map<string, string> | null = null;

interface KeyStore {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function backingStore(): KeyStore {
  if (typeof localStorage === 'undefined') {
    if (!memory) memory = new Map<string, string>();
    const mem = memory;
    const order: string[] = [];
    return {
      get length() {
        return order.length;
      },
      key(index: number) {
        return order[index] ?? null;
      },
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => {
        if (!mem.has(k)) order.push(k);
        mem.set(k, v);
      },
      removeItem: (k) => {
        mem.delete(k);
      },
    };
  }
  return localStorage;
}

function readTable(table: string): Row[] {
  if (table === 'kv') {
    const all = backingStore();
    const rows: Row[] = [];
    for (let i = 0; i < all.length; i += 1) {
      const key = all.key(i);
      if (key !== null && key.startsWith(PREFIX)) {
        rows.push({ key: key.slice(PREFIX.length), value: all.getItem(key) ?? '' });
      }
    }
    return rows;
  }
  const raw = backingStore().getItem(`${PREFIX}table.${table}`);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Row[]) : [];
  } catch {
    return [];
  }
}

function writeTable(table: string, rows: Row[]): void {
  if (table === 'kv') {
    const all = backingStore();
    const live = new Set<string>();
    for (const row of rows) {
      const key = PREFIX + String(row.key);
      live.add(key);
      all.setItem(key, String(row.value));
    }
    for (let i = all.length - 1; i >= 0; i -= 1) {
      const key = all.key(i);
      if (key !== null && key.startsWith(PREFIX) && !live.has(key)) {
        all.removeItem(key);
      }
    }
    return;
  }
  backingStore().setItem(`${PREFIX}table.${table}`, JSON.stringify(rows));
}

function norm(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim();
}

function extractCols(sql: string): string[] {
  const m = /^INSERT (?:OR REPLACE )?INTO (\w+) \(([^)]+)\) VALUES/.exec(sql);
  if (!m) return [];
  return m[2].split(',').map((c) => c.trim());
}

function upsert(table: string, cols: string[], params: unknown[]): void {
  if (cols.length !== params.length) {
    throw new Error(`db.web : ${cols.length} colonnes mais ${params.length} paramètres — ${table}`);
  }
  const row: Row = {};
  cols.forEach((col, i) => {
    row[col] = params[i];
  });
  const pk = PRIMARY_KEYS[table];
  if (!pk) throw new Error(`db.web : table inconnue ${table}`);
  const rows = readTable(table);
  const idx = rows.findIndex((r) => r[pk] === params[cols.indexOf(pk)]);
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], ...row };
  } else {
    rows.push(row);
  }
  writeTable(table, rows);
}

function deleteRows(table: string, col: string, value: unknown): void {
  const rows = readTable(table).filter((r) => r[col] !== value);
  writeTable(table, rows);
}

interface TailResult {
  where: { col: string; op: 'eq' | 'notnull'; value?: unknown } | null;
  order: { col: string; desc: boolean } | null;
  limit: number | null;
}

function parseTail(sql: string): TailResult {
  let rest = sql;
  let where: TailResult['where'] = null;
  let order: TailResult['order'] = null;
  let limit: number | null = null;

  const wm = /^ WHERE (\w+) (= \?|IS NOT NULL)/.exec(rest);
  if (wm) {
    rest = rest.slice(wm[0].length);
    if (wm[2] === '= ?') {
      where = { col: wm[1], op: 'eq', value: 0 };
    } else {
      where = { col: wm[1], op: 'notnull' };
    }
  }
  const om = /^ ORDER BY (\w+(?: DESC| ASC)?)/.exec(rest);
  if (om) {
    rest = rest.slice(om[0].length);
    const token = om[1];
    order = { col: token.replace(/ (DESC|ASC)$/, ''), desc: token.endsWith(' DESC') };
  }
  const lm = /^ LIMIT (\d+)$/.exec(rest);
  if (lm) {
    limit = Number(lm[1]);
    rest = rest.slice(lm[0].length);
  }
  if (rest.length > 0) {
    throw new Error(`db.web : clause SQL non supportée (${rest}) — ${sql}`);
  }
  return { where, order, limit };
}

function select(sql: string, params: unknown[]): Row[] {
  const s = norm(sql);
  let m: RegExpExecArray | null;

  if ((m = /^SELECT COUNT\(\*\) (?:AS|as) (\w+) FROM (\w+)$/.exec(s))) {
    return [{ [m[1]]: readTable(m[2]).length }];
  }
  if ((m = /^SELECT SUM\((\w+)\) (?:AS|as) (\w+) FROM (\w+)$/.exec(s))) {
    const rows = readTable(m[3]);
    const values = rows
      .map((r) => r[m![1]])
      .filter((v): v is number => typeof v === 'number');
    return [{ [m[2]]: values.length ? values.reduce((a, b) => a + b, 0) : null }];
  }

  const head =
    /^(SELECT .+? FROM \w+)( WHERE \w+ (?:= \?|IS NOT NULL))?( ORDER BY \w+(?: DESC| ASC)?)?( LIMIT \d+)?$/.exec(s);
  if (!head) throw new Error(`db.web : SELECT non supporté — ${s}`);
  const core = /^SELECT (.+?) FROM (\w+)$/.exec(head[1]);
  if (!core) throw new Error(`db.web : SELECT non supporté — ${s}`);
  const projection = core[1];
  const table = core[2];
  const tail = parseTail(`${head[2] ?? ''}${head[3] ?? ''}${head[4] ?? ''}`);

  if (tail.where?.op === 'eq') {
    tail.where.value = params.length ? params[0] : 0;
  }

  let rows = readTable(table);
  if (tail.where) {
    rows =
      tail.where.op === 'eq'
        ? rows.filter((r) => r[tail.where!.col] === tail.where!.value)
        : rows.filter((r) => r[tail.where!.col] !== null && r[tail.where!.col] !== undefined);
  }
  if (tail.order) rows = [...rows].sort(byCol(tail.order.col, tail.order.desc));
  if (tail.limit !== null) rows = rows.slice(0, tail.limit);

  if (projection === '*') return rows;
  const cols = projection.split(',').map((c) => c.trim());
  return rows.map((r) => {
    const out: Row = {};
    for (const c of cols) out[c] = r[c];
    return out;
  });
}

function byCol(col: string, desc: boolean): (a: Row, b: Row) => number {
  return (a, b) => {
    const av = a[col];
    const bv = b[col];
    const cmp = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv));
    return desc ? -cmp : cmp;
  };
}

interface ListDb {
  execSync(sql: string): void;
  runSync(sql: string, params?: unknown[]): void;
  getAllSync<T = Row>(sql: string, params?: unknown[]): T[];
  getFirstSync<T = Row>(sql: string, params?: unknown[]): T | null;
}

class WebDatabase implements ListDb {
  execSync(sql: string): void {
    const s = norm(sql);
    if (/^PRAGMA /.test(s) || s.startsWith('CREATE TABLE')) return;
    throw new Error(`db.web : execSync non supporté — ${s}`);
  }

  runSync(sql: string, params: unknown[] = []): void {
    const s = norm(sql);
    const insert = /^INSERT (OR REPLACE )?INTO (\w+)/.exec(s);
    if (insert) {
      const cols = extractCols(s);
      if (!cols.length) throw new Error(`db.web : INSERT non supporté — ${s}`);
      upsert(insert[2], cols, params);
      return;
    }
    const del = /^DELETE FROM (\w+) WHERE (\w+) = \?$/.exec(s);
    if (del) {
      deleteRows(del[1], del[2], params[0]);
      return;
    }
    throw new Error(`db.web : runSync non supporté — ${s}`);
  }

  getAllSync<T = Row>(sql: string, params: unknown[] = []): T[] {
    return select(sql, params) as T[];
  }

  getFirstSync<T = Row>(sql: string, params: unknown[] = []): T | null {
    const rows = select(sql, params) as T[];
    return rows.length > 0 ? rows[0] : null;
  }
}

let db: ListDb | null = null;

export function getDb(): ListDb {
  if (!db) db = new WebDatabase();
  return db;
}

export function getJson<T>(key: string): T | null {
  const raw = backingStore().getItem(PREFIX + key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJson(key: string, value: unknown): void {
  backingStore().setItem(PREFIX + key, JSON.stringify(value));
}

export function removeKey(key: string): void {
  backingStore().removeItem(PREFIX + key);
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function deleteAllUserData(): void {
  const all = backingStore();
  for (let i = all.length - 1; i >= 0; i -= 1) {
    const key = all.key(i);
    if (key !== null && key.startsWith(PREFIX)) all.removeItem(key);
  }
}
