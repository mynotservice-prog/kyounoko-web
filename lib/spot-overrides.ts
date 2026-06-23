/**
 * スポット情報の上書き層。
 *
 * lib/spots.ts はハードコードされた大量のスポット配列だが、その上に
 * 「lib/spot-overrides.json で個別 slug 単位で任意フィールドを上書き」できる
 * 仕組み。/admin/spots/edit から編集すると JSON が GitHub commit され、
 * Vercel が自動デプロイで本番に反映される。
 *
 * slug は元スポット（spots.ts の定義）から spotToSlug() で決定的に算出される。
 * override は slug をキーに「算出後」にマージされるため、施設名・市区町村を
 * 編集しても slug（= URL）は変わらない。リンク切れが起きない設計。
 *
 * 保存形式（slug → 上書きされたフィールドだけが入る部分オブジェクト）:
 *   {
 *     "rindo-eb58": {
 *       "note": "公式提供の最新情報に差し替え",
 *       "pricing": { "adult": "1,600円" },
 *       "facilities": { "nursingRoom": "yes" }
 *     }
 *   }
 *
 * 注意:
 *  - 本ファイルは Server Component / API route から使う。
 *  - 編集は /api/admin/spot-overrides の POST 経由でのみ可能。
 */

import { unstable_cache } from 'next/cache';
import overridesJson from './spot-overrides.json';
import type { Spot } from './spots';
import { isKvConfigured, kvGet, kvSet } from './kv-store';

/** 上書き可能なトップレベルのフィールド（文字列/enum）。 */
export const SPOT_TEXT_FIELDS = [
  'name',
  'city',
  'ward',
  'note',
  'budget',
  'reservation',
  'hiddenTip',
  'crowdTips',
  'accessTips',
  'nearby',
  'waterDepth',
  'image',
] as const;
export type SpotTextField = (typeof SPOT_TEXT_FIELDS)[number];

/** pricing サブオブジェクトの編集可能キー。 */
export const SPOT_PRICING_FIELDS = ['adult', 'elementary', 'preschool', 'infant'] as const;
export type SpotPricingField = (typeof SPOT_PRICING_FIELDS)[number];

/** facilities サブオブジェクトの編集可能キー（note 以外は yes/no enum）。 */
export const SPOT_FACILITY_ENUM_FIELDS = [
  'bathroom',
  'diaperChange',
  'nursingRoom',
  'kidsSpace',
  'strollerRental',
] as const;
export type SpotFacilityEnumField = (typeof SPOT_FACILITY_ENUM_FIELDS)[number];

/** ageGuide サブオブジェクトの編集可能キー（AgeTag）。 */
export const SPOT_AGE_GUIDE_FIELDS = ['0-1', '2-3', '4-6'] as const;
export type SpotAgeGuideField = (typeof SPOT_AGE_GUIDE_FIELDS)[number];

/** 上書き可能なカテゴリ（lib/spots.ts の SpotCategory と一致させる）。 */
export const SPOT_CATEGORY_VALUES = [
  'zoo', 'aquarium', 'park', 'museum', 'amusement', 'indoor', 'farm', 'seasonal', 'restaurant',
] as const;

/** 上書き可能な屋内/屋外区分（SpotPlace と一致）。 */
export const SPOT_PLACE_VALUES = ['indoor', 'outdoor', 'mixed'] as const;

/** 上書き可能な対象年齢タグ（AgeTag と一致）。 */
export const SPOT_AGE_VALUES = ['0-1', '2-3', '4-6'] as const;

/** 上書きとして保存できる Spot の部分形。 */
export type SpotOverride = Partial<
  Pick<Spot, 'name' | 'city' | 'ward' | 'note' | 'budget' | 'reservation' | 'hiddenTip' | 'crowdTips' | 'accessTips' | 'nearby' | 'waterDepth' | 'image' | 'images' | 'pricing' | 'facilities' | 'ageGuide' | 'category' | 'place' | 'ages' | 'faq' | 'faqComplete' | 'nearbySlugs'>
>;

export type SpotOverridesMap = Record<string, SpotOverride>;

/** ビルド時にバンドルされる上書き（KV未設定時のフォールバック兼・初期シード）。 */
export const BUNDLED_SPOT_OVERRIDES = overridesJson as SpotOverridesMap;

/** KV のキー。 */
export const SPOT_OVERRIDES_KV_KEY = 'spot:overrides';
/** revalidateTag 用。保存時にこのタグを revalidate するとページが最新を読む。 */
export const SPOT_OVERRIDES_TAG = 'spot-overrides';

/** slug の上書き内容を取得（無ければ null）。同期・バンドル版（後方互換）。 */
export function getSpotOverride(slug: string): SpotOverride | null {
  return BUNDLED_SPOT_OVERRIDES[slug] ?? null;
}

/** 全 overrides を取得（同期・バンドル版）。 */
export function getAllSpotOverrides(): SpotOverridesMap {
  return BUNDLED_SPOT_OVERRIDES;
}

/**
 * 元スポット + override をマージして 1 件返す。
 * pricing / facilities はネストしたサブオブジェクトを浅くマージする
 * （adult だけ上書き、他は元の値を維持できるように）。
 *
 * ovMap を渡すと実行時 override（KV由来）でマージできる。省略時はバンドル版。
 */
export function mergeSpot(spot: Spot, slug: string, ovMap: SpotOverridesMap = BUNDLED_SPOT_OVERRIDES): Spot {
  const ov = ovMap[slug];
  if (!ov) return spot;
  const merged: Spot = { ...spot, ...ov };
  if (ov.pricing) merged.pricing = { ...spot.pricing, ...ov.pricing };
  if (ov.facilities) merged.facilities = { ...spot.facilities, ...ov.facilities };
  if (ov.ageGuide) merged.ageGuide = { ...spot.ageGuide, ...ov.ageGuide };
  return merged;
}

/**
 * 実行時の override マップを取得。
 * - KV 設定済み: KV から読む（無ければバンドルにフォールバック）
 * - 未設定: バンドルJSON
 * unstable_cache でタグ付きキャッシュし、保存時に revalidateTag で更新する。
 */
export const getRuntimeSpotOverrides = unstable_cache(
  async (): Promise<SpotOverridesMap> => {
    if (isKvConfigured()) {
      const fromKv = await kvGet<SpotOverridesMap>(SPOT_OVERRIDES_KV_KEY);
      if (fromKv) return fromKv;
    }
    return BUNDLED_SPOT_OVERRIDES;
  },
  ['runtime-spot-overrides'],
  { tags: [SPOT_OVERRIDES_TAG] },
);

/**
 * 保存用に「現在の全 override」を取得（キャッシュを通さない直読み）。
 * KV が空ならバンドルをシードとして使う（初回保存で他の上書きが消えないように）。
 */
export async function readSpotOverridesForWrite(): Promise<SpotOverridesMap> {
  if (isKvConfigured()) {
    const fromKv = await kvGet<SpotOverridesMap>(SPOT_OVERRIDES_KV_KEY);
    return fromKv ?? { ...BUNDLED_SPOT_OVERRIDES };
  }
  return { ...BUNDLED_SPOT_OVERRIDES };
}

/** override マップを KV に保存。 */
export async function writeSpotOverridesToKv(map: SpotOverridesMap): Promise<boolean> {
  return kvSet(SPOT_OVERRIDES_KV_KEY, map);
}
