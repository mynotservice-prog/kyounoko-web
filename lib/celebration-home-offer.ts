/**
 * お祝いの面（外食チェーンのお食い初め・七五三の記事）の本文中に、「自宅でお祝いする場合」の
 * アフィリエイトを1枠だけ置く試し（2026-11-27 作成）。
 *
 * ## 位置と部品
 *  - 本文の料金の節（見出しに「早見表」を含む最初の H2 の節）の直後に1枠。見出しが無い記事には出さない。
 *  - 部品は既存の InlineItemCTA（PR ラベル・rel="sponsored nofollow noopener"・
 *    クリックで GA4 `affiliate_click` を provider / item_id / placement つきで送る）。
 *  - placement は `article-body-celebration-home`（lib/affiliate-placement.ts）。
 *  - 本文・title・見出し・updatedAt は変えない（描画の層だけで差し込む）。
 *
 * ## 対象の記事（明示の一覧。パターンでは拾わない）
 *  - docs/experiments-active.md の処置・対照・凍結に当たる記事は入れない。
 *    外したもの: `bandotaro-okuizome-shichigosan`（実験32 処置）・`sagami-okuizome-shichigosan`（実験32 対照）。
 *    行事の解説記事9本（`shichigosan-shokujikai-dokode` ほか）は実験40（申込型アフィリ）の処置なので入れない。
 *  - noindex の記事・タイアップ記事には出さない（呼び出し側 page.tsx で除く）。
 *
 * ## 商品（楽天市場・もしも経由。AffiliateLink が NEXT_PUBLIC_MOSHIMO_* でラップする）
 *  - 2026-11-27 に商品ページ https://item.rakuten.co.jp/oiwaizen/01011-001/ の HTML で確認:
 *    店名「お祝い膳 楽天市場店」・商品名「お食い初め膳爛々」・価格 5,980円〜18,980円（税込・選ぶ内容で変わる）・
 *    尾頭付きの鯛を塩焼きにした状態で届ける・歯固めの石と手引き書つき・冷凍で届く。
 *  - 送料・在庫・ランキングの順位は書かない（変わるため）。値段や内容が変わったら、ここを直すか枠を外す。
 */

import type { AffiliateLinkProps } from '@/components/affiliate/AffiliateLink';

export const CELEBRATION_HOME_SLUGS = [
  'aiya-okuizome-shichigosan',
  'ajino-mingei-okuizome-shichigosan',
  'ganko-okuizome-shichigosan',
  'kagonoya-okuizome-shichigosan',
  'kisoji-okuizome-shichigosan',
  'kitaohji-okuizome',
  'kora-honten-okuizome-shichigosan',
  'shoya-okuizome-shichigosan',
  'tonden-okuizome-shichigosan',
  'umenohana-okuizome-shichigosan',
] as const;

export type CelebrationHomeOffer = {
  item: AffiliateLinkProps;
  /** InlineItemCTA の PR ラベルの横に出す一言 */
  note: string;
  /** この見出しの H2 の節の直後に差し込む */
  afterHeading: RegExp;
};

const OFFER: CelebrationHomeOffer = {
  item: {
    provider: 'rakuten',
    href: 'https://item.rakuten.co.jp/oiwaizen/01011-001/',
    title: 'お食い初め膳 爛々（お祝い膳 楽天市場店）',
    subtitle: '尾頭付きの鯛を塩焼きにした状態で、冷凍で届くお食い初めのセット。歯固めの石と手引き書つき',
    price: '5,980円〜18,980円（税込・選ぶ内容で変わる）',
    itemId: 'celebration-home-oiwaizen-ranran',
  },
  note: '自宅でお祝いする場合',
  afterHeading: /早見表/,
};

/** 対象の記事なら枠の中身を返す。対象外は null。 */
export function getCelebrationHomeOffer(slug: string): CelebrationHomeOffer | null {
  return (CELEBRATION_HOME_SLUGS as readonly string[]).includes(slug) ? OFFER : null;
}
