/**
 * 駅別 個人店マッピング — chunk-35（神奈川主要30駅 子連れランチ）
 *
 * 神奈川エリア初の駅別個人店マップ。横浜/川崎/湘南/県央の主要30駅。
 *
 * - 各駅ごとに Web 調査で実在を確認した実名の個人店のみを掲載
 * - チェーン店は対象外（lib/station-restaurants.ts で全駅自動付与済み）
 * - 子連れ向き設備は公開情報・取材記事ベースの推定。最終的には店舗確認前提
 * - 食べログ点数等の数値スコアは引用していない
 *
 * 30駅は3パートに分割して並列で投入:
 *   chunk-35a: 横浜中心10駅
 *   chunk-35b: 横浜郊外・川崎10駅
 *   chunk-35c: 湘南・県央10駅
 */

import type { StationIndieMap } from './types';
import { CHUNK_35A } from './chunk-35a';
import { CHUNK_35B } from './chunk-35b';
import { CHUNK_35C } from './chunk-35c';

export const CHUNK_35: StationIndieMap = {
  ...CHUNK_35A,
  ...CHUNK_35B,
  ...CHUNK_35C,
};
