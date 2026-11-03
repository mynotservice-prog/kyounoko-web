/**
 * 内部リンクのクリックを「どの部品が押されたか」で分けて数えるための分類（2026-10）。
 *
 * 背景: 記事の上部にはカテゴリ一覧へのリンクが 3 つ（左上の「戻る」・パンくず・カテゴリ名）あり、
 * 回遊 PV の約 2 割が一覧行きだったが、どれが押されたかを分ける計測が無かった。
 * 兄弟チップと本文中のリンク、下部のカードと関連記事も同じく分けられなかった。
 *
 * 方針:
 * - サーバーが返す HTML は変えない。既にある class 名から、クリック時にクライアント側で判定する。
 * - 送るのは部品の種類（placement）とリンク先のパス（link_url）だけ。クエリ・ハッシュは落とす。
 *   個人を特定する情報は送らない。
 * - GA4 側は、既に登録済みのカスタム定義 `placement` と、標準のディメンション `linkUrl`
 *   （`link_url` パラメータ）で読める。新しいカスタム定義は要らない。
 *
 * 部品の class 名を変えるときは、この表も合わせて直す（合わないものは 'other' に落ちる）。
 */

export const INTERNAL_LINK_CLICK_EVENT = 'internal_link_click';

/** 上から順に判定する（先に当たったものを採る）。selector は a 自身か祖先に当たればよい。 */
const PLACEMENT_RULES: ReadonlyArray<readonly [selector: string, placement: string]> = [
  // --- 画面の枠 ---
  ['.v2-back-btn', 'back'], // 左上の「戻る」（記事ではカテゴリ一覧へのリンク）
  ['[role="dialog"]', 'menu'], // ハンバーガーメニューの中
  ['.v2-dt-header, .v2-app-header', 'header'],
  ['footer', 'footer'],
  ['nav.breadcrumb, nav[class*="-crumb"]', 'breadcrumb'],
  // --- 記事ページ ---
  ['.page-head > a.eyebrow', 'category-label'], // 題の上のカテゴリ名
  ['.av3-tags', 'tag-chip'], // 年齢などのタグ
  ['.article-meta', 'article-meta'], // 著者・訂正の連絡先
  ['.cluster-nav', 'cluster-chip'], // 「同じお店の記事」「同じ区の記事」のチップ
  ['.av3-chain', 'chain-box'], // チェーンの判定ボックス
  ['.tldr-box', 'tldr'],
  ['section[aria-label^="チェーン別"]', 'comparison-table'],
  ['.av3-faq', 'faq'],
  ['.av3-xlink-primary', 'card-same-chain'], // 下部のカード（同じお店・チェーン比較）
  ['.av3-xlink', 'card-crosslink'], // 下部のカード（他チェーン・あわせて読みたい・プラン）
  ['.av3-related', 'related'], // 関連する記事
  ['.av3-station', 'station-cta'], // 駅ページへの帯
  ['.av3-planlink', 'plan-cta'], // 「今日の流れ」への帯
  ['.av3-fallback', 'fallback'],
  ['.av3-nextq', 'body-nextq'], // 本文の「次に迷うこと」の節
  ['a.auto-internal-link', 'body-auto'], // 本文中のリンク（自動で付いたもの）
  ['.prose', 'body'], // 本文中のリンク（手で書いたもの）
  // --- 駅ページ ---
  ['.station-conditions-cta', 'station-conditions'],
  ['.station-related', 'station-related'],
  ['.stv3-back', 'station-back'],
  // --- どのページにもある型 ---
  ['.kk-sec-more, .v2-sec-more', 'section-more'],
  ['.kk-chips', 'chip'],
  ['.kk-rows, .v2-vlist', 'row-list'],
];

export type InternalLinkClick = {
  /** 押された部品の種類 */
  placement: string;
  /** リンク先のパス（クエリ・ハッシュなし） */
  link_url: string;
};

/**
 * クリックされた a 要素を分類する。内部リンクでなければ null。
 * - 外部リンク、同じページ内の見出しへのリンク（目次など）は数えない。
 */
export function classifyInternalLink(
  a: Element,
  loc: Pick<Location, 'href' | 'origin' | 'pathname'> = window.location,
): InternalLinkClick | null {
  const raw = a.getAttribute('href');
  if (!raw || raw.startsWith('#')) return null;
  let url: URL;
  try {
    url = new URL(raw, loc.href);
  } catch {
    return null;
  }
  if (url.origin !== loc.origin) return null;
  if (url.pathname === loc.pathname && url.hash) return null;
  for (const [selector, placement] of PLACEMENT_RULES) {
    if (a.closest(selector)) return { placement, link_url: url.pathname };
  }
  return { placement: 'other', link_url: url.pathname };
}
