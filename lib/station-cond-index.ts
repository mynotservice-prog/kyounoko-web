// 駅×条件ページの index/noindex 判定（単一の真実源）。
// page.tsx の generateMetadata と sitemap.ts の双方から呼び、判定のドリフトを防ぐ。
//
// 二段ゲート（2026-06-30 薄ページ剪定 step2）:
//   1) spot系条件(asobiba/kouen/ame-asobiba)は従来方針どおり常に noindex。
//   2) GSC 90日で表示実績のある combo は無条件 index（需要実証済み＝将来も伸びる）。
//   3) 残りは「駅の重要度 × 内容の充実度」で判定:
//      主要/ターミナル駅 かつ matched件数>=3 のみ index。
//      minor駅 × 需要なし は、全国チェーンを並べただけの near-duplicate（doorway的）で
//      90日表示0が大量に死蔵していたため noindex。matched件数だけでは
//      kids-menu/indie/baby のように全駅で多数マッチする条件を剪定できないため、
//      駅の重要度（実需要が将来出うるか）を軸に加えている。
//      実績のある combo は (2) で必ず救済されるため chicken-egg を回避。
import { STATION_COND_DEMAND } from './station-cond-demand';
import type { ConditionKind, StationConditionSlug } from './station-conditions';

/** 内容充実度ゲートの最小 matched 件数。 */
export const STATION_CONDITION_MIN_MATCHES = 3;

export type StationScale = 'terminal' | 'major' | 'minor';

export function isStationConditionIndexable(
  slug: string,
  condition: StationConditionSlug | string,
  matchedCount: number,
  kind: ConditionKind,
  scale: StationScale | undefined,
): boolean {
  if (kind === 'spot') return false;
  if (STATION_COND_DEMAND.has(`${slug}/${condition}`)) return true;
  const significant = scale === 'terminal' || scale === 'major';
  return significant && matchedCount >= STATION_CONDITION_MIN_MATCHES;
}
