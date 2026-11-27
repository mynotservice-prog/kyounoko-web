/**
 * /today と /search が受け付けるクエリの許可リストと、正規の並び順への整形。
 *
 * 【2026-11-27 作成】/today はクエリごとに別のキャッシュキーになる。許可していない項目
 * （fbclid・date・category 等）、許可していない値、並び順のゆれ、意味の無い値（vm=0）が
 * そのまま通ると、同じ内容のページが別URLとして毎回 Function を起動する。
 * middleware.ts はここで作った正規のクエリと実際のクエリが違えば正規URLへ 308 を返す。
 * 応答は URL だけで決まり UA に依らないので、9/03 の「UA で変わる応答は保存させない」とは別物。
 *
 * このファイルはクライアント部品（OmakasePlanButton・OutingPlanView）からも読むので、
 * 駅マスタなど重いデータを import しない。駅 slug の実在確認は middleware が isKnownStation で渡す。
 *
 * 項目を足すときは TODAY_ORDER と TODAY_VALUES（または個別の判定）を同時に直すこと。
 * ここに無い項目は middleware で削られ、ページに届かない。
 */
import { AREAS, isValidArea } from './area';

/** 「別の候補」（vm/vl/va）の周期。5回押すと最初の候補に戻る。0 は「指定なし」と同じなので省く。 */
export const TODAY_VARIANT_CYCLE = 5;

/** 東京23区（lib/tokyo-stations.ts の TokyoWard と同じ。重いファイルを読まないよう写している） */
const TOKYO_WARDS = new Set([
  'chiyoda', 'chuo', 'minato', 'shinjuku', 'bunkyo', 'taito',
  'sumida', 'koto', 'shinagawa', 'meguro', 'ota', 'setagaya',
  'shibuya', 'nakano', 'suginami', 'toshima', 'kita', 'arakawa',
  'itabashi', 'nerima', 'adachi', 'katsushika', 'edogawa',
]);

/** 値が決まっている項目。app/today/page.tsx・lib/articles.ts の TodayQuery・各フォームの値に合わせる。 */
const TODAY_VALUES: Record<string, ReadonlySet<string>> = {
  age: new Set(['0-1', '2-3', '4-6']),
  weather: new Set(['sunny', 'cloudy', 'rain', 'heat', 'cold', 'any']),
  // indoor は app/area/[slug]/page.tsx の「室内施設」チップが付ける
  place: new Set(['home', 'outside', 'indoor', 'any']),
  day: new Set(['weekday', 'holiday', 'any']),
  duration: new Set(['15', '60', '120', '240']),
  budget: new Set(['free', 'low', 'mid', 'high', 'any']),
  mode: new Set(['go', 'do', 'eat', 'home']),
  slot: new Set(['lunch']),
};

/**
 * 正規の並び順。人の導線（駅チップ・おまかせ・別の候補・LINE 配信の UTM）が今出している順に合わせてある。
 * ここに無い項目（mealTime・date・category・fbclid・gclid・_rsc 等）はページが読まないか、
 * 読んでも結果が変わらないので削る（_rsc は Next が middleware の手前で外すので、ここには来ない）。
 */
const TODAY_ORDER = [
  'station', 'ward', 'age', 'weather', 'place', 'day', 'duration', 'budget', 'area', 'mode',
  'vm', 'vl', 'va', 'slot',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
] as const;

/** 駅・区を起点にした「今日の流れ」でだけ意味がある項目 */
const ANCHOR_ONLY = new Set(['vm', 'vl', 'va', 'slot']);
/** 「今日の流れ」（駅・区起点）では使わない項目。ページは station/ward/age/weather/budget/v* しか見ない */
const NON_ANCHOR_ONLY = new Set(['place', 'day', 'duration', 'area', 'mode']);

/** 地方ブロック（kansai 等）。記事の area にはブロックも入り、記事末尾の CTA がそのまま渡す */
const AREA_BLOCKS = new Set<string>(AREAS.flatMap((a) => (a.block ? [a.block] : [])));

const STATION_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UTM_VALUE_RE = /^[A-Za-z0-9_.-]{1,40}$/;

export type TodayCanonicalOptions = {
  /** 駅 slug の実在確認。渡さなければ形だけ見る（クライアント部品用） */
  isKnownStation?: (slug: string) => boolean;
};

type ParamSource = URLSearchParams | Record<string, string | undefined | null>;

