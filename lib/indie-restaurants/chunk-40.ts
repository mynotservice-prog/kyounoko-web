/**
 * 駅別 個人店マッピング — chunk-40（埼玉15+千葉15 主要30駅 子連れランチ）
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店のみを掲載
 * - チェーン店は対象外（lib/station-restaurants.ts で全駅自動付与済み）
 * - 子連れ向き設備は公開情報・取材記事ベースの推定。最終的には店舗確認前提
 * - 食べログ点数等の数値スコアは引用していない
 *
 * 30駅を2パートに分割して並列で投入:
 *   chunk-40a: 埼玉15駅
 *   chunk-40b: 千葉15駅
 */

import type { StationIndieMap } from './types';
import { CHUNK_40A } from './chunk-40a';
import { CHUNK_40B } from './chunk-40b';

export const CHUNK_40: StationIndieMap = {
  ...CHUNK_40A,
  ...CHUNK_40B,
};
