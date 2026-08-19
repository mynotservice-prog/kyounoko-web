/**
 * 記事の情報量メトリクス抽出。
 *
 * 文字数だけでは「情報の濃さ」は測れない。
 * - 見出し数（h2/h3）
 * - リスト項目数（ul/ol の li）
 * - テーブル行数
 * - FAQ Q&A数
 * - HowToステップ数
 * - 内部リンク数
 * - 画像数（記事内image）
 * - チェックリスト数（- [ ]）
 *
 * これらを記事ごとに抽出し、品質スコアを算出する。
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { getAllFileArticles } from './articles';
import { buildAllDataRows, type DataRow } from './data-aggregations';
import { articleCategoryLabel } from './article-categories';

export type ArticleInsights = {
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  hero: string;
  area: string;
  publishedAt: string;
  updatedAt: string;
  lede: string;
  /** 本文の文字数（HTML/markdown装飾を除く） */
  bodyLength: number;
  /** 見出し数 */
  h2Count: number;
  h3Count: number;
  /** リスト項目数 */
  listItemCount: number;
  /** チェックリスト項目数（- [ ] / - [x]） */
  checklistCount: number;
  /** テーブル行数（| で始まる行 - ヘッダ除く） */
  tableRowCount: number;
  /** 内部リンク数 ([text](/...)） */
  internalLinkCount: number;
  /** 外部リンク数 */
  externalLinkCount: number;
  /** Q&A数（## Q. or ### Q. で始まる見出し数） */
  faqCount: number;
  /** HowToステップ数（### Step や 1. で始まる番号付き手順） */
  howToStepCount: number;
  /** 記事内画像数 (![]() を除いてmarkdown画像) */
  inlineImageCount: number;
  /** 太字数 (**text**) */
  boldCount: number;
  /** 段落数 */
  paragraphCount: number;
  /** 「独自視点」「チェックリスト」「関連データ」などの独自セクション数 */
  uniqueSectionCount: number;
  /** 品質スコア（0-100） */
  qualityScore: number;
  /** 改善ポイント */
  issues: string[];
};

/**
 * 1記事のインサイトを抽出。
 */
