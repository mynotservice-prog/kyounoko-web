/**
 * /data/* 配下のデータ集約ページ用ヘルパ。
 * チェーン店・個人店・路線・駅の各データソースを横断して集計する。
 *
 * AIO/GEO 最適化（生成AIの引用元になりやすい構造化済みオープンデータ）として、
 * 23区の子連れOK店データを「データセット」形式で配信するための集計関数群。
 */

import {
  TOKYO_STATIONS,
  WARD_NAMES,
  type TokyoStation,
  type TokyoWard,
} from './tokyo-stations';
import {
  CHAINS,
  CHAIN_BY_SLUG,
  STATION_CHAIN_MAPPING,
  CHAIN_CATEGORY_LABEL,
  type Chain,
  type ChainCategory,
  type SeatingType,
} from './station-restaurants';
import {
  STATION_INDIE_MAP,
  getAllIndieRestaurants,
  isHotpepperStation,
  HOTPEPPER_GENERATED_AT,
  INDIE_GENRE_LABEL,
  type IndieRestaurant,
  type IndieGenre,
} from './indie-restaurants';
import { TOKYO_LINES, getStationsOnLine, type TokyoLine } from './tokyo-lines';

/** 生成AIが引用しやすい単一データレコード（駅×店舗の最小単位）。 */
export type DataRow = {
  /** 駅slug+店名から生成した一意ID。 */
  id: string;
  /** 店名。 */
  name: string;
  /** 最寄り駅（日本語、例: 渋谷）。 */
  station: string;
  /** 駅slug。 */
  stationSlug: string;
  /** 区（日本語、例: 渋谷区）。 */
  ward: string;
  /** 区ID。 */
  wardId: TokyoWard;
  /** カテゴリ／ジャンル日本語ラベル。 */
  category: string;
  /** チェーンか個人店か。 */
  type: 'chain' | 'indie';
  /** ベビーカー受け入れ度（'good' | 'ok' | 'limited' | 'unknown'）。 */
  stroller: 'good' | 'ok' | 'limited' | 'unknown';
  /** キッズメニュー有無。 */
  kidsMenu: boolean;
  /** 個室・座敷あり。 */
  privateRoom: boolean;
  /** キッズチェア（高さ調整できる子供用椅子）あり。 */
  kidsChair: boolean;
  /** 子供用スプーン・フォーク・取り皿の提供あり。 */
  kidsCutlery: boolean;
  /** 店内にキッズスペース・遊び場あり。 */
  kidsSpace: boolean;
  /** ランチ価格帯（表記ゆれを許容、文字列）。 */
  priceRange: string;
  // ===== 子連れ目線フィールド（v6 追加、個人店は当面 undefined）=====
  /** 入口・店内に段差なし（ベビーカーそのまま入店可） */
  stepFree?: boolean;
  /** 用意のある席タイプ */
  seatingType?: SeatingType[];
  /** おむつ替え台あり */
  diaperChangingTable?: boolean;
  /** 授乳室・授乳スペースあり */
  nursingRoom?: boolean;
  /** 離乳食持ち込みOK（公式に明記） */
  bringBabyFood?: boolean;
  /** 取り分け前提のメニュー */
  shareDish?: boolean;
  /** ベビーカーで席まで（たたまずに済む通路幅） */
  strollerToSeat?: boolean;
  /** アレルゲン表示あり */
  allergenInfo?: boolean;
};

/** 簡易ハッシュ（id衝突回避用、決定的）。 */
function shortHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36).slice(0, 6);
}

/** 駅slugと店名から一意ID生成。 */
export function makeRowId(stationSlug: string, name: string, type: 'chain' | 'indie'): string {
  return `${type}-${stationSlug}-${shortHash(name)}`;
}

/**
 * 23区全駅×全チェーン×全個人店をフラット化した配列。
 * Dataset 配信・CSV化の元データ。
 */
