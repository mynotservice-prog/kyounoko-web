import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * On-demand revalidation API
 *
 * 編集 API（edit-content / event-overrides 等）から呼ばれ、
 * 指定パスの Next.js キャッシュをパージする。
 * これにより Vercel デプロイ（ビルド消費）なしで本番反映できる。
 *
 * 認証: ADMIN_REVALIDATE_SECRET と一致する token を要求。
 *       内部呼び出しでは process.env から付与する。
 *
 * 使い方:
 *   POST /api/admin/revalidate
 *   body: { secret: string, paths: string[] }
 */

const SECRET = process.env.ADMIN_REVALIDATE_SECRET || 'kyounoko-revalidate-default';

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
  const revalidated: string[] = [];
  const errors: string[] = [];
  for (const p of body.paths) {
    if (typeof p !== 'string' || !p.startsWith('/')) {
      errors.push(`invalid path: ${String(p)}`);
      continue;
    }
    try {
      revalidatePath(p);
      revalidated.push(p);
    } catch (e) {
      errors.push(`${p}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return NextResponse.json({ ok: true, revalidated, errors });
}
