import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { EDITABLE_FIELDS, type EditableField, type EventOverride } from '@/lib/event-overrides';

/**
 * /admin/events/edit から呼ばれるイベント上書き保存 API。
 *
 * 機能:
 *  - GET  → { overrides: { [slug]: EventOverride } }
 *  - POST { slug, patch: Partial<EventOverride> } → 該当slugを更新
 *      patch のフィールドが空文字なら override 削除（元の値に戻る）
 *
 * 保存先:
 *  - ローカル開発: lib/event-overrides.json に直接書き込み
 *  - 本番: GitHub Contents API で commit → 自動デプロイ
 *
 * セキュリティ:
 *  - 開発時 (NODE_ENV=development) は無条件で許可
 *  - 本番では ALLOW_ADMIN_EDIT=1 + referer check
 *  - slug は [a-z0-9_-]+ のみ
 *  - patch は EDITABLE_FIELDS にあるキーだけ受け付ける
 *  - hero は安全なパスのみ
 */

const ROOT = process.cwd();
const FILE_REL = 'lib/event-overrides.json';
const FILE_ABS = path.join(ROOT, FILE_REL);

function isAllowed(req: NextRequest): { ok: boolean; reason?: string } {
  if (process.env.NODE_ENV === 'development') return { ok: true };
  // 明示的に '0' で disable できるが、未設定はデフォルト許可。
  // /admin 配下は middleware の Basic Auth で保護されており、ここでは referer のみ確認すれば十分。
  if (process.env.ALLOW_ADMIN_EDIT === '0') {
    return { ok: false, reason: 'admin edit disabled (ALLOW_ADMIN_EDIT=0)' };
  }
  const ref = req.headers.get('referer') || '';
  if (!/\/admin\//.test(ref)) return { ok: false, reason: 'invalid referer' };
  return { ok: true };
}

function isValidSlug(s: unknown): s is string {
  return typeof s === 'string' && /^[a-z0-9_-]+$/.test(s);
}

function isValidHero(s: unknown): boolean {
  if (typeof s !== 'string') return false;
  if (s === '') return true;
  return (
    s.startsWith('/v2/') ||
    s.startsWith('/photos/') ||
    s.startsWith('/hero-ai/') ||
    s.startsWith('/img/') ||
    s.startsWith('/hero/') ||
    /^https:\/\/(images\.microcms-assets\.io)\//.test(s)
  );
}

/** patch オブジェクトの各フィールドをホワイトリストでフィルタ＆検証して返す */
function sanitizePatch(input: unknown): EventOverride | { error: string } {
  if (!input || typeof input !== 'object') return { error: 'patch must be object' };
  const p = input as Record<string, unknown>;
  const result: EventOverride = {};
  for (const k of Object.keys(p)) {
    if (!EDITABLE_FIELDS.includes(k as EditableField)) {
      return { error: `unknown field: ${k}` };
    }
    const v = p[k];
    if (k === 'hero') {
      if (!isValidHero(v)) return { error: 'invalid hero path' };
      if (v !== '') (result as Record<string, unknown>)[k] = v;
    } else if (k === 'tags') {
      // 配列 or 空配列なら OK、空文字/null/undefined は削除指示
      if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
        if (v.length > 0) (result as Record<string, unknown>)[k] = v;
      } else if (typeof v === 'string') {
        // カンマ区切り入力対応
        const arr = v.split(',').map((s) => s.trim()).filter(Boolean);
        if (arr.length > 0) (result as Record<string, unknown>)[k] = arr;
      } else if (v == null) {
        // 削除指示として扱う
      } else {
        return { error: 'invalid tags' };
      }
    } else {
      if (typeof v !== 'string') return { error: `field ${k} must be string` };
      if (v !== '') (result as Record<string, unknown>)[k] = v;
    }
  }
  return result;
}

type Overrides = Record<string, EventOverride>;

