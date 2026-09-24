/**
 * 全駅の個人店マッピング統合エントリ。
 * chunk-1〜19（東京）と chunk-kansai（関西）を結合して
 * 全駅から参照できる単一の StationIndieMap を提供する。
 */

import { CHUNK_1 } from './chunk-1';
import { CHUNK_2 } from './chunk-2';
import { CHUNK_3 } from './chunk-3';
import { CHUNK_4 } from './chunk-4';
import { CHUNK_5 } from './chunk-5';
import { CHUNK_6 } from './chunk-6';
import { CHUNK_7 } from './chunk-7';
import { CHUNK_8 } from './chunk-8';
import { CHUNK_9 } from './chunk-9';
import { CHUNK_10 } from './chunk-10';
import { CHUNK_11 } from './chunk-11';
import { CHUNK_12 } from './chunk-12';
import { CHUNK_13 } from './chunk-13';
import { CHUNK_14 } from './chunk-14';
import { CHUNK_15 } from './chunk-15';
import { CHUNK_16 } from './chunk-16';
import { CHUNK_17 } from './chunk-17';
import { CHUNK_18 } from './chunk-18';
import { CHUNK_19 } from './chunk-19';
import { CHUNK_20 } from './chunk-20';
import { CHUNK_21 } from './chunk-21';
import { CHUNK_22 } from './chunk-22';
import { CHUNK_23 } from './chunk-23';
import { CHUNK_24 } from './chunk-24';
import { CHUNK_25 } from './chunk-25';
import { CHUNK_26 } from './chunk-26';
import { CHUNK_27 } from './chunk-27';
import { CHUNK_28 } from './chunk-28';
import { CHUNK_29 } from './chunk-29';
import { CHUNK_30 } from './chunk-30';
import { CHUNK_31 } from './chunk-31';
import { CHUNK_32 } from './chunk-32';
import { CHUNK_33 } from './chunk-33';
import { CHUNK_34 } from './chunk-34';
import { CHUNK_35 } from './chunk-35';
import { CHUNK_36 } from './chunk-36';
import { CHUNK_37 } from './chunk-37';
import { CHUNK_38 } from './chunk-38';
import { CHUNK_39 } from './chunk-39';
import { CHUNK_40 } from './chunk-40';
import { CHUNK_KANSAI } from './chunk-kansai';
import { CHUNK_41 } from './chunk-41';
import { CHUNK_42 } from './chunk-42';
import { CHUNK_43 } from './chunk-43';
import HOTPEPPER from './hotpepper.json';
import type { StationIndieMap, IndieRestaurant, IndieGenre } from './types';

export type { IndieRestaurant, IndieGenre, StationIndieMap } from './types';

/**
 * chunk-6 は既存駅への追加店舗を含む。マージ時に既存配列に対して重複なく concat する。
 */
function mergeIndieMaps(...maps: StationIndieMap[]): StationIndieMap {
  const result: StationIndieMap = {};
  for (const map of maps) {
    for (const [slug, list] of Object.entries(map)) {
      if (result[slug]) {
        result[slug] = [...result[slug], ...list];
      } else {
        result[slug] = [...list];
      }
    }
  }
  return result;
}

export const STATION_INDIE_MAP: StationIndieMap = mergeIndieMaps(
  CHUNK_1,
  CHUNK_2,
  CHUNK_3,
  CHUNK_4,
  CHUNK_5,
  CHUNK_6,
  CHUNK_7,
  CHUNK_8,
  CHUNK_9,
  CHUNK_10,
  CHUNK_11,
  CHUNK_12,
  CHUNK_13,
  CHUNK_14,
  CHUNK_15,
  CHUNK_16,
  CHUNK_17,
  CHUNK_18,
  CHUNK_19,
  CHUNK_20,
  CHUNK_21,
  CHUNK_22,
  CHUNK_23,
  CHUNK_24,
  CHUNK_25,
  CHUNK_26,
  CHUNK_27,
  CHUNK_28,
  CHUNK_29,
  CHUNK_30,
  CHUNK_31,
  CHUNK_32,
  CHUNK_33,
  CHUNK_34,
  CHUNK_35,
  CHUNK_36,
  CHUNK_37,
  CHUNK_38,
  CHUNK_39,
  CHUNK_40,
  CHUNK_KANSAI,
  CHUNK_41,
  CHUNK_42,
  CHUNK_43,
);

