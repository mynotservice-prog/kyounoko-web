/**
 * Amazon アソシエイト用のアフィリエイトタグ自動付与ユーティリティ。
 *
 * 使い方:
 *   AffiliateLink コンポーネントは provider='amazon' のとき wrapAmazonAssociate() を
 *   通して href を最終URLに変換する。Amazon ドメイン（amazon.co.jp / amzn.to /
 *   amazon.com）で、かつ env `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` が設定されて
 *   いる場合に限り、`tag=` パラメータを付与する。
 *
 * 必要な環境変数:
 *   NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG  — Amazonアソシエイト ID（例: 'kyounoko-22'）
 *
 * 申請:
 *   https://affiliate.amazon.co.jp/ で申請。審査通過後にトラッキングIDが発行される。
 *   複数サイト運用するなら、サイトごとにトラッキングIDを作成しておくと分析しやすい。
 */

function getAssociateTag(): string | undefined {
  return process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim();
}

/**
 * Amazon 商品URL / 検索URLに associate tag (`?tag=xxx-22`) を自動付与する。
 * - env 未設定 → 元URL をそのまま返す（no-op）
 * - Amazon ドメイン以外 → 元URL をそのまま返す
 * - 既に `tag=` が付いている → そのまま返す（上書きしない）
 *
 * @param productUrl Amazon商品URL（/dp/XXX や /s?k=YYY 形式どちらも可）
 */
export function wrapAmazonAssociate(productUrl: string): string {
  if (!productUrl || productUrl === '#') return productUrl;

  const tag = getAssociateTag();
  if (!tag) return productUrl;

  // Amazon ドメイン判定（日本版・国際版・短縮URLすべて）
  const isAmazon = /^https?:\/\/([^/]*\.)?(amazon\.co\.jp|amazon\.com|amzn\.to|amzn\.asia)\//i.test(
    productUrl,
  );
  if (!isAmazon) return productUrl;

  try {
    const url = new URL(productUrl);
    // 既に tag が付いていたら上書きしない（誤ってトラッキングID変更する事故を防ぐ）
    if (url.searchParams.has('tag')) return productUrl;
    url.searchParams.set('tag', tag);
    return url.toString();
  } catch {
    return productUrl;
  }
}

/** デバッグ用: Amazon associate tag が設定されているか */
export function isAmazonAssociateConfigured(): boolean {
  return Boolean(getAssociateTag());
}