export function buildAllDataRows(): DataRow[] {
  const rows: DataRow[] = [];

  // チェーン店: STATION_CHAIN_MAPPING を駅×チェーンで展開
  for (const station of TOKYO_STATIONS) {
    const chainSlugs = STATION_CHAIN_MAPPING[station.slug] ?? [];
    for (const chainSlug of chainSlugs) {
      const chain = CHAIN_BY_SLUG.get(chainSlug);
      if (!chain) continue;
      rows.push({
        id: makeRowId(station.slug, chain.slug, 'chain'),
        name: chain.name,
        station: station.name,
        stationSlug: station.slug,
        ward: WARD_NAMES[station.ward],
        wardId: station.ward,
        category: CHAIN_CATEGORY_LABEL[chain.category],
        type: 'chain',
        stroller: chain.stroller,
        kidsMenu: chain.kidsMenu,
        privateRoom: chain.privateRoom,
        kidsChair: chain.babyChair === true,
        // チェーン店ヒューリスティック: キッズメニューあり = カトラリー提供ありが標準
        kidsCutlery: chain.kidsCutlery ?? chain.kidsMenu === true,
        kidsSpace: chain.kidsSpace === true,
        priceRange: chain.lunchPrice,
        stepFree: chain.stepFree,
        seatingType: chain.seatingType,
        diaperChangingTable: chain.diaperChangingTable,
        nursingRoom: chain.nursingRoom,
        bringBabyFood: chain.bringBabyFood,
        shareDish: chain.shareDish,
        strollerToSeat: chain.strollerToSeat,
        allergenInfo: chain.allergenInfo,
      });
    }
  }

  // 個人店: STATION_INDIE_MAP を展開
  for (const indieFlat of getAllIndieRestaurants()) {
    const station = TOKYO_STATIONS.find((s) => s.slug === indieFlat.stationSlug);
    if (!station) continue;
    rows.push({
      id: makeRowId(station.slug, indieFlat.name, 'indie'),
      name: indieFlat.name,
      station: station.name,
      stationSlug: station.slug,
      ward: WARD_NAMES[station.ward],
      wardId: station.ward,
      category: INDIE_GENRE_LABEL[indieFlat.genre],
      type: 'indie',
      stroller: indieFlat.strollerOk ? 'good' : 'unknown',
      kidsMenu: indieFlat.kidsMenu === true,
      privateRoom: indieFlat.privateRoom === true,
      kidsChair: indieFlat.kidsChair === true,
      kidsCutlery: indieFlat.kidsCutlery === true,
      kidsSpace: indieFlat.kidsSpace === true,
      priceRange: indieFlat.priceLunch ?? '',
      // v6: 個人店も推論済み8項目を反映
      stepFree: indieFlat.stepFree,
      seatingType: indieFlat.seatingType as SeatingType[] | undefined,
      diaperChangingTable: indieFlat.diaperChangingTable,
      nursingRoom: indieFlat.nursingRoom,
      bringBabyFood: indieFlat.bringBabyFood,
      shareDish: indieFlat.shareDish,
      strollerToSeat: indieFlat.strollerToSeat,
      allergenInfo: indieFlat.allergenInfo,
    });
  }

  return rows;
}

/** 区別の集計メトリクス。 */
export type WardMetrics = {
  wardId: TokyoWard;
  wardName: string;
  /** 区内駅数。 */
  stationCount: number;
  /** チェーン店レコード総数（駅×チェーン）。 */
  chainCount: number;
  /** 個人店件数。 */
  indieCount: number;
  /** 全店舗（チェーン+個人）。 */
  totalCount: number;
  /** ベビーカー◎店比率（0-1）。 */
  strollerGoodRatio: number;
  /** 個室あり店比率。 */
  privateRoomRatio: number;
  /** キッズメニューあり店比率。 */
  kidsMenuRatio: number;
  /** 子連れ歓迎度総合スコア（3指標の平均）。 */
  familyScore: number;
};

/** 全23区の比較メトリクスを計算。 */
export function buildWardMetrics(): WardMetrics[] {
  const rows = buildAllDataRows();
  const wardIds = Object.keys(WARD_NAMES) as TokyoWard[];

  return wardIds.map((wardId): WardMetrics => {
    const wardRows = rows.filter((r) => r.wardId === wardId);
    const stationCount = TOKYO_STATIONS.filter((s) => s.ward === wardId).length;
    const chainCount = wardRows.filter((r) => r.type === 'chain').length;
    const indieCount = wardRows.filter((r) => r.type === 'indie').length;
    const totalCount = wardRows.length;
    const strollerGood = wardRows.filter((r) => r.stroller === 'good').length;
    const privateRoom = wardRows.filter((r) => r.privateRoom).length;
    const kidsMenu = wardRows.filter((r) => r.kidsMenu).length;
    const strollerGoodRatio = totalCount === 0 ? 0 : strollerGood / totalCount;
    const privateRoomRatio = totalCount === 0 ? 0 : privateRoom / totalCount;
    const kidsMenuRatio = totalCount === 0 ? 0 : kidsMenu / totalCount;
    const familyScore = (strollerGoodRatio + privateRoomRatio + kidsMenuRatio) / 3;
    return {
      wardId,
      wardName: WARD_NAMES[wardId],
      stationCount,
      chainCount,
      indieCount,
      totalCount,
      strollerGoodRatio,
      privateRoomRatio,
      kidsMenuRatio,
      familyScore,
    };
  });
}

