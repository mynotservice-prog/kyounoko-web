/**
 * 駅周辺のスポットを取得するロジック。
 *
 * 駅×スポット系条件ページ（asobiba / kouen / ame-asobiba）で使用。
 *
 * 解決順序:
 *   1. nearestStation が完全一致するスポット（高精度）
 *   2. 同じ地域（Tokyo:ward / Kanagawa:city / Kansai/Saichi:prefecture）に属するスポット
 *
 * SPOTS 内の city/ward は日本語ラベル（例: '世田谷区' / '横浜市' / '大阪市'）、
 * station 側は英語slug（例: 'setagaya' / 'yokohama' / 'osaka'）なので、
 * 各地域のマッパー経由で照合する。
 */

import { SPOTS, type Spot } from './spots';
import { findStationBySlug, getAllStations } from './all-stations';
import { WARD_NAMES, type TokyoWard } from './tokyo-stations';
import { KANAGAWA_CITY_NAMES, type KanagawaCity } from './kanagawa-stations';
import { PREFECTURE_NAMES, type KansaiPrefecture } from './kansai-stations';
import { SAICHI_PREFECTURE_NAMES, type SaiChiPrefecture } from './saitama-chiba-stations';
import { STATION_CONDITIONS, getConditionKind, type StationConditionSlug } from './station-conditions';

/**
 * 同じ地域に属するスポットをすべて拾う。
 * Tokyo: spot.ward === station の WARD_NAMES[ward]
 * Kanagawa: spot.city === KANAGAWA_CITY_NAMES[station.city]
 * Kansai: spot.city が 大阪市/京都市/神戸市 など、prefecture から推測
 * Saichi: 同様
 *
 * 完全な精度より「同区/同市の代表的スポットを表示する」ことを優先。
 */
function getSpotsByRegion(stationSlug: string): Spot[] {
  const station = findStationBySlug(stationSlug);
  if (!station) return [];
  // 対象ラベルセット
  const targetLabels = new Set<string>();
  if (station.region === 'tokyo') {
    const name = WARD_NAMES[station.ward as TokyoWard];
    if (name) targetLabels.add(name);
  } else if (station.region === 'kanagawa') {
    const name = KANAGAWA_CITY_NAMES[station.city as KanagawaCity];
    if (name) targetLabels.add(name);
  } else if (station.region === 'kansai') {
    // 大阪府の駅 → spots の city が '大阪市' のもの。同様に京都府 → '京都市'、兵庫県 → '神戸市'
    const pref = PREFECTURE_NAMES[station.prefecture as KansaiPrefecture];
    if (pref === '大阪府') {
      targetLabels.add('大阪市');
      targetLabels.add('大阪府');
    } else if (pref === '京都府') {
      targetLabels.add('京都市');
      targetLabels.add('京都府');
    } else if (pref === '兵庫県') {
      targetLabels.add('神戸市');
      targetLabels.add('兵庫県');
    } else if (pref === '奈良県') {
      targetLabels.add('奈良市');
      targetLabels.add('奈良県');
    } else if (pref === '滋賀県') {
      targetLabels.add('大津市');
      targetLabels.add('滋賀県');
    } else if (pref === '和歌山県') {
      targetLabels.add('和歌山市');
      targetLabels.add('和歌山県');
    }
  } else if (station.region === 'saichi') {
    const pref = SAICHI_PREFECTURE_NAMES[station.prefecture as SaiChiPrefecture];
    if (pref === '埼玉県') {
      targetLabels.add('さいたま市');
      targetLabels.add('埼玉県');
      targetLabels.add('川越市');
    } else if (pref === '千葉県') {
      targetLabels.add('千葉市');
      targetLabels.add('千葉県');
      targetLabels.add('浦安市');
    }
  }
  if (targetLabels.size === 0) return [];
  const result: Spot[] = [];
  for (const list of Object.values(SPOTS)) {
    if (!list) continue;
    for (const s of list) {
      if ((s.ward && targetLabels.has(s.ward)) || (s.city && targetLabels.has(s.city))) {
        result.push(s);
      }
    }
  }
  return result;
}

/**
 * 駅周辺のスポットを高精度→フォールバックの順で取得する。
 */
