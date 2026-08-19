/**
 * 「どのページが見られているか」×「今の中身の状態」を突き合わせて、
 * “次に何をやるべきか” を1本のキューにするデータ層。
 *
 * なぜ必要か:
 *   これまで需要（GSC/GA4）と状態（記事品質・スポット鮮度）が別々の画面にあり、
 *   「表示は多いが薄い記事」「クリックはあるが確認日が切れた施設」を突き合わせるのが
 *   目視作業だった。判断に必要な2つの数字が同じ行に並んでいないと優先順位は決まらない。
 *
 * 判定の考え方:
 *   - 期待CTRは外部のベンチマーク表を使わず、**このサイト自身の順位帯別CTR**から作る。
 *     ジャンル特性（AIOに食われる型など）が自動的に織り込まれる。
 *   - 「増やす（攻め）」は見込み増クリック数で並べる。
 *   - 「腐り防止（守り）」は増分では測れないので別キューにし、守るクリック数で並べる。
 *     数字の意味が違うものを1つのスコアに混ぜない。
 */

import { getTopPages, isSearchConsoleConfigured, type ScRow } from './search-console';
import { querySearchConsole } from './search-console';
import { getGa4TopPagesByPrefix, isGa4Configured } from './ga4';
import { getAllFileArticles, type FileArticleMeta } from './articles';
import { getAllArticleInsights, type ArticleInsights } from './article-insights';
import { getAllSpotsWithSlug, type Spot } from './spots';
import { getSpotFreshness } from './spot-verification';

export const DEMAND_DAYS = 28;

/** GA4のページ別PVを引く行数上限 */
const GA4_PAGE_LIMIT = 20000;

export type {
  ContentKind,
  ActionKey,
  DemandRow,
} from './content-demand-shared';
export { ACTION_LABEL, ACTION_SIDE } from './content-demand-shared';

import type { ContentKind, ActionKey, DemandRow } from './content-demand-shared';

export type DemandBoard = {
  configured: boolean;
  rows: DemandRow[];
  bands: Array<{
    band: string;
    /** この帯の期待CTR（採用値） */
    ctr: number;
    /** 基準の元になったページ数（表示300回以上） */
    pages: number;
    impressions: number;
    clicks: number;
    /** true=このサイトの実測 / false=ページ数不足で固定値 */
    measured: boolean;
  }>;
  totals: { clicks: number; impressions: number; ctr: number; position: number; prevClicks: number };
  ga4Configured: boolean;
  /**
   * GA4のPVの内訳。unmatched は「検索実績が無いのでこの表に出てこないページ」
   * （トップ・/category/* などの回遊面）。黙って落とすと「これで全部」と読めてしまうので数を持つ。
   */
  ga4: { totalPv: number; matchedPv: number; unmatchedPv: number; unmatchedPages: number } | null;
};

/* ── 順位帯 ───────────────────────────────────────── */

const BANDS: Array<{ key: string; min: number; max: number; fallbackCtr: number }> = [
  { key: '1-3位', min: 0, max: 3, fallbackCtr: 0.18 },
  { key: '3-5位', min: 3, max: 5, fallbackCtr: 0.11 },
  { key: '5-10位', min: 5, max: 10, fallbackCtr: 0.04 },
  { key: '10-20位', min: 10, max: 20, fallbackCtr: 0.015 },
  { key: '20位〜', min: 20, max: Infinity, fallbackCtr: 0.004 },
];

/**
 * 「上位化できたら届くCTR」の基準に使う帯。
 * 8位のページが1〜3位まで飛ぶ想定は楽観的すぎるので、現実的な着地点である3-5位帯を使う。
 */
const PUSH_TARGET_BAND = '3-5位';

/**
 * ベンチを実測とみなす最低ページ数（表示300回以上のページを数える）。
 * 少数だと1ページの特異値がそのまま基準になるため、下回ったら固定値にフォールバック。
 */
const BAND_MIN_PAGES = 8;

