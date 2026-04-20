/**
 * 記事のカテゴリ/slug/タイトル から、追加の Schema.org JSON-LD を生成する。
 *
 * 既存の Article + BreadcrumbList + FAQ + HowTo + ItemList に加えて、
 * 記事タイプ別の特化スキーマ（Recipe, Product, Course, Event）を付与することで
 * リッチリザルト（検索結果での画像・評価・所要時間表示）と
 * AI検索の引用精度（ChatGPT / Perplexity 等）を向上させる。
 *
 * 付与ロジック:
 * - Recipe: 朝食・幼児食・お弁当・作り置き等の食事系記事
 * - Course: 習い事・通信教育等の教育系記事
 * - Event: 桜・ハロウィン・クリスマス・七五三等の季節行事
 * - Product: 単一商品レビュー/紹介記事（ランキングは ItemList を既に使用）
 */

import type { FileArticle } from './articles';

/** 食事・レシピ系のslugパターン */
const RECIPE_SLUG_PATTERNS = [
  /asagohan/,
  /bento|obento|kyaraben/,
  /gohan|ryouri|reshipi|recipe/,
  /rinyuushoku|youjishoku/,
  /tsukurioki|reitou/,
  /yaki|chicken|toriniku|gyuuniku|sakana/,
  /dessert|okashi|sweets|oyatsu/,
  /yasai|vegetable/,
  /yuuhan|dinner|lunch|ranchi/,
];

/** 習い事・教育系 */
const COURSE_SLUG_PATTERNS = [
  /naraigoto/,
  /kumon|gakken|shichida|tsuushin|chiku/,
  /swimming|soccer|yakyu|taisou|sports|piano/,
  /eigo|programming|chiiku/,
  /shichigosan-narai/,  // not actually a 習い事
];

/** イベント系 */
const EVENT_SLUG_PATTERNS = [
  /hanami|sakura|ohanami/,
  /halloween|hanabi|oshougatsu|natsumatsuri|hinamatsuri|tanabata|kodomonohi|setsubun|shichigosan/,
  /xmas|christmas|kurisumasu/,
  /undoukai/,
];

function matchesAny(s: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(s));
}

type Schema = Record<string, unknown>;

/** Recipe schema（レシピ記事用）*/
function buildRecipe(article: FileArticle, url: string, imageUrl: string): Schema | null {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: article.title,
    description: article.tldr ?? article.metaDescription,
    image: imageUrl,
    author: { '@type': 'Person', name: 'ながみー' },
    datePublished: article.publishedAt,
    // 所要時間（分）を PT{N}M で
    ...(article.quickInfo?.durationMin && {
      totalTime: `PT${article.quickInfo.durationMin}M`,
      prepTime: `PT${Math.floor(article.quickInfo.durationMin * 0.3)}M`,
      cookTime: `PT${Math.floor(article.quickInfo.durationMin * 0.7)}M`,
    }),
    recipeCategory: '子ども向け料理',
    recipeCuisine: '和食',
    keywords: '幼児食,子ども,時短,ベビー',
    // 材料はHowToから抜くと量が多すぎるので省略（HowToに任せる）
    ...(article.howto && article.howto.length >= 3 && {
      recipeInstructions: article.howto.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    }),
    // 子ども向けなので recipeYield は1-2人分
    recipeYield: '1-2人分（親子）',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

/** Course schema（習い事記事用）*/
function buildCourse(article: FileArticle, url: string, imageUrl: string): Schema | null {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: article.title,
    description: article.tldr ?? article.metaDescription,
    image: imageUrl,
    provider: {
      '@type': 'Organization',
      name: 'きょうのこ',
      sameAs: 'https://kyounoko.jp',
    },
    inLanguage: 'ja',
    educationalLevel: '0-6歳（未就学児）',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

/** Event schema（季節行事記事用）*/
function buildEvent(article: FileArticle, url: string, imageUrl: string): Schema | null {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: article.title,
    description: article.tldr ?? article.metaDescription,
    image: imageUrl,
    organizer: { '@type': 'Organization', name: 'きょうのこ編集部' },
    eventStatus: 'https://schema.org/EventScheduled',
    // 日時は記事自体が「情報ガイド」なので実際の年の開催日は記事内で明記している前提
    // 発生年を仮置きしないようにここでは startDate を省略
    location: {
      '@type': 'VirtualLocation',
      url: url,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

/**
 * 記事に応じて追加スキーマを返す。該当しなければ空配列。
 */
export function getExtraSchemasForArticle(
  article: FileArticle,
  url: string,
  imageUrl: string,
): Schema[] {
  const slug = article.slug.toLowerCase();
  const schemas: Schema[] = [];

  // カテゴリでの優先判定
  const isFood = article.category === 'today-taberu';
  const isNarai = article.category === 'narai';
  const isEvent = article.category === 'gyouji';

  if (isFood || matchesAny(slug, RECIPE_SLUG_PATTERNS)) {
    const s = buildRecipe(article, url, imageUrl);
    if (s) schemas.push(s);
  }
  if (isNarai || matchesAny(slug, COURSE_SLUG_PATTERNS)) {
    const s = buildCourse(article, url, imageUrl);
    if (s) schemas.push(s);
  }
  if (isEvent || matchesAny(slug, EVENT_SLUG_PATTERNS)) {
    const s = buildEvent(article, url, imageUrl);
    if (s) schemas.push(s);
  }

  return schemas;
}
