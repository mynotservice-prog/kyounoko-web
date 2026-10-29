/**
 * 駅×条件ページに載せる店を、店単位・根拠つきで数える（2026-10-28・Phase 2）。
 * 設計: docs/station-cond-rebuild-2026-10.md §3〜§5
 *
 * 対象は公式で実在を確認した駅（lib/station-verified-stores.ts に登録がある575駅）の、次の6条件。
 *   famiresu / kaitenzushi / yakiniku … チェーンの業態（実在店）＋ホットペッパーの個人店（ジャンル）
 *   kids-menu / baby / private-room   … 根拠のある店だけ（lib/station-evidence.ts の店の公式・ブランドの公式、
 *                                        個人店はホットペッパーの店の掲載情報）
 * 雨の日（建物の公式台帳待ち）と個人店（indie）は、ここでは扱わない（従来の判定のまま）。
 *
 * 距離は駅中心からの直線。800m以内は駅前・徒歩圏、800m超〜1kmは「少し歩く」（子連れで15〜20分）。
 */
import { CHAINS, CHAIN_CATEGORY_LABEL as CATEGORY_LABEL, type Chain } from './station-restaurants';
import { getVerifiedStores, type VerifiedStore } from './station-verified-stores';
import { getIndieRestaurantsByStation, INDIE_GENRE_LABEL } from './indie-restaurants';
import { evidenceForStore, storeDisplayName, type EvidenceNeed } from './station-evidence';
import HOTPEPPER_COND from './indie-restaurants/hotpepper-cond.json';

export const REBUILT_CONDITIONS = new Set(['famiresu', 'kaitenzushi', 'yakiniku', 'kids-menu', 'baby', 'private-room']);

export type CondStoreSource = 'store' | 'brand' | 'category' | 'listing';

export type CondStore = {
  key: string;
  kind: 'chain' | 'indie';
  name: string;
  address?: string;
  url?: string;
  /** 駅中心からの直線距離（m）。分からない店は undefined */
  m?: number;
  band: '駅前' | '徒歩圏' | '少し歩く';
  /** 根拠の段: 店の公式／チェーン公式（全店）／業態／店の掲載（ホットペッパー） */
  source: CondStoreSource;
  /** 根拠の中身（例「キッズメニュー」「店のコメント: お子様用の椅子あります」） */
  evidence?: string;
  chain?: string;
  /** 業態・ジャンルの表示名 */
  genre?: string;
};

export type ConditionStores = {
  stores: CondStore[];
  /** 800m以内の店数（一覧に載せていない「ほかN店」を含む） */
  within800: number;
  /** 1km以内の店数（同上） */
  within1000: number;
};

const CHAIN_BY_SLUG = new Map<string, Chain>(CHAINS.map((c) => [c.slug, c]));
const FAMIRESU_EXTRA = new Set(['saizeriya', 'gusto', 'jonathan', 'denny-s', 'royal-host', 'cocos', 'bamiyan']);
const NEEDS: Record<string, EvidenceNeed[]> = {
  'kids-menu': ['kidsMenu'],
  baby: ['babyChair', 'diaper', 'nursing', 'babyFood'],
  'private-room': ['privateRoom'],
};
const NEED_LABEL: Record<EvidenceNeed, string> = {
  kidsMenu: 'キッズメニュー',
  babyChair: '子ども用の椅子',
  diaper: 'おむつ替え台',
  nursing: '授乳スペース',
  babyFood: '離乳食の持ち込み',
  privateRoom: '個室・座敷',
  stepFree: '入口の段差なし',
  kidsSpace: 'キッズスペース',
};

function categoryMatch(chainSlug: string, condition: string): boolean {
  const c = CHAIN_BY_SLUG.get(chainSlug);
  if (!c) return false;
  if (condition === 'famiresu') return c.category === 'family-restaurant' || FAMIRESU_EXTRA.has(c.slug);
  if (condition === 'kaitenzushi') return c.category === 'sushi';
  if (condition === 'yakiniku') return c.category === 'yakiniku';
  return false;
}

