/**
 * もしもアフィリエイト用のトラッキングURL生成ユーティリティ。
 *
 * 使い方:
 *   lib/affiliate-products.ts の provider='rakuten' アイテムに、楽天市場の商品URL
 *   (例: https://item.rakuten.co.jp/shopname/productcode/) を `href` に指定する。
 *   AffiliateLink コンポーネントは provider='rakuten' のときに wrapMoshimoRakuten()
 *   で自動的にもしも経由のリダイレクト URL に変換する。
 *
 * 必要な環境変数:
 *   NEXT_PUBLIC_MOSHIMO_A_ID        — もしもアフィリエイト 会員ID（全プロモ共通）
 *   NEXT_PUBLIC_MOSHIMO_RAKUTEN_P_ID = '54' 固定でOK（楽天市場の商品購入 プロモID）
 *   NEXT_PUBLIC_MOSHIMO_RAKUTEN_PC_ID — プロモコード（広告取得時に発行）
 *   NEXT_PUBLIC_MOSHIMO_RAKUTEN_PL_ID — 広告ID（広告取得時に発行）
 *
 * 広告取得ページ:
 *   https://af.moshimo.com/af/shop/promotion/source?promotion_id=54&shop_site_id=668264
 *   で発行される HTMLコードから a_id / pc_id / pl_id が取得できる。
 */

const MOSHIMO_CLICK_URL = 'https://af.moshimo.com/af/c/click';

function getEnv(): {
  a_id?: string;
  p_id?: string;
  pc_id?: string;
  pl_id?: string;
} {
  return {
    a_id: process.env.NEXT_PUBLIC_MOSHIMO_A_ID?.trim(),
    p_id: process.env.NEXT_PUBLIC_MOSHIMO_RAKUTEN_P_ID?.trim() ?? '54',
    pc_id: process.env.NEXT_PUBLIC_MOSHIMO_RAKUTEN_PC_ID?.trim(),
    pl_id: process.env.NEXT_PUBLIC_MOSHIMO_RAKUTEN_PL_ID?.trim(),
  };
}

/**
 * 楽天商品URLをもしも経由のトラッキングURLにラップする。
 * env が未設定の場合、あるいは入力URLが楽天ドメインでない場合は、元のURLをそのまま返す。
 */
export function wrapMoshimoRakuten(productUrl: string): string {
  if (!productUrl || productUrl === '#') return productUrl;

  const { a_id, p_id, pc_id, pl_id } = getEnv();

  // env 未設定 or 楽天以外 → そのまま返す
  if (!a_id || !pc_id || !pl_id) return productUrl;
  const isRakuten = /^https?:\/\/([^/]*\.)?rakuten\.co\.jp\//i.test(productUrl);
  if (!isRakuten) return productUrl;

  const params = new URLSearchParams({
    a_id,
    p_id: p_id ?? '54',
    pc_id,
    pl_id,
    url: productUrl,
  });
  return `${MOSHIMO_CLICK_URL}?${params.toString()}`;
}

/**
 * 入力文字列（HTMLコード or URL）から a_id / pc_id / pl_id を抽出する補助関数。
 * 主に開発時のデバッグ/検証用。
 */
export function parseMoshimoCode(code: string): {
  a_id?: string;
  pc_id?: string;
  pl_id?: string;
  p_id?: string;
} {
  const m = (re: RegExp): string | undefined => {
    const r = re.exec(code);
    return r ? r[1] : undefined;
  };
  return {
    a_id: m(/[?&]a_id=([^&"'\s]+)/),
    p_id: m(/[?&]p_id=([^&"'\s]+)/),
    pc_id: m(/[?&]pc_id=([^&"'\s]+)/),
    pl_id: m(/[?&]pl_id=([^&"'\s]+)/),
  };
}

/** デバッグ用: もしも楽天経由のトラッキングURLが実際に生成できる状態か？ */
export function isMoshimoRakutenConfigured(): boolean {
  const { a_id, pc_id, pl_id } = getEnv();
  return Boolean(a_id && pc_id && pl_id);
}
