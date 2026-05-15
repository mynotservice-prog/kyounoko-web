/**
 * スポット拡充バッチ（batch-1〜6）の統合エントリ。
 *
 * 全国47都道府県の「子連れおでかけスポット」DBを底上げするための追加データ。
 * 各バッチは Web 調査で実在を確認した実名スポットのみ（創作なし）。
 * spots.ts 側でモジュール読み込み時に SPOTS へ name 重複を除いてマージされる。
 */
import type { AreaSlug } from '../area';
import type { Spot } from '../spots';
import { SPOTS_EXTRA_1 } from './batch-1';
import { SPOTS_EXTRA_2 } from './batch-2';
import { SPOTS_EXTRA_3 } from './batch-3';
import { SPOTS_EXTRA_4 } from './batch-4';
import { SPOTS_EXTRA_5 } from './batch-5';
import { SPOTS_EXTRA_6 } from './batch-6';

const BATCHES: Partial<Record<AreaSlug, Spot[]>>[] = [
  SPOTS_EXTRA_1,
  SPOTS_EXTRA_2,
  SPOTS_EXTRA_3,
  SPOTS_EXTRA_4,
  SPOTS_EXTRA_5,
  SPOTS_EXTRA_6,
];

/** 都道府県 slug → 追加スポット配列。全バッチを結合したもの。 */
export const SPOTS_EXTRA: Partial<Record<AreaSlug, Spot[]>> = (() => {
  const merged: Partial<Record<AreaSlug, Spot[]>> = {};
  for (const batch of BATCHES) {
    for (const [area, list] of Object.entries(batch) as [AreaSlug, Spot[]][]) {
      if (!list) continue;
      merged[area] = [...(merged[area] ?? []), ...list];
    }
  }
  return merged;
})();
