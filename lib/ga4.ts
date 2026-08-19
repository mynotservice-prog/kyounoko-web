/**
 * GA4 Data API 連携。
 *
 * セットアップ:
 *   1. lib/google-auth.ts の Service Account を GA4 プロパティの「閲覧者」に追加
 *   2. Vercel env GA4_PROPERTY_ID に「プロパティ ID（数値）」を設定（管理 > プロパティ設定）
 *
 * 未設定/未連携時は null / [] を返す（呼び出し側でグレースフルに空表示）。
 */
import { getGoogleAccessToken, getGa4PropertyId, isGoogleConfigured } from './google-auth';

const PROPERTY_ID = getGa4PropertyId();
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

export function isGa4Configured(): boolean {
  return isGoogleConfigured() && !!PROPERTY_ID;
}

type RunReportBody = {
  dateRanges: { startDate: string; endDate: string }[];
  metrics: { name: string }[];
  dimensions?: { name: string }[];
  dimensionFilter?: unknown;
  orderBys?: unknown[];
  limit?: number;
};

type Ga4Row = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };

async function runReport(body: RunReportBody): Promise<Ga4Row[] | null> {
  if (!isGa4Configured()) return null;
  const token = await getGoogleAccessToken([SCOPE]);
  if (!token) return null;
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('[ga4] API error', res.status, (await res.text()).slice(0, 300));
    return null;
  }
  const data = (await res.json()) as { rows?: Ga4Row[] };
  return data.rows ?? [];
}

const num = (v?: string) => (v ? Number(v) || 0 : 0);

export type Ga4Totals = { pageViews: number; activeUsers: number; sessions: number };

/** 指定期間の合計（PV / アクティブユーザー / セッション） */
export async function getGa4Totals(startDate: string, endDate: string): Promise<Ga4Totals | null> {
  const rows = await runReport({
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }],
  });
  if (!rows) return null;
  const m = rows[0]?.metricValues ?? [];
  return { pageViews: num(m[0]?.value), activeUsers: num(m[1]?.value), sessions: num(m[2]?.value) };
}

export type Ga4MonthlyRow = { month: string; pageViews: number; activeUsers: number };

/** 直近 N か月の月次 PV / ユーザー（yearMonth 次元） */
export async function getGa4MonthlyTrend(months = 12): Promise<Ga4MonthlyRow[] | null> {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - (months - 1), 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const rows = await runReport({
    dateRanges: [{ startDate: fmt(start), endDate: fmt(end) }],
    dimensions: [{ name: 'yearMonth' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
    orderBys: [{ dimension: { dimensionName: 'yearMonth' } }],
  });
  if (!rows) return null;
  return rows.map((r) => {
    const ym = r.dimensionValues?.[0]?.value ?? ''; // 'YYYYMM'
    const month = ym.length === 6 ? `${ym.slice(0, 4)}-${ym.slice(4)}` : ym;
    return { month, pageViews: num(r.metricValues?.[0]?.value), activeUsers: num(r.metricValues?.[1]?.value) };
  });
}

export type Ga4EventByPageRow = { pagePath: string; count: number };

/**
 * 指定イベント（既定: affiliate_click）をページ別に集計。
 * 「どの記事が稼いでいるか」のクリック近似ランキングに使う。
 */
export async function getGa4EventByPage(
  eventName = 'affiliate_click',
  days = 28,
  limit = 50,
): Promise<Ga4EventByPageRow[] | null> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const rows = await runReport({
    dateRanges: [{ startDate: fmt(start), endDate: fmt(end) }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: eventName } },
    },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit,
  });
  if (!rows) return null;
  return rows.map((r) => ({
    pagePath: r.dimensionValues?.[0]?.value ?? '',
    count: num(r.metricValues?.[0]?.value),
  }));
}

export type Ga4EventByProviderRow = { provider: string; count: number };

/**
 * 指定イベント（既定: affiliate_click）を provider 別に集計。
 * 「どのASP（valuecommerce / rakuten / amazon ...）がクリックを稼いでいるか」の内訳に使う。
 *
 * ⚠️ 前提: GA4管理画面でイベントパラメータ `provider` を
 *   「カスタム定義 > カスタムディメンション（イベント スコープ / パラメータ名 provider）」
 *   として登録しておく必要がある。未登録だと Data API が 400 を返し、本関数は null になる。
 *   （計測自体は trackEvent で送れているので、登録すれば過去分も遡って集計される。）
 */
export async function getGa4EventByProvider(
  eventName = 'affiliate_click',
  days = 28,
  limit = 20,
): Promise<Ga4EventByProviderRow[] | null> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const rows = await runReport({
    dateRanges: [{ startDate: fmt(start), endDate: fmt(end) }],
    dimensions: [{ name: 'customEvent:provider' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: eventName } },
    },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit,
  });
  if (!rows) return null;
  return rows.map((r) => ({
    provider: r.dimensionValues?.[0]?.value || '(未設定)',
    count: num(r.metricValues?.[0]?.value),
  }));
}

export type Ga4PageViewRow = { pagePath: string; pageViews: number };

/**
 * 指定パスで始まるページの PV ランキングを返す（例: '/spot/' でスポット別 PV）。
 * 人気ランキングページ（/ranking）のデータ源。未連携時は null。
 */
export async function getGa4TopPagesByPrefix(
  prefix: string,
  days = 7,
  limit = 100,
): Promise<Ga4PageViewRow[] | null> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const rows = await runReport({
    dateRanges: [{ startDate: fmt(start), endDate: fmt(end) }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    dimensionFilter: {
      filter: { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH', value: prefix } },
    },
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit,
  });
  if (!rows) return null;
  return rows.map((r) => ({
    pagePath: r.dimensionValues?.[0]?.value ?? '',
    pageViews: num(r.metricValues?.[0]?.value),
  }));
}
