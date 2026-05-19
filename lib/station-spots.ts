/**
 * 駅周辺のスポットを取得するロジック。
 *
 * 駅×スポット系条件ページ（asobiba / kouen / ame-asobiba）で使用。
 *
 * 解決順序:
 *   1. nearestStation が完全一致するスポット（高精度）
 *   2. 同じ ward に属するスポット（フォールバック、東京23区のみ）
 *   3. 結果が0件なら空配列
 *
 * SPOTS 内の ward は日本語ラベル（例: '世田谷区'）、Tokyo の station.ward は
 * 英語slug（例: 'setagaya'）なので WARD_NAMES でマッピングする。
 */

import { SPOTS, type Spot } from './spots';
import { findStationBySlug } from './all-stations';
import { WARD_NAMES, type TokyoWard } from './tokyo-stations';
import type { StationConditionSlug } from './station-conditions';

/** 同ward内のスポットをすべて拾う。東京以外は station.ward が無いので空。 */
function getSpotsByWard(stationSlug: string): Spot[] {
  const station = findStationBySlug(stationSlug);
  if (!station || station.region !== 'tokyo') return [];
  const wardName = WARD_NAMES[station.ward as TokyoWard];
  if (!wardName) return [];
  const result: Spot[] = [];
  for (const list of Object.values(SPOTS)) {
    if (!list) continue;
    for (const s of list) {
      if (s.ward === wardName) result.push(s);
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
  // ward フォールバック。byStation で拾えたものは除外
  const stationNames = new Set(byStation.map((s) => s.name));
  const byWard = getSpotsByWard(stationSlug).filter((s) => !stationNames.has(s.name));
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
