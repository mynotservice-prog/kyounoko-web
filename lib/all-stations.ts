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
import {
  KANAGAWA_STATIONS,
  KANAGAWA_CITY_NAMES,
  KANAGAWA_CITY_LABEL,
  type KanagawaStation,
  type KanagawaCity,
} from './kanagawa-stations';
import {
  SAICHI_STATIONS,
  SAICHI_PREFECTURE_NAMES,
  SAICHI_PREFECTURE_LABEL,
  type SaiChiStation,
  type SaiChiPrefecture,
} from './saitama-chiba-stations';

export type StationRegion = 'tokyo' | 'kansai' | 'kanagawa' | 'saichi';

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

export type KanagawaAnyStation = KanagawaStation & {
  region: 'kanagawa';
  /** 表示用のエリアラベル（市名） */
  regionLabel: string;
};

export type SaiChiAnyStation = SaiChiStation & {
  region: 'saichi';
  /** 表示用のエリアラベル（県名） */
  regionLabel: string;
};

export type AnyStation = TokyoAnyStation | KansaiAnyStation | KanagawaAnyStation | SaiChiAnyStation;

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

function toKanagawaAny(s: KanagawaStation): KanagawaAnyStation {
  return {
    ...s,
    region: 'kanagawa',
    regionLabel: KANAGAWA_CITY_NAMES[s.city],
  };
}

function toSaiChiAny(s: SaiChiStation): SaiChiAnyStation {
  return {
    ...s,
    region: 'saichi',
    regionLabel: SAICHI_PREFECTURE_NAMES[s.prefecture],
  };
}

/**
 * 全駅（東京+関西+神奈川+埼玉/千葉）を返す。
 */
export function getAllStations(): AnyStation[] {
  return [
    ...TOKYO_STATIONS.map(toTokyoAny),
    ...KANSAI_STATIONS.map(toKansaiAny),
    ...KANAGAWA_STATIONS.map(toKanagawaAny),
    ...SAICHI_STATIONS.map(toSaiChiAny),
  ];
}

/**
 * slug から駅を検索（東京・関西・神奈川・埼玉/千葉を横断）。
 */
export function findStationBySlug(slug: string): AnyStation | undefined {
  const tokyo = TOKYO_STATIONS.find((s) => s.slug === slug);
  if (tokyo) return toTokyoAny(tokyo);
  const kansai = KANSAI_STATIONS.find((s) => s.slug === slug);
  if (kansai) return toKansaiAny(kansai);
  const kanagawa = KANAGAWA_STATIONS.find((s) => s.slug === slug);
  if (kanagawa) return toKanagawaAny(kanagawa);
  const saichi = SAICHI_STATIONS.find((s) => s.slug === slug);
  if (saichi) return toSaiChiAny(saichi);
  return undefined;
}

/**
 * 同じエリアの他駅を返す。
 * - 東京: 同じ ward
 * - 関西: 同じ prefecture
 * - 神奈川: 同じ city
 * - 埼玉/千葉: 同じ prefecture
 */
export function getSameAreaStations(station: AnyStation, limit = 12): AnyStation[] {
  if (station.region === 'tokyo') {
    return TOKYO_STATIONS
      .filter((s) => s.ward === station.ward && s.slug !== station.slug)
      .slice(0, limit)
      .map(toTokyoAny);
  }
  if (station.region === 'kansai') {
    return KANSAI_STATIONS
      .filter((s) => s.prefecture === station.prefecture && s.slug !== station.slug)
      .slice(0, limit)
      .map(toKansaiAny);
  }
  if (station.region === 'kanagawa') {
    return KANAGAWA_STATIONS
      .filter((s) => s.city === station.city && s.slug !== station.slug)
      .slice(0, limit)
      .map(toKanagawaAny);
  }
  return SAICHI_STATIONS
    .filter((s) => s.prefecture === station.prefecture && s.slug !== station.slug)
    .slice(0, limit)
    .map(toSaiChiAny);
}

export {
  WARD_NAMES,
  PREFECTURE_NAMES,
  PREFECTURE_REGION_LABEL,
  KANAGAWA_CITY_NAMES,
  KANAGAWA_CITY_LABEL,
  SAICHI_PREFECTURE_NAMES,
  SAICHI_PREFECTURE_LABEL,
};
export type { TokyoWard, KansaiPrefecture, KanagawaCity, SaiChiPrefecture };
