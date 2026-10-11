import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { SPOT_OVERRIDES_TAG, migrateSpotOverridesToHash } from '@/lib/spot-overrides';
import { isKvConfigured, getLastKvSetError } from '@/lib/kv-store';

/**
 * スポット上書きを旧キー（1つの JSON）から slug ごとの Hash へ移し替える（1回だけ実行する）。
 * 旧キーは読むだけで残す。書いた内容が旧キーと一致したときだけ切り替わる。
 * 2回目以降は何もせず現在の件数を返す。
 *
 *   curl -X POST -H "Referer: https://kyounoko.jp/admin/spots/edit" \
 *     https://kyounoko.jp/api/admin/spot-overrides/migrate
 */
export async function POST(req: NextRequest) {
  // ../route.ts の isAllowed と同じ条件（/admin 配下は Basic 認証の内側）
  if (process.env.NODE_ENV !== 'development') {
    if (process.env.ALLOW_ADMIN_EDIT === '0') {
      return NextResponse.json({ error: 'admin edit disabled (ALLOW_ADMIN_EDIT=0)' }, { status: 403 });
    }
    if (!/\/admin\//.test(req.headers.get('referer') || '')) {
      return NextResponse.json({ error: 'invalid referer' }, { status: 403 });
    }
  }
  if (!isKvConfigured()) return NextResponse.json({ error: 'KV not configured' }, { status: 400 });

  let result: Awaited<ReturnType<typeof migrateSpotOverridesToHash>>;
  try {
    result = await migrateSpotOverridesToHash();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 503 });
  }
  if (!result.ok) {
    return NextResponse.json({ error: result.error, kv: getLastKvSetError() }, { status: 500 });
  }
  if (!result.already) revalidateTag(SPOT_OVERRIDES_TAG);
  return NextResponse.json(result);
}
