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

function facetsOf(s: Spot): string[] {
  const f: string[] = [];
  if (s.babyChair) f.push('ベビーチェア');
  if (s.kidsMenu) f.push('キッズメニュー');
  if (s.strollerAccess) f.push('ベビーカーOK');
  if (s.babyFood) f.push('離乳食OK');
  return f;
}

/** 決定的な軽量ハッシュ（イベントごとにチェーン候補を回転させるためだけに使う）。 */
function slugHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function popularFirst(a: Spot, b: Spot): number {
  if (a.popular && !b.popular) return -1;
  if (!a.popular && b.popular) return 1;
  return a.name.localeCompare(b.name, 'ja');
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
  const pool = getAllSpotsWithSlug().filter(
    (x) =>
      x.area === ev.area &&
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
  // 市区町村一致の実店舗 → （東京のみ）全国ファミリー向けチェーン の順。
  // どちらも無ければスロットごと省く（レストランを創作しない）。
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

  // リンクできる実在スポットが1件も無いなら、プランとして成立しない
  if (usedSlugs.length === 0) return null;
  return { steps, usedSlugs };
}
