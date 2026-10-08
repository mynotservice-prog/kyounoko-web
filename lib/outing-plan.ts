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

import { WARD_NAMES, getStationsByWard, type TokyoWard } from './tokyo-stations';
import {
  findStationBySlug,
  getStationCoords,
  haversineKm,
  resolveStationSlugByName,
  type AnyStation,
} from './all-stations';
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
import { getAllPlanMetas, pickTopPlan, type PlanMeta } from './plans';
import type { Weather } from './types';
import { getVerifiedStores, type VerifiedStore } from './station-verified-stores';
import { getSpotHours, isSpotOpenOn, spotHoursLine } from './spot-hours';
import { isSpotAvailableNow } from './spot-temp-closed';
import { SPOT_CLOSED } from './spot-closed';
import { getTokyoNow } from './date';
import { getSeasonState, getSpotSeason } from './spot-season';
import {
  getIndieRestaurantsByStation,
  INDIE_GENRE_LABEL,
  type IndieRestaurant,
} from './indie-restaurants';

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
  /**
   * スロットのアイコン名（`components/kk/KkIcon.tsx` の KkIconName）。
   * 2026-09 リニューアル: 絵文字は使わない（docs/renewal-2026-09.md §3-0）。
   */
  icon: string;
  kind: 'spot' | 'restaurant' | 'homeplan';
  spot?: Spot;
  /** /spot/[slug] へのリンク用 */
  spotSlug?: string;
  /** 個人店など /spot 以外の行き先。指定時は spotSlug より優先してリンクする */
  href?: string;
  plan?: PlanMeta;
  /** お昼スロットの子連れ設備（ベビーチェア等） */
  facets?: string[];
  /** 午前・午後の行き先の、公式の休み・営業時間（lib/spot-hours.ts にあるスポットだけ） */
  hoursLine?: string;
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
  /** 区起点のとき、お昼を探した駅（駅起点では undefined） */
  lunchStation?: { slug: string; name: string };
  slots: OutingSlot[];
  /** 全体の質: ideal=午前が同駅 / ward=同地域 / mixed=広域フォールバック含む */
  coverage: 'ideal' | 'ward' | 'mixed';
};

/** AnyStation → SPOTSのエリアキー（都道府県/地域）。 */
function areaKeyOf(st: AnyStation): string {
  // 多摩の駅は埼玉・千葉と同じ型で持っているが、スポットのエリアは東京
  if (st.region === 'saichi' && st.prefecture === 'tokyo-tama') return 'tokyo';
  if (st.region === 'kansai' || st.region === 'saichi') return st.prefecture;
  return st.region; // 'tokyo' | 'kanagawa'
}

const NON_RESTAURANT = (s: Spot) => s.category !== 'restaurant';

const WATER_PLAY_NAME = /じゃぶじゃぶ|ジャブジャブ|水遊び場|プール$/;

/**
 * 季節ものを、時期外に案内しない。
 * - 会期データ（lib/spot-season.ts）があるスポットは、いま会期中の窓が1つも無ければ外す。
 * - 収穫体験・季節カテゴリ（梨狩り・じゃぶじゃぶ池など）は、会期データか営業期間（lib/spot-hours.ts の
 *   openSeason）で「いま営業中」と分かるものだけ出す。時期が分からないものは勧めない。
 */
function inSeasonNow(s: Spot): boolean {
  const windows = getSpotSeason(s.name);
  if (windows.length) return windows.some((w) => getSeasonState(w) === 'open');
  if (s.category === 'harvest' || s.category === 'seasonal') return Boolean(getSpotHours(s.name)?.openSeason);
  // 名前が水遊び場で、営業期間のデータが無いもの（公式で期間を読めなかった池）は、6〜9月の外では出さない
  if (WATER_PLAY_NAME.test(s.name) && !getSpotHours(s.name)?.openSeason) {
    const m = getTokyoNow().month;
    return m >= 6 && m <= 9;
  }
  return true;
}

function ageOk(s: Spot, age?: AgeTag): boolean {
  if (!age) return true;
  return s.ages.includes(age);
}

/**
 * 天気ごとの「行き先の向き」。厳格パスで使う条件で、0件なら呼び出し側が緩める。
 * - sunny        … 屋内だけの施設は外す（outdoor / mixed を出す）
 * - cloudy       … 制約なし（屋内も屋外も可。雨と同じ挙動にはしない）
 * - rain/heat/cold … 屋外は外す（indoor / mixed を出す）
 */
