import { NextRequest, NextResponse } from 'next/server';
import { PINTEREST_REDIRECT_URI } from '@/lib/pinterest';

/**
 * GET /api/pinterest/oauth/callback?code=...
 *
 * Pinterest からの認可コールバック。authorization_code を
 * access_token + refresh_token に交換し、refresh_token を画面に表示する。
 * 表示された値を Vercel 環境変数 PINTEREST_REFRESH_TOKEN に保存すれば、
 * 以降は cron が自動で投稿する（完全自動運用の開始）。
 *
 * 必要env: PINTEREST_APP_ID, PINTEREST_APP_SECRET。
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: 'missing code' }, { status: 400 });
  }

  const appId = process.env.PINTEREST_APP_ID;
  const appSecret = process.env.PINTEREST_APP_SECRET;
  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: 'PINTEREST_APP_ID / PINTEREST_APP_SECRET not set' },
      { status: 500 },
    );
  }

  const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' + Buffer.from(`${appId}:${appSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: PINTEREST_REDIRECT_URI,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    refresh_token?: string;
    access_token?: string;
    scope?: string;
    refresh_token_expires_in?: number;
  };

  if (!res.ok || !json.refresh_token) {
    return NextResponse.json(
      { error: 'token exchange failed', status: res.status, detail: json },
      { status: 502 },
    );
  }

  // refresh token をコピーしやすい形で表示（オーナーのみが到達する一度きりの画面）
  const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="robots" content="noindex">
<title>Pinterest 連携完了</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1a1a1a}
code{background:#eef2e8;padding:2px 6px;border-radius:4px;word-break:break-all}
.box{background:#f7faf3;border:1px solid #d9e4cc;border-radius:12px;padding:20px;margin:16px 0}
textarea{width:100%;height:90px;font-family:monospace;font-size:13px;padding:10px;border:1px solid #ccc;border-radius:8px}</style>
</head><body>
<h1>✅ Pinterest 連携に成功しました（きょうのこ）</h1>
<p>付与スコープ: <code>${(json.scope ?? '').replace(/[<>]/g, '')}</code></p>
<div class="box">
<p><strong>この refresh token を Vercel の環境変数 <code>PINTEREST_REFRESH_TOKEN</code> に保存してください。</strong></p>
<textarea readonly onclick="this.select()">${json.refresh_token}</textarea>
<p style="color:#a05">⚠️ この値は秘密情報です。保存したらこのタブを閉じてください。</p>
</div>
<p>保存後、<code>/api/cron/pinterest-pin</code> が次回 cron 実行から自動投稿を開始します。</p>
</body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
