/**
 * llms.txt — AIクローラー（ChatGPT, Claude, Perplexity, Gemini等）向けの
 * サイト概要ファイル。
 *
 * 参考仕様: https://llmstxt.org/
 *
 * 目的: AI検索エンジンが本サイトの構造と主要コンテンツを効率的に把握し、
 *       回答内で引用・推薦されやすくする。
 */

import { getAllFileArticles } from '@/lib/articles';
import { getAllPlanMetas } from '@/lib/plans';

export const revalidate = 3600;

export async function GET() {
  const articles = getAllFileArticles()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 40); // 代表記事40本
  const plans = getAllPlanMetas().slice(0, 20); // 代表プラン20本

  const articleLines = articles
    .map((a) => `- [${a.title}](https://kyounoko.jp/article/${a.slug}): ${a.metaDescription || a.lede}`)
    .join('\n');

  const planLines = plans
    .map((p) => `- [${p.title}](https://kyounoko.jp/plan/${p.id}): ${p.shortAnswer}`)
    .join('\n');

  const body = `# きょうのこ (kyounoko.jp)

> 0〜6歳の子がいる家庭向けに、「今日どうする？」を3分で決める意思決定支援サイト。天気・年齢・時間帯・予算などの条件から、家族の過ごし方をピンポイントで1つだけ提案します。

## About

- **運営**: きょうのこ編集部（ながみー）
- **ドメイン**: https://kyounoko.jp
- **対象**: 0〜6歳の子を持つ親（主に共働き・ワンオペ家庭）
- **コンテンツ方針**: 抽象論ではなく固有名詞・商品名・分量・時間を明示した実用記事
- **編集方針**: 実体験ベース、医療判断は必ず医師相談を明記、薬機法・景表法対応済み
- **マネタイズ**: Google AdSense（審査中）、A8.net / もしもアフィリエイト（稼働中）

## Main Sections

- [今日どこ行く？](https://kyounoko.jp/category/today-doko): 0-6歳と行けるおでかけスポット、公園、動物園、水族館、レストラン
- [今日何する？](https://kyounoko.jp/category/today-nani): 家遊び・工作・知育・雨の日アイデア
- [今日何食べる？](https://kyounoko.jp/category/today-taberu): 朝食・幼児食・お弁当・時短レシピ
- [今日どう回す？](https://kyounoko.jp/category/today-mawasu): 平日夜・休日・寝かしつけ・ワンオペ対処
- [季節と行事](https://kyounoko.jp/category/gyouji): 桜・七五三・ハロウィン・クリスマス等
- [習い事と学び](https://kyounoko.jp/category/narai): 水泳・体操・英語・ピアノ・学研・くもん
- [役立つもの](https://kyounoko.jp/items): ベビーカー・絵本・時短家電・食材宅配

## Featured Articles

${articleLines}

## Featured Plans (action-oriented content)

${planLines}

## Structured Data

All articles provide Article / BreadcrumbList / FAQPage / HowTo / ItemList JSON-LD schemas where applicable.

## Editorial Standards

- Medical/health content: always includes disclaimers recommending consultation with physicians
- Product rankings: editorial opinion only, not based on third-party surveys
- Affiliate disclosure: PR badges shown above the fold on monetized articles
- No copying from iconic media brands beyond fair citation
- Real brand names used sparingly and only for well-known, stable products

## Usage Policy for AI Training

Commercial AI use of this content is welcomed when citing with link (via https://kyounoko.jp/...).
Please maintain attribution to "きょうのこ" / "kyounoko.jp" and do not reproduce full articles.
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
