/**
 * アフィリエイト枠の位置（GA4 `affiliate_click` の `placement` パラメータ）。
 *
 * 背景: `affiliate_click` は provider と item_id だけを送っていて、どの枠で押されたかが分からなかった。
 * GA4 には登録済みのカスタム定義 `placement`（internal_link_click・line_cta_view と共用）があるので、
 * 同じパラメータ名で枠の位置を送る。新しいカスタム定義は要らない。
 *
 * 命名: `<ページの種類>-<ページ内の位置>[-<枠の種類>]`。同じ値を別の位置に使い回さない。
 * GA4 の `placement` は他のイベントと共用なので、集計するときは必ず eventName と掛ける。
 * 枠を足したり動かしたりしたら、ここに値を足す（型で呼び出し側の付け忘れを止める）。
 */
export type AffiliatePlacement =
  // --- 記事 /article/[slug] ---
  | 'article-top-reservation' // TL;DR 直後のネット予約（ReservationCTA）
  | 'article-end-picks' // 末尾「この記事で紹介したアイテム」（手作りカード・AffiliateLinkGroup）
  | 'article-end-related' // 末尾の関連商品（カードが無い記事・RelatedItemsCTA）
  | 'article-end-offer' // 末尾の高単価 1 枠（申込型 > 生協 > 宿予約・ReservationCTA）
  | 'article-end-bridge' // 末尾の幼児食宅配ブリッジ（InlineItemCTA）
  | 'article-end-leisure' // 末尾のレジャー予約ブリッジ（ReservationCTA）
  | 'article-body-celebration-home' // お祝いの面の本文・料金の節の直後「自宅でお祝いする場合」（InlineItemCTA・lib/celebration-home-offer.ts）
  // --- スポット /spot/[slug] ---
  | 'spot-reservation' // ネット予約・チケット
  | 'spot-travel' // 子連れ宿予約（レジャースポット）
  // --- きょうの流れ /today ---
  | 'today-plan-lunch' // プラン下のお昼の予約
  | 'today-lunch-list' // お昼の一覧の下の予約
  | 'today-items' // 「あったら便利なもの」
  // --- 駅 /station/[slug]・/station/[slug]/[condition] ---
  | 'station-items' // 駅ページ下部の外食グッズ
  | 'station-shops' // 駅ページの子連れOK店の「ホットペッパーで店舗情報・予約を見る」（2026-11-21〜）
  | 'station-condition-items' // 条件ページのお助けグッズ
  | 'station-condition-bridge' // 条件ページの幼児食宅配ブリッジ
  | 'station-condition-shops' // 条件ページの店の一覧のホットペッパー店舗リンク（作り直した面・旧い面の両方。2026-11-21〜）
  // --- その他の一覧・カタログ ---
  | 'category-items' // /category/[slug] の人気商品
  | 'plan-items' // /plan/[id] の「あると便利なもの」
  | 'items-catalog'; // /items のカタログ

/**
 * Server Component の `<a>` に付ける `affiliate_click` の計測属性（`<a {...affiliateClickAttrs(…)}>`）。
 *
 * クリックは components/common/AnalyticsRouteTracker.tsx が `data-ev` を拾って送る
 * （`data-ev-xxx` がそのままパラメータ xxx になる）。onClick で送る部品（ReservationCTA など）と
 * 同じ provider・item_id・placement の 3 つを送る。アフィリエイトの計測付きリンクのときだけ付けること。
 */
export function affiliateClickAttrs(
  placement: AffiliatePlacement,
  itemId: string,
  provider = 'valuecommerce',
) {
  return {
    'data-ev': 'affiliate_click',
    'data-ev-provider': provider,
    'data-ev-item_id': itemId,
    'data-ev-placement': placement,
  };
}
