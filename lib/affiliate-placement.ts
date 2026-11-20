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
  // --- スポット /spot/[slug] ---
  | 'spot-reservation' // ネット予約・チケット
  | 'spot-travel' // 子連れ宿予約（レジャースポット）
  // --- きょうの流れ /today ---
  | 'today-plan-lunch' // プラン下のお昼の予約
  | 'today-lunch-list' // お昼の一覧の下の予約
  | 'today-items' // 「あったら便利なもの」
  // --- 駅 /station/[slug]・/station/[slug]/[condition] ---
  | 'station-items' // 駅ページ下部の外食グッズ
  | 'station-condition-items' // 条件ページのお助けグッズ
  | 'station-condition-bridge' // 条件ページの幼児食宅配ブリッジ
  // --- その他の一覧・カタログ ---
  | 'category-items' // /category/[slug] の人気商品
  | 'plan-items' // /plan/[id] の「あると便利なもの」
  | 'items-catalog'; // /items のカタログ
