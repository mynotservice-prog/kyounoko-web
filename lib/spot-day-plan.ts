/**
 * スポット起点の「この日の流れ」生成。
 *
 * 役割: /spot/[slug] で、そのスポットを軸に「お昼どこで食べる？」「午後どこへ？」を
 *       編集部の一次データ（SPOTS / TOKYO_RESTAURANTS）だけで組み立てる。
 *       イベント起点版（lib/event-day-plan.ts・2026-08-18）の設計原則をそのまま踏襲する:
 *
 * - 新規URLは作らない。既存の /spot/ ページを厚くし、他の /spot/ へ送客する。
 * - 実在確認済みの一次データのみ使う。データが無いスロットは正直に省く（埋め草を書かない）。
 * - 時刻は断定しない（「午前」「お昼」「午後」の帯のみ）。
 * - 移動の近さも断定しない。最寄り駅一致なら「◯◯周辺」、市区町村一致なら「◯◯内」、
 *   それ以外は「エリア内・移動あり」と明示する。
 */

import {
  getAllSpotsWithSlug,
  isSpotIndexable,
  type Spot,
} from './spots';
import { getAreaName, type AreaSlug } from './area';
import { isSpotAvailableNow } from './spot-temp-closed';
import { facetsOf, slugHash, type EventDayPlan, type EventDayPlanStep } from './event-day-plan';

export type SpotDayPlan = EventDayPlan;

/** 同一施設の別スポット（「◯◯公園」と「◯◯公園じゃぶじゃぶ池」等）を候補から外す。 */
function isSameFacility(a: Spot, b: Spot): boolean {
  const an = a.name.replace(/\s/g, '');
  const bn = b.name.replace(/\s/g, '');
  if (an.length >= 3 && bn.includes(an)) return true;
  if (bn.length >= 3 && an.includes(bn)) return true;
  return false;
}

function popularFirst(a: Spot, b: Spot): number {
  if (a.popular && !b.popular) return -1;
  if (!a.popular && b.popular) return 1;
  return a.name.localeCompare(b.name, 'ja');
}

/**
 * スポット起点の1日の流れを組む。
 * - 軸スポットがレストラン・休止中のときは出さない（null）。
 * - お昼／午後とも一次データで埋まるスロットだけを返し、1件も埋まらなければ null。
 */
export function buildSpotDayPlan(entry: {
  slug: string;
  area: AreaSlug | string;
  spot: Spot;
}): SpotDayPlan | null {
  const axis = entry.spot;
  if (axis.category === 'restaurant') return null;
  if (!isSpotAvailableNow(axis.name)) return null;

  const areaName = getAreaName(entry.area as AreaSlug);
  const cityKey = axis.ward ?? axis.city ?? '';

  const pool = getAllSpotsWithSlug().filter(
    (x) =>
      x.area === entry.area &&
      x.slug !== entry.slug &&
      !isSameFacility(axis, x.spot) &&
      isSpotAvailableNow(x.spot.name),
  );
  const sameStation = (s: Spot): boolean =>
    !!axis.nearestStation && s.nearestStation === axis.nearestStation;
  const sameCity = (s: Spot): boolean =>
    !!cityKey && (s.ward ?? s.city ?? '').includes(cityKey);
  /** 近い順に 0=同駅 / 1=同市区 / 2=それ以外 */
  const proximity = (s: Spot): number => (sameStation(s) ? 0 : sameCity(s) ? 1 : 2);
  const moveLabel = (s: Spot): string =>
    sameStation(s)
      ? `${axis.nearestStation}周辺`
      : sameCity(s)
        ? `${cityKey}内`
        : `${areaName}内・移動あり`;

  const steps: EventDayPlanStep[] = [];
  const usedSlugs: string[] = [];

  // ---- 午前: このスポット（軸） ----
  steps.push({
    slot: '午前',
    icon: axis.place === 'outdoor' ? '🌳' : '🧸',
    kind: 'spot',
    title: axis.name,
    note: '営業時間・休業日はこのページの基本情報と公式サイトで確認してから出発を。',
    facets: facetsOf(axis).slice(0, 3),
  });

  // ---- お昼: 子連れOKレストラン ----
  // 同駅→同市区の実店舗 → （東京のみ）全国ファミリー向けチェーン の順。
  // どちらも無ければスロットごと省く（レストランを創作しない）。
  const restaurants = pool.filter((x) => x.spot.category === 'restaurant');
  const localLunch = restaurants
    .filter((x) => x.spot.ward !== '複数' && proximity(x.spot) <= 1)
    .sort(
      (a, b) => proximity(a.spot) - proximity(b.spot) || popularFirst(a.spot, b.spot),
    )[0];
  const chainPool =
    entry.area === 'tokyo'
      ? restaurants
          .filter((x) => x.spot.ward === '複数' && /チェーン/.test(x.spot.city ?? ''))
          .sort((a, b) => popularFirst(a.spot, b.spot))
      : [];
  const chainLunch =
    chainPool.length > 0 ? chainPool[slugHash(entry.slug) % chainPool.length] : undefined;
  const lunch = localLunch ?? chainLunch;
  if (lunch) {
    usedSlugs.push(lunch.slug);
    steps.push({
      slot: 'お昼',
      icon: '🍽',
      kind: 'restaurant',
      title: lunch.spot.name,
      note: lunch.spot.note,
      href: `/spot/${lunch.slug}`,
      facets: facetsOf(lunch.spot).slice(0, 3),
      move: localLunch
        ? moveLabel(lunch.spot)
        : '周辺のファミリー向けチェーン（店舗は公式で検索）',
    });
  }

  // ---- 午後: あそぶ・休憩できるスポット ----
  // 午前が屋外なら屋内を、屋内なら屋外を優先して緩急をつける。近い順にカスケード。
  const playPool = pool.filter(
    (x) => x.spot.category !== 'restaurant' && isSpotIndexable(x.spot),
  );
  const preferPlace: (s: Spot) => number =
    axis.place === 'outdoor'
      ? (s) => (s.place !== 'outdoor' ? 0 : 1)
      : (s) => (s.place === 'outdoor' ? 0 : 1);
  const play = [...playPool].sort(
    (a, b) =>
      proximity(a.spot) - proximity(b.spot) ||
      preferPlace(a.spot) - preferPlace(b.spot) ||
      popularFirst(a.spot, b.spot),
  )[0];
  if (play) {
    usedSlugs.push(play.slug);
    steps.push({
      slot: '午後',
      icon: play.spot.place === 'outdoor' ? '🌳' : '🧸',
      kind: 'spot',
      title: play.spot.name,
      note: play.spot.note,
      href: `/spot/${play.slug}`,
      move: moveLabel(play.spot),
    });
  }

  // リンクできる実在スポットが1件も無いなら、プランとして成立しない
  if (usedSlugs.length === 0) return null;
  return { steps, usedSlugs };
}
