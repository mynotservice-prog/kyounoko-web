/**
 * 駅×子供の遊び場の施設に、きょうのこの施設ページ（/spot）があれば slug を付ける（ページ側だけで使う）。
 * lib/station-asobiba.ts は next.config.ts から間接的に読まれるので、lib/spots.ts への依存をここに分けている。
 */
import { getOutingSpotsWithSlug, isSpotIndexable } from './spots';
import type { StationAsobiba } from './station-asobiba';

const normName = (s: string) => s.replace(/[（(].*?[）)]/g, '').replace(/[\s・　]/g, '').trim();

let index: Map<string, string> | null = null;
function slugFor(name: string): string | undefined {
  if (!index) {
    index = new Map();
    for (const { slug, spot } of getOutingSpotsWithSlug()) {
      if (!isSpotIndexable(spot)) continue;
      const k = normName(spot.name);
      if (!index.has(k)) index.set(k, slug);
    }
  }
  return index.get(normName(name));
}

export function withSpotLinks(a: StationAsobiba): StationAsobiba {
  return { ...a, facilities: a.facilities.map((f) => ({ ...f, spotSlug: slugFor(f.name) })) };
}
