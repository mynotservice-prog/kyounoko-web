/**
 * Plan ↔ Article の双方向クロスリンク用マッチング。
 *
 * 目的:
 *  - プラン詳細ページに「この行動に役立つ記事」を提示
 *  - 記事詳細ページに「この記事の悩みに使えるプラン」を提示
 *  - 内部リンク密度を上げて回遊・滞在を伸ばす（SEO/AEO 両方に効く）
 *
 * 設計方針:
 *  - 軽量・サーバーサイド限定（pages から直接呼ぶ）
 *  - 既存の `getAllPlanMetas` / `getAllFileArticles` をそのまま利用
 *  - スコアリングは「コア軸が合うかどうか」のヒューリスティック。
 *    現時点は条件マッチ + キーワード一致でシンプルに。
 */

import {
  getAllFileArticles,
  type FileArticleMeta,
} from './articles';
import { getAllPlanMetas, type PlanMeta } from './plans';

// ----------------------------------------------------------------------
// area マッチ（articles.ts / plans.ts と同等の軽量実装をローカルに持つ）
// ----------------------------------------------------------------------

const BLOCK_MEMBERS: Record<string, string[]> = {
  'hokkaido-tohoku': ['hokkaido', 'aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima'],
  'kanto': ['ibaraki', 'tochigi', 'gunma', 'saitama', 'chiba', 'tokyo', 'kanagawa'],
  'chubu': ['niigata', 'toyama', 'ishikawa', 'fukui', 'yamanashi', 'nagano', 'gifu', 'shizuoka', 'aichi'],
  'kansai': ['mie', 'shiga', 'kyoto', 'osaka', 'hyogo', 'nara', 'wakayama'],
  'chugoku-shikoku': ['tottori', 'shimane', 'okayama', 'hiroshima', 'yamaguchi', 'tokushima', 'kagawa', 'ehime', 'kochi'],
  'kyushu-okinawa': ['fukuoka', 'saga', 'nagasaki', 'kumamoto', 'oita', 'miyazaki', 'kagoshima', 'okinawa'],
};

function areaCompatible(a: string | undefined, b: string | undefined): boolean {
  const aa = a ?? 'all';
  const bb = b ?? 'all';
  if (aa === 'all' || bb === 'all') return true;
  if (aa === bb) return true;
  if (BLOCK_MEMBERS[aa]?.includes(bb)) return true;
  if (BLOCK_MEMBERS[bb]?.includes(aa)) return true;
  return false;
}

// ----------------------------------------------------------------------
// 共通: 簡易キーワード一致（タイトル+短答 vs タイトル+説明）
// ----------------------------------------------------------------------

/** 2〜4文字の漢字/カタカナ語をざっくり取り出してキーワード集合化。日本語向け軽量実装。 */
function extractKeywords(text: string): Set<string> {
  const keywords = new Set<string>();
  if (!text) return keywords;
  // 漢字2〜4文字、カタカナ2文字以上、アルファベット3文字以上を拾う
  const re = /([一-鿿]{2,4})|([゠-ヿ]{2,})|([A-Za-z]{3,})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const w = (m[1] || m[2] || m[3] || '').trim();
    if (w.length >= 2) keywords.add(w);
  }
  return keywords;
}

function keywordOverlap(a: string, b: string): number {
  const ka = extractKeywords(a);
  const kb = extractKeywords(b);
  let hits = 0;
  for (const w of ka) {
    if (kb.has(w)) hits++;
  }
  return hits;
}

// ----------------------------------------------------------------------
// A. プラン → 関連記事
// ----------------------------------------------------------------------

/**
 * 指定プランに紐づく「役立つ記事」を最大 limit 件返す。
 * - plan.seoRelated（明示指定）の記事は先頭固定
 * - kind=meal なら category=today-taberu を優先
 * - place に outdoor を含むなら today-doko を優先
 * - place に home を含み outdoor を含まないなら today-nani / today-mawasu を優先
 * - ageRanges の重なりで加点
 * - エリア互換性（プラン area と 記事 area）で加点
 * - タイトル+短答のキーワード重複で加点
 */