/** ベンチ算出の対象にするページの最低表示回数（0クリックの極小ページで基準が沈むのを防ぐ） */
const BENCH_MIN_IMPRESSIONS = 300;

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function bandOf(position: number): (typeof BANDS)[number] {
  return BANDS.find((b) => position > b.min && position <= b.max) ?? BANDS[BANDS.length - 1];
}

/* ── しきい値（変えるならここ1か所） ─────────────── */

const TH = {
  /** 攻めの対象にする最低表示回数 */
  minImpressions: 300,
  /** タイトル改善: 実測CTRがベンチのこの割合を下回ったら */
  ctrShortfallRatio: 0.6,
  /** あと一押しの順位レンジ */
  pushMin: 4,
  pushMax: 20,
  /** 順位が上がる確度の割引（見込み増クリックを盛らないため） */
  pushDiscount: 0.4,
  /**
   * 薄いと判定する品質スコア／文字数。全1,106記事の実測分布の下位25%に合わせてある
   * （品質スコア p25=64 / 本文 p25=1,711字）。ここを緩めると全記事が「薄い」になる。
   */
  thinScore: 64,
  thinBodyLength: 1800,
  /** キューに載せる最低の見込み増クリック（28日） */
  minUpside: 15,
  /** 守り: 鮮度切れスポットを拾う最低クリック */
  defendMinClicks: 5,
  /** 守り: 記事の「長期間更新なし」日数と最低クリック */
  staleArticleDays: 180,
  defendArticleMinClicks: 30,
  /** 維持（触らない）と表示する最低クリック */
  keepMinClicks: 50,
};

/* ── パス正規化 ───────────────────────────────────── */

