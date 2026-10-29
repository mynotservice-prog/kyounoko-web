/**
 * 駅ページ・駅×条件ページ・今日の流れで「この店に◯◯がある」と言ってよい根拠（2026-10-28・Phase 0）。
 *
 * なぜあるか: 駅ページの設備タグ・件数・「赤ちゃん初めての外食」などの抽出は、`lib/station-restaurants.ts`
 * の Chain 型に手で入れたチェーン単位の値（kidsMenu・babyChair・privateRoom・babyFoodOk・stroller）で
 * 作っていた。この値には出典が無く、店ごとの違いも見ていない。設計書 docs/station-cond-rebuild-2026-10.md §3。
 *
 * ここで数えてよいのは次の2段だけ:
 *   - 店の公式: その店について、チェーン公式の店舗検索が「あり」と表示している設備（VerifiedStore.fac）
 *   - ブランドの公式: lib/chain-facilities.ts で ok:true かつ scope:'brand'（全店向けの公式の記載）の項目
 * 'partial'・'some-stores'・'unknown' は数えない（範囲の印が無い古い書き方は、公式の出典があれば全店向けとして数える）。Chain 型の手入力の値は使わない。
 *
 * 駅×条件ページの配信の判定（isStationConditionIndexable）はここを使わない（Phase 2 で切り替える）。
 */
import { getChainFacilitiesForSurvey, type FacilityKey } from './chain-facilities';
import { getVerifiedStores, type VerifiedStore } from './station-verified-stores';

export type EvidenceNeed =
  | 'kidsMenu'
  | 'babyChair'
  | 'diaper'
  | 'nursing'
  | 'babyFood'
  | 'privateRoom'
  | 'stepFree'
  | 'kidsSpace';

export const EVIDENCE_LABEL: Record<EvidenceNeed, string> = {
  kidsMenu: 'キッズメニュー',
  babyChair: '子ども用の椅子',
  diaper: 'おむつ替え台',
  nursing: '授乳スペース',
  babyFood: '離乳食の持ち込み',
  privateRoom: '個室・座敷',
  stepFree: '入口の段差なし・スロープ',
  kidsSpace: 'キッズスペース',
};

/** 公式店舗検索の表記（gen_ts.py で短くした後のもの）→ 根拠の項目 */
const STORE_LABEL_TO_NEED: Record<string, EvidenceNeed> = {
  お子様メニュー: 'kidsMenu',
  お子さまメニュー: 'kidsMenu',
  キッズセット: 'kidsMenu',
  子供用イス: 'babyChair',
  子供椅子: 'babyChair',
  ベビーチェア: 'babyChair',
  おむつ替え台: 'diaper',
  おむつ替えシート: 'diaper',
  ベビーシート: 'diaper',
  オムツ替えシート: 'diaper',
  トイレおむつ台: 'diaper',
  おむつ交換台: 'diaper',
  授乳スペース: 'nursing',
  座敷: 'privateRoom',
  '座敷・小上がり': 'privateRoom',
  '個室・個室風席': 'privateRoom',
  個室: 'privateRoom',
  パーティールームまたは個室: 'privateRoom',
  小上がり席: 'privateRoom',
  段差なし: 'stepFree',
  入口段差なしまたはエレベーター: 'stepFree',
  '1F店舗（スロープあり）': 'stepFree',
  スロープ: 'stepFree',
  スロープ対応: 'stepFree',
  入り口スロープ: 'stepFree',
  'スロープ／エレベーター': 'stepFree',
  入り口バリアフリー: 'stepFree',
  キッズルーム: 'kidsSpace',
  キッズスペース: 'kidsSpace',
  プレイプレイス: 'kidsSpace',
};

/** 根拠の項目 → chain-facilities のキー（ブランドの公式で数えるもの） */
const NEED_TO_BRAND_KEY: Partial<Record<EvidenceNeed, FacilityKey>> = {
  kidsMenu: 'kidsMenu',
  babyChair: 'kidsChair',
  diaper: 'diaperTable',
  nursing: 'nursingRoom',
  babyFood: 'babyFoodBringIn',
  privateRoom: 'zashiki',
  stepFree: 'stepFree',
};

