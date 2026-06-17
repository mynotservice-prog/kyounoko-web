/**
 * 外食予約（ホットペッパーグルメ）等のネット予約CTAを、記事文脈に応じて出すための
 * env ゲート付きオファー生成ユーティリティ。
 *
 * ## 設計意図（「env を差すだけで点灯」）
 * きょうのこの流入主力は「子連れで○○（チェーン店）に行ける？」系の外食記事（GSC実データで約8割）。
 * しかし現状この勝ちトラフィックには「家用の物販／幼児食宅配」しか導線が無く、
 * 読者の意図（=今から外食する）に最も近い「ネット予約」の収益導線が欠けている。
 *
 * 本命のホットペッパーグルメはバリューコマース（VC）経由の成果報酬で、
 * 提携審査が下りるまで実リンクを貼れない。そこで:
 *   - 審査前: env 未設定 → オファーは null（CTA枠は描画されない＝無害）
 *   - 審査後: VC の MyLink URL を env に1行入れるだけで、外食文脈の全記事に予約CTAが点灯
 * という運用にして、承認到着＝即収益化できる状態を先に用意する。
 *
 * ## 必要な環境変数（VC 提携承認後に設定）
 *   NEXT_PUBLIC_VC_HOTPEPPER_URL
 *     ホットペッパーグルメの VC アフィリエイトURL（MyLinkで「子連れ・キッズメニュー」等の
 *     検索結果に深くリンクすると成約率が上がる）。
 *     形式例: https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=...&pid=...&vc_url=...
 *
 * provider='valuecommerce' は wrap 不要でそのまま href に使う（lib/moshimo の楽天とは異なる）。
 */

import { isRestaurantContext } from '@/lib/article-product-hints';

export type ReservationOffer = {
  /** 遷移先（VCアフィリエイトURL。env から取得） */
  href: string;
  /** カード見出し */
  heading: string;
  /** 補足説明 */
  note: string;
  /** ボタン文言 */
  cta: string;
  /** GA4 トラッキング用の識別子 */
  itemId: string;
};

/** http(s) の正規URLか（壊れた env 値で空カードを出さないための防御）。 */
function isValidUrl(url: string | undefined): url is string {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
}

/**
 * 外食文脈の記事に出す「ネット予約」CTA（ホットペッパーグルメ / VC）。
 *
 * - 非外食文脈、または env 未設定なら null（=描画しない）。
 * - env が設定されていれば、子連れOK店のネット予約へ橋渡しするオファーを返す。
 */
export function getRestaurantReservationOffer(
  slug: string,
  category?: string,
  title?: string,
): ReservationOffer | null {
  if (!isRestaurantContext(slug, category, title)) return null;

  const href = process.env.NEXT_PUBLIC_VC_HOTPEPPER_URL?.trim();
  if (!isValidUrl(href)) return null;

  return {
    href,
    heading: '子連れOKのお店をネット予約',
    note: 'キッズメニュー・個室・ベビーカー入店など、子連れ向け条件でお店を探して当日席を確保。',
    cta: 'ホットペッパーで子連れOK店を予約 →',
    itemId: 'hotpepper-reservation',
  };
}

/**
 * スポット詳細ページ向けのネット予約/チケットCTA（カテゴリ別）。
 *
 * メモリ「最大の未開拓面」= /spot/[slug] はアフィゼロ。流入文脈に合わせて出し分ける:
 *   - restaurant → ホットペッパーグルメ予約（NEXT_PUBLIC_VC_HOTPEPPER_URL）
 *   - aquarium / amusement / zoo / museum / farm / seasonal / indoor
 *       → アソビュー！のレジャーチケット（NEXT_PUBLIC_VC_ASOVIEW_URL）
 *   - park → 予約導線なし（基本無料施設）
 *
 * env 未設定 or 該当カテゴリ外なら null（=描画しない）。VC承認後に env を入れるだけで点灯。
 */
const ASOVIEW_CATEGORIES = new Set([
  'aquarium',
  'amusement',
  'zoo',
  'museum',
  'farm',
  'seasonal',
  'indoor',
]);

export function getSpotReservationOffer(category: string): ReservationOffer | null {
  if (category === 'restaurant') {
    const href = process.env.NEXT_PUBLIC_VC_HOTPEPPER_URL?.trim();
    if (!isValidUrl(href)) return null;
    return {
      href,
      heading: 'このお店をネット予約',
      note: '子連れ向けの席・コースを確認して、当日の席を確保。',
      cta: 'ホットペッパーで予約 →',
      itemId: 'hotpepper-reservation-spot',
    };
  }
  if (ASOVIEW_CATEGORIES.has(category)) {
    const href = process.env.NEXT_PUBLIC_VC_ASOVIEW_URL?.trim();
    if (!isValidUrl(href)) return null;
    return {
      href,
      heading: 'チケット・前売りをチェック',
      note: '当日券の行列を避けて、事前にレジャーチケットを購入できる場合があります。',
      cta: 'アソビュー！で前売り券を見る →',
      itemId: 'asoview-ticket-spot',
    };
  }
  return null;
}
