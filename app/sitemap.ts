import type { MetadataRoute } from 'next';

/**
 * Next.js metadata route として出力される /sitemap.xml。
 * urlset 形式で全URLを1ファイルに集約する（分割版は sitemap-*.xml で配信）。
 *
 * 方針: 分割版（sitemap-articles.xml 等）と併存させて、Search Console から
 * どちらを送っても動くようにしている。
 */

import { getArticleIds, getCategories } from '@/lib/microcms';
import { getAllFileArticles } from '@/lib/articles';
import { getAllSpotsWithSlug } from '@/lib/spots';
import { getAllTags } from '@/lib/tags';
import { TOKYO_STATIONS } from '@/lib/tokyo-stations';
import { KANSAI_STATIONS } from '@/lib/kansai-stations';
import { KANAGAWA_STATIONS } from '@/lib/kanagawa-stations';
import { SAICHI_STATIONS } from '@/lib/saitama-chiba-stations';
import { TOKYO_LINES } from '@/lib/tokyo-lines';
import { getStationWithChains } from '@/lib/station-restaurants';
import { getIndieRestaurantsByStation } from '@/lib/indie-restaurants';
import { STATION_CONDITIONS, hasMatchingItems, getConditionKind, filterChainsByCondition, filterIndiesByCondition } from '@/lib/station-conditions';
import { getSpotsForStation, hasMatchingSpots, filterSpotsByCondition } from '@/lib/station-spots';
import { FEATURE_PAGES } from '@/lib/feature-pages';

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
    { url: `${BASE}/feature`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/kid-reports`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.3 },
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
    'tsuyu-shitsunai-asobi-kanzen-guide-0-6sai',
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
  function getArticlePriority(slug: string): number {
    if (PILLAR_SLUGS.has(slug)) return 0.9;
    if (KILLER_SLUGS.has(slug)) return 0.8;
    return 0.6;
  }

  const articleUrlMap = new Map<string, MetadataRoute.Sitemap[number]>();
  try {
    const articles = await getArticleIds();
    for (const article of articles) {
      articleUrlMap.set(article.slug, {
        url: `${BASE}/article/${article.slug}`,
        lastModified: new Date(article.updatedAt ?? Date.now()),
        changeFrequency: 'monthly' as const,
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
      changeFrequency: 'monthly' as const,
      priority: getArticlePriority(article.slug),
    });
  }
  // microCMS側で先に入っていた noindex slug も除去
  for (const slug of noindexSlugs) articleUrlMap.delete(slug);

  const articlePages: MetadataRoute.Sitemap = Array.from(articleUrlMap.values());

  // Plans は noindex なのでsitemapから除外（Search Consoleの「noindex除外」を回避）

  const tagPages: MetadataRoute.Sitemap = getAllTags().map((t) => ({
    url: `${BASE}/tag/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

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
  // 関西駅ページ（大阪・京都・神戸）
  const kansaiStationPages: MetadataRoute.Sitemap = KANSAI_STATIONS.map((s) => ({
    url: `${BASE}/station/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: s.scale === 'terminal' ? 0.7 : s.scale === 'major' ? 0.6 : 0.5,
  }));
  // 神奈川駅ページ（横浜・川崎・湘南・県央）
  const kanagawaStationPages: MetadataRoute.Sitemap = KANAGAWA_STATIONS.map((s) => ({
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

  // 駅×条件ロングテールページ（restaurant 系 + spot 系）
  // 2026-05 再開: matchedCount >= 3 件の充実ページのみsitemapに含める。
  // ページ側 generateMetadata でも同じ閾値で noindex 判定しているため整合性が取れる。
  // これでプログラマティックSEO 数千ページが検索エンジンに公開される。
  const STATION_CONDITION_MIN_MATCHES = 3;
  const stationConditionPages: MetadataRoute.Sitemap = [];
  // Tokyo: restaurant + spot
  for (const s of TOKYO_STATIONS) {
    const data = getStationWithChains(s.slug);
    const chains = data?.chains ?? [];
    const indies = getIndieRestaurantsByStation(s.slug);
    const { all: spotsAll } = getSpotsForStation(s.slug);
    for (const cond of STATION_CONDITIONS) {
      const k = getConditionKind(cond.slug);
      let matchedCount = 0;
      if (k === 'restaurant') {
        if (!hasMatchingItems(chains, indies, cond.slug)) continue;
        const cMatched = filterChainsByCondition(chains, cond.slug);
        const iMatched = filterIndiesByCondition(indies, cond.slug);
        matchedCount = cMatched.length + iMatched.length;
      } else {
        if (!hasMatchingSpots(spotsAll, cond.slug)) continue;
        matchedCount = filterSpotsByCondition(spotsAll, cond.slug).length;
      }
      if (matchedCount < STATION_CONDITION_MIN_MATCHES) continue;
      stationConditionPages.push({
        url: `${BASE}/station/${s.slug}/${cond.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: k === 'spot' ? 0.55 : 0.5,
      });
    }
  }
  // 非Tokyo: spot 系のみ
  const nonTokyoStations = [
    ...KANSAI_STATIONS.map((s) => s.slug),
    ...KANAGAWA_STATIONS.map((s) => s.slug),
    ...SAICHI_STATIONS.map((s) => s.slug),
  ];
  for (const slug of nonTokyoStations) {
    const { all: spotsAll } = getSpotsForStation(slug);
    for (const cond of STATION_CONDITIONS) {
      if (getConditionKind(cond.slug) !== 'spot') continue;
      if (!hasMatchingSpots(spotsAll, cond.slug)) continue;
      const matchedCount = filterSpotsByCondition(spotsAll, cond.slug).length;
      if (matchedCount < STATION_CONDITION_MIN_MATCHES) continue;
      stationConditionPages.push({
        url: `${BASE}/station/${slug}/${cond.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.55,
      });
    }
  }

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

  // 特集ページ（Tier 3）。データドリブンでArticle+Spotを横断キュレーション。
  const featurePages: MetadataRoute.Sitemap = FEATURE_PAGES.map((f) => ({
    url: `${BASE}/feature/${f.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [...staticPages, ...categoryPages, ...articlePages, ...tagPages, ...stationIndex, ...stationPages, ...kansaiStationPages, ...kanagawaStationPages, ...saichiStationPages, ...lineIndex, ...linePages, ...stationConditionPages, ...dataPages, ...spotPages, ...featurePages];
}
