import { NextRequest, NextResponse } from 'next/server';
import {
  buildAdminSessionSetCookie,
  constantTimeEqual,
  createAdminSessionValue,
  readAdminSessionCookie,
  verifyAdminSessionValue,
} from '@/lib/admin-session';

/**
 * 1) ボットのクエリ総当たりからコストを守るハード遮断
 * 2) /admin 配下と /api/admin 配下の Basic 認証
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
// ここが第2層: ボットUA＋クエリ付きの対象パスは edge でクリーンURLへリダイレクトする。
// ページFunction起動もHTML転送も発生しないため、新UAが来ても課金は頭打ちになる。
//
// Googlebot 系だけは除外する（8/17の教訓: クエリ変種の noindex+canonical を
// 読ませないとインデックス残骸が剥がせなくなる）。人間のフィルタ操作もUA不一致で素通し。
//
// 【重要 / 2026-09-03 実測に基づく設計】この応答は UA によって内容が変わる。
// 共有キャッシュに保存されると、ボット向けのリダイレクトが一般ユーザーに配信され
// フィルタ操作が壊れる（キャッシュ汚染）。実測で判明した前提は次の3つ:
//
//   1. 本番でこの応答は Vercel CDN にも CF にも保存されていない
//      （x-vercel-cache ヘッダ自体が付かない＝middleware応答はCDN層を通らない、
//        cf-cache-status は常に DYNAMIC。bot 8連打→人間 の順で叩いても人間は 200）。
//      したがって以前付けていた `public, max-age=86400` は一度も効いておらず、
//      「CFに再訪を止めさせる」効果は存在しなかった。利得ゼロ・リスク非ゼロなので外す。
//   2. それでも危険は残る。このゾーンには **オリジンの Cache-Control を無視して
//      HTML をキャッシュする CF Cache Rule が実在する**（`/` は origin が
//      `private, no-cache, no-store` を返しているのに cf-cache-status: HIT）。
//      そのルールの対象が将来 /today に広がれば、ヘッダに何を書いても汚染されうる。
//   3. `Vary: User-Agent` は CF では標準キャッシュのキーに使われない
//      （CF が尊重する Vary は実質 Accept-Encoding のみ）。CF 対策にはならない。
//
// 結論: ヘッダは防御の主役にできない。よって
//   - 保存を促す指示を一切出さない（no-store。next.config が /today に付ける
//     CDN-Cache-Control も明示的に上書きする。あれは「CDNは24hキャッシュしろ」で危険）
//   - `Vary: User-Agent` は CF 以外の準拠キャッシュには正しく効くので付ける
//   - ステータスは 302（永続でない）。301 はクライアント側に半永久的に焼き付き、
//     UA判定を万一取りこぼした利用者がフィルタを二度と使えなくなる。実測でも
//     301 にボット再訪の抑止効果は見られなかった（適用後も同レートで再クロール）ため
//     301 を選ぶ利得が無い。
// 恒久的にキャッシュ層の手前で止めたい場合は CF WAF 側で遮断する（docs参照）。
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
  const res = NextResponse.redirect(clean, 302);

  // UA依存の応答なので、いかなる共有キャッシュにも保存させない。
  // next.config.ts の headers() が /today 等に付ける
  // `CDN-Cache-Control: public, max-age=86400, stale-while-revalidate=604800`
  // がこの応答にも乗るため、3種すべてを明示的に打ち消す。
  res.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  res.headers.set('CDN-Cache-Control', 'no-store');
  res.headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
  // CF は無視するが、準拠する中間キャッシュには正しくUA別キーを作らせる
  res.headers.set('Vary', 'User-Agent');
  return res;
}

// ===== 2) /admin・/api/admin の Basic 認証 =====
//
// /api/admin/* のうち、Basic 認証ではなく body の ADMIN_REVALIDATE_SECRET で認証するルート。
// これらは Basic 認証の外に置く（素通し）。理由:
//   - /api/admin/revalidate は edit-content が本番内から fetch で呼ぶ（Authorization 無し）
//   - /api/admin/purge-cf は scripts/publish.mjs と定期タスクが secret だけで呼ぶ
// ここで Basic を二重にかけると、その経路が全部 401 で止まる。
// 自前 Basic 認証を持つ /api/admin/reviews は同じ Authorization ヘッダを見るだけなので
// 二重にかけても壊れず、除外しない。
const API_ADMIN_SECRET_AUTH_PATHS = ['/api/admin/purge-cf', '/api/admin/revalidate'];

function isSecretAuthApiPath(pathname: string): boolean {
  return API_ADMIN_SECRET_AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/**
 * /admin 配下と /api/admin 配下を Basic 認証で保護する。
 *
 * 2026-10-09 まで matcher が /admin/:path* だけで、/api/admin/* は各 route の
 * 「Referer に /admin/ を含むか」判定しか無かった。Referer は誰でも付けられるため、
 * 本番で curl -H "Referer: https://kyounoko.jp/admin/" だけで metrics の読み取り
 * （200）や GitHub commit / KV 書き込みが通る状態だった（Phase 0 監査 §7）。
 * 各 route の Referer 判定は多層防御として残す。
 *
 * 環境変数:
 *   ADMIN_USER     ... 管理ユーザー名（Vercel env で設定）
 *   ADMIN_PASSWORD ... 管理パスワード（Vercel env で設定）
 *
 * 未設定時は 503 を返し、誤って公開されないようにする。
 * HTTPS 前提（Vercel 本番は常時 HTTPS）なので Basic Auth で十分。
 *
 * 管理画面（/admin/*）のブラウザ fetch が /api/admin/* を呼ぶとき、「/admin で入力した
 * Basic 資格情報を同じ realm の 401 にブラウザが自動再送する」のはブラウザ実装依存で、
 * 保存操作が 401 で止まりうる。そこで 2026-10-10 から、Basic 認証に成功した応答に
 * 署名付き HttpOnly クッキー（lib/admin-session.ts・12 時間で失効）を付け、
 * /admin/* と /api/admin/* は「Basic 成功 → 通す（クッキー発行）／Basic 無し・不正 →
 * 有効なクッキーがあれば通す／どちらも無ければ 401」の順で判定する。
 * クッキーは Basic 成功の証明なので認証の弱体化ではない。
 * 手元のスクリプトから叩く場合は scripts/publish.mjs 等のように .env.local の
 * ADMIN_USER / ADMIN_PASSWORD で Authorization: Basic を付ける（従来どおり）。
 */