function firstOf(src: ParamSource, key: string): string | undefined {
  if (src instanceof URLSearchParams) return src.get(key) ?? undefined;
  const v = src[key];
  return v == null ? undefined : String(v);
}

function normalizeVariant(v: string): string | undefined {
  if (!/^\d{1,6}$/.test(v)) return undefined;
  const n = Number(v) % TODAY_VARIANT_CYCLE;
  return n === 0 ? undefined : String(n);
}

/**
 * /today のクエリを正規化して、正規の並び順のクエリ文字列（先頭の ? なし）を返す。
 * 何も残らなければ空文字。値は英数字と - _ . だけなので、エンコードのゆれは起きない。
 * 同じ項目が複数あるときはページと同じく最初の値だけを見る。
 */
export function canonicalTodayQuery(src: ParamSource, opts: TodayCanonicalOptions = {}): string {
  const picked = new Map<string, string>();

  for (const key of TODAY_ORDER) {
    const raw = firstOf(src, key);
    if (raw === undefined || raw === '') continue;
    let value: string | undefined;
    if (key === 'station') {
      const ok = raw.length <= 40 && STATION_SLUG_RE.test(raw) && (opts.isKnownStation?.(raw) ?? true);
      value = ok ? raw : undefined;
    } else if (key === 'ward') {
      value = TOKYO_WARDS.has(raw) ? raw : undefined;
    } else if (key === 'area') {
      // all は「指定なし」と同じ（各導線も付けない）
      value = raw !== 'all' && (isValidArea(raw) || AREA_BLOCKS.has(raw)) ? raw : undefined;
    } else if (key === 'vm' || key === 'vl' || key === 'va') {
      value = normalizeVariant(raw);
    } else if (key.startsWith('utm_')) {
      value = UTM_VALUE_RE.test(raw) ? raw : undefined;
    } else {
      value = TODAY_VALUES[key]?.has(raw) ? raw : undefined;
    }
    if (value !== undefined) picked.set(key, value);
  }

  const anchored = picked.has('station') || picked.has('ward');
  const out: string[] = [];
  for (const [key, value] of picked) {
    if (anchored && NON_ANCHOR_ONLY.has(key)) continue;
    if (!anchored && ANCHOR_ONLY.has(key)) continue;
    out.push(`${key}=${value}`);
  }
  return out.join('&');
}

/** 正規化した /today の URL（パスのみ）。人の導線のリンクはこれで作ると 308 を挟まない。 */
export function todayHref(src: ParamSource, opts: TodayCanonicalOptions = {}): string {
  const qs = canonicalTodayQuery(src, opts);
  return qs ? `/today?${qs}` : '/today';
}

/** 「別の候補」を1つ進めた値（周期で戻る）。0 に戻ったら canonicalTodayQuery が項目ごと省く。 */
export function nextTodayVariant(current: string | undefined): string {
  const n = /^\d{1,6}$/.test(current ?? '') ? Number(current) : 0;
  return String((n + 1) % TODAY_VARIANT_CYCLE);
}

// ===== /search =====

/** 検索語の上限（文字数）。記事タイトルの検索にこれより長い語は要らない。超えたら 400。 */
export const SEARCH_MAX_QUERY_LENGTH = 64;
/** ページ送りの上限。記事は50件ずつで、全件でも数十ページ。 */
const SEARCH_MAX_PAGE = 200;

export type SearchCanonical =
  | { kind: 'ok'; query: string }
  | { kind: 'too-long' };

/**
 * /search のクエリを q と p だけに正規化する。q は前後の空白を落とし、空なら省く。
 * p は 2 以上の整数だけ残す（1 は省略と同じ）。返す query は URLSearchParams で作るので
 * 実際のクエリ文字列と比べるときは同じく URLSearchParams で作り直した文字列と比べること。
 */
export function canonicalSearchQuery(src: URLSearchParams): SearchCanonical {
  const q = (src.get('q') ?? '').trim();
  if (q.length > SEARCH_MAX_QUERY_LENGTH) return { kind: 'too-long' };
  const pRaw = src.get('p') ?? '';
  const p = /^\d{1,4}$/.test(pRaw) ? Number(pRaw) : 1;
  const out = new URLSearchParams();
  if (q) out.set('q', q);
  if (p >= 2 && p <= SEARCH_MAX_PAGE) out.set('p', String(p));
  return { kind: 'ok', query: out.toString() };
}
