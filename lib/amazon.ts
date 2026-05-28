/**
 * Amazon アフィリエイトURLラッピングユーティリティ。
 *
 * 優先順位:
 *   1. もしも経由 Amazon（NEXT_PUBLIC_MOSHIMO_AMAZON_PC_ID + PL_ID + 共通 A_ID が必要）
 *   2. Amazon アソシエイト直接タグ付与（NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG が必要）
 *   3. どちらも未設定なら元URLをそのまま返す（no-op）
 *
 * 使い方:
 *   AffiliateLink コンポーネントは provider='amazon' のとき wrapAmazonAssociate() を
 *   通して href を最終URLに変換する。Amazon ドメイン（amazon.co.jp / amzn.to /
 *   amazon.com）配下のURLのみ対象。
 *
 * 必要な環境変数（もしも経由の場合）:
 *   NEXT_PUBLIC_MOSHIMO_A_ID            — もしもユーザーID（楽天と共通）
 *   NEXT_PUBLIC_MOSHIMO_AMAZON_P_ID     — Amazonプロモーションのp_id（既定: 170）
 *   NEXT_PUBLIC_MOSHIMO_AMAZON_PC_ID    — Amazonプロモーションのpc_id
 *   NEXT_PUBLIC_MOSHIMO_AMAZON_PL_ID    — Amazonプロモーションのpl_id
 *
 * 必要な環境変数（直接アソシエイトの場合）:
 *   NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG    — Amazonアソシエイト ID（例: 'kyounoko-22'）
 *
 * 申請:
 *   - もしも経由: https://af.moshimo.com/ にログイン後「プロモーション検索」で
 *     "Amazon" を検索し、提携申請。承認後に発行されるHTMLコードから
 *     a_id / pc_id / pl_id を抽出して設定する。
 *   - 直接: https://affiliate.amazon.co.jp/ で申請（180日以内に3件売上の条件あり）。
 */

const AMAZON_DOMAIN_RE =
  /^https?:\/\/([^/]*\.)?(amazon\.co\.jp|amazon\.com|amzn\.to|amzn\.asia)\//i;

function getMoshimoAmazonConfig(): {
  a_id: string;
  p_id: string;
  pc_id: string;
  pl_id: string;
} | null {
  const a_id = process.env.NEXT_PUBLIC_MOSHIMO_A_ID?.trim();
  const p_id = process.env.NEXT_PUBLIC_MOSHIMO_AMAZON_P_ID?.trim() ?? '170';
  const pc_id = process.env.NEXT_PUBLIC_MOSHIMO_AMAZON_PC_ID?.trim();
  const pl_id = process.env.NEXT_PUBLIC_MOSHIMO_AMAZON_PL_ID?.trim();
  if (!a_id || !pc_id || !pl_id) return null;
  return { a_id, p_id, pc_id, pl_id };
}

function getAssociateTag(): string | undefined {
  return process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim();
}

/**
 * Amazon 商品URL / 検索URLにアフィリエイト経由のラッピングを適用する。
 * - もしも経由のENVが揃っていれば af.moshimo.com 経由URLに変換（推奨）
 * - 直接アソシエイトタグのみ設定があれば ?tag=xxx を付与
 * - どちらも無ければ元URLをそのまま返す
 * - 既に af.moshimo.com 経由 or tag= 付きなら触らない
 *
 * @param productUrl Amazon商品URL（/dp/XXX や /s?k=YYY 形式どちらも可）
 */
export function wrapAmazonAssociate(productUrl: string): string {
  if (!productUrl || productUrl === '#') return productUrl;

  // Amazon ドメイン判定（日本版・国際版・短縮URLすべて）
  if (!AMAZON_DOMAIN_RE.test(productUrl)) return productUrl;

  // 1. もしも経由Amazon優先
  const moshimo = getMoshimoAmazonConfig();
  if (moshimo) {
    const params = new URLSearchParams({
      a_id: moshimo.a_id,
      p_id: moshimo.p_id,
      pc_id: moshimo.pc_id,
      pl_id: moshimo.pl_id,
      url: productUrl,
    });
    return `https://af.moshimo.com/af/c/click?${params.toString()}`;
  }

  // 2. 直接アソシエイトタグ
  const tag = getAssociateTag();
  if (!tag) return productUrl;

  try {
    const url = new URL(productUrl);
    if (url.searchParams.has('tag')) return productUrl;
    url.searchParams.set('tag', tag);
    return url.toString();
  } catch {
    return productUrl;
  }
}

/** デバッグ用: Amazonアフィリエイト経由のいずれかが設定されているか */
export function isAmazonAssociateConfigured(): boolean {
  return Boolean(getMoshimoAmazonConfig()) || Boolean(getAssociateTag());
}
