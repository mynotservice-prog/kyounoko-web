/**
 * 「今日の流れ（おでかけ1日プラン）」生成エンジン。
 *
 * 役割: 既存 buildDayPlan（lib/plans.ts）が「おうちで1日」版（朝食→午前遊び(home)→…）
 *       なのに対し、こちらは「外に出る1日」版を返す:
 *         午前 あそぶ(spot) → お昼 たべる(子連れOKレストラン) → 午後 軽め(spot or おうちplan)
 *
 * 最重要要件: 移動が現実的であること（行くスポットとランチが遠いプランは出さない）。
 *   駅をアンカーに固定し、近さを段階判定する（強い順）:
 *     1) 同じ最寄り駅(nearestStation) … 徒歩圏。walkMinutes で移動を明示
 *     2) 同じ区(ward) … 区内移動。「○○区内」と明示
 *     3) 東京広域(SPOTS.tokyo) … 「△△へ移動」と隠さず明示（最終フォールバック）
 *
 * カバレッジ保証: 東京23区のどの駅でも必ず3スロット埋まる。
 *   - 午前 spot: 同駅→同区→広域 のカスケードで必ず1件（都内spot 70件超）
 *   - お昼   : 区内レストラン→全国チェーン(ward:'複数') で必ず1件
 *   - 午後   : 別spot→おうちミニプラン(531本) で必ず1件
 */

import {
  getStationBySlug,
  WARD_NAMES,
  type TokyoWard,
} from './tokyo-stations';
import {
  SPOTS,
  TOKYO_RESTAURANTS,
  getSpotsByNearestStation,
  getSpotsForWard,
  spotToSlug,
  type Spot,
  type AgeTag,
} from './spots';
import { pickTopPlan, type PlanMeta } from './plans';
import type { Weather } from './types';

export type OutingSlotKey = 'morning' | 'lunch' | 'afternoon';

/** 近さ／フォールバックの段階。UIで正直に出す。 */
export type CoherenceTier = 'station' | 'ward' | 'wide' | 'chain' | 'home';

export type OutingMove = {
  /** 「池袋駅から徒歩8分」「豊島区内」「おうちへ（休憩）」等 */
  text: string;
  minutes?: number;
  tier: CoherenceTier;
};

export type OutingSlot = {
  key: OutingSlotKey;
  /** 「午前 あそぶ」等 */
  label: string;
  /** タイムライン時刻 */
  time: string;
  /** 絵文字アイコン */
  icon: string;
  kind: 'spot' | 'restaurant' | 'homeplan';
  spot?: Spot;
  /** /spot/[slug] へのリンク用 */
  spotSlug?: string;
  plan?: PlanMeta;
  /** お昼スロットの子連れ設備（ベビーチェア等） */
  facets?: string[];
  /** 前スロットからの移動表示 */
  move?: OutingMove;
  tier: CoherenceTier;
};

export type OutingQuery = {
  /** 東京23区の駅slug（最優先アンカー） */
  stationSlug?: string;
  /** 駅が無いとき区だけでも可 */
  ward?: TokyoWard;
  age?: AgeTag;
  weather?: Weather;
  budget?: 'free' | 'low' | 'mid' | 'high';
  /** 「別の候補に変える」用。各スロットで採用候補をずらす（同じ近さの中で別の店/施設に）。 */
  morningVariant?: number;
  lunchVariant?: number;
  afternoonVariant?: number;
};

export type OutingPlan = {
  anchor: {
    stationSlug?: string;
    stationName?: string;
    ward: TokyoWard;
    wardName: string;
    scale?: string;
  };
  slots: OutingSlot[];
  /** 全体の質: ideal=午前が同駅 / ward=同区 / mixed=広域フォールバック含む */
  coverage: 'ideal' | 'ward' | 'mixed';
};

const NON_RESTAURANT = (s: Spot) => s.category !== 'restaurant';

function ageOk(s: Spot, age?: AgeTag): boolean {
  if (!age) return true;
  return s.ages.includes(age);
}

/** 雨/猛暑/寒い日は屋外スポットを避ける（屋内・mixedを優先）。 */
function weatherOk(s: Spot, weather?: Weather): boolean {
  if (!weather || weather === 'sunny' || weather === 'any') return true;
  // rain / heat / cold → 屋外は不可（屋内/mixedのみ）
  return s.place !== 'outdoor';
}

function popularFirst(a: Spot, b: Spot): number {
  if (a.popular && !b.popular) return -1;
  if (!a.popular && b.popular) return 1;
  return a.name.localeCompare(b.name, 'ja');
}

