/**
 * スポット拡充バッチ（batch-1〜7）の統合エントリ。
 *
 * 全国47都道府県の「子連れおでかけスポット」DBを底上げするための追加データ。
 * 各バッチは Web 調査で実在を確認した実名スポットのみ（創作なし）。
 * spots.ts 側でモジュール読み込み時に SPOTS へ name 重複を除いてマージされる。
 *
 * batch-7: じゃぶじゃぶ池・無料水遊び場・噴水広場 30件（東京20+神奈川3+千葉4+埼玉3）
 * batch-8: 全国カバレッジ底上げ +160件（37都道府県を各10施設以上に）
 */
import type { AreaSlug } from '../area';
import type { Spot } from '../spots';
import { SPOTS_EXTRA_1 } from './batch-1';
import { SPOTS_EXTRA_2 } from './batch-2';
import { SPOTS_EXTRA_3 } from './batch-3';
import { SPOTS_EXTRA_4 } from './batch-4';
import { SPOTS_EXTRA_5 } from './batch-5';
import { SPOTS_EXTRA_6 } from './batch-6';
import { SPOTS_EXTRA_7 } from './batch-7';
import { SPOTS_EXTRA_8 } from './batch-8';
// 管理画面「新規スポット」で作成したスポット（/api/admin/spot-create が GitHub commit で追記）。
// エリア(都道府県slug) → Spot[] の形。デプロイで本番反映される。
import ADMIN_CREATED from './admin-created.json';

const BATCHES: Partial<Record<AreaSlug, Spot[]>>[] = [
  SPOTS_EXTRA_1,
  SPOTS_EXTRA_2,
  SPOTS_EXTRA_3,
  SPOTS_EXTRA_4,
  SPOTS_EXTRA_5,
  SPOTS_EXTRA_6,
  SPOTS_EXTRA_7,
  SPOTS_EXTRA_8,
  ADMIN_CREATED as Partial<Record<AreaSlug, Spot[]>>,
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
