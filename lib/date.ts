/**
 * 日付ユーティリティ。Asia/Tokyo 固定。
 * サイトの「今日」を主張するため、全表示は JST から生成する。
 */

const TZ = 'Asia/Tokyo';
const MONTH_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'];

type TokyoDate = {
  year: number;
  month: number;  // 1-12
  day: number;    // 1-31
  weekday: number; // 0-6 (Sun=0)
};

/** JST の「今」を年月日に分解して返す。 */
export function getTokyoNow(): TokyoDate {
  // Intl.DateTimeFormat で JST の各要素を取得（SSR/CSR 同じ結果）
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).formatToParts(new Date());

  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;

  const year = Number(map.year);
  const month = Number(map.month);
  const day = Number(map.day);
  // 曜日記号を日〜土の数字に戻す
  const weekdayIdx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as const;
  const weekday = weekdayIdx[map.weekday as keyof typeof weekdayIdx] ?? 0;

  return { year, month, day, weekday };
}

/** 「4月18日（土）」形式。 */
export function formatJaLong(d: TokyoDate = getTokyoNow()): string {
  return `${d.month}月${d.day}日（${WEEKDAY_JA[d.weekday]}）`;
}

/** 「April 18, 2026」形式。 */
export function formatEnLong(d: TokyoDate = getTokyoNow()): string {
  return `${MONTH_EN[d.month - 1]} ${d.day}, ${d.year}`;
}

/** 英語月名だけ。("April") */
export function monthNameEn(d: TokyoDate = getTokyoNow()): string {
  return MONTH_EN[d.month - 1];
}

/** JST で「平日 / 休日」判定。祝日考慮なし（シンプル実装）。 */
export function isHoliday(d: TokyoDate = getTokyoNow()): boolean {
  return d.weekday === 0 || d.weekday === 6;
}
