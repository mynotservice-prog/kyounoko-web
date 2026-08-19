/**
 * 記事カテゴリの表示名の唯一の正本。
 *
 * なぜ必要か（2026-08-19）:
 *   記事の frontmatter には `category`（ルーティング用スラッグ）と `categoryName`（表示名）が
 *   別々に入っている。スラッグは7種で正常だったが、表示名は執筆時の手入力で **25種類に割れていた**
 *   （「今日どこ行く？」「今日どこ行く」「今日どこいく」／「役立つもの」「役立つ」「yakudatsu」…）。
 *   その結果:
 *     - 公開の /articles が25セクションに分裂し、見出しに `today-taberu` `yakudatsu` `gyouji` という
 *       スラッグが生で表示されていた
 *     - 記事ページの BreadcrumbList 構造化データに同じ揺れがそのまま出て、Google は7カテゴリを
 *       25通りの名前で受け取っていた
 *
 * 対処:
 *   表示名は frontmatter を信用せず、**必ず `category` からこの表を引く**。
 *   データ側（data/articles/*.json）は触っていないので、記事を書き足しても揺れは再発しない。
 *
 * 同じ表が app/article, app/today, app/api/og, app/api/pin-image に重複していた（しかも app/today
 * だけ「？」が無かった）。増やさないこと。新しいカテゴリはここに足す。
 */

export const ARTICLE_CATEGORY_NAME: Record<string, string> = {
  'today-doko': '今日どこ行く？',
  'today-nani': '今日何する？',
  'today-taberu': '今日何食べる？',
  'today-mawasu': '今日どう回す？',
  'shippai-shinai': '失敗しない外出',
  tenki: '天気で決める',
  'heijitsu-yoru': '平日夜を回す',
  gyouji: '季節と行事',
  narai: '習い事と学び',
  yakudatsu: '役立つもの',
};

/**
 * カテゴリスラッグ → 表示名。
 *
 * 既知のスラッグなら常に正本の名前を返す（frontmatter の表記揺れを無視する）。
 * 未知のスラッグ（MicroCMS 側で増えたカテゴリなど）に限り、渡された名前 → スラッグの順に落とす。
 */
export function articleCategoryLabel(category?: string, fallbackName?: string): string {
  if (category && ARTICLE_CATEGORY_NAME[category]) return ARTICLE_CATEGORY_NAME[category];
  return fallbackName?.trim() || category || 'その他';
}
