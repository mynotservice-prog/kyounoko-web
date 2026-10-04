// 駅×条件ページのうち、配信しないが GSC で表示実績のある面を駅トップへ301する（2026-09-26）。
// 判定は lib/station-cond-index.ts の shouldRedirectStationCondition（index 判定と同じ単一の真実源）。
//
// next.config.ts の redirects() から呼び、ビルド時に計算する。リダイレクトはページより先に評価されるので、
// 固定リストにするとデータ更新で index に戻った面を潰してしまう。ビルドごとに計算すればずれない。
import { TOKYO_STATIONS } from './tokyo-stations';
import { getStationWithChains } from './station-restaurants';
import { getIndieRestaurantsByStation } from './indie-restaurants';
import {
  STATION_CONDITIONS,
  getConditionKind,
  filterChainsByCondition,
  filterIndiesByCondition,
} from './station-conditions';
import { shouldRedirectStationCondition } from './station-cond-index';

/**
 * 実験7（docs/experiments-active.md・判定 2026-10-01）の処置群・対照群・補助観察の駅トップ。
 * 実験7は駅トップが発見・クロール・登録されるかを測っている。条件ページからの301は新しい発見経路になるため、
 * 判定日までは転送先にしない（その間は従来どおり404）。判定日の翌日以降のビルドで自動的に転送が始まる。
 */
const EXP7_STATION_SLUGS: ReadonlySet<string> = new Set([
  // 処置群
  'komaba-todaimae', 'ogikubo', 'higashi-ginza', 'toshimaen', 'sakuragicho', 'tokyo-skytree', 'shin-kiba',
  'akasaka', 'toritsu-daigaku', 'nishi-eifuku', 'shimo', 'mitsukoshimae', 'yokodai',
  // 対照群
  'tsukishima', 'yurakucho', 'gakugei-daigaku', 'nezu', 'oizumi-gakuen', 'kuramae', 'jiyugaoka',
  'shimbamba', 'toyocho', 'ebina', 'ayase', 'takanawadai', 'edogawabashi',
  // 補助観察
  'roppongi',
]);
const EXP7_HOLD_UNTIL = Date.parse('2026-10-02T00:00:00+09:00');

export type StationConditionRedirect = { slug: string; condition: string };

export function listStationConditionRedirects(now: number = Date.now()): StationConditionRedirect[] {
  const holdExp7 = now < EXP7_HOLD_UNTIL;
  const out: StationConditionRedirect[] = [];
  for (const station of TOKYO_STATIONS) {
    // 条件ページはチェーンデータのある駅にしか存在しない（その駅トップは必ず配信される）。
    const data = getStationWithChains(station.slug);
    if (!data) continue;
    if (holdExp7 && EXP7_STATION_SLUGS.has(station.slug)) continue;
    const indies = getIndieRestaurantsByStation(station.slug);
    for (const cond of STATION_CONDITIONS) {
      const kind = getConditionKind(cond.slug);
      // spot系（遊び場・公園）は 2026-07-07 以降配信しないので件数は数えない（判定は表示実績だけ）
      const matchedCount =
        kind === 'spot'
          ? 0
          : filterChainsByCondition(data.chains, cond.slug).length +
            filterIndiesByCondition(indies, cond.slug).length;
      if (shouldRedirectStationCondition(station.slug, cond.slug, matchedCount, kind, station.scale)) {
        out.push({ slug: station.slug, condition: cond.slug });
      }
    }
  }
  return out;
}

/** next.config.ts の redirects() 用。条件ごとに1ルールへ畳み、ルール数を面の数に比例させない。 */
export function getStationConditionRedirects(): Array<{ source: string; destination: string; statusCode: 301 }> {
  const slugsByCondition = new Map<string, string[]>();
  for (const { slug, condition } of listStationConditionRedirects()) {
    const list = slugsByCondition.get(condition) ?? [];
    list.push(slug);
    slugsByCondition.set(condition, list);
  }
  return [...slugsByCondition].map(([condition, slugs]) => ({
    source: `/station/:slug(${slugs.join('|')})/${condition}`,
    destination: '/station/:slug',
    statusCode: 301,
  }));
}
