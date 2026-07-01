/**
 * /spots・/spots/[cat] の絞り込み・並び替えの単一ロジック（P0-3b/c）。
 *
 * 方針（docs/kaishu-plan-2026-07.md §2）:
 * - フィルタ/並び替えは全て URL クエリに反映（共有・戻る・再現）。
 * - クエリ変種ページは noindex,follow ＋ canonical→クリーンURL（index膨張を防ぐ）。
 * - 群内 OR / 群間 AND（画面仕様書 §3-3）。
 * - データが無い軸（geo/所要時間/口コミ★）は今は出さない（嘘フィルタを作らない）。
 *
 * matchesFilters は「最小形（FilterableSpot）」で判定するので、サーバー（Spot）でも
 * クライアントの件数ライブ更新でも同一ロジックを使える。
 */
// 型のみ import（実行時依存なし＝この module は client からも安全に使える）。
// スポットデータを読む getFilterableSpots は server 専用の lib/spot-filter-data.ts に置く。
import type { AgeTag, Spot, SpotPlace, SpotCategory } from './spots';

export type Budget = 'free' | 'low' | 'mid' | 'high';
export type SortKey = 'popular' | 'price' | 'name';
export type AreaFilter = 'shutoken' | 'tokyo' | 'kanagawa' | 'chiba' | 'saitama';
export type FacilityKey = 'nursing' | 'diaper' | 'stroller';

/** 首都圏（1都3県） */
export const SHUTOKEN = ['tokyo', 'kanagawa', 'chiba', 'saitama'];

export type SpotFilters = {
  area?: AreaFilter;
  ages: AgeTag[];
  place?: 'indoor' | 'outdoor';
  facilities: FacilityKey[];
  price: Budget[];
  reserve?: 'ok' | 'none';
  sort: SortKey;
};

/** 絞り込み判定に必要な最小フィールド（server/client 共有用）。 */
export type FilterableSpot = {
  slug: string;
  area: string;
  name: string;
  category: SpotCategory;
  ages: AgeTag[];
  place: SpotPlace;
  budget?: Budget;
  reservation?: 'required' | 'recommended' | 'none';
  nursing: boolean;
  diaper: boolean;
  stroller: boolean;
  popular: boolean;
};

export function toFilterable(x: { slug: string; area: string; spot: Spot }): FilterableSpot {
  const f = x.spot.facilities;
  return {
    slug: x.slug,
    area: x.area,
    name: x.spot.name,
    category: x.spot.category,
    ages: x.spot.ages ?? [],
    place: x.spot.place,
    budget: x.spot.budget,
    reservation: x.spot.reservation,
    nursing: f?.nursingRoom === 'yes',
    diaper: f?.diaperChange === 'yes',
    stroller: f?.strollerRental === 'yes',
    popular: !!x.spot.popular,
  };
}

const BUDGET_ORDER: Record<Budget, number> = { free: 0, low: 1, mid: 2, high: 3 };

export function matchesFilters(s: FilterableSpot, f: SpotFilters): boolean {
  // エリア（群間AND）
  if (f.area) {
    if (f.area === 'shutoken') {
      if (!SHUTOKEN.includes(s.area)) return false;
    } else if (s.area !== f.area) {
      return false;
    }
  }
  // 年齢（群内OR）
  if (f.ages.length && !f.ages.some((a) => s.ages.includes(a))) return false;
  // 屋内/屋外（mixed は両方に該当）
  if (f.place === 'indoor' && s.place === 'outdoor') return false;
  if (f.place === 'outdoor' && s.place === 'indoor') return false;
  // 設備（群内OR）
  if (f.facilities.length) {
    const ok = f.facilities.some(
      (k) => (k === 'nursing' && s.nursing) || (k === 'diaper' && s.diaper) || (k === 'stroller' && s.stroller),
    );
    if (!ok) return false;
  }
  // 料金（群内OR）
  if (f.price.length && !(s.budget && f.price.includes(s.budget))) return false;
  // 予約
  if (f.reserve === 'ok' && !(s.reservation === 'recommended' || s.reservation === 'required')) return false;
  if (f.reserve === 'none' && s.reservation !== 'none') return false;
  return true;
}

export function sortSpots(list: FilterableSpot[], sort: SortKey): FilterableSpot[] {
  const arr = [...list];
  if (sort === 'price') {
    arr.sort((a, b) => (BUDGET_ORDER[a.budget ?? 'high'] - BUDGET_ORDER[b.budget ?? 'high']) || a.name.localeCompare(b.name, 'ja'));
  } else if (sort === 'name') {
    arr.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
  } else {
    // popular: 人気優先（安定）
    arr.sort((a, b) => (a.popular === b.popular ? 0 : a.popular ? -1 : 1));
  }
  return arr;
}

/** true なら「絞り込みモード」（何らかのフィルタ/並び替えが効いている）。 */
export function hasActiveFilters(f: SpotFilters): boolean {
  return !!(
    f.area ||
    f.ages.length ||
    f.place ||
    f.facilities.length ||
    f.price.length ||
    f.reserve ||
    (f.sort && f.sort !== 'popular')
  );
}

const AGE_SET: AgeTag[] = ['0-1', '2-3', '4-6'];
const PRICE_SET: Budget[] = ['free', 'low', 'mid', 'high'];
const FAC_SET: FacilityKey[] = ['nursing', 'diaper', 'stroller'];
const AREA_SET: AreaFilter[] = ['shutoken', 'tokyo', 'kanagawa', 'chiba', 'saitama'];

function csv<T extends string>(v: string | string[] | undefined, allowed: readonly T[]): T[] {
  if (!v) return [];
  const raw = Array.isArray(v) ? v.join(',') : v;
  return raw.split(',').map((x) => x.trim()).filter((x): x is T => (allowed as readonly string[]).includes(x));
}
function one<T extends string>(v: string | string[] | undefined, allowed: readonly T[]): T | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && (allowed as readonly string[]).includes(s) ? (s as T) : undefined;
}

/** URL の searchParams から SpotFilters を復元（壊れた値は無視してデフォルトへ）。 */
export function parseFilters(sp: Record<string, string | string[] | undefined>): SpotFilters {
  return {
    area: one(sp.area, AREA_SET),
    ages: csv(sp.age, AGE_SET),
    place: one(sp.place, ['indoor', 'outdoor'] as const),
    facilities: csv(sp.facility, FAC_SET),
    price: csv(sp.price, PRICE_SET),
    reserve: one(sp.reserve, ['ok', 'none'] as const),
    sort: one(sp.sort, ['popular', 'price', 'name'] as const) ?? 'popular',
  };
}

/** SpotFilters → URLクエリ文字列（空は落とす）。共有・戻る・再現用。 */
export function filtersToQuery(f: SpotFilters): string {
  const p = new URLSearchParams();
  if (f.area) p.set('area', f.area);
  if (f.ages.length) p.set('age', f.ages.join(','));
  if (f.place) p.set('place', f.place);
  if (f.facilities.length) p.set('facility', f.facilities.join(','));
  if (f.price.length) p.set('price', f.price.join(','));
  if (f.reserve) p.set('reserve', f.reserve);
  if (f.sort && f.sort !== 'popular') p.set('sort', f.sort);
  return p.toString();
}