function pickByPopular(list: Spot[]): Spot | undefined {
  return [...list].sort(popularFirst)[0];
}

/**
 * 午前/午後の遊び場を、近さカスケードで1件選ぶ。
 * weather フィルタはまず厳格適用→0件なら緩める（必ず埋めるため）。
 */
function pickSpotCascade(
  stationSlug: string | undefined,
  wardName: string,
  q: OutingQuery,
  exclude: Set<string>,
  variant = 0,
): { spot: Spot; tier: CoherenceTier; walkMinutes?: number } | null {
  const filt = (list: Spot[], strictWeather: boolean) =>
    list.filter(
      (s) =>
        NON_RESTAURANT(s) &&
        ageOk(s, q.age) &&
        (!strictWeather || weatherOk(s, q.weather)) &&
        !exclude.has(s.name),
    );
  // 同じ近さ階層の候補リストから variant 番目を選ぶ（「別の候補」用）。
  const at = (list: Spot[]) => list[((variant % list.length) + list.length) % list.length];

  // 1) 同じ駅（徒歩圏）
  if (stationSlug) {
    const atStation = getSpotsByNearestStation(stationSlug, { limit: 24 });
    for (const strict of [true, false]) {
      const cand = filt(atStation, strict).sort(
        (a, b) => (a.walkMinutes ?? 99) - (b.walkMinutes ?? 99),
      );
      if (cand.length) {
        const top = at(cand);
        return { spot: top, tier: 'station', walkMinutes: top.walkMinutes };
      }
    }
  }

  // 2) 同じ区（区内移動）
  const wardSpots = getSpotsForWard(wardName);
  for (const strict of [true, false]) {
    const cand = filt(wardSpots, strict).sort(popularFirst);
    if (cand.length) return { spot: at(cand), tier: 'ward' };
  }

  // 3) 東京広域（最終フォールバック）
  const tokyo = SPOTS.tokyo ?? [];
  for (const strict of [true, false]) {
    const cand = filt(tokyo, strict).sort(popularFirst);
    if (cand.length) return { spot: at(cand), tier: 'wide' };
  }

  return null;
}

function facetsOf(s: Spot): string[] {
  const f: string[] = [];
  if (s.babyChair) f.push('ベビーチェア');
  if (s.kidsMenu) f.push('キッズメニュー');
  if (s.strollerAccess) f.push('ベビーカーOK');
  if (s.babyFood) f.push('離乳食OK');
  return f;
}

/**
 * お昼の子連れOKレストランを1件。区内→全国チェーン の順。
 * レストランは駅紐付けが無いので「区内」が最良の近さ。チェーンはどの駅でも可。
 */
/** お昼候補をスコア順（ファセット数優先）で並べて返す。?slot=lunch のリスト表示にも使う。 */
export function lunchCandidates(
  wardName: string,
  q: { age?: AgeTag; budget?: 'free' | 'low' | 'mid' | 'high' },
): { ward: Spot[]; chain: Spot[] } {
  const budgetOk = (s: Spot) => {
    if (!q.budget || !s.budget) return true;
    const order = { free: 0, low: 1, mid: 2, high: 3 } as const;
    return order[s.budget] <= order[q.budget];
  };
  const isRest = (s: Spot) => s.category === 'restaurant' && ageOk(s, q.age) && budgetOk(s);
  const byFacets = (a: Spot, b: Spot) => facetsOf(b).length - facetsOf(a).length;
  const ward = getSpotsForWard(wardName).filter(isRest).sort(byFacets);
  const chain = TOKYO_RESTAURANTS.filter(isRest).sort(byFacets);
  return { ward, chain };
}

function pickLunch(
  wardName: string,
  q: OutingQuery,
  variant = 0,
): { spot: Spot; tier: CoherenceTier } | null {
  const { ward, chain } = lunchCandidates(wardName, q);
  const at = (list: Spot[]) => list[((variant % list.length) + list.length) % list.length];
  if (ward.length) return { spot: at(ward), tier: 'ward' };
  if (chain.length) return { spot: at(chain), tier: 'chain' };
  return null;
}

/** 午後のおうちミニプラン（休憩・お昼寝考慮）。 */
function pickHomePlan(q: OutingQuery): PlanMeta | null {
  const m = pickTopPlan({
    age: q.age,
    place: 'home',
    mode: 'home',
    duration: '60',
    weather: q.weather,
  });
  return m?.plan ?? null;
}

