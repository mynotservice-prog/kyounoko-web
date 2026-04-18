import { createClient, type MicroCMSListContent, type MicroCMSQueries } from 'microcms-js-sdk';
import type { Article, Category, Tag, Author, Spot, SiteConfig } from './types';

if (!process.env.MICROCMS_SERVICE_DOMAIN) {
  throw new Error('MICROCMS_SERVICE_DOMAIN is required');
}
if (!process.env.MICROCMS_API_KEY) {
  throw new Error('MICROCMS_API_KEY is required');
}

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

// ==========================================================================
// Articles
// ==========================================================================

export async function getArticles(queries?: MicroCMSQueries) {
  return await client.getList<Article>({
    endpoint: 'articles',
    queries: {
      orders: '-publishedAt',
      limit: 20,
      ...queries,
    },
  });
}

export async function getArticle(slug: string): Promise<Article | null> {
  const data = await client.getList<Article>({
    endpoint: 'articles',
    queries: { filters: `slug[equals]${slug}`, limit: 1 },
  });
  return data.contents[0] ?? null;
}

export async function getArticleIds() {
  const data = await client.getList<Article>({
    endpoint: 'articles',
    queries: { fields: 'id,slug,updatedAt', limit: 1000 },
  });
  return data.contents;
}

export async function getArticlesByCategory(categorySlug: string, limit = 20) {
  return await client.getList<Article>({
    endpoint: 'articles',
    queries: {
      filters: `category[equals]${categorySlug}`,
      orders: '-publishedAt',
      limit,
    },
  });
}

export async function getArticlesByTag(tagSlug: string, limit = 20) {
  return await client.getList<Article>({
    endpoint: 'articles',
    queries: {
      filters: `tags[contains]${tagSlug}`,
      orders: '-publishedAt',
      limit,
    },
  });
}

// ==========================================================================
// Categories
// ==========================================================================

export async function getCategories() {
  return await client.getList<Category>({
    endpoint: 'categories',
    queries: { orders: 'order', limit: 20 },
  });
}

export async function getCategory(slug: string): Promise<Category | null> {
  const data = await client.getList<Category>({
    endpoint: 'categories',
    queries: { filters: `slug[equals]${slug}`, limit: 1 },
  });
  return data.contents[0] ?? null;
}

// ==========================================================================
// Tags
// ==========================================================================

export async function getTags() {
  return await client.getList<Tag>({
    endpoint: 'tags',
    queries: { limit: 100 },
  });
}

// ==========================================================================
// Authors
// ==========================================================================

export async function getAuthor(slug: string): Promise<Author | null> {
  const data = await client.getList<Author>({
    endpoint: 'authors',
    queries: { filters: `slug[equals]${slug}`, limit: 1 },
  });
  return data.contents[0] ?? null;
}

// ==========================================================================
// Spots (地域記事用)
// ==========================================================================

export async function getSpots(queries?: MicroCMSQueries) {
  return await client.getList<Spot>({
    endpoint: 'spots',
    queries: { orders: '-updatedAt', limit: 20, ...queries },
  });
}

// ==========================================================================
// Site Config
// ==========================================================================

export async function getSiteConfig(): Promise<SiteConfig | null> {
  try {
    return await client.getObject<SiteConfig>({
      endpoint: 'site',
    });
  } catch {
    return null;
  }
}

// ==========================================================================
// Today Finder 用：複数条件でのフィルタ
// ==========================================================================

export type TodayFilter = {
  age?: '0-1' | '2-3' | '4-6';
  weather?: 'rain' | 'heat' | 'cold' | 'sunny';
  place?: 'home' | 'outside' | 'indoor';
  day?: 'weekday' | 'holiday';
  maxDuration?: number; // 分
  budget?: 'free' | 'low' | 'mid' | 'high';
};

export async function findTodayCandidates(filter: TodayFilter, limit = 10) {
  const filters: string[] = [];

  if (filter.age) filters.push(`quickInfo_ageRanges[contains]${filter.age}`);
  if (filter.weather) filters.push(`quickInfo_weather[contains]${filter.weather}`);
  if (filter.place) filters.push(`quickInfo_place[contains]${filter.place}`);
  if (filter.maxDuration) filters.push(`quickInfo_durationMin[less_than]${filter.maxDuration + 1}`);
  if (filter.budget) filters.push(`quickInfo_budget[equals]${filter.budget}`);

  return await client.getList<Article>({
    endpoint: 'articles',
    queries: {
      filters: filters.length > 0 ? filters.join('[and]') : undefined,
      orders: '-publishedAt',
      limit,
    },
  });
}
