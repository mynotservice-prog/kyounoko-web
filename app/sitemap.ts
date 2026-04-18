import type { MetadataRoute } from 'next';
import { getArticleIds, getCategories } from '@/lib/microcms';

const BASE = 'https://kyounoko.jp';

// MicroCMS未整備時のフォールバックカテゴリslug
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
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/items`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // カテゴリ（MicroCMS優先、なければフォールバック）
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
  } catch {
    // フォールバック
  }
  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map(slug => ({
    url: `${BASE}/category/${slug}`,
    lastModified: categoryLastMod[slug] ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 記事
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await getArticleIds();
    articlePages = articles.map(article => ({
      url: `${BASE}/article/${article.slug}`,
      lastModified: new Date(article.updatedAt ?? Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // 記事は空
  }

  return [...staticPages, ...categoryPages, ...articlePages];
}
