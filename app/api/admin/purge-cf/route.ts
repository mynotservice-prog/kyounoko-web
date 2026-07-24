import { NextRequest, NextResponse } from 'next/server';
import { purgeCfUrls } from '@/lib/cf-purge';

/**
 * Cloudflare エッジキャッシュの URL 単位パージ API
 *
 * 背景: HTML の CF エッジキャッシュが 24h TTL（perf(vercel) 15d1ddd）になり、
 * md 記事のデプロイ反映が最大1日遅れる。edit-content(KV保存) は自分のURLしか
 * パージしないため、「git 経由で md をまとめて更新した後に該当URLだけ即反映する」
 * 手段としてこのエンドポイントを使う（本番 env の CLOUDFLARE_API_TOKEN を利用）。
 *
 * 認証: /api/admin/revalidate と同じ ADMIN_REVALIDATE_SECRET。
 *
 * 使い方:
 *   POST /api/admin/purge-cf
 *   body: { secret: string, paths: string[] }   // paths は "/article/foo" 形式
 */

const SECRET = process.env.ADMIN_REVALIDATE_SECRET || 'kyounoko-revalidate-default';
const MAX_PATHS = 200;

export async function POST(req: NextRequest) {
  let body: { secret?: string; paths?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }
  if (body.secret !== SECRET) {
    return NextResponse.json({ ok: false, error: 'invalid secret' }, { status: 403 });
  }
  if (!Array.isArray(body.paths) || body.paths.length === 0) {
    return NextResponse.json({ ok: false, error: 'paths required' }, { status: 400 });
  }
  if (body.paths.length > MAX_PATHS) {
    return NextResponse.json({ ok: false, error: `paths は最大 ${MAX_PATHS} 件` }, { status: 400 });
  }
  const paths = body.paths.filter((p): p is string => typeof p === 'string' && p.startsWith('/'));
  if (paths.length === 0) {
    return NextResponse.json({ ok: false, error: 'valid paths required（"/" 始まりのみ）' }, { status: 400 });
  }
  const result = await purgeCfUrls(paths);
  return NextResponse.json({ ok: result.ok, purged: result.purged, skipped: result.skipped ?? null });
}
