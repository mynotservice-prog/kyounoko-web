// 駅×条件ページの index/noindex 判定（単一の真実源）。
// page.tsx の generateMetadata と sitemap.ts の双方から呼び、判定のドリフトを防ぐ。
//
// 二段ゲート（2026-06-30 薄ページ剪定 step2）:
//   1) spot系条件(asobiba/kouen/ame-asobiba)は従来方針どおり常に noindex。
//   2) index 救済リスト（2026-06-30 の GSC 90日で表示実績のある combo・凍結）は無条件 index。
//   3) 残りは「駅の重要度 × 内容の充実度」で判定:
//      主要/ターミナル駅 かつ matched件数>=3 のみ index。
//      minor駅 × 需要なし は、全国チェーンを並べただけの near-duplicate（doorway的）で
//      90日表示0が大量に死蔵していたため noindex。matched件数だけでは
//      kids-menu/indie/baby のように全駅で多数マッチする条件を剪定できないため、
//      駅の重要度（実需要が将来出うるか）を軸に加えている。
//      実績のある combo は (2) で必ず救済されるため chicken-egg を回避。
//
// index にしない面は配信しない（page.tsx が dynamicParams=false で 404）。ただし直近の GSC で
// 表示実績のある外食系の面は、404 にせず駅トップへ301する（shouldRedirectStationCondition）。
import { STATION_COND_INDEX_ALLOWLIST } from './station-cond-index-allowlist';
import { STATION_COND_DEMAND } from './station-cond-demand';
import { STATION_COND_LIVE_2026_10 } from './station-cond-live-2026-10';
import { STATION_COND_ZERO_TRIAL } from './station-cond-zero-trial';
import { STATION_COND_LOST_2026_10 } from './station-cond-lost-2026-10';
import { getConditionStores } from './station-cond-stores';
import type { ConditionKind, StationConditionSlug } from './station-conditions';

/** 内容充実度ゲートの最小 matched 件数。 */
export const STATION_CONDITION_MIN_MATCHES = 3;

export type StationScale = 'terminal' | 'major' | 'minor';

/**
 * 店単位で作り直した面（照合済みの575駅×6条件・lib/station-cond-stores.ts）の配信の型（2026-10-28・Phase 2）。
 *   'full'  … 主要駅・ターミナル駅（または表示実績の救済リスト）で、根拠のある店が1km以内に3店以上
 *   'few'   … 店が少ない（0〜2店）が残す面: 2026-10-28 時点で配信していた面／同日に外れた面で表示実績があり1店以上／店0の試験面
 *   null    … 配信しない
 *   undefined … 作り直しの対象外（従来の判定を使う）
 * 設計: docs/station-cond-rebuild-2026-10.md §5〜§6（配信の基準は1km以内に3店以上・社長決定）。
 */
export function stationConditionServeMode(
  slug: string,
  condition: string,
  scale: StationScale | undefined,
): 'full' | 'few' | null | undefined {
  const cs = getConditionStores(slug, condition);
  if (!cs) return undefined;
  const key = `${slug}/${condition}`;
  const significant = scale === 'terminal' || scale === 'major' || STATION_COND_INDEX_ALLOWLIST.has(key);
  if (significant && cs.within1000 >= STATION_CONDITION_MIN_MATCHES) return 'full';
  if (STATION_COND_LIVE_2026_10.has(key)) return 'few';
  if (STATION_COND_LOST_2026_10.has(key) && STATION_COND_DEMAND.has(key) && cs.within1000 >= 1) return 'few';
  if (STATION_COND_ZERO_TRIAL.has(key)) return 'few';
  return null;
}

export function isStationConditionIndexable(
  slug: string,
  condition: StationConditionSlug | string,
  matchedCount: number,
  kind: ConditionKind,
  scale: StationScale | undefined,
): boolean {
  if (kind === 'spot') return false;
  // 店単位で作り直した面は、チェーン単位の件数（matchedCount）ではなく根拠のある店の数で決める
  const mode = stationConditionServeMode(slug, condition, scale);
  if (mode !== undefined) return mode !== null;
  if (STATION_COND_INDEX_ALLOWLIST.has(`${slug}/${condition}`)) return true;
  const significant = scale === 'terminal' || scale === 'major';
  return significant && matchedCount >= STATION_CONDITION_MIN_MATCHES;
}

/**
 * 配信しない外食系の面のうち、GSC 直近90日で表示実績のあるものは駅トップへ301する（2026-09-26）。
 *
 * PR#261 で個人店をホットペッパー実店舗へ置き換えた際、旧データの推測フラグ（privateRoom 等）が消え、
 * 主要駅の個室・雨の日・個人店の面が matched<3 に落ちて 404 になった。中身がチェーン1〜2軒の面を
 * 作り直しても薄いので index には戻さず、Google が知っている URL の評価を駅トップへ寄せる。
 * index 対象でも該当0件の面はページ側で 404 になるため、同じく転送する。
 * spot系（遊び場・公園）は常に配信しないので、表示実績があれば件数によらず転送する（2026-09-29）。
 */
export function shouldRedirectStationCondition(
  slug: string,
  condition: StationConditionSlug | string,
  matchedCount: number,
  kind: ConditionKind,
  scale: StationScale | undefined,
): boolean {
  if (kind !== 'spot') {
    const mode = stationConditionServeMode(slug, condition, scale);
    if (mode !== undefined) return !mode && STATION_COND_DEMAND.has(`${slug}/${condition}`);
  }
  if (kind !== 'spot' && matchedCount > 0 && isStationConditionIndexable(slug, condition, matchedCount, kind, scale)) return false;
  return STATION_COND_DEMAND.has(`${slug}/${condition}`);
}
