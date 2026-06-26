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

import { WARD_NAMES, type TokyoWard } from './tokyo-stations';
import { findStationBySlug, type AnyStation } from './all-stations';
import {
  SPOTS,
  TOKYO_RESTAURANTS,
  getSpotsByNearestStation,
  getSpotsForRegion,
  spotToSlug,
  type Spot,
  type AgeTag,
} from './spots';
import type { AreaSlug } from './area';
import { pickTopPlan, type PlanMeta } from './plans';
import type { Weather } from './types';

export type OutingSlotKey = 'morning' | 'lunch' | 'afternoon';

/** 近さ／フォールバックの段階。UIで正直に出す。 */
export type CoherenceTier = 'station' | 'nearby' | 'ward' | 'wide' | 'chain' | 'home';

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
    /** SPOTSのエリアキー（tokyo/kanagawa/osaka…） */
    areaKey: string;
    /** 地域ラベル（区名/市名/府県名） */
    regionLabel: string;
    scale?: string;
  };
  slots: OutingSlot[];
  /** 全体の質: ideal=午前が同駅 / ward=同地域 / mixed=広域フォールバック含む */
  coverage: 'ideal' | 'ward' | 'mixed';
};

/** AnyStation → SPOTSのエリアキー（都道府県/地域）。 */
function areaKeyOf(st: AnyStation): string {
  if (st.region === 'kansai' || st.region === 'saichi') return st.prefecture;
  return st.region; // 'tokyo' | 'kanagawa'
}

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
  areaKey: string,
  regionLabel: string,
  q: OutingQuery,
  exclude: Set<string>,
  variant = 0,
  anchorStation?: AnyStation | null,
): { spot: Spot; tier: CoherenceTier; walkMinutes?: number; viaStationName?: string } | null {
  const filt = (list: Spot[], strictWeather: boolean) =>
    list.filter(
      (s) =>
        NON_RESTAURANT(s) &&
        ageOk(s, q.age) &&
        (!strictWeather || weatherOk(s, q.weather)) &&
        !exclude.has(s.name),
    );
  // 同じ近さ階層の候補リストから variant 番目を選ぶ（「別の候補」用）。
  const at = <T>(list: T[]) => list[((variant % list.length) + list.length) % list.length];

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

  // 1.5) 近隣駅（アンカー駅と路線を共有する駅のspot）— 区フォールバックより先に。
  //      巨大区(千代田区27駅)で遠い丸の内が出る問題を、路線でつながる近場に置き換える。
  if (anchorStation && anchorStation.lines.length) {
    const anchorLines = new Set(anchorStation.lines);
    const pool = SPOTS[areaKey as AreaSlug] ?? [];
    for (const strict of [true, false]) {
      const cand = filt(pool, strict)
        .filter((s) => s.nearestStation && s.nearestStation !== stationSlug)
        .map((s) => ({ s, st: findStationBySlug(s.nearestStation!) }))
        .filter((x) => x.st && x.st.lines.some((l) => anchorLines.has(l)))
        .sort((a, b) => popularFirst(a.s, b.s));
      if (cand.length) {
        const pick = at(cand);
        return {
          spot: pick.s,
          tier: 'nearby',
          walkMinutes: pick.s.walkMinutes,
          viaStationName: pick.st!.name,
        };
      }
    }
  }

  // 2) 同じ地域（区/市内移動）
  const regionSpots = getSpotsForRegion(areaKey, regionLabel);
  for (const strict of [true, false]) {
    const cand = filt(regionSpots, strict).sort(popularFirst);
    if (cand.length) return { spot: at(cand), tier: 'ward' };
  }

  // 3) エリア広域（最終フォールバック）
  const areaWide = SPOTS[areaKey as AreaSlug] ?? [];
  for (const strict of [true, false]) {
    const cand = filt(areaWide, strict).sort(popularFirst);
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
  areaKey: string,
  regionLabel: string,
  q: { age?: AgeTag; budget?: 'free' | 'low' | 'mid' | 'high' },
): { ward: Spot[]; chain: Spot[] } {
  const budgetOk = (s: Spot) => {
    if (!q.budget || !s.budget) return true;
    const order = { free: 0, low: 1, mid: 2, high: 3 } as const;
    return order[s.budget] <= order[q.budget];
  };
  const isRest = (s: Spot) => s.category === 'restaurant' && ageOk(s, q.age) && budgetOk(s);
  const byFacets = (a: Spot, b: Spot) => facetsOf(b).length - facetsOf(a).length;
  // 地域内のレストラン（東京は TOKYO_RESTAURANTS も getSpotsForRegion が合流）
  const ward = getSpotsForRegion(areaKey, regionLabel).filter(isRest).sort(byFacets);
  // 全国チェーンのみフォールバック採用（ward:'複数' = どの地域にもある店）。
  // TOKYO_RESTAURANTS には神戸/大阪等の地域限定店も混在しているため、それらは除外する
  // （混入すると東京の駅で「神戸ハーバーランド」等が出てしまう）。
  const chain = TOKYO_RESTAURANTS.filter((s) => isRest(s) && s.ward === '複数').sort(byFacets);
  return { ward, chain };
}

function pickLunch(
  areaKey: string,
  regionLabel: string,
  q: OutingQuery,
  variant = 0,
): { spot: Spot; tier: CoherenceTier } | null {
  const { ward, chain } = lunchCandidates(areaKey, regionLabel, q);
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
  regionLabel: string,
  spot: Spot,
  walkMinutes?: number,
  viaStationName?: string,
): OutingMove {
  if (tier === 'station') {
    const m = walkMinutes ?? undefined;
    return {
      text: stationName ? `${stationName}駅から徒歩${m ?? '数'}分` : `徒歩${m ?? '数'}分`,
      minutes: m,
      tier,
    };
  }
  if (tier === 'nearby') {
    // 同じ路線でつながる近隣駅へ電車で移動
    return { text: viaStationName ? `${viaStationName}駅へ（電車ですぐ）` : '電車ですぐ', tier };
  }
  if (tier === 'ward') return { text: `${regionLabel}内`, tier };
  // wide
  return { text: `${spot.ward || spot.city || regionLabel}へ移動`, tier };
}

/**
 * 今日のおでかけプランを生成。東京23区の駅slug（または区）をアンカーに、
 * 移動の少ない3スロットを返す。
 */
/**
 * 駅slug（または東京の区）から、SPOTSエリアキー・地域ラベル・駅名を解決する。
 * buildOutingPlan と ?slot=lunch ビューで共通利用。東京/横浜/関西/埼玉千葉を横断。
 */
export function resolveOutingAnchor(q: { stationSlug?: string; ward?: TokyoWard }): {
  stationSlug?: string;
  stationName?: string;
  areaKey: string;
  regionLabel: string;
  scale?: string;
} | null {
  let stationSlug = q.stationSlug;
  let stationName: string | undefined;
  let regionLabel: string | undefined;
  let areaKey: string | undefined;
  let scale: string | undefined;

  if (stationSlug) {
    const st = findStationBySlug(stationSlug);
    if (st) {
      stationName = st.name;
      // 地域ラベルは「徒歩圏」が成立する最小粒度を使う。
      // 埼玉/千葉(saichi)は regionLabel が県単位で粗いので、駅の area(市区)を使う。
      regionLabel = st.region === 'saichi' ? st.area : st.regionLabel;
      areaKey = areaKeyOf(st);
      scale = st.scale;
    } else {
      stationSlug = undefined; // 不明な駅slugは無視して区で続行
    }
  }
  // 駅が無いとき、東京の区だけでもアンカーにできる（後方互換）
  if (!regionLabel && q.ward) {
    regionLabel = WARD_NAMES[q.ward];
    areaKey = 'tokyo';
  }
  if (!regionLabel || !areaKey) return null;
  return { stationSlug, stationName, areaKey, regionLabel, scale };
}

export function buildOutingPlan(q: OutingQuery): OutingPlan | null {
  const anchor = resolveOutingAnchor(q);
  if (!anchor) return null; // 地域が解決できなければ生成不可
  const { stationSlug, stationName, areaKey, regionLabel, scale } = anchor;
  // 近隣駅(同路線)tier 用にアンカー駅の路線情報を取得
  const anchorStation = stationSlug ? findStationBySlug(stationSlug) : null;

  // spot個別ページのslugは、その spot が属する SPOTS エリアキーで生成する。
  // チェーン店(TOKYO_RESTAURANTS)は 'tokyo' で登録されているため別扱い。
  const slugArea = areaKey;

  const used = new Set<string>();
  const slots: OutingSlot[] = [];

  // ---- 午前: あそぶ ----
  const morning = pickSpotCascade(stationSlug, areaKey, regionLabel, q, used, q.morningVariant ?? 0, anchorStation);
  if (morning) {
    used.add(morning.spot.name);
    slots.push({
      key: 'morning',
      label: '午前 あそぶ',
      time: '10:30',
      icon: '🌤',
      kind: 'spot',
      spot: morning.spot,
      spotSlug: spotToSlug(morning.spot, slugArea),
      move: moveTextForSpot(morning.tier, stationName, regionLabel, morning.spot, morning.walkMinutes, morning.viaStationName),
      tier: morning.tier,
    });
  }

  // ---- お昼: たべる ----
  const lunch = pickLunch(areaKey, regionLabel, q, q.lunchVariant ?? 0);
  if (lunch) {
    used.add(lunch.spot.name);
    slots.push({
      key: 'lunch',
      label: 'お昼 たべる',
      time: '12:00',
      icon: '🍽',
      kind: 'restaurant',
      spot: lunch.spot,
      // チェーンは TOKYO_RESTAURANTS（area='tokyo'）、地域店は areaKey で登録
      spotSlug: spotToSlug(lunch.spot, lunch.tier === 'chain' ? 'tokyo' : slugArea),
      facets: facetsOf(lunch.spot),
      move: {
        // 「徒歩圏」は同駅のときだけ。区/市は広い場合があるので断定しない。
        text: lunch.tier === 'ward' ? `${regionLabel}内` : '周辺のファミリー向けチェーン',
        tier: lunch.tier,
      },
      tier: lunch.tier,
    });
  }

  // ---- 午後: 軽め（0-1歳は休憩優先でおうちへ） ----
  const preferHome = q.age === '0-1';
  let afternoon:
    | { spot: Spot; tier: CoherenceTier; walkMinutes?: number; viaStationName?: string }
    | null = null;
  if (!preferHome) {
    afternoon = pickSpotCascade(stationSlug, areaKey, regionLabel, q, used, q.afternoonVariant ?? 0, anchorStation);
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
      spotSlug: spotToSlug(afternoon.spot, slugArea),
      move: moveTextForSpot(afternoon.tier, stationName, regionLabel, afternoon.spot, afternoon.walkMinutes, afternoon.viaStationName),
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
    anchor: { stationSlug, stationName, areaKey, regionLabel, scale },
    slots,
    coverage,
  };
}