function weatherOk(s: Spot, weather?: Weather): boolean {
  if (!weather || weather === 'any' || weather === 'cloudy') return true;
  if (weather === 'sunny') return s.place !== 'indoor';
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
 *
 * weather の扱い: 以前は「各tierの中で 厳格→緩和 を試す」形だったため、
 * 同じ駅に条件に合う遊び場が1件も無いと、その駅のtierで即座に天気を捨てていた
 * （雨なのに公園、晴れなのに百貨店）。天気は近さより先に効かせたい条件なので、
 * 厳格パスでカスケード全体を回し、全tierで0件のときだけ呼び出し側が緩和パスを回す。
 */
function pickSpotCascade(
  stationSlug: string | undefined,
  areaKey: string,
  regionLabel: string,
  q: OutingQuery,
  exclude: Set<string>,
  variant = 0,
  anchorStation?: AnyStation | null,
  strictWeather = true,
): {
  spot: Spot;
  tier: CoherenceTier;
  walkMinutes?: number;
  viaStationName?: string;
  distanceKm?: number;
} | null {
  // 今日（JST）が定休日・営業期間外のスポット、長期休館中・閉館済みのスポットは案内しない。
  // 休みのデータが無いスポットは外さない（開いているとも休みとも分からない）。
  const today = getTokyoNow();
  const todayIso = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
  const filt = (list: Spot[]) =>
    list.filter(
      (s) =>
        NON_RESTAURANT(s) &&
        !SPOT_CLOSED[s.name] &&
        isSpotAvailableNow(s.name, todayIso) &&
        isSpotOpenOn(s.name, today) &&
        inSeasonNow(s) &&
        ageOk(s, q.age) &&
        (!strictWeather || weatherOk(s, q.weather)) &&
        !exclude.has(s.name),
    );
  // 同じ近さ階層の候補リストから variant 番目を選ぶ（「別の候補」用）。
  const at = <T>(list: T[]) => list[((variant % list.length) + list.length) % list.length];

  // 1) 同じ駅（徒歩圏）
  if (stationSlug) {
    const atStation = getSpotsByNearestStation(stationSlug, { limit: 24 });
    const cand = filt(atStation).sort((a, b) => (a.walkMinutes ?? 99) - (b.walkMinutes ?? 99));
    if (cand.length) {
      const top = at(cand);
      return { spot: top, tier: 'station', walkMinutes: top.walkMinutes };
    }
  }

  // 1.5) 近隣を「実距離」で選ぶ（アンカー駅に座標があるとき）。
  //      ハブ駅(新橋=浅草線→押上8km/ゆりかもめ→お台場)で遠方を拾う問題を、
  //      半径 MAX_KM 以内・近い順 に限定して解消する。子連れで回遊できる範囲だけ提案。
  const anchorCoords = getStationCoords(stationSlug);
  if (anchorCoords) {
    const MAX_KM = 3.0; // これを超える提案はしない（電車1本・回遊できる現実的な範囲）
    const pool = SPOTS[areaKey as AreaSlug] ?? [];
    const cand = filt(pool)
      .filter((s) => s.nearestStation && s.nearestStation !== stationSlug)
      .map((s) => {
        const c = getStationCoords(s.nearestStation!);
        return {
          s,
          st: findStationBySlug(s.nearestStation!),
          km: c ? haversineKm(anchorCoords, c) : null,
        };
      })
      .filter((x) => x.km !== null && x.km <= MAX_KM)
      // 近い順を最優先（morning=最近接, afternoon=次点）。同距離は人気順。
      .sort((a, b) => a.km! - b.km! || popularFirst(a.s, b.s));
    if (cand.length) {
      const pick = at(cand);
      return {
        spot: pick.s,
        tier: 'nearby',
        walkMinutes: pick.s.walkMinutes,
        viaStationName: pick.st?.name,
        distanceKm: pick.km!,
      };
    }
    // 座標アンカーで3km内に該当なし → far fallback はしない（回遊性を優先）。
    // null を返すと上位で「おうちプラン」等に切り替わる。
    return null;
  }

  // --- 以下は座標が無い駅・区アンカーのみの後方互換フォールバック ---
  // 1.5b) 近隣駅（アンカー駅と路線を共有する駅のspot）。
  if (anchorStation && anchorStation.lines.length) {
    const anchorLines = new Set(anchorStation.lines);
    const pool = SPOTS[areaKey as AreaSlug] ?? [];
    const cand = filt(pool)
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

  // 2) 同じ地域（区/市内移動）
  const regionSpots = getSpotsForRegion(areaKey, regionLabel);
  const regionCand = filt(regionSpots).sort(popularFirst);
  if (regionCand.length) return { spot: at(regionCand), tier: 'ward' };

  // 3) エリア広域（最終フォールバック）
  const areaWide = SPOTS[areaKey as AreaSlug] ?? [];
  const wideCand = filt(areaWide).sort(popularFirst);
  if (wideCand.length) return { spot: at(wideCand), tier: 'wide' };

  return null;
}

/**
 * 天気を効かせたカスケード（厳格）→ 全滅なら天気を捨てて再走査（緩和）。
 * 天気を捨てたかどうかは呼び出し側では使わないが、必ず1件返す従来の性質は保つ。
 */
function pickSpotWithWeather(
  stationSlug: string | undefined,
  areaKey: string,
  regionLabel: string,
  q: OutingQuery,
  exclude: Set<string>,
  variant: number,
  anchorStation?: AnyStation | null,
) {
  return (
    pickSpotCascade(stationSlug, areaKey, regionLabel, q, exclude, variant, anchorStation, true) ??
    pickSpotCascade(stationSlug, areaKey, regionLabel, q, exclude, variant, anchorStation, false)
  );
}

function facetsOf(s: Spot): string[] {
  const f: string[] = [];
  if (s.babyChair) f.push('ベビーチェア');
  if (s.kidsMenu) f.push('キッズメニュー');
  if (s.strollerAccess) f.push('ベビーカーOK');
  if (s.babyFood) f.push('離乳食OK');
  return f;
}

// 建物レストラン街 → 最寄駅（部分一致ヒント）。多くの区内レストランは駅紐付けが無いため、
// アンカー駅からの実距離フィルタ（半径3km）を効かせる目的で建物名から駅を補完する。
// 値は日本語駅名（resolveStationSlugByName で slug 化）。23区外(吉祥寺/立川等)は master 非対象→チェーンに落ちる。
const RESTAURANT_STATION_HINTS: Array<[string, string]> = [
  // 東京23区
  ['東京ドームシティ', '水道橋'],
  ['東京ステーションホテル', '東京'],
  ['丸ビル', '東京'],
  ['グランスタ東京', '東京'],
  ['渋谷ヒカリエ', '渋谷'],
  ['二子玉川ライズ', '二子玉川'],
  ['アクアシティお台場', 'お台場海浜公園'],
  ['六本木ヒルズ', '六本木'],
  ['池袋サンシャインシティ', '池袋'],
  ['スカイツリータウン', '押上'],
  ['ソラマチ', '押上'],
  ['新宿高島屋', '新宿'],
  ['ルミネ新宿', '新宿'],
  ['ららぽーと豊洲', '豊洲'],
  ['上野松坂屋', '上野'],
  ['北千住マルイ', '北千住'],
  ['錦糸町オリナス', '錦糸町'],
  ['蒲田グランデュオ', '蒲田'],
  ['アトレ大森', '大森'],
  ['中野サンモール', '中野'],
  ['中野ブロードウェイ', '中野'],
  ['としまえん', '豊島園'],
  // 神奈川
  ['横浜ランドマークタワー', 'みなとみらい'],
  ['横浜赤レンガ倉庫', '桜木町'],
  ['ラゾーナ川崎', '川崎'],
  ['川崎アゼリア', '川崎'],
  ['鎌倉小町通り', '鎌倉'],
  // 関西
  ['グランフロント大阪', '梅田'],
  ['ルクア大阪', '梅田'],
  ['なんばパークス', '難波'],
  ['なんばCITY', '難波'],
  ['あべのハルカス', '天王寺'],
  ['あべのキューズモール', '天王寺'],
  ['京都四条河原町', '河原町'],
  ['京都駅ビル', '京都'],
  ['神戸ハーバーランド', 'ハーバーランド'],
  ['神戸三宮センタープラザ', '三宮'],
];

/** レストランの最寄駅slugを解決（spot.nearestStation 優先、無ければ建物名ヒント）。 */
function resolveLunchStationSlug(s: Spot): string | undefined {
  if (s.nearestStation) return s.nearestStation;
  for (const [key, station] of RESTAURANT_STATION_HINTS) {
    if (s.name.includes(key)) return resolveStationSlugByName(station);
  }
  return undefined;
}

const LUNCH_MAX_KM = 3.0; // 区内でもこの距離を超えるレストランは出さない（回遊できる範囲）。

/**
 * お昼の子連れOKレストランを1件。区内→全国チェーン の順。
 * アンカー駅に座標があるときは、区内候補を実距離(半径3km)で絞り・近い順に並べる。
 */
/** お昼候補をスコア順で並べて返す。?slot=lunch のリスト表示にも使う。anchorSlug 指定時は距離フィルタ。 */
export function lunchCandidates(
  areaKey: string,
  regionLabel: string,
  q: { age?: AgeTag; budget?: 'free' | 'low' | 'mid' | 'high' },
  anchorSlug?: string,
): { ward: Spot[]; chain: Spot[] } {
  const budgetOk = (s: Spot) => {
    if (!q.budget || !s.budget) return true;
    const order = { free: 0, low: 1, mid: 2, high: 3 } as const;
    return order[s.budget] <= order[q.budget];
  };
  const isRest = (s: Spot) => s.category === 'restaurant' && ageOk(s, q.age) && budgetOk(s);
  const byFacets = (a: Spot, b: Spot) => facetsOf(b).length - facetsOf(a).length;
  // 地域内のレストラン（東京は TOKYO_RESTAURANTS も getSpotsForRegion が合流）
  const wardScoped = getSpotsForRegion(areaKey, regionLabel).filter(isRest);

  // アンカー座標があれば「同じward + エリア内3km圏の他ward店」を実距離で統合。
  // 区/エリア境界をまたぐ近接店（心斎橋→なんばパークス1.3km、川崎→ラゾーナ0.3km等）も拾う。
  const anchorCoords = getStationCoords(anchorSlug);
  let ward: Spot[];
  if (anchorCoords) {
    // 候補プール: 同wardの店（距離不明でも後方互換で残す）＋ エリア全レストラン（3km圏のみ）。
    const areaPool = [...(SPOTS[areaKey as AreaSlug] ?? []), ...TOKYO_RESTAURANTS].filter(isRest);
    const seen = new Set<string>();
    const cand: { s: Spot; km: number | null }[] = [];
    const add = (s: Spot, requireNear: boolean) => {
      if (seen.has(s.name)) return;
      const c = getStationCoords(resolveLunchStationSlug(s));
      const km = c ? haversineKm(anchorCoords, c) : null;
      if (km !== null && km > LUNCH_MAX_KM) return; // 距離判明で3km超は除外
      if (requireNear && km === null) return; // 他ward店は近接が確認できるものだけ
      seen.add(s.name);
      cand.push({ s, km });
    };
    for (const s of wardScoped) add(s, false); // 同ward: 距離不明でも可（後方互換）
    for (const s of areaPool) add(s, true); // 他ward: 3km圏のみ追加
    // 近い順 → 距離不明(同ward) → ファセット数。近接かつ設備充実を優先。
    ward = cand
      .sort((a, b) => {
        if (a.km !== null && b.km !== null) return a.km - b.km || byFacets(a.s, b.s);
        if (a.km !== null) return -1;
        if (b.km !== null) return 1;
        return byFacets(a.s, b.s);
      })
      .map((x) => x.s);
  } else {
    ward = wardScoped.sort(byFacets);
  }

  // 全国チェーンのみフォールバック採用（ward:'複数' = どの地域にもある店）。
  // 近接の登録店が無い駅向け。「家族で入れるファミレス」を先頭に出す（IKEA等の特殊店は降格）。
  // 駅ごとに先頭を回転させ、どの空白駅でも同じ店ばかりにならないようにする。
  const chainRank = chainRankFor(anchorSlug);
  const chainAll = TOKYO_RESTAURANTS.filter((s) => isRest(s) && s.ward === '複数').sort(
    (a, b) => chainRank(a) - chainRank(b) || byFacets(a, b),
  );
  // 照合済みの駅では、徒歩10分圏に実在を確認できたチェーンだけを、店名・距離つきで返す。
  // （以前は実在を確かめずに「どの駅にもある」前提で出していた。2026-10 の照合で、駅ページに
  //  表示していたチェーンのうち実在したのは3〜4割だった。）
  const chain = isStationChainVerified(anchorSlug)
    ? chainAll.flatMap((s) => {
        const store = nearestVerifiedStore(anchorSlug, s.name);
        return store ? [withVerifiedStore(s, store)] : [];
      })
    : chainAll;
  return { ward, chain };
}

// 「どの駅にもある」前提のチェーン枠（TOKYO_RESTAURANTS の ward:'複数'）→ 駅ページのチェーンslug。
// 駅ごとの実在確認（lib/station-verified-stores.ts）と突き合わせるための対応表。
// ここに無いチェーン（IKEA・ビッグボーイ・和食さと 等）は実在を確かめる手段が無いので、
// 照合済みの駅では候補に出さない。
const CHAIN_SPOT_TO_SLUG: Record<string, string> = {
  ココス: 'cocos',
  ガスト: 'gusto',
  サイゼリヤ: 'saizeriya',
  くら寿司: 'kura-sushi',
  スシロー: 'sushiro',
  ジョナサン: 'jonathan',
  デニーズ: 'denny-s',
  バーミヤン: 'bamiyan',
  ロイヤルホスト: 'royal-host',
  びっくりドンキー: 'bikkuri-donkey',
  マクドナルド: 'mcdonalds',
  モスバーガー: 'mos-burger',
  ケンタッキーフライドチキン: 'kfc',
  フレッシュネスバーガー: 'freshness-burger',
  リンガーハット: 'ringer-hut',
  丸亀製麺: 'marugame',
  なか卯: 'nakau',
  松屋: 'matsuya',
  すき家: 'sukiya',
  吉野家: 'yoshinoya',
  ミスタードーナツ: 'mister-donut',
  焼肉きんぐ: 'yakiniku-king',
  しゃぶ葉: 'shabu-yo',
  かっぱ寿司: 'kappa-sushi',
  はま寿司: 'hama-sushi',
  コメダ珈琲店: 'komeda',
};

/** 照合済みの駅で、そのチェーンのいちばん近い実在店（無ければ undefined）。 */
function nearestVerifiedStore(anchorSlug: string | undefined, chainSpotName: string): VerifiedStore | undefined {
  if (!anchorSlug) return undefined;
  const chainSlug = CHAIN_SPOT_TO_SLUG[chainSpotName];
  if (!chainSlug) return undefined;
  // stores はチェーンごとに駅から近い順で並んでいる（scripts/station-verify/gen_ts.py）
  return getVerifiedStores(anchorSlug)?.stores.find((st) => st.chain === chainSlug);
}

/** その駅が公式店舗検索で照合済みか（照合済みなら、実在を確認できたチェーンだけを候補にする）。 */
export function isStationChainVerified(anchorSlug: string | undefined): boolean {
  return Boolean(anchorSlug && getVerifiedStores(anchorSlug));
}

/** 実在店の店名・距離を添えたチェーン枠（スポット名は変えない＝/spot へのリンクはそのまま）。 */
function withVerifiedStore(s: Spot, store: VerifiedStore): Spot {
  return {
    ...s,
    city: `${store.name}（${store.distance}）`,
    // タグ（ベビーチェア等）はチェーン共通の目安。store.fac は、その店について公式の店舗検索が
    // 「あり」と表示している項目（無い項目は「無い」ではなく、公式に表示が無いだけ）。
    note:
      `${store.name}（${store.distance}・${store.address}）。` +
      (store.fac && store.fac.length
        ? `この店の公式ページにある設備: ${store.fac.join('・')}。ほかの設備は店舗によって違うので、行く前に公式ページでご確認を。`
        : '設備は店舗によって違うので、行く前に公式ページでご確認を。'),
  };
}

// チェーンフォールバックの優先順（家族で入れる定番ファミレス・回転寿司・麺類）。
// 先頭4つはユーザー指定の定番。
const FAMILY_CHAINS = [
  'サイゼリヤ',
  'ガスト',
  'くら寿司',
  '丸亀製麺',
  'ココス',
  'ジョナサン',
  'デニーズ',
  'スシロー',
  'はま寿司',
  'バーミヤン',
  'ロイヤルホスト',
];

/** anchorSlug ごとに優先リストを回転させた、チェーンの並び順ランク関数を返す。 */
function chainRankFor(anchorSlug?: string): (s: Spot) => number {
  const rot = anchorSlug
    ? [...anchorSlug].reduce((a, c) => a + c.charCodeAt(0), 0) % FAMILY_CHAINS.length
    : 0;
  const priority = [...FAMILY_CHAINS.slice(rot), ...FAMILY_CHAINS.slice(0, rot)];
  return (s: Spot) => {
    const i = priority.findIndex((k) => s.name.includes(k));
    return i === -1 ? priority.length : i;
  };
}

/** 個人店の子連れ向きスコア（true のフィールドだけ数える。要店舗確認前提のデータ規律に従う）。 */
export function indieLunchScore(r: IndieRestaurant): number {
  let score = 0;
  if (r.popular) score += 2;
  for (const k of [
    'kidsChair',
    'kidsMenu',
    'strollerOk',
    'strollerToSeat',
    'privateRoom',
    'bringBabyFood',
    'kidsCutlery',
    'shareDish',
    'stepFree',
  ] as const) {
    if (r[k]) score += 1;
  }
  if (r.seatingType?.includes('zashiki')) score += 1;
  return score;
}

// 子連れの昼ごはんに勧めない店（店名で判定）。ホットペッパーの「お子様連れOK」は居酒屋・バー・
// ビアレストラン・ホルモン焼きにも付くので、「今日の流れ」では名前に酒場系の語が入る店を出さない。
// 駅ページの個人店一覧はそのまま（掲載情報どおりに載せる）。「酒家」は中華料理店の屋号なので除かない。
const KANA = 'ァ-ヶー';
const INDIE_NOT_FAMILY_LUNCH = new RegExp(
  [
    'ビール|ビア(?:ホール|ガーデン|バー|ダイニング|レストラン|カフェ)|デリリウム',
    '\\b(?:BEER|Beer|beer|BAR|Bar|bar|PUB|Pub|WINE|Wine|BBQ)\\b',
    `(?<![${KANA}])(?:バル|バー|パブ)(?![${KANA}])`,
    '(?:パスタ|ピザ|肉|魚|海鮮|チーズ|スペイン|イタリアン|大衆|和)バル',
    'ダイニングバー|ワインバー|スポーツバー|酒(?!家)|ワイン|ホルモン|やきとり|焼鳥|焼き鳥|もつ鍋|もつ焼',
    'バーベキュー|シーシャ|スナック|立ち飲み|立呑|ダーツ|カラオケ',
  ].join('|'),
);
// 説明文が酒・宴会を売りにしている店は、外さずに後ろへ回す
const INDIE_DRINK_DESC = /飲み放題|お酒|ビール|ワイン|日本酒|地酒|焼酎|カクテル|宴会|女子会|合コン|二次会/;

/** 「今日の流れ」のお昼に出してよい個人店か。 */
export function isFamilyLunchIndie(r: IndieRestaurant): boolean {
  return !INDIE_NOT_FAMILY_LUNCH.test(r.name);
}

/** アンカー駅の個人店を子連れ向きの順で返す（酒場系は除く）。 */
export function indieLunchCandidates(anchorSlug: string | undefined): IndieRestaurant[] {
  if (!anchorSlug) return [];
  const rank = (r: IndieRestaurant) =>
    indieLunchScore(r) +
    (r.childNote?.includes('歓迎') ? 2 : 0) -
    (INDIE_DRINK_DESC.test(r.description ?? '') ? 2 : 0);
  return getIndieRestaurantsByStation(anchorSlug)
    .filter(isFamilyLunchIndie)
    .sort(
      (a, b) =>
        rank(b) - rank(a) || (a.distanceM ?? 9999) - (b.distanceM ?? 9999) || a.name.localeCompare(b.name, 'ja'),
    );
}

/** 個人店を表示用の擬似 Spot に変換する（/spot ページは無いので slug は作らない）。 */
export function indieToLunchSpot(r: IndieRestaurant): Spot {
  return {
    name: `${r.name}（${INDIE_GENRE_LABEL[r.genre]}）`,
    category: 'restaurant',
    place: 'indoor',
    ages: ['0-1', '2-3', '4-6'],
    city: r.area,
    note: `${r.description} 設備・営業時間は店舗にご確認を。`,
    babyChair: r.kidsChair,
    kidsMenu: r.kidsMenu,
    strollerAccess: r.strollerOk || r.strollerToSeat,
    babyFood: r.bringBabyFood,
  };
}

/**
 * 区を起点にしたとき（駅の指定なし）の、お昼を探す駅を決める。
 *
 * 以前は区内の「実店舗スポット」（lib/spots.ts の TOKYO_RESTAURANTS）から選んでいたが、これは店舗の
 * 実在を確かめていないデータで、「レストラン◯◯（△△周辺ほか）」のような場所の定まらない枠が出ていた。
 * 駅を1つ決めて、駅起点と同じ「ホットペッパー掲載の個人店＋公式で実在を確認したチェーン店」から選ぶ。
 * 駅は、午前の行き先の最寄り駅 → 区内の駅（子連れ向き・規模の大きい順）の順に、候補がある最初の駅。
 */
export function resolveWardLunchStation(
  ward: TokyoWard | undefined,
  morningSpot?: Spot,
): { slug: string; name: string } | undefined {
  if (!ward) return undefined;
  const cands: string[] = [];
  if (morningSpot?.nearestStation) {
    const slug = findStationBySlug(morningSpot.nearestStation)
      ? morningSpot.nearestStation
      : resolveStationSlugByName(morningSpot.nearestStation);
    if (slug) cands.push(slug);
  }
  const scaleRank = { terminal: 0, major: 1, minor: 2 } as const;
  for (const st of [...getStationsByWard(ward)].sort(
    (a, b) => Number(b.familyFriendly) - Number(a.familyFriendly) || scaleRank[a.scale] - scaleRank[b.scale],
  )) {
    cands.push(st.slug);
  }
  for (const slug of cands) {
    const st = findStationBySlug(slug);
    if (!st) continue;
    const hasChain = Boolean(
      getVerifiedStores(slug)?.stores.some((x) => Object.values(CHAIN_SPOT_TO_SLUG).includes(x.chain)),
    );
    if (indieLunchCandidates(slug).length || hasChain) return { slug, name: st.name };
  }
  return undefined;
}

function pickLunch(
  areaKey: string,
  regionLabel: string,
  q: OutingQuery,
  variant = 0,
  anchorSlug?: string,
  /** 区起点で、お昼だけ駅を決めて探すときの駅名（指定時は実在未確認の候補へ落とさない） */
  wardLunchStationName?: string,
): { spot: Spot; tier: CoherenceTier; href?: string; moveText?: string } | null {
  const at = <T,>(list: T[]) => list[((variant % list.length) + list.length) % list.length];
  const { ward, chain } = lunchCandidates(areaKey, regionLabel, q, anchorSlug);
  const verified = isStationChainVerified(anchorSlug);
  // 照合済みの駅のチェーンは「この駅の徒歩10分圏に実在する店」なので、駅近の候補として扱える。
  const stationChains = verified ? chain : [];
  type Pick = { spot: Spot; tier: CoherenceTier; href?: string; moveText?: string };
  // 区起点のときは「◯◯駅の近く」と駅名を添える（プランの起点が駅ではないため）
  const near = (text?: string) => (wardLunchStationName ? `${wardLunchStationName}駅の近く${text ? `・${text}` : ''}` : text);
  const chainPick = (sp: Spot): Pick => ({
    spot: sp,
    tier: 'station',
    href: `/station/${anchorSlug}#section-chains`,
    moveText: near(sp.city),
  });
  // ① 駅近の個人店（駅×個人店データ・子連れ設備スコア順）。最初の候補は個人店のまま。
  //    「別の候補」を押したときは、実在を確認した駅近のファミリー向けチェーンと交互に出す。
  const indies = indieLunchCandidates(anchorSlug);
  if (indies.length) {
    const indiePicks: Pick[] = indies.map((r) => ({
      spot: indieToLunchSpot(r),
      tier: 'station',
      href: `/station/${anchorSlug}#section-indies`,
      moveText: near(r.area),
    }));
    const chainPicks = stationChains.slice(0, 6).map(chainPick);
    const mixed: Pick[] = [];
    for (let i = 0; i < Math.max(indiePicks.length, chainPicks.length); i++) {
      if (indiePicks[i]) mixed.push(indiePicks[i]);
      if (chainPicks[i]) mixed.push(chainPicks[i]);
    }
    return at(mixed);
  }
  // ② 駅近に実在を確認したチェーン → ③ 区/市内の実店舗スポット → ④ 全国ファミリー向けチェーン（未照合の駅のみ）
  if (stationChains.length) return chainPick(at(stationChains));
  // 区起点では、実在を確かめていない候補（区内の実店舗スポット・全国チェーンの一般枠）へは落とさない
  if (wardLunchStationName) return null;
  if (ward.length) return { spot: at(ward), tier: 'ward' };
  if (chain.length) return { spot: at(chain), tier: 'chain' };
  return null;
}

/** 午後のおうちミニプラン（休憩・お昼寝考慮）。 */
// 天気・時間帯の条件つきで書かれたプラン（「寒い日の…」「雨の日の…」「…夜は」）
// と、行事・季節が決まっているプラン（「ひな祭り当日…」「ハロウィン…」）。条件の指定が無いときは出さない
const CONDITIONAL_PLAN_TEXT =
  /寒い|冷え|雨の日|雨で|雨天|猛暑|暑い日|真夏|真冬|夜|夕食|寝る前|朝|お風呂|入浴|ひな祭り|ハロウィン|クリスマス|正月|節分|七夕|こどもの日|母の日|父の日|敬老|お月見|花見|お盆|年末|年始|バレンタイン|イースター|誕生日|当日|春|夏|秋|冬/;

function pickHomePlan(q: OutingQuery): PlanMeta | null {
  // 天気の指定が無いとき、天気の条件つきプラン（weather: ['cold'] の「寒い日の入浴優先…」など）を
  // 出さない。pickTopPlan は天気未指定だと天気を絞らないので、条件つきのものが先頭に来ることがあった。
  // 午後の枠なので、夜・朝の段取りを書いたプランも外す。
  if (!q.weather || q.weather === 'any') {
    const general = getAllPlanMetas()
      .filter(
        (p) =>
          p.kind !== 'meal' &&
          p.place.includes('home') &&
          // 年齢の指定が無いときは、1つの年齢だけに向けたプラン（「ハイハイ…」など）を出さない
          (q.age ? p.ageRanges.includes(q.age) : p.ageRanges.length >= 2) &&
          (p.weather.includes('any') || p.weather.length >= 3) &&
          !CONDITIONAL_PLAN_TEXT.test(`${p.title} ${p.shortAnswer}`),
      )
      .sort((a, b) => Math.abs(a.durationMin - 60) - Math.abs(b.durationMin - 60) || a.id.localeCompare(b.id));
    // 合うものが無ければプランを付けず、枠の既定文（お昼寝・休憩）を出す
    return general[0] ?? null;
  }
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
  distanceKm?: number,
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
    // 実距離で「近さ」を表現。〜1.6km=歩いても行ける近さ / それ以上=電車で数分。
    const km = distanceKm;
    const via = viaStationName ? `${viaStationName}駅` : '近く';
    if (km != null && km <= 1.6) {
      return { text: `${via}まで歩いてすぐ（約${km.toFixed(1)}km）`, tier };
    }
    if (km != null) {
      return { text: `${via}へ電車で数分（約${km.toFixed(1)}km）`, tier };
    }
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
      // saichi(埼玉/千葉)・kansai(大阪/京都/兵庫)は regionLabel が県/府単位で粗いので、
      // 駅の area(市区・地区=梅田/難波等)を使う。
      regionLabel = st.region === 'saichi' || st.region === 'kansai' ? st.area : st.regionLabel;
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
  const morning = pickSpotWithWeather(stationSlug, areaKey, regionLabel, q, used, q.morningVariant ?? 0, anchorStation);
  if (morning) {
    used.add(morning.spot.name);
    slots.push({
      key: 'morning',
      label: '午前 あそぶ',
      time: '10:30',
      icon: 'sunny',
      kind: 'spot',
      spot: morning.spot,
      spotSlug: spotToSlug(morning.spot, slugArea),
      hoursLine: spotHoursLine(morning.spot.name) ?? undefined,
      move: moveTextForSpot(morning.tier, stationName, regionLabel, morning.spot, morning.walkMinutes, morning.viaStationName, morning.distanceKm),
      tier: morning.tier,
    });
  }

  // ---- お昼: たべる ----
  // 区起点（駅の指定なし）は、午前の行き先の最寄り駅か区内の駅を1つ決めて、その駅の実在店から選ぶ
  const wardLunchStation = stationSlug ? undefined : resolveWardLunchStation(q.ward, morning?.spot);
  const lunch = wardLunchStation
    ? pickLunch(areaKey, regionLabel, q, q.lunchVariant ?? 0, wardLunchStation.slug, wardLunchStation.name)
    : pickLunch(areaKey, regionLabel, q, q.lunchVariant ?? 0, stationSlug);
  if (lunch) {
    used.add(lunch.spot.name);
    slots.push({
      key: 'lunch',
      label: 'お昼 たべる',
      time: '12:00',
      icon: 'lunch',
      kind: 'restaurant',
      spot: lunch.spot,
      // 個人店は /station の個人店セクションへ（/spot ページを持たない）
      href: lunch.href,
      // チェーンは TOKYO_RESTAURANTS（area='tokyo'）、地域店は areaKey で登録
      spotSlug: lunch.href
        ? undefined
        : spotToSlug(lunch.spot, lunch.tier === 'chain' ? 'tokyo' : slugArea),
      facets: facetsOf(lunch.spot),
      move: {
        // 「徒歩圏」は同駅のときだけ。区/市は広い場合があるので断定しない。
        text:
          lunch.moveText ??
          (lunch.tier === 'ward' ? `${regionLabel}内` : '周辺のファミリー向けチェーン'),
        tier: lunch.tier,
      },
      tier: lunch.tier,
    });
  }

  // ---- 午後: 軽め（0-1歳は休憩優先でおうちへ） ----
  const preferHome = q.age === '0-1';
  let afternoon:
    | { spot: Spot; tier: CoherenceTier; walkMinutes?: number; viaStationName?: string; distanceKm?: number }
    | null = null;
  if (!preferHome) {
    afternoon = pickSpotWithWeather(stationSlug, areaKey, regionLabel, q, used, q.afternoonVariant ?? 0, anchorStation);
  }
  if (afternoon) {
    used.add(afternoon.spot.name);
    slots.push({
      key: 'afternoon',
      label: '午後 つづき',
      time: '13:30',
      icon: 'toy',
      kind: 'spot',
      spot: afternoon.spot,
      spotSlug: spotToSlug(afternoon.spot, slugArea),
      hoursLine: spotHoursLine(afternoon.spot.name) ?? undefined,
      move: moveTextForSpot(afternoon.tier, stationName, regionLabel, afternoon.spot, afternoon.walkMinutes, afternoon.viaStationName, afternoon.distanceKm),
      tier: afternoon.tier,
    });
  } else {
    const home = pickHomePlan(q);
    slots.push({
      key: 'afternoon',
      label: preferHome ? '午後 おうちで休憩' : '午後 おうちで',
      time: '13:30',
      icon: 'home',
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
    lunchStation: wardLunchStation,
    slots,
    coverage,
  };
}
