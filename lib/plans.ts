/**
 * Plan コンテンツ系統。
 *
 * 役割: 既存の SEO記事（content/articles/）が「まとめ」「ランキング」「ガイド」型で
 *       オーガニック流入目的のコンテンツであるのに対し、Plan は
 *       「今日これをする」という行動単位の具体プランを返す用の別系統。
 *
 * TodayFinder から条件が入力されると、getTodayAnswer(query) は
 *   1) Plan から完全一致（年齢/天気/家外/時間/予算/エリア）
 *   2) Plan の近傍一致（コア条件のみ合致）
 *   3) それもなければ既存記事フォールバック
 * という優先順位で「今日の答えを1つ」を選ぶ。
 *
 * Plan ファイル形式（content/plans/*.md）:
 *   frontmatter:
 *     id: 一意スラグ (例: p-home-rain-2-3-15m-free-01)
 *     title: プラン名
 *     shortAnswer: 1文の要約（「家にある紙コップ10個とスマホで15分集中遊び」等）
 *     ageRanges: ["2-3"]
 *     weather: ["rain", "cold"]
 *     place: ["home"]
 *     day: ["any"] | ["weekday"] | ["holiday"]
 *     durationMin: 15
 *     budget: "free"
 *     area: "all" | "tokyo" ...
 *     seoRelated: "chiiku-asobi-ie-de-10"  # 任意、記事slugを参照
 *   本文: マークダウン（What to do / タイムライン / 必要なもの / つまずき対処）
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { AgeRange, Budget, PlaceType, Weather } from './types';

const PLANS_DIR = path.join(process.cwd(), 'content', 'plans');

export type PlanDay = 'any' | 'weekday' | 'holiday';

export type PlanMeta = {
  id: string;
  title: string;
  shortAnswer: string;
  ageRanges: AgeRange[];
  weather: Weather[];
  place: PlaceType[];
  day: PlanDay[];
  durationMin: number;
  budget: Budget;
  area: string;
  seoRelated?: string;
};

export type Plan = PlanMeta & {
  body: string; // Markdown
};

// ------------------------------------------------------------
// 読み込み
// ------------------------------------------------------------

function readPlansDir(): string[] {
  if (!fs.existsSync(PLANS_DIR)) return [];
  return fs.readdirSync(PLANS_DIR).filter((f) => f.endsWith('.md'));
}

function parsePlan(raw: string, fallbackId: string): { meta: PlanMeta; body: string } | null {
  const { data, content } = matter(raw);
  const d = data as Record<string, unknown>;

  if (typeof d.title !== 'string' || typeof d.shortAnswer !== 'string') return null;

  const ageRanges = Array.isArray(d.ageRanges)
    ? d.ageRanges.filter((x): x is string => typeof x === 'string')
    : [];
  const weather = Array.isArray(d.weather)
    ? d.weather.filter((x): x is string => typeof x === 'string')
    : [];
  const place = Array.isArray(d.place)
    ? d.place.filter((x): x is string => typeof x === 'string')
    : [];
  const day = Array.isArray(d.day)
    ? d.day.filter((x): x is string => typeof x === 'string')
    : ['any'];

  const meta: PlanMeta = {
    id: typeof d.id === 'string' ? d.id : fallbackId,
    title: d.title,
    shortAnswer: d.shortAnswer,
    ageRanges: ageRanges as AgeRange[],
    weather: weather as Weather[],
    place: place as PlaceType[],
    day: day as PlanDay[],
    durationMin: typeof d.durationMin === 'number' ? d.durationMin : 30,
    budget: (typeof d.budget === 'string' ? d.budget : 'free') as Budget,
    area: typeof d.area === 'string' ? d.area : 'all',
    seoRelated: typeof d.seoRelated === 'string' ? d.seoRelated : undefined,
  };

  return { meta, body: content };
}

/** 全プランのメタ情報。本文は含まない（軽量）。 */
export function getAllPlanMetas(): PlanMeta[] {
  const files = readPlansDir();
  const metas: PlanMeta[] = [];
  for (const f of files) {
    const raw = fs.readFileSync(path.join(PLANS_DIR, f), 'utf8');
    const parsed = parsePlan(raw, f.replace(/\.md$/, ''));
    if (parsed) metas.push(parsed.meta);
  }
  return metas;
}

/** 指定 id のプラン。本文含む。 */
export function getPlan(id: string): Plan | null {
  const files = readPlansDir();
  for (const f of files) {
    const raw = fs.readFileSync(path.join(PLANS_DIR, f), 'utf8');
    const parsed = parsePlan(raw, f.replace(/\.md$/, ''));
    if (parsed && parsed.meta.id === id) {
      return { ...parsed.meta, body: parsed.body };
    }
  }
  return null;
}

export function getAllPlanIds(): string[] {
  return getAllPlanMetas().map((m) => m.id);
}

// ------------------------------------------------------------
// スコアリング — 「答えを1つに決める」の決定ロジック
// ------------------------------------------------------------

