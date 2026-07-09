import type { MetadataRoute } from 'next';

/**
 * Next.js metadata route として出力される /sitemap.xml。
 * urlset 形式で全URLを1ファイルに集約する（分割版は sitemap-*.xml で配信）。
 *
 * 方針: 分割版（sitemap-articles.xml 等）と併存させて、Search Console から
 * どちらを送っても動くようにしている。
 */

import { getArticleIds, getCategories } from '@/lib/microcms';
import { getAllFileArticles, getKvOnlyArticleMetas } from '@/lib/articles';
import { getAllSpotsWithSlug } from '@/lib/spots';
import { BROWSE_CATEGORIES, spotsByCategory } from '@/lib/spot-browse';
import { TOKYO_STATIONS } from '@/lib/tokyo-stations';
import { KANSAI_STATIONS } from '@/lib/kansai-stations';
import { KANAGAWA_STATIONS } from '@/lib/kanagawa-stations';
import { SAICHI_STATIONS } from '@/lib/saitama-chiba-stations';
import { TOKYO_LINES } from '@/lib/tokyo-lines';
import { getStationWithChains } from '@/lib/station-restaurants';
import { getIndieRestaurantsByStation } from '@/lib/indie-restaurants';
import { STATION_CONDITIONS, hasMatchingItems, getConditionKind, filterChainsByCondition, filterIndiesByCondition } from '@/lib/station-conditions';
import { getSpotsForStation, hasMatchingSpots, filterSpotsByCondition, getSpotConditionCanonicalSlug } from '@/lib/station-spots';
import { isStationConditionIndexable } from '@/lib/station-cond-index';
import { FEATURE_PAGES } from '@/lib/feature-pages';
import { AFFILIATE_TARGET_SLUGS } from '@/lib/affiliate-products';

const BASE = 'https://kyounoko.jp';

