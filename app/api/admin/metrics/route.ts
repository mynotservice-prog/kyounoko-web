import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  AFFILIATE_SOURCES,
  METRICS_TAG,
  readMetricsForWrite,
  writeMetricsToKv,
  type MonthlyMetric,
  type MetricsMap,
} from '@/lib/metrics';
import { isKvConfigured } from '@/lib/kv-store';

/**
 * /admin/kpi の月次メトリクス保存 API。
 *
 *  - GET  → { metrics: MonthlyMetric[] }
 *  - POST { month, patch } → 該当月を upsert（マージ）。空オブジェクトなら削除。
 *
 * 保存先:
 *  - ローカル開発: data/metrics-monthly.json に直接書き込み
 *  - 本番: GitHub Contents API で commit → 自動デプロイ
 *
 * セキュリティ: spot-overrides と同方針（dev は許可 / 本番は ALLOW_ADMIN_EDIT≠'0' + /admin referer）
 */

const ROOT = process.cwd();
const FILE_REL = 'data/metrics-monthly.json';
const FILE_ABS = path.join(ROOT, FILE_REL);

function isAllowed(req: NextRequest): { ok: boolean; reason?: string } {
  if (process.env.NODE_ENV === 'development') return { ok: true };
  if (process.env.ALLOW_ADMIN_EDIT === '0') return { ok: false, reason: 'admin edit disabled' };
  const ref = req.headers.get('referer') || '';
  if (!/\/admin\//.test(ref)) return { ok: false, reason: 'invalid referer' };
  return { ok: true };
}

const SOURCE_KEYS = AFFILIATE_SOURCES.map((s) => s.key) as string[];

function toMoney(v: unknown): number | undefined {
  if (v == null || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[,\s¥円]/g, ''));
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.round(n);
}

/** patch を検証してクリーンな MonthlyMetric（month除く）に整形。空なら null。 */
function sanitizePatch(input: unknown): MonthlyMetric | null | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'patch must be object' };
  const p = input as Record<string, unknown>;
  const out: MonthlyMetric = { month: '' };

  if ('affiliate' in p && p.affiliate) {
    if (typeof p.affiliate !== 'object') return { error: 'affiliate must be object' };
    const src = p.affiliate as Record<string, unknown>;
    const aff: Record<string, number> = {};
    for (const k of Object.keys(src)) {
      if (!SOURCE_KEYS.includes(k)) return { error: `unknown affiliate source: ${k}` };
      const m = toMoney(src[k]);
      if (m != null) aff[k] = m;
    }
    if (Object.keys(aff).length > 0) out.affiliate = aff;
  }
  if ('lineFollowers' in p) {
    const n = toMoney(p.lineFollowers);
    if (n != null) out.lineFollowers = n;
  }
  if ('pv' in p) {
    const n = toMoney(p.pv);
    if (n != null) out.pv = n;
  }
  if ('note' in p && p.note != null && p.note !== '') {
    if (typeof p.note !== 'string' || p.note.length > 500) return { error: 'invalid note' };
    out.note = p.note;
  }

  // month 以外に中身が無ければ null（= 削除指示）
  const { month: _omit, ...rest } = out;
  return Object.keys(rest).length === 0 ? null : out;
}

// ---- GitHub helpers ----
async function ghGetFile(): Promise<{ text: string; sha: string } | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return null;
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(FILE_REL)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'kyounoko-admin' },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { content?: string; sha?: string; encoding?: string };
  if (!data.content || !data.sha) return null;
  const text = data.encoding === 'base64' ? Buffer.from(data.content, 'base64').toString('utf8') : data.content;
  return { text, sha: data.sha };
}