function bandOf(m: number | undefined, fallback?: VerifiedStore['distance']): CondStore['band'] {
  if (m === undefined) return fallback ?? '徒歩圏';
  return m <= 300 ? '駅前' : m <= 800 ? '徒歩圏' : '少し歩く';
}

type HpCondShop = { name: string; hpId: string; url?: string; address?: string; genre?: string; distanceM: number; evidence?: string };
const HP_COND = (HOTPEPPER_COND as { stations: Record<string, Record<string, HpCondShop[]>> }).stations;

const cache = new Map<string, ConditionStores | null>();

/** 作り直しの対象（照合済みの駅×6条件）なら店の一覧。対象外は null（従来の判定・画面のまま） */
export function getConditionStores(stationSlug: string, condition: string): ConditionStores | null {
  const ck = `${stationSlug}/${condition}`;
  if (cache.has(ck)) return cache.get(ck)!;
  const verified = getVerifiedStores(stationSlug);
  if (!verified || !REBUILT_CONDITIONS.has(condition)) {
    cache.set(ck, null);
    return null;
  }
  const stores: CondStore[] = [];
  let moreNear = 0;
  let moreFar = 0;
  const isCategory = condition === 'famiresu' || condition === 'kaitenzushi' || condition === 'yakiniku';

  // チェーン（公式で実在を確認した店）
  for (const st of [...verified.stores, ...(verified.far ?? [])]) {
    const chain = CHAIN_BY_SLUG.get(st.chain);
    if (!chain) continue;
    let source: CondStoreSource | null = null;
    let evidence: string | undefined;
    if (isCategory) {
      if (categoryMatch(st.chain, condition)) source = 'category';
    } else {
      const ev = evidenceForStore(st);
      const hits = NEEDS[condition].filter((n) => ev.has(n));
      if (hits.length) {
        source = hits.some((n) => ev.get(n) === 'store') ? 'store' : 'brand';
        evidence = hits.map((n) => NEED_LABEL[n]).join('・');
      }
    }
    if (!source) continue;
    stores.push({
      key: `c:${st.chain}:${st.name}:${st.address}`,
      kind: 'chain',
      name: storeDisplayName(chain.name, st.name),
      address: st.address,
      url: st.url,
      m: st.m,
      band: bandOf(st.m, st.distance),
      source,
      evidence,
      chain: st.chain,
      genre: undefined,
    });
  }
  // 一覧に載せていない「ほかN店」: 業態の条件は数える。設備の条件はブランドの公式があるチェーンだけ数える
  const countMore = (more: Record<string, number> | undefined) => {
    let n = 0;
    for (const [chain, k] of Object.entries(more ?? {})) {
      if (isCategory ? categoryMatch(chain, condition) : brandHas(chain, NEEDS[condition])) n += k;
    }
    return n;
  };
  moreNear = countMore(verified.more);
  moreFar = countMore(verified.farMore);

  // 個人店（ホットペッパーの掲載情報）
  const seen = new Set<string>();
  const pushIndie = (s: { name: string; hpId?: string; url?: string; address?: string; distanceM?: number; genre?: string }, evidence?: string) => {
    const id = s.hpId ?? s.name;
    if (seen.has(id)) return;
    if (s.distanceM !== undefined && s.distanceM > 1000) return;
    seen.add(id);
    stores.push({
      key: `i:${id}`,
      kind: 'indie',
      name: s.name,
      address: s.address,
      url: s.url,
      m: s.distanceM,
      band: bandOf(s.distanceM),
      source: 'listing',
      evidence,
      genre: s.genre,
    });
  };
  for (const r of getIndieRestaurantsByStation(stationSlug)) {
    if (r.source !== 'hotpepper') continue;
    const g = INDIE_GENRE_LABEL[r.genre];
    if (condition === 'kaitenzushi' && r.genre === 'sushi') pushIndie({ ...r, genre: g });
    if (condition === 'yakiniku' && (r.genre === 'yakiniku' || r.genre === 'korean')) pushIndie({ ...r, genre: g });
    if (condition === 'private-room' && r.privateRoom) pushIndie({ ...r, genre: g }, '個室あり（店の掲載）');
  }
  for (const s of HP_COND[stationSlug]?.[condition] ?? []) {
    pushIndie(s, s.evidence ? `店のコメント: ${s.evidence}` : condition === 'private-room' ? '個室あり（店の掲載）' : undefined);
  }

  stores.sort((a, b) => (a.m ?? 9999) - (b.m ?? 9999) || a.name.localeCompare(b.name, 'ja'));
  const near = stores.filter((s) => s.band !== '少し歩く').length;
  const result: ConditionStores = {
    stores,
    within800: near + moreNear,
    within1000: stores.length + moreNear + moreFar,
  };
  cache.set(ck, result);
  return result;
}