async function readOverrides(): Promise<Overrides> {
  try {
    const text = await fs.readFile(FILE_ABS, 'utf-8');
    return JSON.parse(text) as Overrides;
  } catch {
    return {};
  }
}

async function writeOverridesLocal(data: Overrides): Promise<void> {
  const text = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(FILE_ABS, text, 'utf-8');
}

async function ghGetFile(): Promise<{ text: string; sha: string } | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return null;
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(FILE_REL)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'kyounoko-admin',
    },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { content?: string; sha?: string; encoding?: string };
  if (!data.content || !data.sha) return null;
  const text =
    data.encoding === 'base64'
      ? Buffer.from(data.content, 'base64').toString('utf8')
      : data.content;
  return { text, sha: data.sha };
}

async function ghPutFile(text: string, sha: string | undefined, message: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return { ok: false, error: 'GITHUB_TOKEN/REPO not set' };
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(FILE_REL)}`;
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(text, 'utf-8').toString('base64'),
    branch,
  };
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
  if (!res.ok) {
    const errText = await res.text();
    return { ok: false, error: `github ${res.status}: ${errText.slice(0, 200)}` };
  }
  return { ok: true };
}

// ===== GET =====

export async function GET(req: NextRequest) {
  const auth = isAllowed(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 403 });

  if (process.env.NODE_ENV !== 'development' && process.env.GITHUB_TOKEN) {
    const gh = await ghGetFile();
    if (gh) {
      try {
        const data = JSON.parse(gh.text) as Overrides;
        return NextResponse.json({ overrides: data });
      } catch {
        // fall through
      }
    }
  }
  const overrides = await readOverrides();
  return NextResponse.json({ overrides });
}

// ===== POST =====

export async function POST(req: NextRequest) {
  const auth = isAllowed(req);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 403 });

  let body: { slug?: unknown; patch?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!isValidSlug(body.slug)) {
    return NextResponse.json({ error: 'invalid slug' }, { status: 400 });
  }
  const slug = body.slug;
  const patchResult = sanitizePatch(body.patch);
  if ('error' in patchResult) {
    return NextResponse.json({ error: patchResult.error }, { status: 400 });
  }
  const patch = patchResult;

  // 既存読み込み
  let current: Overrides = {};
  let sha: string | undefined;
  if (process.env.NODE_ENV !== 'development' && process.env.GITHUB_TOKEN) {
    const gh = await ghGetFile();
    if (gh) {
      try {
        current = JSON.parse(gh.text) as Overrides;
      } catch {
        current = {};
      }
      sha = gh.sha;
    }
  } else {
    current = await readOverrides();
  }

  // patch を current[slug] にマージ。空フィールドは削除指示として扱う。
  const merged: EventOverride = { ...(current[slug] || {}) };
  for (const k of EDITABLE_FIELDS) {
    if (k in (body.patch as Record<string, unknown>)) {
      const v = (patch as Record<string, unknown>)[k];
      if (v === undefined) {
        delete (merged as Record<string, unknown>)[k];
      } else {
        (merged as Record<string, unknown>)[k] = v;
      }
    }
  }

  // すべて空になったら entry ごと削除
  if (Object.keys(merged).length === 0) {
    delete current[slug];
  } else {
    current[slug] = merged;
  }

  const newText = JSON.stringify(current, null, 2) + '\n';

  // ローカル
  if (process.env.NODE_ENV === 'development') {
    try {
      await writeOverridesLocal(current);
    } catch (e) {
      return NextResponse.json(
        { error: 'local write failed: ' + (e instanceof Error ? e.message : String(e)) },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, mode: 'local', slug, patch });
  }

  // 本番: GitHub commit
  const msg = `chore(event): update overrides for ${slug}`;
  const r = await ghPutFile(newText, sha, msg);
  if (!r.ok) {
    return NextResponse.json({ error: r.error || 'github write failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mode: 'github', slug, patch });
}
