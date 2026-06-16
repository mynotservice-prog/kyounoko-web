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

import overridesJson from './spot-overrides.json';
import type { Spot } from './spots';

/** 上書き可能なトップレベルのフィールド（文字列/enum）。 */
export const SPOT_TEXT_FIELDS = [
  'name',
  'city',
  'ward',
  'note',
  'budget',
  'reservation',
  'hiddenTip',
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

/** 上書きとして保存できる Spot の部分形。 */
export type SpotOverride = Partial<
  Pick<Spot, 'name' | 'city' | 'ward' | 'note' | 'budget' | 'reservation' | 'hiddenTip' | 'nearby' | 'waterDepth' | 'image' | 'images' | 'pricing' | 'facilities' | 'ageGuide'>
>;

export type SpotOverridesMap = Record<string, SpotOverride>;

const OVERRIDES = overridesJson as SpotOverridesMap;

/** slug の上書き内容を取得（無ければ null） */
export function getSpotOverride(slug: string): SpotOverride | null {
  return OVERRIDES[slug] ?? null;
}

/** 全 overrides を取得（admin 一覧用） */
export function getAllSpotOverrides(): SpotOverridesMap {
  return OVERRIDES;
}

/**
 * 元スポット + override をマージして 1 件返す。
 * pricing / facilities はネストしたサブオブジェクトを浅くマージする
 * （adult だけ上書き、他は元の値を維持できるように）。
 */
export function mergeSpot(spot: Spot, slug: string): Spot {
  const ov = OVERRIDES[slug];
  if (!ov) return spot;
  const merged: Spot = { ...spot, ...ov };
  if (ov.pricing) merged.pricing = { ...spot.pricing, ...ov.pricing };
  if (ov.facilities) merged.facilities = { ...spot.facilities, ...ov.facilities };
  if (ov.ageGuide) merged.ageGuide = { ...spot.ageGuide, ...ov.ageGuide };
  return merged;
}
