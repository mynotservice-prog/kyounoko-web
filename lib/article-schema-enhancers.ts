/**
 * 記事のカテゴリ/slug/タイトル から、追加の Schema.org JSON-LD を生成する。
 *
 * 既存の Article + BreadcrumbList + FAQ + HowTo + ItemList に加えて、
 * 記事タイプ別の特化スキーマ（Recipe, Course）を付与することで
 * リッチリザルト（検索結果での画像・評価・所要時間表示）と
 * AI検索の引用精度（ChatGPT / Perplexity 等）を向上させる。
 *
 * 付与ロジック:
 * - Recipe: 朝食・幼児食・お弁当・作り置き等の食事系記事で、かつ HowTo と 所要時間 が揃っているもの
 * - Course: 習い事・通信教育等の教育系記事
 *
 * ## Event スキーマを使わない理由
 * 当サイトの季節行事記事（七五三・ハロウィン等）は「情報ガイド」であって、
 * 特定日時に特定場所で開催される Event ではない。
 * Event スキーマは startDate と 適切な location（Place/PostalAddress）が必須のため、
 * 情報記事に無理に付与するとSearch Consoleで重大エラーになる。
 *
 * ## Recipe スキーマの条件
 * Google の Recipe リッチリザルト要件（recipeInstructions 推奨・prepTime/totalTime 推奨）を
 * 満たすため、以下が揃っている場合のみ付与:
 * - article.howto（3ステップ以上）→ recipeInstructions
 * - article.quickInfo.durationMin → totalTime / prepTime / cookTime
 *
 * 条件未達の記事には Recipe スキーマを付与せず、通常の Article スキーマのみに留める。
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
];

function matchesAny(s: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(s));
}

type Schema = Record<string, unknown>;

/**
 * Recipe schema（レシピ記事用）
 * Google Search Console の Recipe リッチリザルト重大エラーを回避するため、
 * recipeInstructions（howto） と 所要時間（durationMin）が両方揃っている場合のみ付与。
 */
function buildRecipe(article: FileArticle, url: string, imageUrl: string): Schema | null {
  const hasSteps = !!article.howto && article.howto.length >= 3;
  const hasDuration = !!article.quickInfo?.durationMin;

  // 必須フィールドが揃わない記事には Recipe スキーマを付与しない
  if (!hasSteps || !hasDuration) {
    return null;
  }

  const durationMin = article.quickInfo!.durationMin!;

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: article.title,
    description: article.tldr ?? article.metaDescription,
    image: imageUrl,
    author: { '@type': 'Person', name: 'ながみー' },
    datePublished: article.publishedAt,
    totalTime: `PT${durationMin}M`,
    prepTime: `PT${Math.max(1, Math.floor(durationMin * 0.3))}M`,
    cookTime: `PT${Math.max(1, Math.floor(durationMin * 0.7))}M`,
    recipeCategory: '子ども向け料理',
    recipeCuisine: '和食',
    keywords: '幼児食,子ども,時短,ベビー',
    recipeInstructions: article.howto!.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
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

/**
 * 記事に応じて追加スキーマを返す。該当しなければ空配列。
 *
 * Event スキーマは意図的に含めない（情報ガイド記事は Event ではない）。
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

  if (isFood || matchesAny(slug, RECIPE_SLUG_PATTERNS)) {
    const s = buildRecipe(article, url, imageUrl);
    if (s) schemas.push(s);
  }
  if (isNarai || matchesAny(slug, COURSE_SLUG_PATTERNS)) {
    const s = buildCourse(article, url, imageUrl);
    if (s) schemas.push(s);
  }

  return schemas;
}