/**
 * ホットペッパーグルメ Webサービスで取得した実店舗（scripts/hotpepper-indie-import.mjs が生成）。
 * この駅のデータがあれば、出典のない旧AI生成データ（chunk-*.ts）を駅単位で丸ごと置き換える。
 * 取れなかった駅の旧データは出さない（2026-09-24 社長決定）。
 */
const HOTPEPPER_STATIONS = (HOTPEPPER as { stations: Record<string, IndieRestaurant[]> }).stations;
export const HOTPEPPER_GENERATED_AT: string = (HOTPEPPER as { generatedAt: string }).generatedAt;
/**
 * 旧 chunk-*.ts のうち、各館の公式ショップリストで1店ずつ確認した駅（station-overrides の indieLabels を持つ）。
 * これ以外の旧データは出典のないAI生成で架空店を含むため、ホットペッパーで取れなかった駅でも表示しない。
 */
const MANUALLY_VERIFIED_STATIONS = new Set(['koshigaya-laketown']);
for (const slug of Object.keys(STATION_INDIE_MAP)) {
  const hp = HOTPEPPER_STATIONS[slug];
  if (hp && hp.length > 0) STATION_INDIE_MAP[slug] = hp;
  else if (!MANUALLY_VERIFIED_STATIONS.has(slug)) STATION_INDIE_MAP[slug] = [];
}
for (const [slug, list] of Object.entries(HOTPEPPER_STATIONS)) {
  if (list.length > 0) STATION_INDIE_MAP[slug] = list;
}

/** この駅の個人店がホットペッパー由来か（見出し・リード文と出典表記の出し分け用） */
export function isHotpepperStation(slug: string): boolean {
  return (HOTPEPPER_STATIONS[slug]?.length ?? 0) > 0;
}

/**
 * 駅slugから個人店リストを取得。未登録駅は空配列。
 */
export function getIndieRestaurantsByStation(slug: string): IndieRestaurant[] {
  return STATION_INDIE_MAP[slug] ?? [];
}

/**
 * 全店舗をフラットに取得（集計・全店検索用）。
 */
export function getAllIndieRestaurants(): Array<IndieRestaurant & { stationSlug: string }> {
  const all: Array<IndieRestaurant & { stationSlug: string }> = [];
  for (const [slug, list] of Object.entries(STATION_INDIE_MAP)) {
    for (const r of list) {
      all.push({ ...r, stationSlug: slug });
    }
  }
  return all;
}

/**
 * 個人店ジャンルラベル（日本語表記）。
 */
export const INDIE_GENRE_LABEL: Record<IndieGenre, string> = {
  washoku: '和食・割烹・定食',
  sushi: '寿司・海鮮',
  tempura: '天ぷら',
  tonkatsu: 'とんかつ',
  yoshoku: '洋食・ハンバーグ',
  italian: 'イタリアン・パスタ',
  french: 'フレンチ・ビストロ',
  chinese: '中華',
  korean: '韓国・サムギョプサル',
  yakiniku: '焼肉',
  cafe: 'カフェ・喫茶店',
  bakery: 'パン・ベーカリーカフェ',
  sweets: 'スイーツ・ケーキ',
  curry: 'カレー・スパイス',
  noodles: 'ラーメン・うどん・そば',
  shabu: 'しゃぶしゃぶ・すき焼き',
  teppan: '鉄板焼き・お好み焼き',
  asian: 'タイ・ベトナム・エスニック',
  others: 'その他',
};

/**
 * 個人店登録駅数（カバレッジ確認用）。
 */
export function getIndieCoverageStats(): { stationCount: number; restaurantCount: number } {
  const slugs = Object.keys(STATION_INDIE_MAP);
  const restaurantCount = slugs.reduce((sum, s) => sum + STATION_INDIE_MAP[s].length, 0);
  return { stationCount: slugs.length, restaurantCount };
}