/** 駅ページのチェーンslug → chain-facilities の key（名前が違うものだけ） */
const CHAIN_FACILITIES_ALIAS: Record<string, string> = {
  'shabu-yo': 'shabuyou',
  'musashino-mori-coffee': 'musashinomori-coffee',
  'mister-donut': 'misdo',
  ichiban: 'uobei',
  'ringer-hut': 'ringerhut',
  'saint-marc-cafe': 'sanmarccafe',
  'tully-coffee': 'tullyscoffee',
  'kushikatsu-tanaka': 'kushikatsutanaka',
  'yakiniku-king': 'yakinikuking',
  goemon: 'yomenya-goemon',
  lotteria: 'zetteria',
};

export type BrandEvidence = { sourceUrl?: string; verifiedAt?: string };

let brandCache: Map<string, Map<EvidenceNeed, BrandEvidence>> | null = null;
function brandTable(): Map<string, Map<EvidenceNeed, BrandEvidence>> {
  if (brandCache) return brandCache;
  brandCache = new Map();
  for (const c of getChainFacilitiesForSurvey()) {
    const m = new Map<EvidenceNeed, BrandEvidence>();
    for (const [need, key] of Object.entries(NEED_TO_BRAND_KEY) as [EvidenceNeed, FacilityKey][]) {
      const v = c.items[key];
      // 全店向けの公式の記載: scope:'brand'。10/24 の照合より前の書き方（scope なし）でも、公式の出典（sourceUrl）があれば同じ扱い
      // （ガスト・ジョナサン・スシロー・大戸屋のキッズメニューなど。2026-10-29）。店舗検索の集計で全店にあるものも数える。
      // 「一部店舗のみ」（some-stores）と、全店に満たない集計は数えない
      const brandWide =
        v?.ok === true &&
        (v.scope === 'brand' ||
          (!v.scope && !!v.sourceUrl) ||
          (v.scope === 'store-count' && v.stores !== undefined && v.stores === v.storesTotal));
      if (v && brandWide) m.set(need, { sourceUrl: v.sourceUrl, verifiedAt: v.verifiedAt ?? c.verifiedAt });
    }
    brandCache.set(c.key, m);
  }
  return brandCache;
}

/** ブランドの公式（全店向けの記載）で「ある」と言える項目 */
export function brandEvidence(chainSlug: string): Map<EvidenceNeed, BrandEvidence> {
  return brandTable().get(CHAIN_FACILITIES_ALIAS[chainSlug] ?? chainSlug) ?? new Map();
}

/** その店について、公式店舗検索の表示で「ある」と言える項目 */
export function storeEvidence(store: Pick<VerifiedStore, 'fac'>): Set<EvidenceNeed> {
  const s = new Set<EvidenceNeed>();
  for (const label of store.fac ?? []) {
    const need = STORE_LABEL_TO_NEED[label];
    if (need) s.add(need);
  }
  return s;
}

export type EvidenceSource = 'store' | 'brand';

/** 店1つについて、項目ごとの根拠（店の公式を優先） */
export function evidenceForStore(store: VerifiedStore): Map<EvidenceNeed, EvidenceSource> {
  const m = new Map<EvidenceNeed, EvidenceSource>();
  for (const need of brandEvidence(store.chain).keys()) m.set(need, 'brand');
  for (const need of storeEvidence(store)) m.set(need, 'store');
  return m;
}

export type EvidenceStore = {
  chain: string;
  name: string;
  address?: string;
  distance?: VerifiedStore['distance'];
  url?: string;
  source: EvidenceSource;
};

/**
 * 駅で、その項目に根拠のある店の一覧（駅に近い順）。
 * 照合済みの駅は実在店ごと。照合していない駅は、ブランドの公式がある項目だけをチェーン単位で返す
 * （店は特定しないので name はチェーン名）。chainSlugs はその駅で表示しているチェーン。
 * 6店目以降（more）は店名が無いので、ブランドの公式がある項目に限り moreCount に数える。
 */