const BLOCK_MEMBERS: Record<string, string[]> = {
  'hokkaido-tohoku': ['hokkaido', 'aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima'],
  'kanto': ['ibaraki', 'tochigi', 'gunma', 'saitama', 'chiba', 'tokyo', 'kanagawa'],
  'chubu': ['niigata', 'toyama', 'ishikawa', 'fukui', 'yamanashi', 'nagano', 'gifu', 'shizuoka', 'aichi'],
  'kansai': ['mie', 'shiga', 'kyoto', 'osaka', 'hyogo', 'nara', 'wakayama'],
  'chugoku-shikoku': ['tottori', 'shimane', 'okayama', 'hiroshima', 'yamaguchi', 'tokushima', 'kagawa', 'ehime', 'kochi'],
  'kyushu-okinawa': ['fukuoka', 'saga', 'nagasaki', 'kumamoto', 'oita', 'miyazaki', 'kagoshima', 'okinawa'],
};

function areaMatch(planArea: string | undefined, userArea: string | undefined): 'exact' | 'block' | 'any' | 'none' {
  const pa = planArea ?? 'all';
  const ua = userArea ?? 'all';
  if (pa === 'all' || ua === 'all') return 'any';
  if (pa === ua) return 'exact';
  if (BLOCK_MEMBERS[pa]?.includes(ua)) return 'block';
  if (BLOCK_MEMBERS[ua]?.includes(pa)) return 'block';
  return 'none';
}

export type PlanQuery = {
  age?: string;
  weather?: string;
  place?: string;
  day?: string;
  duration?: string;
  budget?: string;
  area?: string;
};

export type PlanMatch = {
  plan: PlanMeta;
  score: number;
  reasons: string[];
};

function scorePlan(p: PlanMeta, q: PlanQuery): PlanMatch {
  let score = 0;
  const reasons: string[] = [];

  // 年齢（コア条件：不一致は -100 で弾く）
  if (q.age) {
    if (p.ageRanges.includes(q.age as AgeRange)) {
      score += 20;
      reasons.push(`${q.age}歳向け`);
    } else {
      score -= 100;
    }
  }

  // 家/外（コア条件：不一致は -80）
  if (q.place && q.place !== 'any') {
    const want = q.place === 'outside' ? 'outdoor' : q.place; // finder の 'outside' → 'outdoor'
    if (p.place.includes(want as PlaceType)) {
      score += 15;
      reasons.push(q.place === 'home' ? '家でできる' : '外に出かける');
    } else if (want === 'outdoor' && p.place.includes('indoor' as PlaceType)) {
      score += 8; // outside を求めた時の indoor 許容
      reasons.push('屋内スポット');
    } else {
      score -= 80;
    }
  }

  // 天気（コア条件）
  if (q.weather && q.weather !== 'any') {
    if (p.weather.includes(q.weather as Weather)) {
      const labels: Record<string, string> = { rain: '雨でもOK', heat: '猛暑日OK', cold: '寒い日OK', sunny: '晴れ向き' };
      score += 12;
      reasons.push(labels[q.weather] ?? q.weather);
    } else if (p.weather.includes('any' as Weather)) {
      score += 3;
    } else {
      score -= 15;
    }
  }

  // 時間（記事と同じく <= OK）
  if (q.duration) {
    const userMin = Number(q.duration);
    if (Number.isFinite(userMin)) {
      if (p.durationMin <= userMin) {
        score += 10;
        reasons.push(`${p.durationMin}分で完結`);
      } else if (p.durationMin <= userMin * 1.5) {
        score += 3;
      } else {
        score -= 20;
      }
    }
  }

  // 予算
  if (q.budget && q.budget !== 'any') {
    const rank: Record<string, number> = { free: 0, low: 1, mid: 2, high: 3 };
    const u = rank[q.budget] ?? 3;
    const pr = rank[p.budget] ?? 3;
    if (pr <= u) {
      const labels: Record<string, string> = { free: '無料', low: '〜2,000円', mid: '〜5,000円', high: '5,000円〜' };
      score += 6;
      reasons.push(labels[p.budget] ?? p.budget);
    } else {
      score -= 10;
    }
  }

  // 平日/休日
  if (q.day && q.day !== 'any') {
    if (p.day.includes(q.day as PlanDay) || p.day.includes('any')) {
      score += 4;
      reasons.push(q.day === 'weekday' ? '平日向き' : '休日向き');
    }
  }

  // エリア（外出系のみ効く。家プランは area: all が基本）
  if (q.area && q.area !== 'all') {
    const m = areaMatch(p.area, q.area);
    if (m === 'exact') { score += 25; reasons.push('エリア一致'); }
    else if (m === 'block') { score += 10; reasons.push('エリア近接'); }
    else if (m === 'any') { score += 1; /* area:all は全員通す */ }
    else { score -= 60; }
  }

  return { plan: p, score, reasons };
}

/**
 * プランから「今日の答え」を1つ返す。
 * - 完全一致優先（年齢/場所/天気 の全てが合致）
 * - 同スコアは shortAnswer 長さの短い方を優先（簡潔さ）
 * - 見つからなければ null
 */
export function pickTopPlan(q: PlanQuery): PlanMatch | null {
  const scored = getAllPlanMetas()
    .map((p) => scorePlan(p, q))
    .filter((m) => m.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.plan.shortAnswer.length - b.plan.shortAnswer.length;
    });

  return scored[0] ?? null;
}

/**
 * 現在の上位3プランを返す（別の候補表示用・最大2件に絞って呼び出し側で使う）。
 */
export function getAlternativePlans(q: PlanQuery, excludeId: string, limit = 2): PlanMatch[] {
  return getAllPlanMetas()
    .map((p) => scorePlan(p, q))
    .filter((m) => m.score > 0 && m.plan.id !== excludeId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