export function normalizePath(url: string): string {
  const p = url
    .replace(/^https?:\/\/(www\.)?kyounoko\.jp/, '')
    .split('#')[0]
    .split('?')[0];
  const trimmed = p.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function classify(path: string): { kind: ContentKind; slug: string } {
  const seg = path.split('/').filter(Boolean);
  if (seg[0] === 'article' && seg[1]) return { kind: 'article', slug: seg[1] };
  if (seg[0] === 'spot' && seg[1]) return { kind: 'spot', slug: seg[1] };
  if (seg[0] === 'station' && seg[1]) return { kind: 'station', slug: seg[1] };
  if (seg[0] === 'event' && seg[1]) return { kind: 'event', slug: seg[1] };
  if (seg[0] === 'plan' && seg[1]) return { kind: 'plan', slug: seg[1] };
  return { kind: 'other', slug: path };
}

function daysSince(iso: string | undefined, now: Date): number | undefined {
  if (!iso) return undefined;
  const t = Date.parse(iso.length <= 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(t)) return undefined;
  return Math.max(0, Math.floor((now.getTime() - t) / 86400000));
}

/* ── GSC 取得 ─────────────────────────────────────── */

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** 前28日のページ別データ（比較用） */
async function getPrevPages(days: number, limit: number): Promise<ScRow[]> {
  const end = new Date(Date.now() - days * 86400000);
  const start = new Date(end.getTime() - days * 86400000);
  return querySearchConsole({
    startDate: iso(start),
    endDate: iso(end),
    dimensions: ['page'],
    rowLimit: limit,
  });
}

/* ── 本体 ─────────────────────────────────────────── */

export async function getDemandBoard(limit = 1000): Promise<DemandBoard> {
  const now = new Date();
  const configured = isSearchConsoleConfigured();
  if (!configured) {
    return {
      configured: false,
      rows: [],
      bands: [],
      totals: { clicks: 0, impressions: 0, ctr: 0, position: 0, prevClicks: 0 },
      ga4Configured: isGa4Configured(),
      ga4: null,
    };
  }

  const [cur, prev, ga4] = await Promise.all([
    getTopPages(DEMAND_DAYS, limit),
    getPrevPages(DEMAND_DAYS, limit).catch(() => [] as ScRow[]),
    // 上限1000だとPV下位のページが黙って0PV扱いになる（実測: サイト全体91,904PVのうち
    // 77,710PVしか紐付かなかった）。GA4は1リクエスト10万行まで返せるので余裕を持たせる。
    isGa4Configured()
      ? getGa4TopPagesByPrefix('/', DEMAND_DAYS, GA4_PAGE_LIMIT).catch(() => null)
      : Promise.resolve(null),
  ]);

  // アンカーURL行（#:~:text=…）は同じページを二重計上するので畳んでから使う
  const merge = (rows: ScRow[]) => {
    const m = new Map<string, { clicks: number; impressions: number; posSum: number }>();
    for (const r of rows) {
      const p = normalizePath(r.keys[0] ?? '');
      const e = m.get(p) ?? { clicks: 0, impressions: 0, posSum: 0 };
      e.clicks += r.clicks;
      e.impressions += r.impressions;
      e.posSum += r.position * r.impressions;
      m.set(p, e);
    }
    return m;
  };
  const curMap = merge(cur);
  const prevMap = merge(prev);

  const pvMap = new Map<string, number>();
  for (const r of ga4 ?? []) {
    const p = normalizePath(r.pagePath);
    pvMap.set(p, (pvMap.get(p) ?? 0) + r.pageViews);
  }

  // ── 順位帯別の期待CTR（このサイト自身の実測から作る）
  //
  // 平均ではなく「ページ単位の中央値」を使う。表示7万回・CTR1.8% のような巨大な1ページが
  // 加重平均を引きずり下ろし、同じ帯の他ページの取りこぼしが見えなくなるため。
  const bandAgg = BANDS.map((b) => ({ ...b, clicks: 0, impressions: 0, samples: [] as number[] }));
  for (const [, v] of curMap) {
    const pos = v.impressions > 0 ? v.posSum / v.impressions : 100;
    const b = bandAgg.find((x) => pos > x.min && pos <= x.max) ?? bandAgg[bandAgg.length - 1];
    b.clicks += v.clicks;
    b.impressions += v.impressions;
    if (v.impressions >= BENCH_MIN_IMPRESSIONS) b.samples.push(v.clicks / v.impressions);
  }
  const benchByBand = new Map<string, { ctr: number; measured: boolean; pages: number }>();
  let ceiling = Infinity; // 順位が下がるほど期待CTRが上がる逆転（少数サンプルのノイズ）を潰す
  for (const b of bandAgg) {
    const measured = b.samples.length >= BAND_MIN_PAGES;
    const raw = measured ? median(b.samples) : b.fallbackCtr;
    const ctr = Math.min(raw, ceiling);
    ceiling = ctr;
    benchByBand.set(b.key, { ctr, measured, pages: b.samples.length });
  }
  // 「上位化したら届くCTR」。1〜3位ではなく3-5位帯を現実的な着地点として使う。
  const targetCtr =
    benchByBand.get(PUSH_TARGET_BAND)?.ctr ?? BANDS.find((b) => b.key === PUSH_TARGET_BAND)!.fallbackCtr;

  // ── メタデータの索引
  const articleMeta = new Map<string, FileArticleMeta>();
  for (const a of getAllFileArticles()) articleMeta.set(a.slug, a);
  const insightsMap = new Map<string, ArticleInsights>();
  for (const i of getAllArticleInsights()) insightsMap.set(i.slug, i);
  const spotMap = new Map<string, { spot: Spot; area: string }>();
  for (const s of getAllSpotsWithSlug()) spotMap.set(s.slug, { spot: s.spot, area: String(s.area) });

  const rows: DemandRow[] = [];
  for (const [path, v] of curMap) {
    const position = v.impressions > 0 ? v.posSum / v.impressions : 0;
    const ctr = v.impressions > 0 ? v.clicks / v.impressions : 0;
    const band = bandOf(position);
    const bench = benchByBand.get(band.key)?.ctr ?? band.fallbackCtr;
    const p = prevMap.get(path);
    const { kind, slug } = classify(path);

    const row: DemandRow = {
      path,
      kind,
      slug,
      title: path,
      clicks: v.clicks,
      impressions: v.impressions,
      ctr,
      position,
      prevClicks: p?.clicks ?? 0,
      prevImpressions: p?.impressions ?? 0,
      deltaClicks: v.clicks - (p?.clicks ?? 0),
      pageViews: pvMap.size > 0 ? pvMap.get(path) ?? 0 : null,
      benchCtr: bench,
      positionBand: band.key,
      upsideTitle: 0,
      upsidePush: 0,
      action: 'none',
      reason: '',
      score: 0,
      publicHref: `https://kyounoko.jp${path}`,
    };

    if (kind === 'article') {
      const meta = articleMeta.get(slug);
      const ins = insightsMap.get(slug);
      row.title = meta?.title ?? ins?.title ?? path;
      row.subtitle = meta?.categoryName ?? meta?.category;
      row.updatedAt = meta?.updatedAt?.slice(0, 10);
      row.ageDays = daysSince(meta?.updatedAt, now);
      row.qualityScore = ins?.qualityScore;
      row.bodyLength = ins?.bodyLength;
      row.noindex = meta?.noindex;
      row.editHref = meta ? `/admin/articles/${slug}/edit` : undefined;
    } else if (kind === 'spot') {
      const s = spotMap.get(slug);
      if (s) {
        const f = getSpotFreshness(s.spot, now);
        row.title = s.spot.name;
        row.subtitle = s.spot.ward ?? s.spot.city ?? s.area;
        row.freshness = f.state;
        row.verifiedAt = f.verifiedAt;
        row.overdueDays = f.overdueDays;
        row.ageDays = f.ageDays;
        row.editHref = `/admin/spots/edit?q=${encodeURIComponent(s.spot.name)}`;
      }
    } else if (kind === 'event') {
      row.editHref = '/admin/events/edit';
    }

    decide(row, { bench, targetCtr });
    rows.push(row);
  }

  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
  const totalImpr = rows.reduce((s, r) => s + r.impressions, 0);
  const prevClicks = rows.reduce((s, r) => s + r.prevClicks, 0);
  const wPos = totalImpr > 0 ? rows.reduce((s, r) => s + r.position * r.impressions, 0) / totalImpr : 0;

  rows.sort((a, b) => b.clicks - a.clicks);

  let ga4Summary: DemandBoard['ga4'] = null;
  if (pvMap.size > 0) {
    const totalPv = [...pvMap.values()].reduce((s, v) => s + v, 0);
    const matchedPv = rows.reduce((s, r) => s + (r.pageViews ?? 0), 0);
    const known = new Set(rows.map((r) => r.path));
    let unmatchedPages = 0;
    for (const p of pvMap.keys()) if (!known.has(p)) unmatchedPages++;
    ga4Summary = { totalPv, matchedPv, unmatchedPv: totalPv - matchedPv, unmatchedPages };
  }

  return {
    configured: true,
    rows,
    bands: bandAgg.map((b) => ({
      band: b.key,
      ctr: benchByBand.get(b.key)?.ctr ?? b.fallbackCtr,
      pages: benchByBand.get(b.key)?.pages ?? 0,
      impressions: b.impressions,
      clicks: b.clicks,
      measured: benchByBand.get(b.key)?.measured ?? false,
    })),
    totals: {
      clicks: totalClicks,
      impressions: totalImpr,
      ctr: totalImpr > 0 ? totalClicks / totalImpr : 0,
      position: wPos,
      prevClicks,
    },
    ga4Configured: isGa4Configured(),
    ga4: ga4Summary,
  };
}

/* ── 判定 ─────────────────────────────────────────── */

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;
const int = (n: number) => Math.round(n).toLocaleString('en-US');

function decide(r: DemandRow, ctx: { bench: number; targetCtr: number }) {
  // 守り①: 需要があるのに事実確認が切れているスポット。
  // 2026-07に室内遊び場13本を全数検証したところ掲載施設の3〜5割が閉店/実在しなかった。
  // 順位やCTRより先に効くので、攻めの判定より前に置く。
  if (r.kind === 'spot' && r.clicks >= TH.defendMinClicks) {
    if (r.freshness === 'closed') {
      r.action = 'verify';
      r.score = r.clicks;
      r.reason = `閉店済みの記録あり。${int(r.clicks)}クリック分の掲載が誤情報になっている`;
      return;
    }
    if (r.freshness === 'stale' || r.freshness === 'unverified') {
      r.action = 'verify';
      r.score = r.clicks;
      r.reason =
        r.freshness === 'unverified'
          ? `確認記録なしで${int(r.clicks)}クリック。公式サイトで在否と設備を裏取りする`
          : `最終確認から${r.ageDays}日（期限を${r.overdueDays}日超過）で${int(r.clicks)}クリック`;
      return;
    }
  }

  // ── 攻め: 独立した2つの余地を出し、大きい方を今回の一手にする
  const hasDemand = r.impressions >= TH.minImpressions;

  // (a) タイトル/スニペット: 順位はあるのにクリックされていない分
  r.upsideTitle =
    hasDemand && r.position <= TH.pushMax && r.ctr < ctx.bench * TH.ctrShortfallRatio
      ? r.impressions * (ctx.bench - r.ctr)
      : 0;

  // (b) 順位: 上位帯まで押し上げたときの増分（確度で割引）
  r.upsidePush =
    hasDemand && r.position >= TH.pushMin && r.position <= TH.pushMax
      ? r.impressions * Math.max(0, ctx.targetCtr - r.ctr) * TH.pushDiscount
      : 0;

  const thin =
    (r.qualityScore != null && r.qualityScore < TH.thinScore) ||
    (r.bodyLength != null && r.bodyLength < TH.thinBodyLength);

  const best = Math.max(r.upsideTitle, r.upsidePush);
  if (best >= TH.minUpside) {
    if (r.upsideTitle >= r.upsidePush) {
      r.action = 'title';
      r.score = r.upsideTitle;
      r.reason = `${r.positionBand}の期待CTR ${pct(ctx.bench)} に対し実測 ${pct(r.ctr)}。表示${int(
        r.impressions,
      )}回のうち約${int(r.upsideTitle)}クリックを取りこぼしている`;
      return;
    }
    // 順位を上げたい。ただし中身が薄いままでは動かないので、薄い記事は先に厚みを足す。
    if (thin) {
      r.action = 'thicken';
      r.score = r.upsidePush;
      const detail = [
        r.qualityScore != null ? `品質スコア${r.qualityScore}` : null,
        r.bodyLength != null ? `本文${int(r.bodyLength)}字` : null,
      ]
        .filter(Boolean)
        .join('・');
      r.reason = `平均${r.position.toFixed(1)}位・表示${int(r.impressions)}回。${detail}で下位25%の薄さ。厚みを足せば約${int(
        r.upsidePush,
      )}クリック`;
      return;
    }
    r.action = 'push';
    r.score = r.upsidePush;
    r.reason = `平均${r.position.toFixed(1)}位・表示${int(r.impressions)}回。3-5位まで押し上げれば約${int(
      r.upsidePush,
    )}クリック（確度${Math.round(TH.pushDiscount * 100)}%で割引済み）`;
    return;
  }

  // 守り②: 稼いでいるのに長期間更新していない記事
  if (
    r.kind === 'article' &&
    r.clicks >= TH.defendArticleMinClicks &&
    r.ageDays != null &&
    r.ageDays >= TH.staleArticleDays
  ) {
    r.action = 'refresh';
    r.score = r.clicks;
    r.reason = `${int(r.clicks)}クリックを稼いでいるが最終更新が${r.ageDays}日前。価格・営業情報が古びていないか確認する`;
    return;
  }

  if (r.clicks >= TH.keepMinClicks) {
    r.action = 'keep';
    r.score = r.clicks;
    r.reason = `平均${r.position.toFixed(1)}位・CTR ${pct(r.ctr)}（${r.positionBand}の期待 ${pct(
      ctx.bench,
    )}）。今いじる理由がない`;
    return;
  }

  r.action = 'none';
  r.score = 0;
  r.reason =
    r.impressions < TH.minImpressions
      ? `表示${int(r.impressions)}回。まだ需要が立っていない`
      : `平均${r.position.toFixed(1)}位・CTR ${pct(r.ctr)}。改善余地が小さい`;
}
