import type { MetadataRoute } from 'next';
import { getArticleIds, getCategories } from '@/lib/microcms';

const BASE = 'https://kyounoko.jp';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // 年齢別ハブ
  const ageHubs: MetadataRoute.Sitemap = [
    { url: `${BASE}/age/0-1`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/age/2-3`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/age/4-6`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // カテゴリ
  const { contents: categories } = await getCategories().catch(() => ({ contents: [] }));
  const categoryPages: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${BASE}/category/${cat.slug}`,
    lastModified: new Date(cat.updatedAt ?? Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 記事
  const articles = await getArticleIds().catch(() => []);
  const articlePages: MetadataRoute.Sitemap = articles.map(article => ({
    url: `${BASE}/article/${article.slug}`,
    lastModified: new Date(article.updatedAt ?? Date.now()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...ageHubs, ...categoryPages, ...articlePages];
}
