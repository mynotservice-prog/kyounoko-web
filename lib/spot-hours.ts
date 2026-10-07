/**
 * スポットの定休日・営業時間（公式サイトの記載）と、「その日に開いているか」の判定。
 *
 * 【なぜあるか】「今日の流れ」（lib/outing-plan.ts）は、午前・午後の行き先を人気順・近い順で
 * 機械的に選ぶ。スポットのデータに休みの情報が無かったので、月曜に月曜休館の博物館を
 * 「午前はここへ」と案内していた。ここに載っているスポットは、定休日に当たる日は候補から外す。
 *
 * 【決まり】
 *  - データ（lib/spot-hours-data.ts）は運営元の公式サイトで読めたものだけ。文言は公式の表記のまま持つ。
 *  - 機械で判定するのは「毎週◯曜」「祝日は開館して翌日／翌平日に休み」「年末年始」「営業する季節」だけ。
 *    「第2・第4月曜」「不定休」「施設カレンダーによる」は判定せず、文言を表示して読者に確かめてもらう。
 *  - 載っていないスポットは「分からない」。開いているとも休みとも言わない。
 *  - 祝日の表（lib/jp-holidays.ts）の範囲を過ぎた日は、祝日の例外を当てられないので判定しない
 *    （休みと決めつけない）。
 */
import { SPOT_HOURS_ALIASES, SPOT_HOURS_DATA } from './spot-hours-data';
import { isJpHoliday, JP_HOLIDAYS_UNTIL } from './jp-holidays';

export type SpotHours = {
  /** ok=定休の記載あり / always-open=公式に無休・常時開放 / irregular=不定休・カレンダーによる */
  status: 'ok' | 'always-open' | 'irregular';
  /** 毎週休む曜日（0=日…6=土）。月に数回だけの休みは入れない */
  closedWeekdays?: number[];
  /** その曜日が祝日のときは開ける */
  holidayOpen?: boolean;
  /** 祝日に開けた代わりに休む日 */
  shiftTo?: 'next-day' | 'next-weekday';
  /** 年末年始などの休み（MM-DD。年をまたぐ範囲は from > to） */
  closedRanges?: Array<{ from: string; to: string }>;
  /** 営業する季節（MM-DD）。この外の日は営業していない */
  openSeason?: { from: string; to: string };
  /** 公式の休みの文言 */
  closedText?: string;
  /** 公式の営業時間の文言 */
  hoursText?: string;
  /** 曜日で表せない休み・予約制など（公式の記載に沿った補足） */
  note?: string;
  /** 記載のある公式ページ */
  source: string;
  /** 公式を読んだ日 */
  checkedAt: string;
};

/** name は lib/spots.ts の元の name。上書き後の表示名でも引ける（スポットページ用）。 */
export function getSpotHours(spotName: string): SpotHours | undefined {
  return SPOT_HOURS_DATA[spotName] ?? SPOT_HOURS_DATA[SPOT_HOURS_ALIASES[spotName] ?? ''];
}

type Ymd = { year: number; month: number; day: number };

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (d: Ymd) => `${d.year}-${pad(d.month)}-${pad(d.day)}`;
const toUtc = (d: Ymd) => new Date(Date.UTC(d.year, d.month - 1, d.day));
const fromUtc = (t: Date): Ymd => ({ year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() });
const addDays = (d: Ymd, n: number): Ymd => fromUtc(new Date(toUtc(d).getTime() + n * 86400000));
const weekdayOf = (d: Ymd) => toUtc(d).getUTCDay();

/** MM-DD の範囲に入るか（from > to は年をまたぐ範囲）。 */
function inMonthDayRange(d: Ymd, r: { from: string; to: string }): boolean {
  const md = `${pad(d.month)}-${pad(d.day)}`;
  return r.from <= r.to ? r.from <= md && md <= r.to : md >= r.from || md <= r.to;
}

/**
 * その日（JSTの年月日）に定休で閉まっているなら、理由の短い文言を返す。開いている・分からないは null。
 */
export function regularClosureOn(spotName: string, d: Ymd): string | null {
  const h = getSpotHours(spotName);
  if (!h) return null;
  if (h.openSeason && !inMonthDayRange(d, h.openSeason)) return '営業期間外';
  if (h.closedRanges?.some((r) => inMonthDayRange(d, r))) return '年末年始などの休み';
  if (h.status !== 'ok' || !h.closedWeekdays?.length) return null;
  if (toIso(d) > JP_HOLIDAYS_UNTIL) return null;

  const isHol = (x: Ymd) => isJpHoliday(toIso(x));
  const closedDay = (x: Ymd) => h.closedWeekdays!.includes(weekdayOf(x));

  if (closedDay(d)) return h.holidayOpen && isHol(d) ? null : '定休日';
  if (!h.holidayOpen || !h.shiftTo || isHol(d)) return null;

  const prev = addDays(d, -1);
  if (h.shiftTo === 'next-day') return closedDay(prev) && isHol(prev) ? '振替の休み' : null;

  // next-weekday: 祝日に開けた定休曜日の「直後の平日」。間に祝日・土日が挟まればその先へ送る
  const wd = weekdayOf(d);
  if (wd === 0 || wd === 6) return null;
  for (let x = prev, i = 0; i < 7; x = addDays(x, -1), i++) {
    const w = weekdayOf(x);
    const off = isHol(x) || w === 0 || w === 6;
    if (!off) return null;
    if (closedDay(x) && isHol(x)) return '振替の休み';
  }
  return null;
}

/** おすすめ枠に出してよいか（その日が定休なら false。データが無いスポットは true）。 */
export function isSpotOpenOn(spotName: string, d: Ymd): boolean {
  return regularClosureOn(spotName, d) === null;
}

/** 表示用の1行（「休み: 月曜（祝日の場合は翌平日）／9:30〜17:00」）。データが無ければ null。 */
export function spotHoursLine(spotName: string): string | null {
  const h = getSpotHours(spotName);
  if (!h) return null;
  const parts: string[] = [];
  if (h.closedText) parts.push(`休み: ${h.closedText}`);
  if (h.hoursText) parts.push(`時間: ${h.hoursText}`);
  return parts.length ? parts.join('／') : null;
}
