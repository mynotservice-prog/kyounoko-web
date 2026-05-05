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

  return [...staticPages, ...categoryPages, ...articlePages, ...tagPages, ...stationIndex, ...stationPages];
}