function brandHas(chainSlug: string, needs: EvidenceNeed[]): boolean {
  // チェーン公式（全店向けの記載）がある項目は、一覧に載らない店にも当てはまる
  const fake = { chain: chainSlug, name: '', address: '', distance: '徒歩圏' as const, fac: [] };
  const ev = evidenceForStore(fake);
  return needs.some((n) => ev.get(n) === 'brand');
}

/** 根拠の段の表示名 */
export const COND_SOURCE_LABEL: Record<CondStoreSource, string> = {
  store: 'この店の公式ページの表示',
  brand: 'チェーン公式（全店）',
  category: '業態（公式で実在を確認）',
  listing: 'ホットペッパーの店の掲載',
};

const SIT_DOWN_FIRST: Record<string, number> = {
  'family-restaurant': 0, sushi: 0, washoku: 0, italian: 0, chinese: 0, yakiniku: 0, noodles: 1, curry: 1, gyudon: 1,
  'mall-food': 1, cafe: 2, 'fast-food': 2, bakery: 3,
};

export type OtherStore = {
  key: string;
  name: string;
  category: string;
  m?: number;
  band: CondStore['band'];
  url?: string;
  /** 根拠のある設備（店の公式店舗検索の表示＝店／チェーン公式の全店向けの記載＝全店）。lib/station-evidence.ts */
  facilities: { label: string; source: 'store' | 'brand' }[];
};

const OTHER_FAC_ORDER: EvidenceNeed[] = ['kidsMenu', 'babyChair', 'diaper', 'nursing', 'babyFood', 'privateRoom', 'kidsSpace'];

/**
 * 条件に合う店が少ない面（0〜2店）で出す「この駅の近くで公式に実在を確認した、ほかのお店」（2026-10-29）。
 * 経堂のファミレスのように条件に合う店は無くても、駅の近くには大戸屋・スシローなどの実在店がある。
 * 「何も無い」と読めないよう、条件以外の実在店（800m以内）を、席で食べる業態を先に、駅に近い順で返す。
 */
export function getOtherVerifiedStores(stationSlug: string, condition: string, limit = 10): { stores: OtherStore[]; total: number } {
  const verified = getVerifiedStores(stationSlug);
  const cs = getConditionStores(stationSlug, condition);
  if (!verified || !cs) return { stores: [], total: 0 };
  const inCond = new Set(cs.stores.filter((s) => s.kind === 'chain').map((s) => s.key));
  const all: (OtherStore & { rank: number })[] = [];
  for (const st of verified.stores) {
    const chain = CHAIN_BY_SLUG.get(st.chain);
    if (!chain) continue;
    const key = `c:${st.chain}:${st.name}:${st.address}`;
    if (inCond.has(key)) continue;
    all.push({
      key,
      name: storeDisplayName(chain.name, st.name),
      category: CATEGORY_LABEL[chain.category] ?? '',
      m: st.m,
      band: bandOf(st.m, st.distance),
      url: st.url,
      facilities: (() => {
        const ev = evidenceForStore(st);
        return OTHER_FAC_ORDER.filter((n) => ev.has(n)).map((n) => ({ label: NEED_LABEL[n], source: ev.get(n)! }));
      })(),
      rank: SIT_DOWN_FIRST[chain.category] ?? 2,
    });
  }
  all.sort((a, b) => a.rank - b.rank || (a.m ?? 9999) - (b.m ?? 9999));
  return { stores: all.slice(0, limit).map(({ rank: _rank, ...x }) => x), total: all.length };
}