function moveTextForSpot(
  tier: CoherenceTier,
  stationName: string | undefined,
  wardName: string,
  spot: Spot,
  walkMinutes?: number,
): OutingMove {
  if (tier === 'station') {
    const m = walkMinutes ?? undefined;
    return {
      text: stationName ? `${stationName}駅から徒歩${m ?? '数'}分` : `徒歩${m ?? '数'}分`,
      minutes: m,
      tier,
    };
  }
  if (tier === 'ward') return { text: `${wardName}内`, tier };
  // wide
  return { text: `${spot.ward || spot.city || '都内'}へ移動`, tier };
}

/**
 * 今日のおでかけプランを生成。東京23区の駅slug（または区）をアンカーに、
 * 移動の少ない3スロットを返す。
 */
export function buildOutingPlan(q: OutingQuery): OutingPlan | null {
  // アンカー解決
  let stationSlug = q.stationSlug;
  let stationName: string | undefined;
  let ward: TokyoWard | undefined = q.ward;
  let scale: string | undefined;

  if (stationSlug) {
    const st = getStationBySlug(stationSlug);
    if (st) {
      stationName = st.name;
      ward = st.ward;
      scale = st.scale;
    } else {
      stationSlug = undefined; // 不明な駅slugは無視して区で続行
    }
  }
  if (!ward) return null; // 東京の駅も区も無ければ生成不可（呼び出し側でフォールバック）
  const wardName = WARD_NAMES[ward];

  const used = new Set<string>();
  const slots: OutingSlot[] = [];

  // ---- 午前: あそぶ ----
  const morning = pickSpotCascade(stationSlug, wardName, q, used, q.morningVariant ?? 0);
  if (morning) {
    used.add(morning.spot.name);
    slots.push({
      key: 'morning',
      label: '午前 あそぶ',
      time: '10:30',
      icon: '🌤',
      kind: 'spot',
      spot: morning.spot,
      spotSlug: spotToSlug(morning.spot, 'tokyo'),
      move: moveTextForSpot(morning.tier, stationName, wardName, morning.spot, morning.walkMinutes),
      tier: morning.tier,
    });
  }

  // ---- お昼: たべる ----
  const lunch = pickLunch(wardName, q, q.lunchVariant ?? 0);
  if (lunch) {
    used.add(lunch.spot.name);
    slots.push({
      key: 'lunch',
      label: 'お昼 たべる',
      time: '12:00',
      icon: '🍽',
      kind: 'restaurant',
      spot: lunch.spot,
      spotSlug: spotToSlug(lunch.spot, 'tokyo'),
      facets: facetsOf(lunch.spot),
      move: {
        text: lunch.tier === 'ward' ? `${wardName}内・徒歩圏` : '周辺のファミリー向けチェーン',
        tier: lunch.tier,
      },
      tier: lunch.tier,
    });
  }

  // ---- 午後: 軽め（0-1歳は休憩優先でおうちへ） ----
  const preferHome = q.age === '0-1';
  let afternoon: { spot: Spot; tier: CoherenceTier; walkMinutes?: number } | null = null;
  if (!preferHome) {
    afternoon = pickSpotCascade(stationSlug, wardName, q, used, q.afternoonVariant ?? 0);
  }
  if (afternoon) {
    used.add(afternoon.spot.name);
    slots.push({
      key: 'afternoon',
      label: '午後 つづき',
      time: '13:30',
      icon: '🧸',
      kind: 'spot',
      spot: afternoon.spot,
      spotSlug: spotToSlug(afternoon.spot, 'tokyo'),
      move: moveTextForSpot(afternoon.tier, stationName, wardName, afternoon.spot, afternoon.walkMinutes),
      tier: afternoon.tier,
    });
  } else {
    const home = pickHomePlan(q);
    slots.push({
      key: 'afternoon',
      label: preferHome ? '午後 おうちで休憩' : '午後 おうちで',
      time: '13:30',
      icon: '🏠',
      kind: 'homeplan',
      plan: home ?? undefined,
      move: { text: 'おうちへ（お昼寝・休憩）', tier: 'home' },
      tier: 'home',
    });
  }

  const morningTier = slots[0]?.tier;
  const coverage: OutingPlan['coverage'] =
    morningTier === 'station' ? 'ideal' : morningTier === 'ward' ? 'ward' : 'mixed';

  return {
    anchor: { stationSlug, stationName, ward, wardName, scale },
    slots,
    coverage,
  };
}
