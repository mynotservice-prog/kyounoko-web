import type { MetadataRoute } from 'next';
import { getArticleIds, getCategories } from '@/lib/microcms';
import { getAllFileArticles } from '@/lib/articles';
import { getAllTags } from '@/lib/tags';

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
  // 法的ページ等の lastModified は固定日にしておく（毎ビルドで変わると "更新された" と誤認される）
  const legalLastMod = new Date('2026-04-17');
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/items`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/about`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: legalLastMod, changeFrequency: 'yearly', priority: 0.3 },
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

  // 記事（MicroCMS + ファイルベース、slugでマージ）
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
  } catch {
    // MicroCMS 未整備時は無視
  }

  // ファイルベース記事（MicroCMS にない slug のみ追加）
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

  // タグページ
  const tagPages: MetadataRoute.Sitemap = getAllTags().map((t) => ({
    url: `${BASE}/tag/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...categoryPages, ...articlePages, ...tagPages];
}
