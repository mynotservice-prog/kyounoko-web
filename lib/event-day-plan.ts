/**
 * イベント起点の「1日モデルコース」生成。
 *
 * 役割: /event/[slug] で、イベントを軸に「お昼どこで食べる？」「前後どこで遊ぶ？」を
 *       編集部の一次データ（SPOTS / TOKYO_RESTAURANTS）だけで組み立てる。
 *
 * 設計方針（2026-08-18 評価メモ docs/event-day-plan-assessment-2026-08-18.md に基づく）:
 * - 新規URLは作らない。既存の /event/ ページを厚くし、/spot/ へ送客する（資産は /spot/ 側）。
 * - 実在確認済みの一次データのみ使う。データが無いスロットは正直に省く（埋め草を書かない）。
 * - イベントの開催時間データは持っていないため、時刻は断定しない（「午前」「お昼」「午後」の帯のみ）。
 * - 移動の近さも断定しない。市区町村一致なら「○○区内」、それ以外は「エリア内・移動あり」と明示する。
 */

import type { EventEntry } from './events';
import {
  getAllSpotsWithSlug,
  isSpotIndexable,
  type Spot,
} from './spots';
import { getAreaName } from './area';
import { isSpotAvailableNow } from './spot-temp-closed';
import {
  findStationBySlug,
  getAllStations,
  resolveStationSlugByName,
} from './all-stations';
import {
  getIndieRestaurantsByStation,
  INDIE_GENRE_LABEL,
  type IndieRestaurant,
} from './indie-restaurants';

export type EventDayPlanStep = {
  /** 時間帯ラベル（時刻は断定しない） */
  slot: string;
  /** 絵文字アイコン */
  icon: string;
  kind: 'event' | 'restaurant' | 'spot';
  title: string;
  /** 補足（会場・確認済み設備など） */
  note?: string;
  /** /spot/[slug] へのリンク（kind: event のときは無し） */
  href?: string;
  /** 子連れ設備タグ（ベビーチェア等、データにあるものだけ） */
  facets?: string[];
  /** 近さの表示（正直に）。例: '豊島区内' / '東京都内・移動あり' */
  move?: string;
};

export type EventDayPlan = {
  steps: EventDayPlanStep[];
  /** プランに採用した /spot/ の slug（重複表示の除外用） */
  usedSlugs: string[];
};

export function facetsOf(s: Spot): string[] {
  const f: string[] = [];
  if (s.babyChair) f.push('ベビーチェア');
  if (s.kidsMenu) f.push('キッズメニュー');
  if (s.strollerAccess) f.push('ベビーカーOK');
  if (s.babyFood) f.push('離乳食OK');
  return f;
}

/** 決定的な軽量ハッシュ（ページごとにチェーン候補を回転させるためだけに使う）。 */
export function slugHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function popularFirst(a: Spot, b: Spot): number {
  if (a.popular && !b.popular) return -1;
  if (!a.popular && b.popular) return 1;
  return a.name.localeCompare(b.name, 'ja');
}

/** nearestStation（slug/日本語名が混在）から駅slugを解決。spot-day-plan と同じ両対応。 */
function stationSlugOfSpot(s: Spot): string | undefined {
  const ns = s.nearestStation;
  if (!ns) return undefined;
  if (findStationBySlug(ns)) return ns;
  return resolveStationSlugByName(ns);
}

/** 個人店の子連れ向きスコア（true のフィールドだけ数える）。 */
function indieScore(r: IndieRestaurant): number {
  let score = 0;
  if (r.popular) score += 2;
  for (const k of [
    'kidsChair', 'kidsMenu', 'strollerOk', 'strollerToSeat', 'privateRoom',
    'bringBabyFood', 'kidsCutlery', 'shareDish', 'stepFree',
  ] as const) {
    if (r[k]) score += 1;
  }
  if (r.seatingType?.includes('zashiki')) score += 1;
  return score;
}

