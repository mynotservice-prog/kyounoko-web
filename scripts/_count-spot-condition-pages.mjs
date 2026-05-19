#!/usr/bin/env node
/**
 * 新規追加された駅×スポット系条件ページが何ページ生成されるかドライラン。
 * tsx と node を組み合わせて確認する。
 */
import { execSync } from 'node:child_process';

const result = execSync(
  `npx tsx -e "
import { TOKYO_STATIONS } from './lib/tokyo-stations';
import { STATION_CONDITIONS, getConditionKind, hasMatchingItems } from './lib/station-conditions';
import { getSpotsForStation, hasMatchingSpots } from './lib/station-spots';
import { getStationWithChains } from './lib/station-restaurants';
import { getIndieRestaurantsByStation } from './lib/indie-restaurants';
const counts = { restaurant: 0, spot: 0 };
const perCond = {};
for (const s of TOKYO_STATIONS) {
  const data = getStationWithChains(s.slug);
  const chains = data?.chains ?? [];
  const indies = getIndieRestaurantsByStation(s.slug);
  const { all } = getSpotsForStation(s.slug);
  for (const c of STATION_CONDITIONS) {
    const k = getConditionKind(c.slug);
    const ok = k === 'restaurant' ? hasMatchingItems(chains, indies, c.slug) : hasMatchingSpots(all, c.slug);
    if (!ok) continue;
    counts[k]++;
    perCond[c.slug] = (perCond[c.slug] ?? 0) + 1;
  }
}
console.log('restaurant pages:', counts.restaurant);
console.log('spot pages:', counts.spot);
console.log('total pages:', counts.restaurant + counts.spot);
console.log('per condition:', JSON.stringify(perCond, null, 2));
"`,
  { cwd: process.cwd(), encoding: 'utf8' }
);
console.log(result);
