import { NextResponse } from 'next/server';
import { submitToIndexNow, submitAllArticlesToIndexNow } from '@/lib/indexnow';

/**
 * IndexNow 通知用 API ルート。
 *
 * ## エンドポイント
 * - GET  /api/indexnow/submit
 *      → 全記事 + トップページ をまとめて通知
 * - POST /api/indexnow/submit  with body { urls: string[] }
 *      → 任意 URL リストを通知（同一ホストのみ採用）
 *
 * ## 認可
 * 環境変数 INDEXNOW_TRIGGER_TOKEN がセットされている場合、
 * `?token=...` または `Authorization: Bearer ...` を必須とする。
 * 未設定なら認証なしでも動くが、本番では必ずセットすること。
 *
 * ## 想定の使い方
 * - 記事公開後に手動で叩く（ローカルから curl）
 * - GitHub Actions / Vercel Cron でビルド後に GET を叩く
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isAuthorized(req: Request): boolean {
  const token = process.env.INDEXNOW_TRIGGER_TOKEN;
  if (!token) return true; // 未設定なら誰でも叩ける（INDEXNOW_KEY 自体が秘密なので最低限の防壁はある）

  const url = new URL(req.url);
  const fromQuery = url.searchParams.get('token');
  const fromHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return fromQuery === token || fromHeader === token;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const result = await submitAllArticlesToIndexNow();
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
