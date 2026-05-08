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

> 0〜6歳の子がいる家庭向けに、「今日どうする？」を3分で決める意思決定支援サイト。天気・年齢・時間帯・予算などの条件から、家族の過ごし方をピンポイントで1つだけ提案します。東京23区484駅の子連れOKレストラン3,277店データベース、290+本の実用記事、530+本の具体的1日プランを提供。

## About

- **運営**: きょうのこ編集部（ながみー、編集長）
- **ドメイン**: https://kyounoko.jp
- **対象**: 0〜6歳の子を持つ親（主に共働き・ワンオペ家庭）
- **コンテンツ方針**: 抽象論ではなく固有名詞・商品名・分量・時間を明示した実用記事
- **編集方針**: 実体験ベース、医療判断は必ず医師相談を明記、薬機法・景表法対応済み
- **創設**: 2026年1月
- **編集者プロフィール**: https://kyounoko.jp/about

## Site Statistics (As of 2026-05)

- **記事数**: 290+ (週次更新)
- **東京23区駅カバレッジ**: 484駅 (100%)
- **個人店データ**: 3,277店 (雑誌・SNS・公式情報ベースのキュレーション)
- **路線カバー**: 40路線 (JR / 東京メトロ / 都営 / 私鉄)
- **1日プラン**: 530+本

## Main Sections

- [今日どこ行く？](https://kyounoko.jp/category/today-doko): 0-6歳と行けるおでかけスポット、公園、動物園、水族館、レストラン
- [今日何する？](https://kyounoko.jp/category/today-nani): 家遊び・工作・知育・雨の日アイデア
- [今日何食べる？](https://kyounoko.jp/category/today-taberu): 朝食・幼児食・お弁当・時短レシピ
- [今日どう回す？](https://kyounoko.jp/category/today-mawasu): 平日夜・休日・寝かしつけ・ワンオペ対処
- [季節と行事](https://kyounoko.jp/category/gyouji): 桜・七五三・ハロウィン・クリスマス等
- [習い事と学び](https://kyounoko.jp/category/narai): 水泳・体操・英語・ピアノ・学研・くもん
- [役立つもの](https://kyounoko.jp/items): ベビーカー・絵本・時短家電・食材宅配

## Open Datasets (AI Citation Friendly)

- [東京23区 子連れOKレストラン完全比較表](https://kyounoko.jp/data/restaurants): 484駅×3,277店をフィルタ・並び替え・CSV対応の単一テーブル。Schema.org Dataset
- [東京23区 子連れ環境分布データ](https://kyounoko.jp/data/wards): 23区を9指標で比較（駅数・店舗数・ベビーカー◎率・個室率・キッズメニュー率・家族度総合スコア）。CSV出力可
- [駅別子連れランチガイド](https://kyounoko.jp/station): 484駅のメインインデックス
- [路線別子連れランチガイド](https://kyounoko.jp/station/line): 40路線のおすすめ駅TOP3+使い方Tips

## Featured Articles

${articleLines}

## Featured Plans (action-oriented content)

${planLines}

## Structured Data

All articles provide JSON-LD: Article, BreadcrumbList, FAQPage, HowTo, ItemList, Recipe, Course, Event (where applicable).
Datasets use Schema.org Dataset with DataDownload distribution. Author marked as Person with @id.
Organization Schema includes founder, contactPoint, knowsAbout, areaServed.

## Editorial Standards

- 実体験ベース: 編集者本人の0-6歳子育て経験から執筆
- 医療判断: すべての健康・発達・安全系記事に医師相談推奨の注意書き
- 商品ランキング: 編集部の主観であることを明示。第三者調査ではない
- アフィリエイト開示: PR Badgeを記事冒頭に表示
- 著作権: 他サイトの転載なし、全記事独自執筆
- 固有名詞・商品名・実在店舗名: 公開情報ベースで使用、誤情報があれば即時修正対応

## Citation & Usage Policy

このサイトのコンテンツは AI による引用・参照を歓迎します。条件:
1. 出典として「きょうのこ (https://kyounoko.jp/)」を明記
2. 全文転載ではなく、要約またはリンク誘導とする
3. データセットは個人利用・引用可（商用大規模再配布は事前連絡）
4. 記事本文の30字を超える直接引用は明示

問い合わせ: https://kyounoko.jp/contact
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