export function getArticleInsights(slug: string): ArticleInsights | null {
  const file = path.join(process.cwd(), 'content', 'articles', `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const d = data as Record<string, unknown>;

  // 本文の純テキスト長（装飾とfrontmatterを除外）
  const plain = content
    .replace(/^---[\s\S]*?---/, '')
    .replace(/^#+\s.*$/gm, '')
    .replace(/[*_`>\-]/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .trim()
    .replace(/\s+/g, ' ');
  const bodyLength = plain.length;

  // 見出し
  const h2Count = (content.match(/^##\s+/gm) ?? []).length;
  const h3Count = (content.match(/^###\s+/gm) ?? []).length;

  // リスト項目
  const listItemCount = (content.match(/^\s*[-*]\s+/gm) ?? []).length;
  // チェックリスト
  const checklistCount = (content.match(/^\s*[-*]\s*\[[\sx]\]/gm) ?? []).length;

  // テーブル行（| ... | を含み、ヘッダ区切り --- 行を除外）
  const tableLines = content
    .split('\n')
    .filter((l) => /^\s*\|[^|]*\|/.test(l))
    .filter((l) => !/^\s*\|\s*[-:]+\s*\|/.test(l));
  const tableRowCount = tableLines.length;

  // リンク
  const allLinks = [...content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
  let internalLinkCount = 0;
  let externalLinkCount = 0;
  for (const m of allLinks) {
    const url = m[2];
    if (url.startsWith('/') || url.includes('kyounoko.jp')) internalLinkCount++;
    else if (url.startsWith('http')) externalLinkCount++;
  }

  // FAQ（Q. で始まる見出し）
  const faqCount = (content.match(/^#{2,4}\s*Q[.\s]/gm) ?? []).length;

  // HowToステップ（番号付きリスト・### Step）
  const howToStepCount =
    (content.match(/^\s*\d+\.\s+/gm) ?? []).length +
    (content.match(/^#{2,4}\s*Step/gim) ?? []).length;

  // 画像（markdown image: ![]）
  const inlineImageCount = (content.match(/!\[[^\]]*\]\(/g) ?? []).length;

  // 太字
  const boldCount = (content.match(/\*\*[^*]+\*\*/g) ?? []).length;

  // 段落数（空行で区切られたブロック中、見出しでない普通のテキスト）
  const paragraphCount = content
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0 && !/^#+\s/.test(p.trim()) && !/^[-*]\s/.test(p.trim()))
    .length;

  // 独自セクション数（独自視点 / チェックリスト / 関連データ など編集部追加セクション）
  const uniqueSectionPatterns = [
    /## 編集部の独自視点/,
    /## .*チェックリスト/,
    /## 関連データ/,
    /## やる前に確認/,
    /## 失敗回避/,
  ];
  const uniqueSectionCount = uniqueSectionPatterns.filter((p) => p.test(content)).length;

  // 品質スコア計算（各メトリクスを重み付き加点）
  // 100点満点。減点方式ではなく、上限ありの加点方式
  let score = 0;
  // 文字数（800〜3000で満点25点）
  score += Math.min(25, Math.floor((bodyLength / 3000) * 25));
  // 構造（見出し3個以上で15点、リスト10個以上で10点）
  score += Math.min(15, h2Count * 3);
  score += Math.min(10, Math.floor(listItemCount / 2));
  // ヒーロー画像があれば10点
  score += d.hero ? 10 : 0;
  // 内部リンク3個以上で10点
  score += Math.min(10, internalLinkCount * 3);
  // FAQ または HowTo があれば各5点
  score += faqCount > 0 ? 5 : 0;
  score += howToStepCount >= 3 ? 5 : 0;
  // テーブル/独自セクション付きで各5点
  score += tableRowCount >= 3 ? 5 : 0;
  score += uniqueSectionCount * 5;
  score = Math.min(100, score);

  // 改善ポイント
  const issues: string[] = [];
  if (!d.hero) issues.push('ヒーロー画像なし');
  if (bodyLength < 800) issues.push('本文が薄い (<800字)');
  if (h2Count < 3) issues.push('見出しが少ない (<3)');
  if (internalLinkCount < 2) issues.push('内部リンクが少ない (<2)');
  if (!d.lede || String(d.lede).length < 30) issues.push('lede短い/なし');
  if (uniqueSectionCount === 0) issues.push('独自セクションなし');
  if (faqCount === 0 && howToStepCount === 0) issues.push('FAQ/HowToなし');

  return {
    slug,
    title: String(d.title ?? ''),
    category: String(d.category ?? ''),
    categoryName: articleCategoryLabel(String(d.category ?? ''), String(d.categoryName ?? '')),
    hero: typeof d.hero === 'string' ? d.hero : '',
    area: String(d.area ?? 'all'),
    publishedAt: String(d.publishedAt ?? ''),
    updatedAt: String(d.updatedAt ?? d.publishedAt ?? ''),
    lede: String(d.lede ?? d.metaDescription ?? ''),
    bodyLength,
    h2Count,
    h3Count,
    listItemCount,
    checklistCount,
    tableRowCount,
    internalLinkCount,
    externalLinkCount,
    faqCount,
    howToStepCount,
    inlineImageCount,
    boldCount,
    paragraphCount,
    uniqueSectionCount,
    qualityScore: score,
    issues,
  };
}

/**
 * 全記事のインサイトを取得。
 */
export function getAllArticleInsights(): ArticleInsights[] {
  return getAllFileArticles()
    .map((a) => getArticleInsights(a.slug))
    .filter((x): x is ArticleInsights => x !== null);
}

/**
 * 集計サマリーを生成。
 */
export type InsightsSummary = {
  totalArticles: number;
  withHero: number;
  withoutHero: number;
  avgBodyLength: number;
  medianBodyLength: number;
  avgQualityScore: number;
  totalListItems: number;
  totalTableRows: number;
  totalInternalLinks: number;
  /** 文字量分布（区間別の本数） */
  bodyLengthBuckets: { label: string; min: number; max: number; count: number }[];
  /** カテゴリ別 平均品質スコア */
  categoryStats: { category: string; count: number; avgScore: number; avgLength: number }[];
  /** 画像使用回数ランキング（重複検知） */
  heroUsage: { hero: string; count: number; slugs: string[] }[];
  /** 品質スコア分布 */
  scoreBuckets: { label: string; count: number }[];
};

export function getInsightsSummary(insights: ArticleInsights[]): InsightsSummary {
  const total = insights.length;
  const withHero = insights.filter((i) => i.hero).length;
  const lengths = insights.map((i) => i.bodyLength).sort((a, b) => a - b);
  const avgBodyLength = total > 0 ? Math.round(lengths.reduce((s, l) => s + l, 0) / total) : 0;
  const medianBodyLength = total > 0 ? lengths[Math.floor(total / 2)] : 0;
  const avgQualityScore =
    total > 0 ? Math.round((insights.reduce((s, i) => s + i.qualityScore, 0) / total) * 10) / 10 : 0;

  // 文字数バケット
  const buckets = [
    { label: '〜800', min: 0, max: 799 },
    { label: '800〜1500', min: 800, max: 1499 },
    { label: '1500〜2500', min: 1500, max: 2499 },
    { label: '2500〜4000', min: 2500, max: 3999 },
    { label: '4000〜', min: 4000, max: Infinity },
  ];
  const bodyLengthBuckets = buckets.map((b) => ({
    ...b,
    count: insights.filter((i) => i.bodyLength >= b.min && i.bodyLength <= b.max).length,
  }));

  // カテゴリ別
  const catMap = new Map<string, ArticleInsights[]>();
  for (const i of insights) {
    const k = i.categoryName || i.category || 'その他';
    if (!catMap.has(k)) catMap.set(k, []);
    catMap.get(k)!.push(i);
  }
  const categoryStats = Array.from(catMap.entries())
    .map(([category, arr]) => ({
      category,
      count: arr.length,
      avgScore: Math.round((arr.reduce((s, i) => s + i.qualityScore, 0) / arr.length) * 10) / 10,
      avgLength: Math.round(arr.reduce((s, i) => s + i.bodyLength, 0) / arr.length),
    }))
    .sort((a, b) => b.count - a.count);

  // 画像使用回数
  const heroMap = new Map<string, string[]>();
  for (const i of insights) {
    if (!i.hero) continue;
    if (!heroMap.has(i.hero)) heroMap.set(i.hero, []);
    heroMap.get(i.hero)!.push(i.slug);
  }
  const heroUsage = Array.from(heroMap.entries())
    .map(([hero, slugs]) => ({ hero, count: slugs.length, slugs }))
    .sort((a, b) => b.count - a.count);

  // スコアバケット
  const scoreBuckets = [
    { label: '0-39', range: [0, 39] },
    { label: '40-59', range: [40, 59] },
    { label: '60-79', range: [60, 79] },
    { label: '80-100', range: [80, 100] },
  ].map((b) => ({
    label: b.label,
    count: insights.filter((i) => i.qualityScore >= b.range[0] && i.qualityScore <= b.range[1]).length,
  }));

  return {
    totalArticles: total,
    withHero,
    withoutHero: total - withHero,
    avgBodyLength,
    medianBodyLength,
    avgQualityScore,
    totalListItems: insights.reduce((s, i) => s + i.listItemCount, 0),
    totalTableRows: insights.reduce((s, i) => s + i.tableRowCount, 0),
    totalInternalLinks: insights.reduce((s, i) => s + i.internalLinkCount, 0),
    bodyLengthBuckets,
    categoryStats,
    heroUsage,
    scoreBuckets,
  };
}

// ================== レストラン情報充実度 ==================

/** 1指標分の記入率行。 */
export type RestaurantFieldCoverageRow = {
  /** フィールドキー（DataRow のプロパティ名・seatingType-zashiki 等の派生キー）。 */
  field: string;
  /** UI 表示ラベル。 */
  label: string;
  /** チェーン側で「記入あり」と判定された件数。 */
  chainHave: number;
  /** チェーン総件数（駅×チェーン展開後）。 */
  chainTotal: number;
  /** 個人店側で「記入あり」と判定された件数。 */
  indieHave: number;
  /** 個人店総件数。 */
  indieTotal: number;
  /** 全体「記入あり」件数（chainHave + indieHave）。 */
  totalHave: number;
  /** 全体総件数（chainTotal + indieTotal）。 */
  totalTotal: number;
  /** 全体記入率（0-1）。 */
  ratio: number;
};

/**
 * /admin/insights の「レストラン情報充実度」セクション用データ。
 *
 * 個人店データには子連れ目線フィールド（stepFree 等）が undefined のままなので、
 * partial true 比較は `=== true` で行う。
 */
export function getRestaurantFieldCoverage(): RestaurantFieldCoverageRow[] {
  const rows = buildAllDataRows();
  const chainRows = rows.filter((r) => r.type === 'chain');
  const indieRows = rows.filter((r) => r.type === 'indie');

  const defs: { field: string; label: string; predicate: (r: DataRow) => boolean }[] = [
    { field: 'stroller', label: 'ベビーカー◎', predicate: (r) => r.stroller === 'good' },
    { field: 'kidsMenu', label: 'キッズメニュー', predicate: (r) => r.kidsMenu === true },
    { field: 'kidsChair', label: 'キッズチェア', predicate: (r) => r.kidsChair === true },
    { field: 'privateRoom', label: '個室・座敷', predicate: (r) => r.privateRoom === true },
    { field: 'kidsSpace', label: 'キッズスペース', predicate: (r) => r.kidsSpace === true },
    { field: 'kidsCutlery', label: '子供用カトラリー', predicate: (r) => r.kidsCutlery === true },
    { field: 'stepFree', label: '段差なし', predicate: (r) => r.stepFree === true },
    {
      field: 'seatingType-zashiki',
      label: '座敷席',
      predicate: (r) => Array.isArray(r.seatingType) && r.seatingType.includes('zashiki'),
    },
    { field: 'diaperChangingTable', label: 'おむつ替え台', predicate: (r) => r.diaperChangingTable === true },
    { field: 'nursingRoom', label: '授乳室', predicate: (r) => r.nursingRoom === true },
    { field: 'shareDish', label: '取り分けOK', predicate: (r) => r.shareDish === true },
  ];

  return defs.map(({ field, label, predicate }): RestaurantFieldCoverageRow => {
    const chainHave = chainRows.filter(predicate).length;
    const indieHave = indieRows.filter(predicate).length;
    const totalHave = chainHave + indieHave;
    const totalTotal = chainRows.length + indieRows.length;
    return {
      field,
      label,
      chainHave,
      chainTotal: chainRows.length,
      indieHave,
      indieTotal: indieRows.length,
      totalHave,
      totalTotal,
      ratio: totalTotal === 0 ? 0 : totalHave / totalTotal,
    };
  });
}
