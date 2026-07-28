/**
 * 「探す（/spots）」ブラウズ用のカテゴリ設定とカテゴリ別スポット取得。
 *
 * /spots（ブラウズ）・/spots/[cat]（カテゴリ全件）・sitemap の 3 箇所が
 * 同じカテゴリ定義・同じ件数で動くよう、ここを単一の真実源にする。
 *
 * SEO 方針（docs/kaishu-plan-2026-07.md §2）:
 * - /spots と /spots/[cat] は index 対象（canonical 自己参照）。
 * - filter/sort/page などのクエリ変種は将来 noindex,follow にする（本PRでは未実装）。
 *
 * restaurant カテゴリは P1-1c（チェーン外食のDB整理）で別扱いのため、
 * ブラウズ導線・カテゴリ全件ページからは意図的に除外する。
 */
import { getAllSpotsWithSlug, type Spot, type SpotCategory } from './spots';

export type BrowseCategory = {
  id: SpotCategory;
  /** 表示ラベル（例: 公園・自然） */
  label: string;
  /** V2_ACCENT のキー（コンポーネント側でキャストして使用） */
  accent: string;
  /** V2Icon の name（コンポーネント側でキャストして使用） */
  icon: string;
};

/** ブラウズに出す「おでかけ先」カテゴリ。順序＝表示順。restaurant は除外。 */
export const BROWSE_CATEGORIES: BrowseCategory[] = [
  { id: 'park', label: '公園・自然', accent: 'indoor', icon: 'tree' },
  { id: 'zoo', label: '動物園', accent: 'purple', icon: 'leaf' },
  { id: 'aquarium', label: '水族館', accent: 'rain', icon: 'umbrella' },
  { id: 'museum', label: '博物館・科学館', accent: 'purple', icon: 'book' },
  { id: 'indoor', label: '室内遊び場', accent: 'lunch', icon: 'house' },
  { id: 'amusement', label: '遊園地', accent: 'event', icon: 'party' },
  { id: 'farm', label: '牧場', accent: 'sun', icon: 'leaf' },
  { id: 'seasonal', label: '観光スポット', accent: 'sun', icon: 'sun' },
];

export function getBrowseCategory(id: string): BrowseCategory | undefined {
  return BROWSE_CATEGORIES.find((c) => c.id === id);
}

/**
 * 一覧掲載に値するか（最低限の情報があるか）。
 * /spots の従来判定と揃える（名前 + note/市区町村/最寄り駅のいずれか）。
 */
export function isListableSpot(s: Spot): boolean {
  if (!s.name) return false;
  return !!(s.note || s.ward || s.city || s.nearestStation);
}

export type SpotWithSlug = ReturnType<typeof getAllSpotsWithSlug>[number];

/** 指定カテゴリの掲載可能スポットを人気優先で全件返す（重複slugは getAllSpotsWithSlug が排除済）。 */
export function spotsByCategory(cat: SpotCategory): SpotWithSlug[] {
  return getAllSpotsWithSlug()
    .filter((x) => x.spot.category === cat && isListableSpot(x.spot))
    .sort((a, b) => (a.spot.popular === b.spot.popular ? 0 : a.spot.popular ? -1 : 1));
}
