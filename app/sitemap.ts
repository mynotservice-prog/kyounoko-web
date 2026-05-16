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
import { getAllTags } from '@/lib/tags';
import { TOKYO_STATIONS } from '@/lib/tokyo-stations';
import { KANSAI_STATIONS } from '@/lib/kansai-stations';
import { KANAGAWA_STATIONS } from '@/lib/kanagawa-stations';
import { TOKYO_LINES } from '@/lib/tokyo-lines';
import { getStationWithChains } from '@/lib/station-restaurants';
import { getIndieRestaurantsByStation } from '@/lib/indie-restaurants';
import { STATION_CONDITIONS, hasMatchingItems } from '@/lib/station-conditions';

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

  const articleUrlMap = new Map<string, MetadataRoute.Sitemap[number]>();
  try {
    const articles = await getArticleIds();
    for (const article of articles) {
      articleUrlMap.set(article.slug, {
        url: `${BASE}/article/${article.slug}`,
        lastModified: new Date(article.updatedAt ?? Date.now()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      });
    }
  } catch {}

  for (const article of getAllFileArticles()) {
    if (articleUrlMap.has(article.slug)) continue;
    articleUrlMap.set(article.slug, {
      url: `${BASE}/article/${article.slug}`,
      lastModified: new Date(article.updatedAt ?? Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    });
  }

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

  // 駅×条件ロングテールページ（最大484駅×4条件=1,936ページ、該当0件の組合せは除外）
  const stationConditionPages: MetadataRoute.Sitemap = [];
  for (const s of TOKYO_STATIONS) {
    const data = getStationWithChains(s.slug);
    const chains = data?.chains ?? [];
    const indies = getIndieRestaurantsByStation(s.slug);
    for (const cond of STATION_CONDITIONS) {
      if (!hasMatchingItems(chains, indies, cond.slug)) continue;
      stationConditionPages.push({
        url: `${BASE}/station/${s.slug}/${cond.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.45,
      });
    }
  }

  // /data/* AIO参照用データセットページ
  const dataPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/data`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE}/data/restaurants`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${BASE}/data/wards`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.75 },
  ];

  return [...staticPages, ...categoryPages, ...articlePages, ...tagPages, ...stationIndex, ...stationPages, ...kansaiStationPages, ...kanagawaStationPages, ...lineIndex, ...linePages, ...stationConditionPages, ...dataPages];
}
