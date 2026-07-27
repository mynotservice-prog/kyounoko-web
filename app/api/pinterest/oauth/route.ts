import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { PINTEREST_REDIRECT_URI, PINTEREST_SCOPES } from '@/lib/pinterest';

/**
 * GET /api/pinterest/oauth?secret=CRON_SECRET
 *
 * 一度きりの OAuth 開始エンドポイント（オーナー専用）。
 * Pinterest の認可画面へリダイレクトする。認可後 /callback で
 * refresh token が表示されるので、それを Vercel 環境変数
 * PINTEREST_REFRESH_TOKEN に保存する。
 *
 * 認証: ?secret= に CRON_SECRET を一致させる（refresh token 露出を防ぐため）。
 * 必要env: PINTEREST_APP_ID, CRON_SECRET。
 * 事前条件: Pinterest アプリの redirect URI に
 *   https://kyounoko.jp/api/pinterest/oauth/callback を登録しておくこと。
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf-8');
  const bb = Buffer.from(b, 'utf-8');
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided = request.nextUrl.searchParams.get('secret') ?? '';
  if (!secret || !safeEqual(provided, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const appId = process.env.PINTEREST_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: 'PINTEREST_APP_ID not set' }, { status: 500 });
  }

  const authUrl = new URL('https://www.pinterest.com/oauth/');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', PINTEREST_REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', PINTEREST_SCOPES.join(','));
  // state は CSRF 用の単純マーカー（このフローはオーナー手動の一度きり）
  authUrl.searchParams.set('state', 'kyounoko');

  return NextResponse.redirect(authUrl.toString());
}
