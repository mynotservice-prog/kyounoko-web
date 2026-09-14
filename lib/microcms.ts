import {
  createClient,
  type MicroCMSListContent,
  type MicroCMSListResponse,
  type MicroCMSQueries,
} from 'microcms-js-sdk';
import type { Article, Category, Tag, Author, Spot, SiteConfig } from './types';

// クライアントは遅延初期化する。
// モジュール読み込み時に throw すると、デプロイ直後の env 反映タイミング次第で
// microCMS を import する全ページが一斉に 5xx になりうる（開設週 2026-04 に発生し、
// GSC の「サーバーエラー(5xx)」として残存した）。実際に API を呼ぶ瞬間にだけ env を
// 検証することで、env 欠落時も呼び出し側の try/catch で 404 に縮退できる。
let _client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (_client) return _client;
  const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = process.env.MICROCMS_API_KEY;
  if (!serviceDomain) throw new Error('MICROCMS_SERVICE_DOMAIN is required');
  if (!apiKey) throw new Error('MICROCMS_API_KEY is required');
  _client = createClient({ serviceDomain, apiKey });
  return _client;
}

// ==========================================================================
// Articles
// ==========================================================================

/**
 * microCMS の `articles` エンドポイントを呼ぶかどうか（既定: 呼ばない）。
 *
 * 2026-09-11: microCMS から「articles と spot-reports に毎時それぞれ1,600〜1,800件の404」と連絡があった。
 * - 記事は全件 content/articles/*.md から配信しており、microCMS 側に articles API は作られていない。
 * - microCMS の一覧取得は該当0件なら 200 と空配列を返す。404 はエンドポイントそのものが無いことを意味する。
 * - それでも記事ページは microCMS を先に試してからファイルに落ちる作りだったため、
 *   Vercel のビルド1回で記事1,179本ぶん、ISR 再生成のたびにも1件ずつ、必ず404を出していた。
 * 表示は元々ファイル側しか使っていないので、呼ばなくても出力は変わらない。
 * microCMS に articles API を作ったら、Vercel の env に MICROCMS_ARTICLES_ENABLED=1 を入れて再開する。
 */
const ARTICLES_API_ENABLED = process.env.MICROCMS_ARTICLES_ENABLED === '1';

function emptyList<T>(limit = 0): MicroCMSListResponse<T> {
  return { contents: [], totalCount: 0, offset: 0, limit };
}

export async function getArticles(queries?: MicroCMSQueries) {
  if (!ARTICLES_API_ENABLED) return emptyList<Article>();
  return await getClient().getList<Article>({
    endpoint: 'articles',
    queries: {
      orders: '-publishedAt',
      limit: 20,
      ...queries,
    },
  });
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (!ARTICLES_API_ENABLED) return null;
  const data = await getClient().getList<Article>({
    endpoint: 'articles',
    queries: { filters: `slug[equals]${slug}`, limit: 1 },
  });
  return data.contents[0] ?? null;
}

export async function getArticleIds() {
  if (!ARTICLES_API_ENABLED) return emptyList<Article>().contents;
  const data = await getClient().getList<Article>({
    endpoint: 'articles',
    queries: { fields: 'id,slug,updatedAt', limit: 1000 },
  });
  return data.contents;
}

export async function getArticlesByCategory(categorySlug: string, limit = 20) {
  if (!ARTICLES_API_ENABLED) return emptyList<Article>(limit);
  return await getClient().getList<Article>({
    endpoint: 'articles',
    queries: {
      filters: `category[equals]${categorySlug}`,
      orders: '-publishedAt',
      limit,
    },
  });
}

export async function getArticlesByTag(tagSlug: string, limit = 20) {
  if (!ARTICLES_API_ENABLED) return emptyList<Article>(limit);
  return await getClient().getList<Article>({
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
  return await getClient().getList<Category>({
    endpoint: 'categories',
    queries: { orders: 'order', limit: 20 },
  });
}

export async function getCategory(slug: string): Promise<Category | null> {
  const data = await getClient().getList<Category>({
    endpoint: 'categories',
    queries: { filters: `slug[equals]${slug}`, limit: 1 },
  });
  return data.contents[0] ?? null;
}

// ==========================================================================
// Tags
// ==========================================================================

export async function getTags() {
  return await getClient().getList<Tag>({
    endpoint: 'tags',
    queries: { limit: 100 },
  });
}

// ==========================================================================
// Authors
// ==========================================================================

export async function getAuthor(slug: string): Promise<Author | null> {
  const data = await getClient().getList<Author>({
    endpoint: 'authors',
    queries: { filters: `slug[equals]${slug}`, limit: 1 },
  });
  return data.contents[0] ?? null;
}

// ==========================================================================
// Spots (地域記事用)
// ==========================================================================

export async function getSpots(queries?: MicroCMSQueries) {
  return await getClient().getList<Spot>({
    endpoint: 'spots',
    queries: { orders: '-updatedAt', limit: 20, ...queries },
  });
}

// ==========================================================================
// Site Config
// ==========================================================================

export async function getSiteConfig(): Promise<SiteConfig | null> {
  try {
    return await getClient().getObject<SiteConfig>({
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
  if (!ARTICLES_API_ENABLED) return emptyList<Article>(limit);
  const filters: string[] = [];

  if (filter.age) filters.push(`quickInfo_ageRanges[contains]${filter.age}`);
  if (filter.weather) filters.push(`quickInfo_weather[contains]${filter.weather}`);
  if (filter.place) filters.push(`quickInfo_place[contains]${filter.place}`);
  if (filter.maxDuration) filters.push(`quickInfo_durationMin[less_than]${filter.maxDuration + 1}`);
  if (filter.budget) filters.push(`quickInfo_budget[equals]${filter.budget}`);

  return await getClient().getList<Article>({
    endpoint: 'articles',
    queries: {
      filters: filters.length > 0 ? filters.join('[and]') : undefined,
      orders: '-publishedAt',
      limit,
    },
  });
}