const FALLBACK_CATEGORY_SLUGS = [
  'today-doko',
  'today-nani',
  'today-taberu',
  'today-mawasu',
  'gyouji',
  'narai',
  'yakudatsu',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const legalLastMod = new Date('2026-04-17');
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/items`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/recipes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/spots`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/tools/babycar-shindan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tools/naraigoto-match`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tools/odekake-type`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/downloads`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/downloads/nyuuen-checklist`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/downloads/getsurei-schedule`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/downloads/obento-rotation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/downloads/bousai-list`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/downloads/naraigoto-hikaku`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/for-facilities`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/kura-sushi`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/feature`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/ranking`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/reports`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE}/area`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/area/tokyo`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    // 23区エリアページ（/area/[slug]）
    ...(['chiyoda','chuo','minato','shinjuku','bunkyo','taito','sumida','koto','shinagawa','meguro','ota','setagaya','shibuya','nakano','suginami','toshima','kita','arakawa','itabashi','nerima','adachi','katsushika','edogawa'] as const).map((s) => ({
      url: `${BASE}/area/${s}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    { url: `${BASE}/kid-reports`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/external-transmission`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.3 },
  ];

  let categorySlugs: string[] = FALLBACK_CATEGORY_SLUGS;
  let categoryLastMod: Record<string, Date> = {};
  try {
    const { contents: categories } = await getCategories();
    if (categories.length > 0) {
      categorySlugs = categories.map(c => c.slug);
      categoryLastMod = Object.fromEntries(
        categories.map(c => [c.slug, new Date(c.updatedAt ?? Date.now())])
      );
    }
  } catch {}

  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map(slug => ({
    url: `${BASE}/category/${slug}`,
    lastModified: categoryLastMod[slug] ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 2026-05: SEO戦略のため priority を差別化
  // - ピラーページ(0.9)：「育児マップ」型の総合ガイド。クロール優先
  // - キラー記事(0.8)：高購買意欲 or 高ボリュームの中核記事
  // - 通常記事(0.6)：その他
  // Googleは priority を相対指標としてのみ参照（絶対値ではない）が、
  // クロール頻度の優先度シグナルとして機能する
  const PILLAR_SLUGS = new Set<string>([
    '0sai-ikuji-kanzen-map',
    '1-2sai-ikuji-kanzen-map',
    '3-6sai-ikuji-kanzen-map',
    'natsu-kosodate-kanzen-map',
  ]);
  const KILLER_SLUGS = new Set<string>([
    // 育児/離乳食/食物アレルギー など基幹用語
    'rinyuushoku-toha-kanzen-guide',
    'shokumotsu-allergy-toha-kanzen-guide',
    'sango-utsu-toha-kanzen-guide',
    'yonaki-toha-kanzen-guide',
    'sotsunyu-toha-kanzen-guide',
    'iyaiya-ki-toha-kanzen-guide',
    'babyfood-toha-kanzen-guide',
    'tsukamaridachi-toha-kanzen-guide',
    // キラー記事（高購買意欲・ベビーカー・チャイルドシート 等）
    'babycar-osusume-2026-hikaku',
    'babycar-a-vs-b',
    'akachan-nekashitsuke-kanzen-guide-0-1sai',
    'natsuyasumi-kazoku-ryokou-kodzure-2026',
    'tsuyu-shitsunai-asobi-0-6sai-hozonban-2026',
    'kodomo-kaze-hayaku-naosu-kanzen-guide',
    'kodomo-netsuchusho-3sain-real-2026',
    'shichigosan-nenrei-junbi',
    'randoseru-erabikata-osusume-2026',
    'shougakkou-nyugaku-junbi-kanzen-list',
    'hoikuen-nyuuen-junbi-0-2sai-kanzen-list',
    'hoikuen-vs-youchien-hikaku',
    'kodomochalle-vs-smile-zemi',
    'kaiten-sushi-4chain-comparison',
    'famires-7chain-8koumoku-2026',
    'famires-kodzure-ranking-2026-10sen',
    'kids-menu-chain-15-hikaku',
  ]);
  // 収益重点記事（アフィリ対象 = 月100万のエンジン）はクロール最優先
  const MONEY_SLUGS = new Set<string>(AFFILIATE_TARGET_SLUGS as readonly string[]);
  function getArticlePriority(slug: string): number {
    if (MONEY_SLUGS.has(slug)) return 0.9;
    if (PILLAR_SLUGS.has(slug)) return 0.9;
    if (KILLER_SLUGS.has(slug)) return 0.8;
    return 0.6;
  }
  // 収益重点記事は更新頻度シグナルも上げてクロール頻度を稼ぐ
  function getArticleChangeFreq(slug: string): 'weekly' | 'monthly' {
    return MONEY_SLUGS.has(slug) ? 'weekly' : 'monthly';
  }

  const articleUrlMap = new Map<string, MetadataRoute.Sitemap[number]>();
  try {
    const articles = await getArticleIds();
    for (const article of articles) {
      articleUrlMap.set(article.slug, {
        url: `${BASE}/article/${article.slug}`,
        lastModified: new Date(article.updatedAt ?? Date.now()),
        changeFrequency: getArticleChangeFreq(article.slug),
        priority: getArticlePriority(article.slug),
      });
    }
  } catch {}

  // AdSense審査対策（2026-05）: noindex 記事はsitemapから除外する
  const noindexSlugs = new Set<string>();
  for (const article of getAllFileArticles()) {
    if (article.noindex) {
      noindexSlugs.add(article.slug);
      articleUrlMap.delete(article.slug);
      continue;
    }
    if (articleUrlMap.has(article.slug)) continue;
    articleUrlMap.set(article.slug, {
      url: `${BASE}/article/${article.slug}`,
      lastModified: new Date(article.updatedAt ?? Date.now()),
      changeFrequency: getArticleChangeFreq(article.slug),
      priority: getArticlePriority(article.slug),
    });
  }
  // microCMS側で先に入っていた noindex slug も除去
  for (const slug of noindexSlugs) articleUrlMap.delete(slug);

  // KVにのみ存在する新規記事（デプロイ不要で作成された記事）もサイトマップに載せる
  try {
    for (const article of await getKvOnlyArticleMetas()) {
      if (article.noindex || articleUrlMap.has(article.slug)) continue;
      articleUrlMap.set(article.slug, {
        url: `${BASE}/article/${article.slug}`,
        lastModified: new Date(article.updatedAt ?? Date.now()),
        changeFrequency: getArticleChangeFreq(article.slug),
        priority: getArticlePriority(article.slug),
      });
    }
  } catch {}

  const articlePages: MetadataRoute.Sitemap = Array.from(articleUrlMap.values());

  // Plans は noindex なのでsitemapから除外（Search Consoleの「noindex除外」を回避）

  // 剪定(2026-06): タグページは noindex 化したため sitemap から除外（旧 tagPages）。

  // 駅別子連れランチページ（23区484駅）
  const stationIndex: MetadataRoute.Sitemap = [{
    url: `${BASE}/station`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }];
  const stationPages: MetadataRoute.Sitemap = TOKYO_STATIONS.map((s) => ({
    url: `${BASE}/station/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: s.scale === 'terminal' ? 0.7 : s.scale === 'major' ? 0.6 : 0.5,
  }));
  // 駅ページが index される（飲食データがある）駅だけ sitemap に載せる。
  // プラン生成の距離アンカー専用に追加した飲食データの無い駅は、ページ側で noindex に
  // なるため sitemap からも除外し「noindex URL を sitemap 送信」の不整合を防ぐ。
  const stationHasContent = (slug: string) =>
    (getStationWithChains(slug)?.chains?.length ?? 0) > 0 ||
    getIndieRestaurantsByStation(slug).length > 0;
  // 関西駅ページ（大阪・京都・神戸）
  const kansaiStationPages: MetadataRoute.Sitemap = KANSAI_STATIONS.filter((s) =>
    stationHasContent(s.slug),
  ).map((s) => ({
    url: `${BASE}/station/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: s.scale === 'terminal' ? 0.7 : s.scale === 'major' ? 0.6 : 0.5,
  }));
  // 神奈川駅ページ（横浜・川崎・湘南・県央）
  const kanagawaStationPages: MetadataRoute.Sitemap = KANAGAWA_STATIONS.filter((s) =>
    stationHasContent(s.slug),
  ).map((s) => ({
    url: `${BASE}/station/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: s.scale === 'terminal' ? 0.7 : s.scale === 'major' ? 0.6 : 0.5,
  }));
  // 埼玉・千葉駅ページ（東京通勤圏）
  const saichiStationPages: MetadataRoute.Sitemap = SAICHI_STATIONS.map((s) => ({
    url: `${BASE}/station/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: s.scale === 'terminal' ? 0.7 : s.scale === 'major' ? 0.6 : 0.5,
  }));
  // 路線別ページ（40路線）
  const lineIndex: MetadataRoute.Sitemap = [{
    url: `${BASE}/station/line`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }];
  const linePages: MetadataRoute.Sitemap = TOKYO_LINES.map((l) => ({
    url: `${BASE}/station/line/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.55,
  }));

  // 駅×条件ロングテールページ（restaurant 系のみ。spot 系は下で除外）
  // index/noindex 判定は page.tsx と共通の二段ゲート（lib/station-cond-index.ts）を使う。
  // 需要実績(GSC90日) or matched>=閾値 のページのみ sitemap に載せ、ページ側 noindex と整合させる。
  const stationConditionPages: MetadataRoute.Sitemap = [];
  // Tokyo: restaurant + spot
  for (const s of TOKYO_STATIONS) {
    const data = getStationWithChains(s.slug);
    const chains = data?.chains ?? [];
    const indies = getIndieRestaurantsByStation(s.slug);
    const { all: spotsAll } = getSpotsForStation(s.slug);
    for (const cond of STATION_CONDITIONS) {
      const k = getConditionKind(cond.slug);
      // 剪定(2026-06): スポット系条件は90日ほぼ表示0のため index/sitemapから除外。
      if (k === 'spot') continue;
      let matchedCount = 0;
      if (k === 'restaurant') {
        if (!hasMatchingItems(chains, indies, cond.slug)) continue;
        const cMatched = filterChainsByCondition(chains, cond.slug);
        const iMatched = filterIndiesByCondition(indies, cond.slug);
        matchedCount = cMatched.length + iMatched.length;
      } else {
        if (!hasMatchingSpots(spotsAll, cond.slug)) continue;
        matchedCount = filterSpotsByCondition(spotsAll, cond.slug).length;
        // 同区重複は代表へ canonical 集約しているので、非代表(重複)はsitemapに載せない。
        if (getSpotConditionCanonicalSlug(s.slug, cond.slug) !== s.slug) continue;
      }
      if (!isStationConditionIndexable(s.slug, cond.slug, matchedCount, k, s.scale)) continue;
      stationConditionPages.push({
        url: `${BASE}/station/${s.slug}/${cond.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5, // restaurant系のみ（spot系は上で除外済み）
      });
    }
  }
  // 非Tokyo(関西/神奈川/埼玉千葉)の駅×条件は spot 系のみ。剪定(2026-06)で
  // spot系を index/sitemapから除外したため、ここは収録しない（おでかけ先は
  // 「今日の流れ(/today)」とエリア/spotページが担う）。

  // /data/* AIO参照用データセットページ
  const dataPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/data`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE}/data/restaurants`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE}/data/wards`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.75 },
  ];

  // 2026-05 再開: AdSense承認済み + matchedCount >= 3 フィルタ済みのため、
  // 駅×条件ページをsitemapに含めて公開する（プログラマティックSEO拡張）。

  // スポット個別ページ（プログラマティックSEO第3弾、2026-05追加）
  // isIndexable() の条件を満たすスポットのみsitemapに含める（薄ページ判定回避）。
  const spotPages = getAllSpotsWithSlug()
    .filter((x) => {
      const s = x.spot;
      let score = 0;
      if (s.note && s.note.length >= 25) score++;
      if (s.facilities && Object.keys(s.facilities).length >= 2) score++;
      if (s.pricing && Object.keys(s.pricing).length >= 1) score++;
      if (s.hiddenTip && s.hiddenTip.length >= 15) score++;
      if (s.nearestStation) score++;
      if (s.ward || s.city) score++;
      return score >= 3;
    })
    .map((x) => ({
      url: `${BASE}/spot/${x.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  // スポットのカテゴリ全件ページ（/spots/[cat]）。看板コンテンツの入口。
  const spotCategoryPages: MetadataRoute.Sitemap = BROWSE_CATEGORIES
    .filter((c) => spotsByCategory(c.id).length > 0)
    .map((c) => ({
      url: `${BASE}/spots/${c.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }));

  // 特集ページ（Tier 3）。データドリブンでArticle+Spotを横断キュレーション。
  const featurePages: MetadataRoute.Sitemap = FEATURE_PAGES.map((f) => ({
    url: `${BASE}/feature/${f.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [...staticPages, ...categoryPages, ...articlePages, ...stationIndex, ...stationPages, ...kansaiStationPages, ...kanagawaStationPages, ...saichiStationPages, ...lineIndex, ...linePages, ...stationConditionPages, ...dataPages, ...spotCategoryPages, ...spotPages, ...featurePages];
}
