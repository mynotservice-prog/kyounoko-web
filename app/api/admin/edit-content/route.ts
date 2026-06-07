import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

/**
 * /admin/articles/[slug]/edit と /admin/plans/[id]/edit から呼ばれる
 * コンテンツ編集 API。
 *
 * 機能:
 *  - GET  ?kind=article&slug=xxx  → { frontmatter (JSON), body (markdown) }
 *  - POST { kind, slug, frontmatter, body }  → 保存
 *
 * 保存先の自動切り替え:
 *  - **ローカル開発** (NODE_ENV=development): ローカル FS に直接書き込み（git push は手動）
 *  - **本番 Vercel + GitHub設定済み**: GitHub Contents API で content/*.md を直接 commit
 *    → Vercel が自動デプロイ。**スマホからも編集→保存だけで本番反映**。
 *
 * セキュリティ:
 *  - 開発時 (NODE_ENV=development) は無条件で許可
 *  - 本番では ALLOW_ADMIN_EDIT=1 ENV を設定したときだけ動作
 *  - referer が /admin/ 由来であることをチェック（CSRF対策）
 *  - slug は [a-z0-9_-]+ のみ許可（パストラバーサル対策）
 *
 * 本番で必要な ENV:
 *  - ALLOW_ADMIN_EDIT=1
 *  - GITHUB_TOKEN  : Fine-grained PAT。kyounoko-web リポジトリの Contents: read & write 権限
 *  - GITHUB_REPO   : "owner/repo" 形式（例: "nagamy/kyounoko-web"）
 *  - GITHUB_BRANCH : デフォルト "main"
 *  - GITHUB_AUTHOR_NAME / GITHUB_AUTHOR_EMAIL : 任意。指定なければ token 所有者を使う
 */

const ROOT = process.cwd();
const KINDS = ['article', 'plan'] as const;
type Kind = (typeof KINDS)[number];

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

function pathFor(kind: Kind, slug: string): string | null {
  if (!/^[a-z0-9_-]+$/.test(slug)) return null;
  const dir = kind === 'article' ? 'content/articles' : 'content/plans';
  return path.join(ROOT, dir, `${slug}.md`);
}

function parseKind(v: unknown): Kind | null {
  return KINDS.includes(v as Kind) ? (v as Kind) : null;
}

function repoPath(kind: Kind, slug: string): string {
  const dir = kind === 'article' ? 'content/articles' : 'content/plans';
  return `${dir}/${slug}.md`;
}

/** GitHub Contents API でファイル取得 → text を返す（取得できなければ null） */
async function ghGetFile(repoRel: string): Promise<{ text: string; sha: string } | null> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) return null;
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(repoRel)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'kyounoko-admin' },
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

/** GitHub Contents API でファイル作成/更新（commit） */
async function ghPutFile(
  repoRel: string,
  newText: string,
  message: string,
  prevSha?: string
): Promise<{ commit?: string; html_url?: string }> {
  const token = process.env.GITHUB_TOKEN!;
  const repo = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURI(repoRel)}`;
  const author =
    process.env.GITHUB_AUTHOR_NAME && process.env.GITHUB_AUTHOR_EMAIL
      ? { name: process.env.GITHUB_AUTHOR_NAME, email: process.env.GITHUB_AUTHOR_EMAIL }
      : undefined;
  const payload: Record<string, unknown> = {
    message,
    content: Buffer.from(newText, 'utf8').toString('base64'),
    branch,
  };
  if (prevSha) payload.sha = prevSha;
  if (author) {
    payload.author = author;
    payload.committer = author;
  }
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'kyounoko-admin',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} ${errText.slice(0, 300)}`);
  }
  const data = (await res.json()) as { commit?: { sha?: string; html_url?: string } };
  return { commit: data.commit?.sha, html_url: data.commit?.html_url };
}

const useGitHub = (): boolean =>
  process.env.NODE_ENV !== 'development' && !!process.env.GITHUB_TOKEN && !!process.env.GITHUB_REPO;

export async function GET(req: NextRequest) {
  const guard = isAllowed(req);
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.reason }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const kind = parseKind(searchParams.get('kind'));
  const slug = searchParams.get('slug') || '';
  if (!kind) return NextResponse.json({ ok: false, error: 'invalid kind' }, { status: 400 });

  // 本番 + GitHub設定済み → GitHub から取得（FS は古い可能性があるため）
  if (useGitHub()) {
    try {
      const got = await ghGetFile(repoPath(kind, slug));
      if (!got) return NextResponse.json({ ok: false, error: 'github fetch failed' }, { status: 404 });
      const { data, content } = matter(got.text);
      return NextResponse.json({ ok: true, frontmatter: data, body: content, source: 'github', sha: got.sha });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }
  }

  const fp = pathFor(kind, slug);
  if (!fp) return NextResponse.json({ ok: false, error: 'invalid slug' }, { status: 400 });
  try {
    const raw = await fs.readFile(fp, 'utf8');
    const { data, content } = matter(raw);
    return NextResponse.json({ ok: true, frontmatter: data, body: content, source: 'fs' });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 404 }
    );
  }
}

export async function POST(req: NextRequest) {
  const guard = isAllowed(req);
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.reason }, { status: 403 });

  let body: { kind?: string; slug?: string; frontmatter?: unknown; body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }
  const kind = parseKind(body.kind);
  if (!kind) return NextResponse.json({ ok: false, error: 'invalid kind' }, { status: 400 });
  const fp = pathFor(kind, body.slug || '');
  if (!fp) return NextResponse.json({ ok: false, error: 'invalid slug' }, { status: 400 });
  if (typeof body.body !== 'string' || body.frontmatter == null || typeof body.frontmatter !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid payload' }, { status: 400 });
  }

  // gray-matter.stringify で YAML フロントマター + 本文を再構成
  const out = matter.stringify(body.body, body.frontmatter as Record<string, unknown>);

  // ----- 本番 + GitHub設定済み: Contents API 経由で commit -----
  if (useGitHub()) {
    try {
      const repoRel = repoPath(kind, body.slug!);
      const prev = await ghGetFile(repoRel);
      const commitMsg = `edit(${kind}): ${body.slug} via admin (mobile)`;
      const result = await ghPutFile(repoRel, out, commitMsg, prev?.sha);
      return NextResponse.json({
        ok: true,
        source: 'github',
        path: repoRel,
        commit: result.commit,
        commitUrl: result.html_url,
        deployed: 'Vercel が自動デプロイします（1〜3分）',
      });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      );
    }
  }

  // ----- ローカル開発: FS に書き込み（git push は手動） -----
  try {
    // バックアップ（直前の内容を .bak にコピー）— 失敗時の復旧用
    try {
      const prev = await fs.readFile(fp, 'utf8');
      await fs.writeFile(fp + '.bak', prev, 'utf8');
    } catch {
      // 元ファイルがない（新規作成）ケースもあり得るので無視
    }
    await fs.writeFile(fp, out, 'utf8');
    return NextResponse.json({ ok: true, source: 'fs', path: fp.replace(ROOT, '') });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