async function ghPutFile(text: string, sha: string | undefined, message: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return { ok: false, error: 'GITHUB_TOKEN/REPO not set' };
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(FILE_REL)}`;
  const body: Record<string, unknown> = { message, content: Buffer.from(text, 'utf-8').toString('base64'), branch };
  if (sha) body.sha = sha;
  const author = process.env.GITHUB_AUTHOR_NAME;
  const email = process.env.GITHUB_AUTHOR_EMAIL;
  if (author && email) body.committer = { name: author, email };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'kyounoko-admin',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ok: false, error: `github ${res.status}: ${(await res.text()).slice(0, 200)}` };
  return { ok: true };
}

async function readLocal(): Promise<MetricsMap> {
  try {
    return JSON.parse(await fs.readFile(FILE_ABS, 'utf-8')) as MetricsMap;
  } catch {
    return [];
  }
}

// ===== GET =====
export async function GET(req: NextRequest) {
  const auth = isAllowed(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 403 });
  if (isKvConfigured()) {
    return NextResponse.json({ metrics: await readMetricsForWrite() });
  }
  if (process.env.NODE_ENV !== 'development' && process.env.GITHUB_TOKEN) {
    const gh = await ghGetFile();
    if (gh) {
      try {
        return NextResponse.json({ metrics: JSON.parse(gh.text) as MetricsMap });
      } catch {
        /* fall through */
      }
    }
  }
  return NextResponse.json({ metrics: await readLocal() });
}

// ===== POST =====
export async function POST(req: NextRequest) {
  const auth = isAllowed(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 403 });

  let body: { month?: unknown; patch?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (typeof body.month !== 'string' || !/^\d{4}-\d{2}$/.test(body.month)) {
    return NextResponse.json({ error: 'month は YYYY-MM 形式で指定してください' }, { status: 400 });
  }
  const month = body.month;
  const sanitized = sanitizePatch(body.patch);
  if (sanitized && 'error' in sanitized) {
    return NextResponse.json({ error: sanitized.error }, { status: 400 });
  }

  // 既存読み込み（KV優先 → GitHub → ローカル）
  const useKv = isKvConfigured();
  let current: MetricsMap = [];
  let sha: string | undefined;
  if (useKv) {
    current = await readMetricsForWrite();
  } else if (process.env.NODE_ENV !== 'development' && process.env.GITHUB_TOKEN) {
    const gh = await ghGetFile();
    if (gh) {
      try {
        current = JSON.parse(gh.text) as MetricsMap;
      } catch {
        current = [];
      }
      sha = gh.sha;
    }
  } else {
    current = await readLocal();
  }

  // 月で upsert（null は削除）
  const idx = current.findIndex((m) => m.month === month);
  if (sanitized === null) {
    if (idx >= 0) current.splice(idx, 1);
  } else {
    const merged: MonthlyMetric = { ...(idx >= 0 ? current[idx] : { month }), ...sanitized, month };
    if (idx >= 0) current[idx] = merged;
    else current.push(merged);
  }
  current.sort((a, b) => a.month.localeCompare(b.month));

  // KV: デプロイ不要で保存して /admin/kpi を更新
  if (useKv) {
    const ok = await writeMetricsToKv(current);
    if (!ok) return NextResponse.json({ error: 'kv write failed' }, { status: 500 });
    revalidateTag(METRICS_TAG);
    revalidatePath('/admin/kpi');
    return NextResponse.json({ ok: true, mode: 'kv', month });
  }

  const newText = JSON.stringify(current, null, 2) + '\n';

  if (process.env.NODE_ENV === 'development') {
    try {
      await fs.mkdir(path.dirname(FILE_ABS), { recursive: true });
      await fs.writeFile(FILE_ABS, newText, 'utf-8');
    } catch (e) {
      return NextResponse.json({ error: 'local write failed: ' + (e instanceof Error ? e.message : String(e)) }, { status: 500 });
    }
    return NextResponse.json({ ok: true, mode: 'local', month });
  }

  const r = await ghPutFile(newText, sha, `chore(metrics): update ${month}`);
  if (!r.ok) return NextResponse.json({ error: r.error || 'github write failed' }, { status: 500 });
  return NextResponse.json({ ok: true, mode: 'github', month });
}
