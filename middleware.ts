import { NextRequest, NextResponse } from 'next/server';

/**
 * 1) ボットのクエリ総当たりからコストを守るハード遮断
 * 2) /admin 配下の Basic 認証
 */

// ===== 1) ボット×クエリ変種の遮断 =====
//
// 背景: /today 等はクエリごとに別キャッシュキー＝ユニーククエリの総当たりは
// ほぼ毎回 Function 起動＋Origin転送になり、Vercel費を直撃する。
//   - 2026-08/27〜09/02: ClaudeBot+GPTBot が 42万req/12h → 6日で$39
//   - 2026-09/02夜〜: robots.txt の列挙に無い新UA claude-searchbot が 34K req/12h
//
// robots.txt（デフォルト拒否に反転済み・app/robots.ts）が第1層だが、
// あれは紳士協定で、取得ラグ中や非準拠ボットには効かない。
// ここが第2層: ボットUA＋クエリ付きの対象パスは edge で 301 をクリーンURLへ返す。
// Function 起動もデータ転送も発生しないため、どんな新UAが来ても課金は微小で頭打ち。
//
// Googlebot 系だけは除外する（8/17の教訓: クエリ変種の noindex+canonical を
// 読ませないとインデックス残骸が剥がせなくなる）。人間のフィルタ操作もUA不一致で素通し。
const BOT_QUERY_BLOCKED_PATHS = new Set(['/today', '/events', '/ranking', '/spots', '/search']);

// Google 検索・広告系は遮断しない（noindex を読ませる／AdSense・検査ツールを止めない）
const GOOGLE_UA_RE =
  /googlebot|google-inspectiontool|adsbot-google|mediapartners-google|apis-google|storebot-google/i;

// 一般的なボットUAの検出。`bot` の部分一致で claude-searchbot / gptbot / amazonbot /
// applebot / bingbot / semrushbot 等を包括し、`bot` を含まない既知UAを個別に足す。
const BOT_UA_RE =
  /bot|crawl|spider|slurp|chatgpt|claude|anthropic|openai|perplexity|meta-external|facebookexternal|bytespider|bytedance|yandex|ahrefs|dataforseo|scrapy|python-requests|go-http-client|curl|wget/i;

function botQueryGuard(req: NextRequest): NextResponse | null {
  const { pathname, search } = req.nextUrl;
  if (!search || !BOT_QUERY_BLOCKED_PATHS.has(pathname)) return null;

  const ua = req.headers.get('user-agent') ?? '';
  // UA無しもボット扱い（ブラウザは必ずUAを送る）
  const isBot = ua === '' || (BOT_UA_RE.test(ua) && !GOOGLE_UA_RE.test(ua));
  if (!isBot) return null;

  const clean = req.nextUrl.clone();
  clean.search = '';
  const res = NextResponse.redirect(clean, 301);
  // CF にも redirect を1日キャッシュさせ、同一URLの再訪を Vercel まで届かせない
  res.headers.set('Cache-Control', 'public, max-age=86400');
  return res;
}

/**
 * /admin 配下を Basic 認証で保護する。
 *
 * 環境変数:
 *   ADMIN_USER     ... 管理ユーザー名（Vercel env で設定）
 *   ADMIN_PASSWORD ... 管理パスワード（Vercel env で設定）
 *
 * 未設定時は 503 を返し、誤って公開されないようにする。
 * HTTPS 前提（Vercel 本番は常時 HTTPS）なので Basic Auth で十分。
 */
export function middleware(req: NextRequest) {
  const blocked = botQueryGuard(req);
  if (blocked) return blocked;

  if (!req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return new NextResponse('Admin is not configured. Set ADMIN_USER and ADMIN_PASSWORD env vars.', {
      status: 503,
    });
  }

  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Basic ')) {
    const encoded = auth.slice(6).trim();
    let decoded = '';
    try {
      decoded = atob(encoded);
    } catch {
      // fallthrough
    }
    const idx = decoded.indexOf(':');
    if (idx !== -1) {
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);
      if (constantTimeEqual(user, expectedUser) && constantTimeEqual(pass, expectedPass)) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin area", charset="UTF-8"',
    },
  });
}

export const config = {
  // botQueryGuard の対象パス（BOT_QUERY_BLOCKED_PATHS と一致させること）＋ /admin
  matcher: ['/admin/:path*', '/today', '/events', '/ranking', '/spots', '/search'],
};

/** タイミング攻撃を弱めるための定数時間比較（Edge Runtime 互換） */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
