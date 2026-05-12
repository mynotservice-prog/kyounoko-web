/**
 * 東京（lib/tokyo-stations.ts）と関西（lib/kansai-stations.ts）の駅マスタを
 * 統合して扱うための薄いアダプタ。
 *
 * 方針:
 * - 既存の TOKYO_STATIONS / KANSAI_STATIONS は変更しない
 * - region で東京と関西を判別できる discriminated union を提供
 * - 駅ページ・サイトマップ・全駅一覧などから統一して参照
 */

import {
  TOKYO_STATIONS,
  WARD_NAMES,
  type TokyoStation,
  type TokyoWard,
} from './tokyo-stations';
import {
  KANSAI_STATIONS,
  PREFECTURE_NAMES,
  PREFECTURE_REGION_LABEL,
  type KansaiStation,
  type KansaiPrefecture,
} from './kansai-stations';

export type StationRegion = 'tokyo' | 'kansai';

export type TokyoAnyStation = TokyoStation & {
  region: 'tokyo';
  /** 表示用のエリアラベル（区名） */
  regionLabel: string;
};

export type KansaiAnyStation = KansaiStation & {
  region: 'kansai';
  /** 表示用のエリアラベル（府/県名） */
  regionLabel: string;
};

export type AnyStation = TokyoAnyStation | KansaiAnyStation;

function toTokyoAny(s: TokyoStation): TokyoAnyStation {
  return {
    ...s,
    region: 'tokyo',
    regionLabel: WARD_NAMES[s.ward] ?? '',
  };
}

function toKansaiAny(s: KansaiStation): KansaiAnyStation {
  return {
    ...s,
    region: 'kansai',
    regionLabel: PREFECTURE_NAMES[s.prefecture],
  };
}

/**
 * 全駅（東京+関西）を返す。
 */
export function getAllStations(): AnyStation[] {
  return [
    ...TOKYO_STATIONS.map(toTokyoAny),
    ...KANSAI_STATIONS.map(toKansaiAny),
  ];
}

/**
 * slug から駅を検索（東京・関西を横断）。
 */
export function findStationBySlug(slug: string): AnyStation | undefined {
  const tokyo = TOKYO_STATIONS.find((s) => s.slug === slug);
  if (tokyo) return toTokyoAny(tokyo);
  const kansai = KANSAI_STATIONS.find((s) => s.slug === slug);
  if (kansai) return toKansaiAny(kansai);
  return undefined;
}

/**
 * 同じエリアの他駅（東京なら同じ ward、関西なら同じ prefecture）を返す。
 */
export function getSameAreaStations(station: AnyStation, limit = 12): AnyStation[] {
  if (station.region === 'tokyo') {
    return TOKYO_STATIONS
      .filter((s) => s.ward === station.ward && s.slug !== station.slug)
      .slice(0, limit)
      .map(toTokyoAny);
  }
  return KANSAI_STATIONS
    .filter((s) => s.prefecture === station.prefecture && s.slug !== station.slug)
    .slice(0, limit)
    .map(toKansaiAny);
}

export { WARD_NAMES, PREFECTURE_NAMES, PREFECTURE_REGION_LABEL };
export type { TokyoWard, KansaiPrefecture };
