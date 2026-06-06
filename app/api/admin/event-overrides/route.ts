import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * /admin/event-images から呼ばれるイベント hero 画像 上書き API。
 *
 * 機能:
 *  - GET  → { overrides: { [slug]: { hero?: string } } }
 *  - POST { slug, hero }  → 該当 slug を更新（hero が空文字なら削除）
 *
 * 保存先の自動切り替え（edit-content/route.ts と同じパターン）:
 *  - ローカル開発 (NODE_ENV=development): lib/event-overrides.json に直接書き込み
 *  - 本番 Vercel + GitHub設定済み: GitHub Contents API で commit → 自動デプロイ
 *
 * セキュリティ:
 *  - 開発時 (NODE_ENV=development) は無条件で許可
 *  - 本番では ALLOW_ADMIN_EDIT=1 が必要
 *  - referer が /admin/ 由来であることをチェック
 *  - slug は [a-z0-9_-]+ のみ
 *  - hero は /v2/articles/... 等の安全な path のみ受け付ける
 */

const ROOT = process.cwd();
const FILE_REL = 'lib/event-overrides.json';
const FILE_ABS = path.join(ROOT, FILE_REL);

function isAllowed(req: NextRequest): { ok: boolean; reason?: string } {
  if (process.env.NODE_ENV === 'development') return { ok: true };
  if (process.env.ALLOW_ADMIN_EDIT === '1') {
    const ref = req.headers.get('referer') || '';
    if (!/\/admin\//.test(ref)) return { ok: false, reason: 'invalid referer' };
    return { ok: true };
  }
  return { ok: false, reason: 'admin edit disabled (set ALLOW_ADMIN_EDIT=1 to enable)' };
}

function isValidSlug(s: unknown): s is string {
  return typeof s === 'string' && /^[a-z0-9_-]+$/.test(s);
}

function isValidHero(s: unknown): s is string {
  if (typeof s !== 'string') return false;
  if (s === '') return true; // 空文字は削除指示として許可
  // 内部の安全なパス、または信頼できる外部 https のみ
  return (
    s.startsWith('/v2/') ||
    s.startsWith('/photos/') ||
    s.startsWith('/hero-ai/') ||
    s.startsWith('/img/') ||
    s.startsWith('/hero/') ||
    /^https:\/\/(images\.microcms-assets\.io)\//.test(s)
  );
}

type Overrides = Record<string, { hero?: string }>;

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

/** GitHub Contents API でファイル取得 → text + sha を返す */
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
  const data = (await res.json()) as {
    content?: string;
    sha?: string;
    encoding?: string;
  };
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

  // 本番の Vercel ランタイムでは fs から最新が読めない場合があるので
  // GitHub Contents API を優先（あれば）
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

  let body: { slug?: unknown; hero?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!isValidSlug(body.slug)) {
    return NextResponse.json({ error: 'invalid slug' }, { status: 400 });
  }
  if (!isValidHero(body.hero)) {
    return NextResponse.json(
      { error: 'invalid hero (must be /v2/.., /photos/.., /hero-ai/.., /img/.., /hero/.., or microcms https)' },
      { status: 400 },
    );
  }
  const slug = body.slug;
  const heroVal = body.hero as string;

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

  // 更新
  if (heroVal === '') {
    delete current[slug];
  } else {
    current[slug] = { ...(current[slug] || {}), hero: heroVal };
  }

  const newText = JSON.stringify(current, null, 2) + '\n';

  // ローカルファイル書き込み（開発時のみ）
  if (process.env.NODE_ENV === 'development') {
    try {
      await writeOverridesLocal(current);
    } catch (e) {
      return NextResponse.json(
        { error: 'local write failed: ' + (e instanceof Error ? e.message : String(e)) },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, mode: 'local', slug, hero: heroVal });
  }

  // 本番: GitHub Contents API へ commit
  const msg = heroVal === '' ? `chore(event): clear hero override for ${slug}` : `chore(event): set hero for ${slug}`;
  const r = await ghPutFile(newText, sha, msg);
  if (!r.ok) {
    return NextResponse.json({ error: r.error || 'github write failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mode: 'github', slug, hero: heroVal });
}
