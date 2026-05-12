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
import { pickHeroForText } from './hero-photos';
import HERO_MANIFEST from './hero-manifest.json';

const PLANS_DIR = path.join(process.cwd(), 'content', 'plans');

export type PlanDay = 'any' | 'weekday' | 'holiday';
export type PlanKind = 'activity' | 'meal';
export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Finder のモード。UI のタブ単位で、出力する Plan の kind と入力フォーカスを切り替える。
 * - 'go'   : 外出スポット中心（place=outside で activity プラン）
 * - 'do'   : 何して遊ぶか（家・外問わず activity プラン）
 * - 'eat'  : 何を食べる（meal プラン）
 * - 'home' : 家でどう過ごす（place=home で activity プラン）
 */
export type FinderMode = 'go' | 'do' | 'eat' | 'home';

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
  hero?: string;
  /** 'activity' は遊び・おでかけ系（既存）。'meal' は食事提案。frontmatter で指定なければ activity。 */
  kind: PlanKind;
  /** kind='meal' のとき朝/昼/夜/おやつ のどれか。 */
  mealTime?: MealTime[];
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

  const mealTime = Array.isArray(d.mealTime)
    ? d.mealTime.filter((x): x is string => typeof x === 'string')
    : undefined;

  // hero の自動マッチング（v5: build-time manifest 経由）:
  //   1. hero-manifest.json に登録されたプラン固有AIイラスト → 最優先
  //   2. frontmatter 明示指定の /hero/<cat>-NN.png → /hero-ai/cat-<cat>-NN.webp にマップ
  //   3. 未指定 / 汎用 home-cozy → title+shortAnswer からAIカテゴリ画像を自動マッチ
  //
  // 旧 /photos/<id>.webp（Pexels実写）は v3 までは最優先だったが、
  // サイト全体の「温かみあるイラスト風」世界観統一のため v4 で廃止。
  // v5 で fs.existsSync を廃止し、build-time manifest 経由に統一
  // → Vercel File Tracing が public/ を巻き込まなくなり Function サイズが激減。
  const planId = typeof d.id === 'string' ? d.id : fallbackId;

  let matchedHero: string;
  const fromManifest = (HERO_MANIFEST.planHero as Record<string, string>)[planId];
  if (fromManifest) {
    // build-time に生成したプラン固有AIイラスト
    matchedHero = fromManifest;
  } else {
    const explicitHero = typeof d.hero === 'string' ? d.hero : undefined;
    const isFallbackHero =
      !explicitHero || /\/hero\/home-cozy-/.test(explicitHero);
    if (isFallbackHero) {
      // 未指定 or 汎用 home-cozy → タイトル+短答からAIカテゴリ画像を自動マッチ
      matchedHero = pickHeroForText(`${d.title} ${d.shortAnswer}`, planId);
    } else {
      // 明示指定の /hero/<cat>-NN.<ext> → 新AI画像 /hero-ai/cat-<cat>-NN.webp にマップ
      const aiMatch = explicitHero!.match(/^\/hero\/([a-z-]+)-(\d{2})\.(png|webp|jpg|jpeg)$/i);
      if (aiMatch) {
        matchedHero = `/hero-ai/cat-${aiMatch[1]}-${aiMatch[2]}.webp`;
      } else if (explicitHero!.startsWith('/photos/')) {
        // 旧Pexels実写指定は無視してAIカテゴリにフォールバック
        matchedHero = pickHeroForText(`${d.title} ${d.shortAnswer}`, planId);
      } else {
        matchedHero = explicitHero!;
        if (matchedHero?.endsWith('.png')) {
          matchedHero = matchedHero.replace(/\.png$/, '.webp');
        }
      }
    }
  }

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
    hero: matchedHero,
    kind: (d.kind === 'meal' ? 'meal' : 'activity') as PlanKind,
    mealTime: mealTime ? (mealTime as MealTime[]) : undefined,
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
  /**
   * Finder モード。'eat' のときは meal プラン、それ以外は activity プランを優先。
   * 未指定なら全 kind から選ぶ（後方互換）。
   */
  mode?: FinderMode;
  /** 'eat' モード時の食事帯。breakfast/lunch/dinner/snack。 */
  mealTime?: MealTime;
  /**
   * 時刻ヒント。0-23 の時。指定があると朝/昼/夕/夜に応じて
   * meal の mealTime や activity の継続時間に小さなブーストを与える。
   * 未指定なら時刻による補正なし。
   */
  hourHint?: number;
};