export function getRelatedArticlesForPlan(
  plan: PlanMeta,
  options?: { limit?: number; excludeSlugs?: string[] },
): FileArticleMeta[] {
  const limit = options?.limit ?? 3;
  const exclude = new Set(options?.excludeSlugs ?? []);
  if (plan.seoRelated) exclude.add(plan.seoRelated); // すでに別セクションで表示している

  const all = getAllFileArticles().filter((a) => !exclude.has(a.slug) && !a.noindex);

  // カテゴリ優先度マップ
  const wantsMeal = plan.kind === 'meal';
  const wantsOutdoor = plan.place.includes('outdoor');
  const wantsHome = plan.place.includes('home');

  const categoryBoost = (cat: string): number => {
    if (wantsMeal && cat === 'today-taberu') return 30;
    if (wantsOutdoor && cat === 'today-doko') return 30;
    if (wantsHome && !wantsOutdoor && (cat === 'today-nani' || cat === 'today-mawasu')) return 25;
    // 「外出失敗」「天気で決める」は外出系プランと相性◎
    if (wantsOutdoor && (cat === 'shippai-shinai' || cat === 'tenki')) return 12;
    // 行事カテゴリは活動系全般と相性
    if (!wantsMeal && cat === 'gyouji') return 8;
    return 0;
  };

  const scored = all.map((a) => {
    let score = 0;
    score += categoryBoost(a.category);

    // 年齢重複
    if (a.quickInfo?.ageRanges && a.quickInfo.ageRanges.length > 0) {
      const overlap = a.quickInfo.ageRanges.filter((r) =>
        (plan.ageRanges as string[]).includes(r),
      ).length;
      if (overlap > 0) score += 8 * overlap;
    }

    // エリア互換性
    if (areaCompatible(plan.area, a.area)) {
      score += plan.area !== 'all' && a.area && a.area !== 'all' ? 10 : 3;
    } else {
      score -= 20;
    }

    // キーワード一致（タイトル + 短答）
    const planText = `${plan.title} ${plan.shortAnswer}`;
    const articleText = `${a.title} ${a.metaDescription ?? ''} ${a.lede ?? ''}`;
    score += keywordOverlap(planText, articleText) * 4;

    // 予算近接
    if (plan.budget && a.quickInfo?.budget) {
      const rank: Record<string, number> = { free: 0, low: 1, mid: 2, high: 3 };
      const diff = Math.abs((rank[plan.budget] ?? 3) - (rank[a.quickInfo.budget] ?? 3));
      if (diff === 0) score += 3;
      else if (diff === 1) score += 1;
    }

    // 同じ place（家/外）
    if (a.quickInfo?.place && a.quickInfo.place.length > 0) {
      const placeOverlap = a.quickInfo.place.filter((p) =>
        (plan.place as string[]).includes(p),
      ).length;
      if (placeOverlap > 0) score += 4 * placeOverlap;
    }

    return { article: a, score };
  });

  const positives = scored
    .filter((x) => x.score > 0)
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      return x.article.updatedAt < y.article.updatedAt ? 1 : -1;
    })
    .map((x) => x.article);

  if (positives.length >= limit) return positives.slice(0, limit);

  // 不足分は最新の area 互換な記事で補充
  const filler = all
    .filter(
      (a) =>
        !positives.find((p) => p.slug === a.slug) &&
        areaCompatible(plan.area, a.area),
    )
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return [...positives, ...filler].slice(0, limit);
}

// ----------------------------------------------------------------------
// B. 記事 → 関連プラン
// ----------------------------------------------------------------------

/**
 * 指定記事に紐づく「実際に使えるプラン」を最大 limit 件返す。
 * - 記事 category=today-taberu → kind=meal プラン優先
 * - 記事 category=today-doko   → place=outdoor プラン優先
 * - 記事 category=today-nani   → kind=activity プラン優先
 * - 記事 category=today-mawasu → kind=activity & place=home プラン優先
 * - quickInfo.ageRanges の重なりで加点
 * - エリア互換で加点（記事 area=all なら area 制約は弱め）
 * - タイトル/lede のキーワード一致で加点
 */
export function getRelatedPlansForArticle(
  article: FileArticleMeta,
  options?: { limit?: number },
): PlanMeta[] {
  const limit = options?.limit ?? 3;
  const all = getAllPlanMetas();

  const cat = article.category;
  const wantsMeal = cat === 'today-taberu';
  const wantsOutdoor = cat === 'today-doko';
  const wantsHome = cat === 'today-mawasu' || cat === 'heijitsu-yoru';
  const wantsActivity = cat === 'today-nani' || cat === 'today-mawasu' || cat === 'narai';

  const articleText = `${article.title} ${article.metaDescription ?? ''} ${article.lede ?? ''}`;
  const articleAges = article.quickInfo?.ageRanges ?? [];

  const scored = all.map((p) => {
    let score = 0;

    // kind ボーナス
    if (wantsMeal) {
      if (p.kind === 'meal') score += 25;
      else score -= 5;
    } else if (wantsActivity || wantsOutdoor || wantsHome) {
      if (p.kind === 'activity') score += 12;
      else score -= 4; // 食事カテゴリ以外なのに meal は基本弱め
    }

    // place ボーナス
    if (wantsOutdoor && p.place.includes('outdoor')) score += 18;
    if (wantsHome && p.place.includes('home')) score += 14;

    // 年齢重複
    if (articleAges.length > 0 && p.ageRanges.length > 0) {
      const overlap = p.ageRanges.filter((r) => (articleAges as string[]).includes(r)).length;
      if (overlap > 0) score += 8 * overlap;
    }

    // エリア互換
    if (areaCompatible(article.area, p.area)) {
      score += (article.area && article.area !== 'all' && p.area !== 'all') ? 10 : 3;
    } else {
      score -= 20;
    }

    // キーワード一致
    const planText = `${p.title} ${p.shortAnswer}`;
    score += keywordOverlap(articleText, planText) * 4;

    // 予算近接
    if (article.quickInfo?.budget) {
      const rank: Record<string, number> = { free: 0, low: 1, mid: 2, high: 3 };
      const diff = Math.abs(
        (rank[article.quickInfo.budget] ?? 3) - (rank[p.budget] ?? 3),
      );
      if (diff === 0) score += 3;
      else if (diff === 1) score += 1;
    }

    return { plan: p, score };
  });

  const positives = scored
    .filter((x) => x.score > 0)
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      // 同点は短答が短い（=明快な）プランを優先
      return x.plan.shortAnswer.length - y.plan.shortAnswer.length;
    })
    .map((x) => x.plan);

  return positives.slice(0, limit);
}