/** 路線別の集計メトリクス。 */
export type LineMetrics = {
  line: TokyoLine;
  stationCount: number;
  /** 沿線のチェーン店レコード総数。 */
  chainCount: number;
  /** 沿線の個人店件数。 */
  indieCount: number;
  /** 沿線の総店舗数（チェーン+個人）。 */
  totalCount: number;
};

/** 全路線の比較メトリクスを計算。 */
export function buildLineMetrics(): LineMetrics[] {
  const indieFlat = getAllIndieRestaurants();
  return TOKYO_LINES.map((line): LineMetrics => {
    const stations = getStationsOnLine(line);
    const stationSlugs = new Set(stations.map((s) => s.slug));
    let chainCount = 0;
    for (const slug of stationSlugs) {
      chainCount += (STATION_CHAIN_MAPPING[slug] ?? []).length;
    }
    const indieCount = indieFlat.filter((r) => stationSlugs.has(r.stationSlug)).length;
    return {
      line,
      stationCount: stations.length,
      chainCount,
      indieCount,
      totalCount: chainCount + indieCount,
    };
  });
}

/**
 * データセット全体のサマリ（h1直下表示用）。
 *
 * **件数は、/data/restaurants の表の行（buildAllDataRows）そのものから数える。**
 * 2026-10 まで indieCount は「全駅の店数」（東京23区の外の駅も含む 3,718）を返していて、
 * 表（東京23区の駅に紐づく行だけ＝2,944）と合わず、「個人店3,718店」「7,580店舗」と表示していた。
 */
export type DataSummary = {
  stationCount: number;
  wardCount: number;
  /** チェーンのデータベースにあるブランド数（表に出ないブランドも含む）。 */
  chainBrandCount: number;
  /** 表に出ているチェーンのブランド数。 */
  chainBrandInTableCount: number;
  /** 表のチェーンの行数（駅×チェーンの組み合わせ）。 */
  chainRecordCount: number;
  /** 表の「駅近の子連れOK店」の行数（東京23区の駅に紐づく店だけ）。 */
  indieCount: number;
  /** 上の店がある駅の数。 */
  indieStationCount: number;
  /** 上の店の出どころ。hotpepper = ホットペッパーグルメの店舗掲載情報、other = それ以外。 */
  indieSource: { hotpepperCount: number; otherCount: number; hotpepperGeneratedAt: string };
  lineCount: number;
  /** 表の行数（チェーンの行＋駅近の子連れOK店の行）。 */
  totalRecordCount: number;
};

export function getDataSummary(): DataSummary {
  const rows = buildAllDataRows();
  const chainRows = rows.filter((r) => r.type === 'chain');
  const indieRows = rows.filter((r) => r.type === 'indie');
  const hotpepperCount = indieRows.filter((r) => isHotpepperStation(r.stationSlug)).length;
  return {
    stationCount: TOKYO_STATIONS.length,
    wardCount: Object.keys(WARD_NAMES).length,
    chainBrandCount: CHAINS.length,
    chainBrandInTableCount: new Set(chainRows.map((r) => r.name)).size,
    chainRecordCount: chainRows.length,
    indieCount: indieRows.length,
    indieStationCount: new Set(indieRows.map((r) => r.stationSlug)).size,
    indieSource: { hotpepperCount, otherCount: indieRows.length - hotpepperCount, hotpepperGeneratedAt: HOTPEPPER_GENERATED_AT },
    lineCount: TOKYO_LINES.length,
    totalRecordCount: rows.length,
  };
}

/**
 * 「駅近の子連れOK店」の出どころの説明。駅ページ（app/station/[slug]/page.tsx）の表記に合わせる。
 * ホットペッパー以外の行が混じったときは、その件数も書く（出どころを 1 つに丸めない）。
 */
export function indieSourceNote(s: DataSummary): string {
  const hp =
    `ホットペッパーグルメの店舗掲載情報（${s.indieSource.hotpepperGeneratedAt}取得）で「お子様連れOK・歓迎」かつランチ営業ありと掲載されていた店`;
  if (s.indieSource.otherCount === 0) return hp;
  return `うち${s.indieSource.hotpepperCount.toLocaleString()}店は${hp}。残り${s.indieSource.otherCount.toLocaleString()}店は施設の公式ショップリストで営業を確認した店`;
}

// 再エクスポート（page.tsxから一括import用）
export { CHAIN_CATEGORY_LABEL, INDIE_GENRE_LABEL };
export type { Chain, ChainCategory, SeatingType, IndieRestaurant, IndieGenre, TokyoStation, TokyoWard };