export function evidenceStoresAt(
  stationSlug: string,
  need: EvidenceNeed,
  chainSlugs: { slug: string; name: string }[],
): { stores: EvidenceStore[]; moreCount: number } {
  const verified = getVerifiedStores(stationSlug);
  if (!verified) {
    const stores = chainSlugs
      .filter((c) => brandEvidence(c.slug).has(need))
      .map((c) => ({ chain: c.slug, name: c.name, source: 'brand' as const }));
    return { stores, moreCount: 0 };
  }
  const shown = new Map(chainSlugs.map((c) => [c.slug, c.name]));
  const stores: EvidenceStore[] = [];
  for (const st of verified.stores) {
    if (!shown.has(st.chain)) continue;
    const src = evidenceForStore(st).get(need);
    if (src) {
      stores.push({
        chain: st.chain,
        name: storeDisplayName(shown.get(st.chain)!, st.name),
        address: st.address,
        distance: st.distance,
        url: st.url,
        source: src,
      });
    }
  }
  let moreCount = 0;
  for (const [chain, n] of Object.entries(verified.more ?? {})) {
    if (shown.has(chain) && brandEvidence(chain).has(need)) moreCount += n;
  }
  return { stores, moreCount };
}

/** 公式の店名にチェーン名が入っていない店（「品川駅前店」など）は、チェーン名を前に付ける */
export function storeDisplayName(chainName: string, storeName: string): string {
  const n = (v: string) => v.normalize('NFKC').replace(/\s+/g, '');
  const store = n(storeName);
  const chain = n(chainName);
  if (store.includes(chain)) return storeName;
  // 「とんかつ和幸」の「和幸経堂コルティ店」のように、店名がチェーン名の一部（2字以上）で始まるときも付けない
  for (let len = chain.length - 1; len >= 2; len--) {
    for (let i = 0; i + len <= chain.length; i++) {
      if (store.startsWith(chain.slice(i, i + len))) return storeName;
    }
  }
  return `${chainName} ${storeName}`;
}

/** チェーンのカード用: その駅のこのチェーンで、根拠のある項目と根拠の段 */
export function chainEvidenceAt(stationSlug: string, chainSlug: string): Map<EvidenceNeed, EvidenceSource> {
  const verified = getVerifiedStores(stationSlug);
  const m = new Map<EvidenceNeed, EvidenceSource>();
  for (const need of brandEvidence(chainSlug).keys()) m.set(need, 'brand');
  if (verified) {
    // 掲載店のどれか1店でも公式の表示があれば「店の公式」。全店に無いとは言わない（表示はチェーンのカード単位）
    for (const st of verified.stores.filter((s) => s.chain === chainSlug)) {
      for (const need of storeEvidence(st)) m.set(need, 'store');
    }
  }
  return m;
}

/** 表示順 */
export const EVIDENCE_ORDER: EvidenceNeed[] = [
  'kidsMenu',
  'babyChair',
  'diaper',
  'nursing',
  'babyFood',
  'privateRoom',
  'stepFree',
  'kidsSpace',
];

/** 設備の条件ページで「根拠のある店」の数（店単位・重複なし）。業態の条件（ファミレス等）は null */
const CONDITION_NEEDS: Record<string, EvidenceNeed[] | undefined> = {
  'kids-menu': ['kidsMenu'],
  'private-room': ['privateRoom'],
  baby: ['babyChair', 'diaper', 'nursing', 'babyFood'],
  rainy: [],
};
export function conditionEvidenceCount(
  stationSlug: string,
  condition: string,
  chains: { slug: string; name: string }[],
  indies: { name: string; privateRoom?: boolean }[],
): number | null {
  const needs = CONDITION_NEEDS[condition];
  if (!needs) return null;
  const keys = new Set<string>();
  let more = 0;
  for (const need of needs) {
    const { stores, moreCount } = evidenceStoresAt(stationSlug, need, chains);
    for (const s of stores) keys.add(`${s.chain}|${s.name}`);
    more = Math.max(more, moreCount);
  }
  const indieCount = condition === 'private-room' ? indies.filter((i) => i.privateRoom).length : 0;
  return keys.size + more + indieCount;
}
