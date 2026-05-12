import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { submitToIndexNow, INDEXNOW_HOST } from '@/lib/indexnow';

/**
 * IndexNow 通知用 API ルート（軽量版）。
 *
 * v2: lib/articles を import せず、content/articles の .md ファイル名だけを
 *     fs.readdirSync で見て URL を組み立てる。これにより API Function バンドルから
 *     lib/articles → fs.existsSync(public/...) の鎖を切り、Vercel Function サイズの
 *     300MB 上限を確実に下回らせる。
 *
 * ## エンドポイント
 * - GET  /api/indexnow/submit
 *      → content/articles/*.md のファイル名から URL を生成して通知
 * - POST /api/indexnow/submit  with body { urls: string[] }
 *      → 任意 URL リストを通知
 *
 * ## 認可
 * 環境変数 INDEXNOW_TRIGGER_TOKEN がセットされている場合、
 * `?token=...` または `Authorization: Bearer ...` を必須とする。
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isAuthorized(req: Request): boolean {
  const token = process.env.INDEXNOW_TRIGGER_TOKEN;
  if (!token) return true;
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get('token');
  const fromHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return fromQuery === token || fromHeader === token;
}

/**
 * content/articles/*.md のファイル名から slug を抽出して URL を組み立てる。
 * frontmatter 解析・hero画像存在チェックなどは行わない（軽量化のため）。
 */
function listAllArticleUrls(): string[] {
  try {
    const dir = path.join(process.cwd(), 'content', 'articles');
    const files = fs.readdirSync(dir);
    return files
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .map((f) => `https://${INDEXNOW_HOST}/article/${f.replace(/\.md$/, '')}`);
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const urls = [`https://${INDEXNOW_HOST}/`, ...listAllArticleUrls()];
  const result = await submitToIndexNow(urls);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const urls = (body as { urls?: unknown }).urls;
  if (!Array.isArray(urls) || urls.some((u) => typeof u !== 'string')) {
    return NextResponse.json(
      { ok: false, error: 'Body must be { urls: string[] }' },
      { status: 400 },
    );
  }

  const result = await submitToIndexNow(urls as string[]);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
