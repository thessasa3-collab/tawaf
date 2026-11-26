import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import type {
  BodyPartId,
  CaseStatus,
  ConsciousState,
  GpsLocation,
  HaramZone,
  LanguageCode,
  ResponderReportPayload,
  ResponderUserInternal,
  ResponderUserPublic,
  TriageCaseInternal,
  TriageCaseRecord,
  TriageLevel,
  TriageSource,
  UserRole,
} from './types.ts';

export interface CreateCaseInput {
  caseTokenHash: string;
  level: TriageLevel;
  source: TriageSource;
  language: LanguageCode;
  zone: HaramZone;
  conscious: ConsciousState;
  age: number | null;
  bodyPart: BodyPartId | null;
  gpsLocation?: GpsLocation | null;
  locationDetail?: string | null;
  symptoms: string;
  categoryTitle: string;
  summary: string;
  firstAidSteps: string[];
  warningSigns: string;
  responderReport: ResponderReportPayload;
}

export interface ListCasesFilter {
  level?: TriageLevel;
  zone?: HaramZone;
  status?: CaseStatus;
  q?: string;
  limit?: number;
}

export interface UpdateCasePatch {
  status?: CaseStatus;
  level?: TriageLevel;
  responderNotes?: string;
  updatedBy: string;
}

interface FileStoreSchema {
  cases: TriageCaseInternal[];
  responders: ResponderUserInternal[];
  adminPasscodeHash: string | null;
}

const MAX_FILE_CASES = 500;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tawaf-store.json');

function toPublicCase(item: TriageCaseInternal): TriageCaseRecord {
  const { caseTokenHash: _ignored, ...rest } = item;
  return rest;
}

function toPublicUser(user: ResponderUserInternal): ResponderUserPublic {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}