export async function middleware(req: NextRequest) {
  const blocked = botQueryGuard(req);
  if (blocked) return blocked;

  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin/') && !isSecretAuthApiPath(pathname);
  if (!isAdminPage && !isAdminApi) {
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
        const res = NextResponse.next();
        // Basic 成功時にセッションクッキーを発行。鍵材料が無い場合（理論上ここでは
        // ADMIN_USER/PASSWORD が揃っているので起きない）はクッキー無しで通す。
        const value = await createAdminSessionValue();
        if (value) {
          res.headers.append(
            'Set-Cookie',
            buildAdminSessionSetCookie(value, req.nextUrl.protocol === 'https:'),
          );
        }
        return res;
      }
    }
  }

  // Basic が無い／不正 → 一度 Basic に成功して発行されたクッキーが有効なら通す
  if (await verifyAdminSessionValue(readAdminSessionCookie(req.headers))) {
    return NextResponse.next();
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin area", charset="UTF-8"',
    },
  });
}

export const config = {
  // botQueryGuard の対象パス（BOT_QUERY_BLOCKED_PATHS と一致させること）
  // ＋ Basic 認証の対象（/admin と /api/admin。secret 認証ルートは middleware 内で素通し）
  matcher: ['/admin/:path*', '/api/admin/:path*', '/today', '/events', '/ranking', '/spots', '/search'],
};
