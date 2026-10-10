/**
 * アフィリエイト送客リンクに限り、クリック元のページ URL を ASP に渡す。
 *
 * 背景（2026-10-10 実測）: サイト全体は `Referrer-Policy: strict-origin-when-cross-origin`（next.config.ts）で、
 * 外部へはオリジンだけが渡る。そのためバリューコマースの注文レポートのリファラは全件サイトのトップになり、
 * 「どの記事から売れたか」が ASP 側のデータに残らない。
 *
 * やること: クリック（ポインタ押下）の直前に、送客先が ASP のリンクだけ `referrerpolicy` を
 * `no-referrer-when-downgrade` にし、rel に `noreferrer` があれば外す。サーバーが返す HTML は変えない。
 *
 * やらないこと:
 * - 会員・管理・フォームのページでは何もしない（URL を外に出さない）。
 * - クエリが付いたページでは、広告・検索の計測用パラメータだけのとき以外は何もしない
 *   （決済セッション ID などを外に出さないため）。
 * - Amazon・楽天・Yahoo への直リンクは対象外（注文レポートにリファラが出ないので渡す意味がない）。
 */

const ASP_HOST = /(^|\.)(valuecommerce\.com|moshimo\.com|a8\.net)$/;
const PRIVATE_PATH = /^\/(admin|api)(\/|$)/;
const SAFE_QUERY_KEY = /^(utm_[a-z]+|gclid|gbraid|wbraid|gad_source|gad_campaignid|fbclid|yclid|msclkid|srsltid)$/;
const POLICY = 'no-referrer-when-downgrade';

function pageUrlIsShareable(): boolean {
  const { pathname, search } = window.location;
  if (PRIVATE_PATH.test(pathname)) return false;
  if (!search) return true;
  for (const key of new URLSearchParams(search).keys()) {
    if (!SAFE_QUERY_KEY.test(key)) return false;
  }
  return true;
}

function prepare(e: Event): void {
  const target = e.target as Element | null;
  const a = target?.closest?.('a[href]');
  if (!(a instanceof HTMLAnchorElement) || a.referrerPolicy === POLICY) return;
  let host = '';
  try {
    host = new URL(a.href).hostname;
  } catch {
    return;
  }
  if (!ASP_HOST.test(host) || !pageUrlIsShareable()) return;
  a.referrerPolicy = POLICY;
  if (a.relList.contains('noreferrer')) {
    a.relList.remove('noreferrer');
    a.relList.add('noopener');
  }
}

/** ルートのクライアントコンポーネントから 1 回だけ呼ぶ。戻り値は解除関数。 */
export function installAffiliateReferrer(): () => void {
  // pointerdown: 左・中クリックと、右クリック→「新しいタブで開く」の前に効く。click: キーボード操作の分。
  document.addEventListener('pointerdown', prepare, true);
  document.addEventListener('click', prepare, true);
  return () => {
    document.removeEventListener('pointerdown', prepare, true);
    document.removeEventListener('click', prepare, true);
  };
}
