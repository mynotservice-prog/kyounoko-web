/**
 * 週次LINE配信「今週末どこ行く？」の中身を組み立てる。
 *
 * - Open-Meteo（無料・APIキー不要）で東京の今週末（土・日）の天気を取得
 * - 天気に合わせて lib/spots.ts の東京スポットから3つ提案（雨=屋内 / 晴れ=屋外 / くもり=ミックス）
 * - LINE配信用のテキストを生成（各提案は kyounoko.jp への送客リンク付き）
 *
 * 使う側: app/api/cron/line-weekend/route.ts（毎週金曜20:00 JST の Vercel Cron）
 */
import { SPOTS, type Spot } from './spots';

const SITE = 'https://kyounoko.jp';
const TOKYO = { lat: 35.6895, lon: 139.6917 };

type DayWeather = { date: string; code: number; precipProb: number; label: string };
export type WeekendWeather = { sat: DayWeather | null; sun: DayWeather | null };
type Mode = 'indoor' | 'outdoor' | 'mixed';

/** WMO weather code → ざっくり日本語ラベル。 */
function weatherLabel(code: number): string {
  if (code === 0) return '快晴';
  if (code <= 3) return '晴れ〜くもり';
  if (code === 45 || code === 48) return '霧';
  if (code >= 51 && code <= 67) return '雨';
  if (code >= 71 && code <= 77) return '雪';
  if (code >= 80 && code <= 82) return 'にわか雨';
  if (code >= 85 && code <= 86) return 'にわか雪';
  if (code >= 95) return '雷雨';
  return 'くもり';
}

/** 雨・雪・雷雨、または降水確率50%以上なら「雨寄り」と判定。 */
function isRainy(d: DayWeather | null): boolean {
  if (!d) return false;
  const c = d.code;
  const wet = (c >= 51 && c <= 67) || (c >= 71 && c <= 86) || c >= 95;
  return wet || d.precipProb >= 50;
}

/** 日付文字列(YYYY-MM-DD, UTC正午扱い)の曜日。0=日,6=土。 */
function weekdayOf(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}

/**
 * 東京の「今週末（次に来る土・日）」の天気を取得。
 * cron は金曜に走る想定だが、手動実行でも次の土日を拾えるようにする。
 */
export async function fetchTokyoWeekendWeather(): Promise<WeekendWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${TOKYO.lat}&longitude=${TOKYO.lon}` +
    `&daily=weather_code,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=8`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const j = (await res.json()) as {
    daily?: { time?: string[]; weather_code?: number[]; precipitation_probability_max?: number[] };
  };
  const times = j.daily?.time ?? [];
  const codes = j.daily?.weather_code ?? [];
  const probs = j.daily?.precipitation_probability_max ?? [];
  const pick = (wd: number): DayWeather | null => {
    for (let i = 0; i < times.length; i++) {
      if (weekdayOf(times[i]) === wd) {
        const code = codes[i] ?? 0;
        return { date: times[i], code, precipProb: probs[i] ?? 0, label: weatherLabel(code) };
      }
    }
    return null;
  };
  return { sat: pick(6), sun: pick(0) };
}

/** 週末の天気からモードを決める。土日どちらか雨寄り＝屋内、両方晴れ＝屋外、それ以外＝ミックス。 */
export function decideMode(w: WeekendWeather): Mode {
  const satRain = isRainy(w.sat);
  const sunRain = isRainy(w.sun);
  if (satRain && sunRain) return 'indoor';
  if (satRain || sunRain) return 'mixed';
  return 'outdoor';
}

/** ISO風の週番号（1970-01-01基準の週）。毎週提案を回転させる種に使う。 */
function weekIndex(now: Date): number {
  return Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
}

/**
 * 東京のおでかけスポット（restaurant除く）から、モードに合う3件を選ぶ。
 * - indoor: 屋内 or 雨天OK(mixed) / outdoor: 屋外 or mixed / mixed: 全部
 * - popular → kidReport(実訪問) を優先し、週ごとに開始位置を回して重複を避ける
 * - なるべくカテゴリが被らないように3件そろえる
 */
export function selectSpots(mode: Mode, now: Date): Spot[] {
  const all = (SPOTS.tokyo ?? []).filter((s) => s.category !== 'restaurant');
  let pool =
    mode === 'indoor'
      ? all.filter((s) => s.place === 'indoor' || s.place === 'mixed')
      : mode === 'outdoor'
        ? all.filter((s) => s.place === 'outdoor' || s.place === 'mixed')
        : all;
  if (pool.length < 3) pool = all;

  const ranked = [...pool].sort((a, b) => {
    const pa = Number(Boolean(a.popular)) * 2 + Number(Boolean(a.kidReport));
    const pb = Number(Boolean(b.popular)) * 2 + Number(Boolean(b.kidReport));
    if (pb !== pa) return pb - pa;
    return a.name.localeCompare(b.name, 'ja');
  });
  if (ranked.length === 0) return [];

  const start = weekIndex(now) % ranked.length;
  const rotated = [...ranked.slice(start), ...ranked.slice(0, start)];

  const picked: Spot[] = [];
  const usedCat = new Set<string>();
  for (const s of rotated) {
    if (picked.length >= 3) break;
    if (usedCat.has(s.category)) continue;
    usedCat.add(s.category);
    picked.push(s);
  }
  // カテゴリ多様性で3件に満たなければ残りから補完
  for (const s of rotated) {
    if (picked.length >= 3) break;
    if (!picked.includes(s)) picked.push(s);
  }
  return picked.slice(0, 3);
}

function spotArea(s: Spot): string {
  return s.ward ?? s.city ?? '東京';
}

/** 天気に応じた /today ツールへの送客URL（UTM付き）。 */
function todayUrl(mode: Mode): string {
  const w = mode === 'indoor' ? 'rain' : mode === 'outdoor' ? 'sunny' : '';
  const q = new URLSearchParams();
  if (w) q.set('weather', w);
  q.set('utm_source', 'line');
  q.set('utm_medium', 'weekend');
  return `${SITE}/today?${q.toString()}`;
}

/** 配信本文を組み立てる（天気取得〜文面まで）。 */
export async function buildWeekendMessage(now: Date = new Date()): Promise<{
  text: string;
  mode: Mode;
  weather: WeekendWeather;
  spots: Spot[];
}> {
  const weather = await fetchTokyoWeekendWeather();
  const mode = decideMode(weather);
  const spots = selectSpots(mode, now);

  const wx = `土曜:${weather.sat?.label ?? '—'}／日曜:${weather.sun?.label ?? '—'}`;
  const lead =
    mode === 'indoor'
      ? '今週末は雨模様☔ 屋内でゆっくり過ごせる3つはこちら👇'
      : mode === 'outdoor'
        ? '今週末は晴れ予報☀️ 外で遊べる3つはこちら👇'
        : '今週末はお天気ミックス⛅ どっちでもいける3つはこちら👇';

  const items = spots
    .map((s, i) => `${['①', '②', '③'][i]} ${s.name}（${spotArea(s)}）\n　${s.note ?? ''}`)
    .join('\n');

  const text =
    `📅今週末どこ行く？\n東京の天気は【${wx}】。\n${lead}\n\n` +
    `${items}\n\n` +
    `▼今日の流れ（1日プラン）を作る\n${todayUrl(mode)}`;

  return { text, mode, weather, spots };
}