function indieFacets(r: IndieRestaurant): string[] {
  const f: string[] = [];
  if (r.kidsChair) f.push('キッズチェア');
  if (r.kidsMenu) f.push('キッズメニュー');
  if (r.strollerOk || r.strollerToSeat) f.push('ベビーカーOK');
  if (r.seatingType?.includes('zashiki')) f.push('座敷あり');
  else if (r.privateRoom) f.push('個室あり');
  return f;
}

type IndieLunchHit = { r: IndieRestaurant; stationSlug: string; move: string };

/**
 * イベントに紐づく駅の個人店を探す。
 * ①会場と同一施設のスポットが見つかればその最寄り駅（会場と同じ駅＝moveは店の駅徒歩表記そのまま）
 * ②東京のイベントは、開催区と同じ区の駅の個人店（駅名を明示して「◯◯駅周辺・△△区内」と正直に表示）
 */
function findIndieLunchForEvent(
  ev: EventEntry,
  venueSpots: Spot[],
): IndieLunchHit | undefined {
  // ① 会場スポットの最寄り駅
  for (const vs of venueSpots) {
    const slug = stationSlugOfSpot(vs);
    if (!slug) continue;
    const list = [...getIndieRestaurantsByStation(slug)].sort(
      (a, b) => indieScore(b) - indieScore(a) || a.name.localeCompare(b.name, 'ja'),
    );
    if (list.length) {
      const top = list.slice(0, 3);
      const r = top[slugHash(ev.slug) % top.length];
      return { r, stationSlug: slug, move: r.area };
    }
  }
  // ② 東京: 開催区と同じ区の駅（駅名を明示。会場からの距離は断定しない）
  if (ev.area === 'tokyo' && ev.city) {
    const wardStations = getAllStations().filter(
      (s) => s.region === 'tokyo' && s.regionLabel === ev.city,
    );
    const hits: IndieLunchHit[] = [];
    for (const st of wardStations) {
      for (const r of getIndieRestaurantsByStation(st.slug)) {
        hits.push({
          r,
          stationSlug: st.slug,
          move: `${st.name}駅周辺・${ev.city}内`,
        });
      }
    }
    if (hits.length) {
      const sorted = hits.sort(
        (a, b) => indieScore(b.r) - indieScore(a.r) || a.r.name.localeCompare(b.r.name, 'ja'),
      );
      const top = sorted.slice(0, 3);
      return top[slugHash(ev.slug) % top.length];
    }
  }
  return undefined;
}

/** イベント会場そのものと同一施設のスポットを候補から外す（自己参照の防止）。 */
export function isVenueSelf(ev: EventEntry, s: Spot): boolean {
  const name = s.name.replace(/\s/g, '');
  const venue = ev.venue.replace(/\s/g, '');
  if (name.length >= 3 && venue.includes(name)) return true;
  if (venue.length >= 3 && name.includes(venue)) return true;
  return false;
}

/**
 * イベント起点の1日モデルコースを組む。
 * 一次データで埋まるスロットだけを返し、リンク可能なスポットが1件も無ければ null。
 */