function generateCaseId(): string {
  const timePart = Date.now().toString().slice(-4);
  const randPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TWF-${timePart}-${randPart}`;
}

export class TawafStore {
  private pool: Pool | null = null;
  private mode: 'postgres' | 'file' = 'file';
  private fileCache: FileStoreSchema = {
    cases: [],
    responders: [],
    adminPasscodeHash: null,
  };
  private writeQueue: Promise<void> = Promise.resolve();

  async init(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL?.trim();
    if (dbUrl) {
      const useSsl =
        !dbUrl.includes('localhost') &&
        !dbUrl.includes('127.0.0.1') &&
        !dbUrl.includes('sslmode=disable');
      this.pool = new Pool({
        connectionString: dbUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
      });

      try {
        await this.pool.query('SELECT 1');
        await this.ensurePostgresSchema();
        this.mode = 'postgres';
        console.log('[Tawaf Store] Connected to PostgreSQL');
        return;
      } catch (err) {
        console.warn(
          '[Tawaf Store] PostgreSQL unavailable, falling back to file store:',
          err instanceof Error ? err.message : err
        );
        await this.pool.end().catch(() => {});
        this.pool = null;
      }
    }

    this.mode = 'file';
    await this.loadFileStore();
    console.log('[Tawaf Store] Using persistent file store at', DATA_FILE);
  }

  getMode(): 'postgres' | 'file' {
    return this.mode;
  }

  private async ensurePostgresSchema(): Promise<void> {
    if (!this.pool) return;
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS triage_cases (
        id TEXT PRIMARY KEY,
        case_token_hash TEXT NOT NULL,
        level TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        source TEXT NOT NULL DEFAULT 'ai',
        language TEXT NOT NULL,
        zone TEXT NOT NULL,
        conscious TEXT NOT NULL,
        age INTEGER,
        body_part TEXT,
        symptoms TEXT NOT NULL,
        category_title TEXT NOT NULL,
        summary TEXT NOT NULL,
        first_aid_steps JSONB NOT NULL,
        warning_signs TEXT NOT NULL,
        responder_report JSONB NOT NULL,
        gps_location JSONB,
        location_detail TEXT,
        responder_notes TEXT NOT NULL DEFAULT '',
        updated_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE triage_cases ADD COLUMN IF NOT EXISTS gps_location JSONB;
      ALTER TABLE triage_cases ADD COLUMN IF NOT EXISTS location_detail TEXT;
      CREATE INDEX IF NOT EXISTS idx_triage_cases_created_at ON triage_cases (created_at DESC);
      CREATE TABLE IF NOT EXISTS auth_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS responder_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        role TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  private async loadFileStore(): Promise<void> {
    await fs.promises.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
    if (!fs.existsSync(DATA_FILE)) {
      await this.flushFileStore();
      return;
    }
    try {
      const raw = await fs.promises.readFile(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<FileStoreSchema>;
      this.fileCache = {
        cases: Array.isArray(parsed.cases) ? parsed.cases : [],
        responders: Array.isArray(parsed.responders) ? parsed.responders : [],
        adminPasscodeHash:
          typeof parsed.adminPasscodeHash === 'string' ? parsed.adminPasscodeHash : null,
      };
    } catch {
      this.fileCache = { cases: [], responders: [], adminPasscodeHash: null };
    }
  }

  private flushFileStore(): Promise<void> {
    const task = this.writeQueue.then(async () => {
      await fs.promises.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });
      const tmpFile = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
      const content = JSON.stringify(this.fileCache, null, 2);
      await fs.promises.writeFile(tmpFile, content, { encoding: 'utf8', mode: 0o600 });
      await fs.promises.rename(tmpFile, DATA_FILE);
    });
    this.writeQueue = task.catch(() => {});
    return task;
  }

  async createCase(input: CreateCaseInput): Promise<TriageCaseRecord> {
    const id = generateCaseId();
    const nowIso = new Date().toISOString();

    if (this.pool) {
      const res = await this.pool.query(
        `INSERT INTO triage_cases (
          id, case_token_hash, level, status, source, language, zone, conscious,
          age, body_part, gps_location, location_detail, symptoms, category_title, summary, first_aid_steps,
          warning_signs, responder_report, responder_notes, updated_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, 'open', $4, $5, $6, $7,
          $8, $9, $10::jsonb, $11, $12, $13, $14, $15::jsonb,
          $16, $17::jsonb, '', NULL, $18, $18
        )
        RETURNING *`,
        [
          id,
          input.caseTokenHash,
          input.level,
          input.source,
          input.language,
          input.zone,
          input.conscious,
          input.age,
          input.bodyPart,
          input.gpsLocation ? JSON.stringify(input.gpsLocation) : null,
          input.locationDetail ?? null,
          input.symptoms,
          input.categoryTitle,
          input.summary,
          JSON.stringify(input.firstAidSteps),
          input.warningSigns,
          JSON.stringify(input.responderReport),
          nowIso,
        ]
      );
      return toPublicCase(this.mapPgRowToCase(res.rows[0]));
    }

    const record: TriageCaseInternal = {
      id,
      caseTokenHash: input.caseTokenHash,
      level: input.level,
      status: 'open',
      source: input.source,
      language: input.language,
      zone: input.zone,
      conscious: input.conscious,
      age: input.age,
      bodyPart: input.bodyPart,
      gpsLocation: input.gpsLocation ?? null,
      locationDetail: input.locationDetail ?? null,
      symptoms: input.symptoms,
      categoryTitle: input.categoryTitle,
      summary: input.summary,
      firstAidSteps: input.firstAidSteps,
      warningSigns: input.warningSigns,
      responderReport: input.responderReport,
      responderNotes: '',
      updatedBy: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.fileCache.cases.unshift(record);
    if (this.fileCache.cases.length > MAX_FILE_CASES) {
      this.fileCache.cases.length = MAX_FILE_CASES;
    }
    await this.flushFileStore();
    return toPublicCase(record);
  }

  async listCases(filters: ListCasesFilter = {}): Promise<TriageCaseRecord[]> {
    const limit = Math.min(Math.max(filters.limit ?? 100, 1), 250);

    if (this.pool) {
      const clauses: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (filters.level) {
        clauses.push(`level = $${idx++}`);
        values.push(filters.level);
      }
      if (filters.zone) {
        clauses.push(`zone = $${idx++}`);
        values.push(filters.zone);
      }
      if (filters.status) {
        clauses.push(`status = $${idx++}`);
        values.push(filters.status);
      }
      if (filters.q && filters.q.trim()) {
        clauses.push(
          `(id ILIKE $${idx} OR symptoms ILIKE $${idx} OR category_title ILIKE $${idx})`
        );
        values.push(`%${filters.q.trim()}%`);
        idx++;
      }

      const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
      values.push(limit);

      const res = await this.pool.query(
        `SELECT * FROM triage_cases ${whereSql} ORDER BY created_at DESC LIMIT $${idx}`,
        values
      );
      return res.rows.map((row) => toPublicCase(this.mapPgRowToCase(row)));
    }

    const qLower = filters.q?.trim().toLowerCase() ?? '';
    return this.fileCache.cases
      .filter((item) => {
        if (filters.level && item.level !== filters.level) return false;
        if (filters.zone && item.zone !== filters.zone) return false;
        if (filters.status && item.status !== filters.status) return false;
        if (qLower) {
          const hay = `${item.id} ${item.symptoms} ${item.categoryTitle}`.toLowerCase();
          if (!hay.includes(qLower)) return false;
        }
        return true;
      })
      .slice(0, limit)
      .map(toPublicCase);
  }

  async getCaseById(id: string): Promise<TriageCaseInternal | null> {
    if (this.pool) {
      const res = await this.pool.query('SELECT * FROM triage_cases WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length === 0) return null;
      return this.mapPgRowToCase(res.rows[0]);
    }

    return this.fileCache.cases.find((item) => item.id === id) ?? null;
  }

  async updateCase(id: string, patch: UpdateCasePatch): Promise<TriageCaseRecord | null> {
    const nowIso = new Date().toISOString();

    if (this.pool) {
      const sets: string[] = ['updated_at = $1', 'updated_by = $2'];
      const values: unknown[] = [nowIso, patch.updatedBy];
      let idx = 3;

      if (patch.status !== undefined) {
        sets.push(`status = $${idx++}`);
        values.push(patch.status);
      }
      if (patch.level !== undefined) {
        sets.push(`level = $${idx++}`);
        values.push(patch.level);
      }
      if (patch.responderNotes !== undefined) {
        sets.push(`responder_notes = $${idx++}`);
        values.push(patch.responderNotes);
      }
      values.push(id);

      const res = await this.pool.query(
        `UPDATE triage_cases SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );
      if (res.rows.length === 0) return null;
      return toPublicCase(this.mapPgRowToCase(res.rows[0]));
    }

    const idx = this.fileCache.cases.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    const current = this.fileCache.cases[idx];
    const updated: TriageCaseInternal = {
      ...current,
      status: patch.status ?? current.status,
      level: patch.level ?? current.level,
      responderNotes:
        patch.responderNotes !== undefined ? patch.responderNotes : current.responderNotes,
      updatedBy: patch.updatedBy,
      updatedAt: nowIso,
    };
    this.fileCache.cases[idx] = updated;
    await this.flushFileStore();
    return toPublicCase(updated);
  }

  async deleteCase(id: string): Promise<boolean> {
    if (this.pool) {
      const res = await this.pool.query('DELETE FROM triage_cases WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    }

    const prevLen = this.fileCache.cases.length;
    this.fileCache.cases = this.fileCache.cases.filter((item) => item.id !== id);
    if (this.fileCache.cases.length === prevLen) return false;
    await this.flushFileStore();
    return true;
  }

  async getAdminPasscodeHash(): Promise<string | null> {
    if (this.pool) {
      const res = await this.pool.query(
        "SELECT value FROM auth_settings WHERE key = 'admin_passcode_hash' LIMIT 1"
      );
      return res.rows.length > 0 ? String(res.rows[0].value) : null;
    }
    return this.fileCache.adminPasscodeHash;
  }

  async claimAdminPasscode(hash: string): Promise<boolean> {
    if (this.pool) {
      const res = await this.pool.query(
        `INSERT INTO auth_settings (key, value, updated_at)
         VALUES ('admin_passcode_hash', $1, NOW())
         ON CONFLICT (key) DO NOTHING
         RETURNING key`,
        [hash]
      );
      return res.rows.length > 0;
    }

    if (this.fileCache.adminPasscodeHash) {
      return false;
    }
    this.fileCache.adminPasscodeHash = hash;
    await this.flushFileStore();
    return true;
  }

  async listResponders(): Promise<ResponderUserPublic[]> {
    if (this.pool) {
      const res = await this.pool.query(
        'SELECT id, username, display_name, role, created_at FROM responder_users ORDER BY created_at DESC'
      );
      return res.rows.map((r) => ({
        id: String(r.id),
        username: String(r.username),
        displayName: String(r.display_name),
        role: r.role as UserRole,
        createdAt: new Date(r.created_at).toISOString(),
      }));
    }
    return this.fileCache.responders.map(toPublicUser);
  }

  async findResponderByUsername(username: string): Promise<ResponderUserInternal | null> {
    const clean = username.trim().toLowerCase();
    if (this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM responder_users WHERE LOWER(username) = $1 LIMIT 1',
        [clean]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: String(r.id),
        username: String(r.username),
        displayName: String(r.display_name),
        role: r.role as UserRole,
        passwordHash: String(r.password_hash),
        createdAt: new Date(r.created_at).toISOString(),
      };
    }
    return (
      this.fileCache.responders.find((u) => u.username.toLowerCase() === clean) ?? null
    );
  }

  async createResponder(input: {
    username: string;
    displayName: string;
    role: UserRole;
    passwordHash: string;
  }): Promise<ResponderUserPublic> {
    const id = `USR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const nowIso = new Date().toISOString();
    const cleanUsername = input.username.trim().toLowerCase();

    if (this.pool) {
      const res = await this.pool.query(
        `INSERT INTO responder_users (id, username, display_name, role, password_hash, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, username, display_name, role, created_at`,
        [id, cleanUsername, input.displayName.trim(), input.role, input.passwordHash, nowIso]
      );
      const r = res.rows[0];
      return {
        id: String(r.id),
        username: String(r.username),
        displayName: String(r.display_name),
        role: r.role as UserRole,
        createdAt: new Date(r.created_at).toISOString(),
      };
    }

    if (this.fileCache.responders.some((u) => u.username.toLowerCase() === cleanUsername)) {
      throw new Error('USERNAME_EXISTS');
    }

    const user: ResponderUserInternal = {
      id,
      username: cleanUsername,
      displayName: input.displayName.trim(),
      role: input.role,
      passwordHash: input.passwordHash,
      createdAt: nowIso,
    };
    this.fileCache.responders.unshift(user);
    await this.flushFileStore();
    return toPublicUser(user);
  }

  async deleteResponder(id: string): Promise<boolean> {
    if (this.pool) {
      const res = await this.pool.query('DELETE FROM responder_users WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    }

    const prevLen = this.fileCache.responders.length;
    this.fileCache.responders = this.fileCache.responders.filter((u) => u.id !== id);
    if (this.fileCache.responders.length === prevLen) return false;
    await this.flushFileStore();
    return true;
  }

  private mapPgRowToCase(row: Record<string, unknown>): TriageCaseInternal {
    return {
      id: String(row.id),
      caseTokenHash: String(row.case_token_hash),
      level: row.level as TriageLevel,
      status: row.status as CaseStatus,
      source: row.source as TriageSource,
      language: row.language as LanguageCode,
      zone: row.zone as HaramZone,
      conscious: row.conscious as ConsciousState,
      age: row.age === null || row.age === undefined ? null : Number(row.age),
      bodyPart: row.body_part ? (String(row.body_part) as BodyPartId) : null,
      gpsLocation: (row.gps_location as GpsLocation | null) ?? null,
      locationDetail: row.location_detail ? String(row.location_detail) : null,
      symptoms: String(row.symptoms),
      categoryTitle: String(row.category_title),
      summary: String(row.summary),
      firstAidSteps: Array.isArray(row.first_aid_steps)
        ? (row.first_aid_steps as string[])
        : [],
      warningSigns: String(row.warning_signs),
      responderReport: row.responder_report as ResponderReportPayload,
      responderNotes: String(row.responder_notes ?? ''),
      updatedBy: row.updated_by ? String(row.updated_by) : null,
      createdAt: new Date(String(row.created_at)).toISOString(),
      updatedAt: new Date(String(row.updated_at)).toISOString(),
    };
  }
}

export const store = new TawafStore();
