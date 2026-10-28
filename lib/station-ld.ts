/**
 * 駅ページ・駅×条件ページの ItemList（構造化データ）を店単位で組む（2026-10-28・Phase 0）。
 *
 * 以前はチェーン名（例「サイゼリヤ」）を Restaurant として並べ、description にチェーン共通の手書きの
 * 説明文を入れていた。特定の店ではなく、説明文にも出典が無かった。
 * 照合済みの駅は、公式で実在を確認した店（店名・住所・公式ページ）。照合していない駅のチェーンは、
 * その駅に店があるか確かめていないので載せない。個人店はホットペッパーの掲載情報（店名・住所・店ページ）。
 */
import type { Chain } from './station-restaurants';
import { CHAIN_CATEGORY_LABEL } from './station-restaurants';
import type { IndieRestaurant } from './indie-restaurants';
import { INDIE_GENRE_LABEL } from './indie-restaurants';
import { getVerifiedStores } from './station-verified-stores';
import { storeDisplayName } from './station-evidence';
import type { ConditionStores } from './station-cond-stores';

type LdRestaurant = {
  '@type': 'Restaurant';
  name: string;
  servesCuisine?: string;
  address?: { '@type': 'PostalAddress'; streetAddress: string; addressCountry: 'JP' };
  url?: string;
};

export function buildStoreItemListLd(
  stationSlug: string,
  chains: Chain[],
  indies: IndieRestaurant[],
  name: string,
  description: string,
) {
  const verified = getVerifiedStores(stationSlug);
  const byChain = new Map(chains.map((c) => [c.slug, c]));
  const items: LdRestaurant[] = [];
  for (const st of verified?.stores ?? []) {
    const c = byChain.get(st.chain);
    if (!c) continue;
    items.push({
      '@type': 'Restaurant',
      name: storeDisplayName(c.name, st.name),
      servesCuisine: CHAIN_CATEGORY_LABEL[c.category],
      address: { '@type': 'PostalAddress', streetAddress: st.address, addressCountry: 'JP' },
      ...(st.url ? { url: st.url } : {}),
    });
  }
  for (const r of indies) {
    items.push({
      '@type': 'Restaurant',
      name: r.name,
      servesCuisine: INDIE_GENRE_LABEL[r.genre],
      ...(r.address ? { address: { '@type': 'PostalAddress' as const, streetAddress: r.address, addressCountry: 'JP' as const } } : {}),
      ...(r.url ? { url: r.url } : {}),
    });
  }
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
  };
}

/** 店単位で作り直した駅×条件ページ（lib/station-cond-stores.ts）の ItemList。0店なら null */
export function buildConditionStoresLd(cs: ConditionStores, name: string, description: string) {
  if (cs.stores.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: cs.stores.length,
    itemListElement: cs.stores.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Restaurant',
        name: s.name,
        ...(s.genre ? { servesCuisine: s.genre } : {}),
        ...(s.address ? { address: { '@type': 'PostalAddress', streetAddress: s.address, addressCountry: 'JP' } } : {}),
        ...(s.url ? { url: s.url } : {}),
      },
    })),
  };
}
