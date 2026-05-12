/**
 * 23区全駅の個人店マッピング統合エントリ。
 * chunk-1〜18 を結合して全駅から参照できる単一の StationIndieMap を提供する。
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
);

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
