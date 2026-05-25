/**
 * よく読まれている記事ランキング（Search Console の実クリック数に基づく）。
 *
 * データ取得日: 2026-05-25（直近3ヶ月のクリック数上位）
 * 更新方法: Search Console > 検索パフォーマンス > ページ の上位を反映する。
 *   - 季節記事（母の日など）が時期外れになったら差し替える。
 *
 * slug の配列（クリック数の多い順）。記事メタは getAllFileArticles から解決する。
 */
export const POPULAR_ARTICLE_SLUGS: string[] = [
  'yayoiken-kodzure-koryaku',
  'kodzure-morning-cafe-10',
  'kodzure-saize-koryaku',
  'jonathan-kodzure-koryaku',
  'shabuyou-kodzure-koryaku',
  'gusto-kodzure-koryaku',
  'kodzure-deli-takeout-10',
  'bamiyan-kodzure-koryaku',
  'cocos-kodzure-koryaku',
  'famires-kodzure-ranking-2026-10sen',
];