/**
 * 年齢の近接マップ。指定年齢に完全一致しない場合の「一段階広げる」フォールバック用。
 * 例: q.age='2-3' に対し plan.ages=['0-1'] or ['4-6'] は隣接として小さく許容する。
 * これにより「1-2」のような周辺記法も拾える（content/plans/ の m-* に '1-2' あり）。
 */
const AGE_NEIGHBORS: Record<string, string[]> = {
  '0-1': ['1-2'],
  '1-2': ['0-1', '2-3'],
  '2-3': ['1-2', '4-6'],
  '4-6': ['2-3'],
};

export type PlanMatch = {
  plan: PlanMeta;
  score: number;
  reasons: string[];
};

function scorePlan(p: PlanMeta, q: PlanQuery): PlanMatch {
  let score = 0;
  const reasons: string[] = [];

  // Finder モードによる kind フィルタ（最優先・不一致は強い減点で弾く）
  // - 'eat' モード: meal プランのみ。activity が混ざると邪魔。
  // - 'go'/'do'/'home' モード: activity プランのみ。meal は別タブで扱う。
  // - mode 未指定（後方互換）: kind で絞らない
  if (q.mode) {
    if (q.mode === 'eat') {
      if (p.kind !== 'meal') return { plan: p, score: -1000, reasons: [] };
    } else {
      if (p.kind === 'meal') return { plan: p, score: -1000, reasons: [] };
    }
  }

  // mealTime 一致（'eat' モード時、朝/昼/夜/おやつのどれかが指定されたら強く加点）
  if (q.mode === 'eat' && q.mealTime && p.mealTime?.includes(q.mealTime)) {
    score += 30;
    const labels: Record<MealTime, string> = {
      breakfast: '朝食',
      lunch: '昼食',
      dinner: '夕食',
      snack: 'おやつ',
    };
    reasons.push(labels[q.mealTime]);
  }

  // 'go' モード時は外出系を強く優遇（home プランは弾く）
  if (q.mode === 'go') {
    if (p.place.includes('home' as PlaceType) && !p.place.includes('outdoor' as PlaceType) && !p.place.includes('indoor' as PlaceType)) {
      return { plan: p, score: -1000, reasons: [] };
    }
  }
  // 'home' モード時は家プランを強く優遇（outdoor のみは弾く）
  if (q.mode === 'home') {
    if (p.place.includes('outdoor' as PlaceType) && !p.place.includes('home' as PlaceType) && !p.place.includes('indoor' as PlaceType)) {
      return { plan: p, score: -1000, reasons: [] };
    }
  }

  // 年齢（コア条件：不一致は -100 で弾く。ただし隣接年齢は弱く許容）
  if (q.age) {
    if (p.ageRanges.includes(q.age as AgeRange)) {
      score += 20;
      reasons.push(`${q.age}歳向け`);
    } else {
      const neighbors = AGE_NEIGHBORS[q.age] ?? [];
      const hitNeighbor = neighbors.some((n) => (p.ageRanges as string[]).includes(n));
      if (hitNeighbor) {
        // 隣接年齢は弱マッチ（強くは推さないが排除はしない）
        score += 4;
        reasons.push(`${q.age}歳前後にも`);
      } else {
        score -= 100;
      }
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

  // 時間（exact match を優先、近接度で重みづけ）
  if (q.duration) {
    const userMin = Number(q.duration);
    if (Number.isFinite(userMin)) {
      if (p.durationMin === userMin) {
        score += 15;
        reasons.push(`${p.durationMin}分ちょうど`);
      } else if (p.durationMin <= userMin && p.durationMin >= userMin * 0.7) {
        // 使える時間の70-100%をカバー（ほぼピッタリ）
        score += 10;
        reasons.push(`${p.durationMin}分で完結`);
      } else if (p.durationMin <= userMin * 0.4) {
        // 大幅に短い（4時間空いてるのに15分は物足りない）
        score += 2;
      } else if (p.durationMin <= userMin) {
        score += 5;
      } else if (p.durationMin <= userMin * 1.5) {
        score += 1;
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

  // SNSトレンド一致ボーナス（2026年5月時点のIG調査ベース）
  // 「無料」「予約不要」「鬼リピ」「コスパ」「秒で完食」「鉄板」「失敗しない」
  // 等のキーワードが title/shortAnswer に含まれるプランを優遇。
  if (isTrendingPlan(p)) {
    score += 5;
    reasons.push('いま人気');
  }

  // 時刻ヒント — 朝/昼/夕/夜に応じて mealTime や duration を弱補正。
  // 強く効かせると検索意図を上書きしてしまうので、+1〜+3 程度の薄い加点に留める。
  if (typeof q.hourHint === 'number' && Number.isFinite(q.hourHint)) {
    const h = q.hourHint;
    const slot: MealTime | null =
      h >= 5 && h < 10 ? 'breakfast' :
      h >= 10 && h < 14 ? 'lunch' :
      h >= 14 && h < 17 ? 'snack' :
      h >= 17 && h < 21 ? 'dinner' :
      null;
    if (slot && p.kind === 'meal' && p.mealTime?.includes(slot)) {
      score += 3;
      // ラベルは重複を避けるため reasons に追加しない
    }
    // 夜（21時以降）は短時間の家プラン寄りに微調整
    if ((h >= 21 || h < 5) && p.kind === 'activity' && p.place.includes('home' as PlaceType) && p.durationMin <= 30) {
      score += 2;
    }
  }

  return { plan: p, score, reasons };
}

/**
 * Plan の title / shortAnswer に SNSトレンド語が含まれているかを判定。
 * これがトレンドスコアの源泉になる（ハードコードのキュレーション）。
 */
const TREND_KEYWORDS = [
  '無料', '予約不要', '鬼リピ', 'コスパ', '秒で', '鉄板', '失敗しない',
  '保存版', '0円', '5分', '10分', '15分', '神', '実は', 'ガチで',
  '家にあるもの', '冷凍', '時短',
];

export function isTrendingPlan(p: PlanMeta): boolean {
  const text = `${p.title}${p.shortAnswer}`;
  return TREND_KEYWORDS.some((kw) => text.includes(kw));
}

/**
 * プランから「今日の答え」を1つ返す。
 * - 完全一致優先（年齢/場所/天気 の全てが合致）
 * - 同スコアは shortAnswer 長さの短い方を優先（簡潔さ）
 * - 一致が見つからなければ条件を段階的に緩めて再試行する
 *   ① そのまま → ② weather='any' に緩和 → ③ area='all' に緩和 → ④ 両方緩和
 *
 * 緩和フォールバックで採用された場合も結果は `PlanMatch` を返す。
 * 呼び出し側で「条件を緩めました」表示をしたい場合は reasons 末尾に
 * 「条件を一部緩和」が入るのでそれをトリガーに使う。
 */
export function pickTopPlan(q: PlanQuery): PlanMatch | null {
  const tryQuery = (qq: PlanQuery, relaxedNote?: string): PlanMatch | null => {
    const scored = getAllPlanMetas()
      .map((p) => scorePlan(p, qq))
      .filter((m) => m.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.plan.shortAnswer.length - b.plan.shortAnswer.length;
      });
    const top = scored[0];
    if (!top) return null;
    if (relaxedNote) top.reasons.push(relaxedNote);
    return top;
  };

  // ① そのまま
  const r1 = tryQuery(q);
  if (r1) return r1;

  // ② 天気を 'any' に緩和（雨でも家でできる遊びはそんなに天気依存しない）
  if (q.weather && q.weather !== 'any') {
    const r2 = tryQuery({ ...q, weather: 'any' }, '天気条件を緩和');
    if (r2) return r2;
  }

  // ③ エリアを 'all' に緩和（家プランは元から all なので主に外出系の救済）
  if (q.area && q.area !== 'all') {
    const r3 = tryQuery({ ...q, area: 'all' }, 'エリアを全国に拡大');
    if (r3) return r3;
  }

  // ④ 天気＋エリア両方緩和
  if ((q.weather && q.weather !== 'any') || (q.area && q.area !== 'all')) {
    const r4 = tryQuery({ ...q, weather: 'any', area: 'all' }, '天気・エリアを緩和');
    if (r4) return r4;
  }

  return null;
}

/**
 * 「家で過ごす1日」モード用：朝食・午前活動・昼食・午後活動・おやつ・夕食 を時刻つきで返す。
 * 各 mealTime / 場面ごとに条件に合うプランを1つずつピック。
 */
export type DayPlanSlot = {
  /** 表示名："朝食" "午前の遊び" など */
  label: string;
  /** タイムライン上の時刻表示："7:30" "10:00" など */
  time: string;
  /** 該当プラン（なければ null） */
  plan: PlanMeta | null;
  /** スロットに紐づくアイコン */
  icon: string;
};

export function buildDayPlan(q: PlanQuery): DayPlanSlot[] {
  const age = q.age;
  // 共通条件：家中心、平日／休日は q.day を尊重
  const baseQuery = (overrides: Partial<PlanQuery>): PlanQuery => ({
    age,
    place: 'home',
    weather: q.weather,
    day: q.day,
    ...overrides,
  });

  const pickFor = (filter: (p: PlanMeta) => boolean, q2: PlanQuery): PlanMeta | null => {
    const scored = getAllPlanMetas()
      .filter(filter)
      .map((p) => scorePlan(p, q2))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored[0]?.plan ?? null;
  };

  return [
    {
      label: '朝食',
      time: '7:30',
      icon: '🌅',
      plan: pickFor(
        (p) => p.kind === 'meal' && p.mealTime?.includes('breakfast') === true,
        baseQuery({ mode: 'eat', mealTime: 'breakfast' as MealTime, duration: '15' }),
      ),
    },
    {
      label: '午前の遊び',
      time: '10:00',
      icon: '🎨',
      plan: pickFor(
        (p) => p.kind === 'activity' && p.place.includes('home' as PlaceType),
        baseQuery({ mode: 'home', duration: '60' }),
      ),
    },
    {
      label: '昼食',
      time: '12:00',
      icon: '🍙',
      plan: pickFor(
        (p) => p.kind === 'meal' && p.mealTime?.includes('lunch') === true,
        baseQuery({ mode: 'eat', mealTime: 'lunch' as MealTime, duration: '15' }),
      ),
    },
    {
      label: '午後の遊び',
      time: '15:00',
      icon: '📚',
      plan: pickFor(
        (p) => p.kind === 'activity' && p.place.includes('home' as PlaceType),
        baseQuery({ mode: 'home', duration: '60' }),
      ),
    },
    {
      label: 'おやつ',
      time: '15:30',
      icon: '🍰',
      plan: pickFor(
        (p) => p.kind === 'meal' && p.mealTime?.includes('snack') === true,
        baseQuery({ mode: 'eat', mealTime: 'snack' as MealTime, duration: '15' }),
      ),
    },
    {
      label: '夕食',
      time: '18:00',
      icon: '🌙',
      plan: pickFor(
        (p) => p.kind === 'meal' && p.mealTime?.includes('dinner') === true,
        baseQuery({ mode: 'eat', mealTime: 'dinner' as MealTime, duration: '15' }),
      ),
    },
  ];
}

/**
 * 「別の候補」を返す。スコア順そのままだと類似プランが並びやすいため、
 * できるだけ「ジャンルの違う」プランを混ぜる多様性フィルタを掛ける。
 *
 * 多様性の軸：
 *   - place（home / indoor / outdoor）が違う
 *   - durationMin の区分（≤15 / 16-60 / 61-120 / 121+）が違う
 *   - budget が違う
 * 上記いずれかが既選プランと異なれば「別ジャンル」として優先採用する。
 */
export function getAlternativePlans(q: PlanQuery, excludeId: string, limit = 2): PlanMatch[] {
  const all = getAllPlanMetas()
    .map((p) => scorePlan(p, q))
    .filter((m) => m.score > 0 && m.plan.id !== excludeId)
    .sort((a, b) => b.score - a.score);

  if (all.length <= limit) return all.slice(0, limit);

  // duration bucket
  const dbucket = (n: number): string => (n <= 15 ? 'xs' : n <= 60 ? 's' : n <= 120 ? 'm' : 'l');
  const placeKey = (m: PlanMatch): string => m.plan.place.slice().sort().join(',');

  const picked: PlanMatch[] = [];
  const seen = new Set<string>();

  // 1st: highest scoring
  picked.push(all[0]);
  seen.add(`${placeKey(all[0])}|${dbucket(all[0].plan.durationMin)}|${all[0].plan.budget}`);

  // 2nd〜: 多様性のあるものを優先。同じシグネチャはスキップ。
  for (const m of all.slice(1)) {
    if (picked.length >= limit) break;
    const sig = `${placeKey(m)}|${dbucket(m.plan.durationMin)}|${m.plan.budget}`;
    if (seen.has(sig)) continue;
    picked.push(m);
    seen.add(sig);
  }

  // 多様性で足りなければスコア順で補充
  if (picked.length < limit) {
    for (const m of all.slice(1)) {
      if (picked.length >= limit) break;
      if (picked.some((p) => p.plan.id === m.plan.id)) continue;
      picked.push(m);
    }
  }

  return picked.slice(0, limit);
}