export function getSpotsForStation(stationSlug: string): {
  byStation: Spot[];
  byWard: Spot[];
  all: Spot[];
} {
  const byStation: Spot[] = [];
  for (const list of Object.values(SPOTS)) {
    if (!list) continue;
    for (const s of list) {
      if (s.nearestStation === stationSlug) byStation.push(s);
    }
  }
  // 地域フォールバック。byStation で拾えたものは除外
  const stationNames = new Set(byStation.map((s) => s.name));
  const byWard = getSpotsByRegion(stationSlug).filter((s) => !stationNames.has(s.name));
  return {
    byStation,
    byWard,
    all: [...byStation, ...byWard],
  };
}

/** スポットを条件でフィルタする。 */
export function filterSpotsByCondition(
  spots: readonly Spot[],
  condition: StationConditionSlug,
): Spot[] {
  switch (condition) {
    case 'asobiba':
      // 室内遊び場・動物園・水族館・科学館・遊園地・キッズスペース
      return spots.filter((s) =>
        s.category === 'indoor' ||
        s.category === 'zoo' ||
        s.category === 'aquarium' ||
        s.category === 'museum' ||
        s.category === 'amusement',
      );
    case 'kouen':
      return spots.filter((s) => s.category === 'park');
    case 'ame-asobiba':
      // 屋内のみ。雨でも遊べる場所
      return spots.filter((s) =>
        s.place === 'indoor' || s.summerCool === true,
      );
    default:
      return [];
  }
}

/** スポット系条件のページが「該当スポットを持つか」を判定。 */
export function hasMatchingSpots(
  spots: readonly Spot[],
  condition: StationConditionSlug,
): boolean {
  return filterSpotsByCondition(spots, condition).length > 0;
}

/**
 * 駅×スポット条件ページの正規URL（canonical）に使う駅slugを返す。
 *
 * 背景: スポットは区市町村単位でタグ付けされており、駅固有スポット（byStation）を
 * 持たない駅は「同区フォールバック」で同区の全駅が同一のスポット集合を表示する＝
 * 重複コンテンツになる。AdSense「有用性の低いコンテンツ」/ 重複対策として、
 * 同区×同条件の重複グループは代表1駅に canonical を集約する（ページ自体は残す）。
 *
 * - 駅固有スポットを持つ駅、3件未満の駅 → 自分自身（重複ではない）
 * - 同区フォールバックのみの駅 → そのグループ（同region・同regionLabel・同条件で
 *   3件以上かつ駅固有なし）の中で slug 辞書順が最小の駅を代表とする（決定的）
 */
let _spotConditionCanonicalCache: Map<string, string> | null = null;

function buildSpotConditionCanonicalCache(): Map<string, string> {
  const cache = new Map<string, string>();
  // グループキー（region|regionLabel|condition）→ フォールバックのみ駅slug一覧
  const groups = new Map<string, string[]>();
  const spotConds = STATION_CONDITIONS.filter((c) => getConditionKind(c.slug) === 'spot');

  for (const st of getAllStations()) {
    const { byStation, all } = getSpotsForStation(st.slug);
    for (const cond of spotConds) {
      const matched = filterSpotsByCondition(all, cond.slug);
      if (matched.length < 3) continue; // 生成・index対象外
      const own = filterSpotsByCondition(byStation, cond.slug);
      if (own.length > 0) continue; // 駅固有あり＝重複ではない（自己canonical）
      const key = `${st.region}|${st.regionLabel}|${cond.slug}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(st.slug);
    }
  }

  for (const [key, slugs] of groups) {
    const cond = key.split('|')[2];
    const rep = slugs.slice().sort()[0]; // 決定的な代表（slug辞書順 最小）
    for (const slug of slugs) {
      cache.set(`${slug}|${cond}`, rep);
    }
  }
  return cache;
}

export function getSpotConditionCanonicalSlug(
  stationSlug: string,
  condition: StationConditionSlug,
): string {
  if (!_spotConditionCanonicalCache) {
    _spotConditionCanonicalCache = buildSpotConditionCanonicalCache();
  }
  return _spotConditionCanonicalCache.get(`${stationSlug}|${condition}`) ?? stationSlug;
}