export function buildEventDayPlan(ev: EventEntry): EventDayPlan | null {
  const areaName = getAreaName(ev.area);
  const allInArea = getAllSpotsWithSlug().filter((x) => x.area === ev.area);
  // 会場と同一施設のスポット（最寄り駅の解決に使う。プラン候補からは外す）
  const venueSpots = allInArea.filter((x) => isVenueSelf(ev, x.spot)).map((x) => x.spot);
  const pool = allInArea.filter(
    (x) =>
      !isVenueSelf(ev, x.spot) &&
      // 改修等で休館中の施設は「午後はここへ」と案内しない（期間が明ければ自動で戻る）
      isSpotAvailableNow(x.spot.name),
  );
  const matchCity = (s: Spot): boolean =>
    !!ev.city && (s.ward ?? s.city ?? '').includes(ev.city);

  const steps: EventDayPlanStep[] = [];
  const usedSlugs: string[] = [];

  // ---- 午前: イベント（軸） ----
  steps.push({
    slot: '午前',
    icon: '🎪',
    kind: 'event',
    title: ev.title,
    note: `会場: ${ev.venue}${ev.city ? `（${ev.city}）` : ''}。開催時間・休止日は公式サイトで確認してから出発を。`,
  });

  // ---- お昼: 子連れOKレストラン ----
  // 優先順: ①駅×個人店データ（会場スポットの最寄り駅→東京は同区の駅）
  //         → ②市区町村一致の実店舗 → ③（東京のみ）全国ファミリー向けチェーン。
  // どれも無ければスロットごと省く（レストランを創作しない）。
  const indieHit = findIndieLunchForEvent(ev, venueSpots);
  if (indieHit) {
    steps.push({
      slot: 'お昼',
      icon: '🍽',
      kind: 'restaurant',
      title: `${indieHit.r.name}（${INDIE_GENRE_LABEL[indieHit.r.genre]}）`,
      note: `${indieHit.r.description} 設備・営業時間は店舗にご確認を。`,
      href: `/station/${indieHit.stationSlug}#section-indies`,
      facets: indieFacets(indieHit.r).slice(0, 3),
      move: indieHit.move,
    });
  }
  const restaurants = pool.filter((x) => x.spot.category === 'restaurant');
  const localLunch = restaurants
    .filter((x) => x.spot.ward !== '複数' && matchCity(x.spot))
    .sort((a, b) => popularFirst(a.spot, b.spot))[0];
  // チェーンは全国型（city に「チェーン」を含む）だけを候補にする。
  // IKEA のような店舗限定の '複数' 登録は「周辺の」と言えないので除外。
  // イベントごとに slug ハッシュで回転させ、全ページ同じ店にならないようにする。
  const chainPool =
    ev.area === 'tokyo'
      ? restaurants
          .filter((x) => x.spot.ward === '複数' && /チェーン/.test(x.spot.city ?? ''))
          .sort((a, b) => popularFirst(a.spot, b.spot))
      : [];
  const chainLunch = chainPool.length > 0 ? chainPool[slugHash(ev.slug) % chainPool.length] : undefined;
  const lunch = indieHit ? undefined : (localLunch ?? chainLunch);
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
      move: localLunch ? `${ev.city}内` : '周辺のファミリー向けチェーン（店舗は公式で検索）',
    });
  }

  // ---- 午後: あそぶ・休憩できるスポット ----
  // イベントで疲れた後でも使いやすいよう屋内・mixed を優先。市区町村一致 → エリア内の順。
  const playPool = pool.filter(
    (x) => x.spot.category !== 'restaurant' && isSpotIndexable(x.spot),
  );
  const rankPlay = (list: typeof playPool) =>
    [...list].sort((a, b) => {
      const ai = a.spot.place !== 'outdoor' ? 0 : 1;
      const bi = b.spot.place !== 'outdoor' ? 0 : 1;
      if (ai !== bi) return ai - bi;
      return popularFirst(a.spot, b.spot);
    });
  const localPlay = rankPlay(playPool.filter((x) => matchCity(x.spot)))[0];
  const widePlay = rankPlay(playPool.filter((x) => !matchCity(x.spot)))[0];
  const play = localPlay ?? widePlay;
  if (play) {
    usedSlugs.push(play.slug);
    steps.push({
      slot: '午後',
      icon: '🧸',
      kind: 'spot',
      title: play.spot.name,
      note: play.spot.note,
      href: `/spot/${play.slug}`,
      move: localPlay ? `${ev.city}内` : `${areaName}内・移動あり`,
    });
  }

  // リンクできる実在の行き先（個人店・スポット）が1件も無いなら、プランとして成立しない
  if (!steps.some((s) => s.href)) return null;
  return { steps, usedSlugs };
}
