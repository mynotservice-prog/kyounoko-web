/**
 * Google Search Console API 連携。
 *
 * セットアップ:
 *   1. GA4と同じService Account（GOOGLE_APPLICATION_CREDENTIALS_JSON）を流用
 *   2. Search Consoleで該当サイトの「ユーザーと権限」にService Accountのメールを「制限付き」以上で追加
 *   3. Vercel env に以下を追加:
 *      - SEARCH_CONSOLE_SITE_URL: 例 "sc-domain:kyounoko.jp" または "https://kyounoko.jp/"
 *
 * 未設定時は空配列を返す。
 */

import { JWT } from 'google-auth-library';
import { getGoogleCredentialsJson, getSearchConsoleSiteUrl } from './google-auth';

const SITE_URL = getSearchConsoleSiteUrl();
const CREDS = getGoogleCredentialsJson();

export type ScRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type ScQueryParams = {
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;
  dimensions: ('query' | 'page' | 'country' | 'device' | 'date')[];
  rowLimit?: number;
  dimensionFilterGroups?: unknown[];
};

let cachedClient: JWT | null = null;

async function getClient(): Promise<JWT | null> {
  if (!CREDS) return null;
  if (cachedClient) return cachedClient;
  // env が壊れた JSON でも build/prerender を落とさない（grace degrade で空表示）。
  try {
    const credentials = JSON.parse(CREDS);
    cachedClient = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
    return cachedClient;
  } catch (e) {
    console.error('[search-console] invalid GOOGLE_APPLICATION_CREDENTIALS_JSON', e instanceof Error ? e.message : e);
    return null;
  }
}

async function getAccessToken(): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;
  const tok = await client.getAccessToken();
  return tok?.token ?? null;
}

/**
 * Search Console searchAnalytics.query を実行。
 */
export async function querySearchConsole(params: ScQueryParams): Promise<ScRow[]> {
  if (!SITE_URL) return [];
  const token = await getAccessToken();
  if (!token) return [];

  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate: params.startDate,
      endDate: params.endDate,
      dimensions: params.dimensions,
      rowLimit: params.rowLimit ?? 1000,
      ...(params.dimensionFilterGroups ? { dimensionFilterGroups: params.dimensionFilterGroups } : {}),
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('[search-console] API error', res.status, await res.text());
    return [];
  }
  const data = await res.json();
  return (data.rows ?? []) as ScRow[];
}

/**
 * 過去N日のクエリ別レポート（順位順）
 */
export async function getTopQueries(days = 28, limit = 200): Promise<ScRow[]> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const rows = await querySearchConsole({
    startDate: fmt(start),
    endDate: fmt(end),
    dimensions: ['query'],
    rowLimit: limit,
  });
  // ソート: クリック降順
  return rows.sort((a, b) => b.clicks - a.clicks);
}

/**
 * 過去N日のページ別レポート
 */
export async function getTopPages(days = 28, limit = 100): Promise<ScRow[]> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const rows = await querySearchConsole({
    startDate: fmt(start),
    endDate: fmt(end),
    dimensions: ['page'],
    rowLimit: limit,
  });
  return rows.sort((a, b) => b.clicks - a.clicks);
}

/**
 * キーワード絞り込みレポート（例: 「キッズメニュー」関連）
 */
export async function getKeywordReport(keyword: string, days = 28, limit = 100): Promise<ScRow[]> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const rows = await querySearchConsole({
    startDate: fmt(start),
    endDate: fmt(end),
    dimensions: ['query'],
    rowLimit: limit,
    dimensionFilterGroups: [
      { filters: [{ dimension: 'query', operator: 'contains', expression: keyword }] },
    ],
  });
  return rows.sort((a, b) => b.impressions - a.impressions);
}

/**
 * 特定ページURLのクエリ別内訳（そのページがどのクエリで表示されているか）。
 * 勝ちページ深掘り（取りこぼしクエリの特定）に使う。
 */
export async function getQueriesForPage(page: string, days = 28, limit = 50): Promise<ScRow[]> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const rows = await querySearchConsole({
    startDate: fmt(start),
    endDate: fmt(end),
    dimensions: ['query'],
    rowLimit: limit,
    dimensionFilterGroups: [
      { filters: [{ dimension: 'page', operator: 'equals', expression: page }] },
    ],
  });
  return rows.sort((a, b) => b.impressions - a.impressions);
}

/**
 * CTR改善ターゲット候補抽出: 表示が多くてCTRが低いクエリ
 */
export function findCtrOpportunities(
  rows: ScRow[],
  options: { minImpressions?: number; maxCtr?: number; maxPosition?: number } = {},
): ScRow[] {
  const { minImpressions = 100, maxCtr = 0.05, maxPosition = 20 } = options;
  return rows
    .filter((r) => r.impressions >= minImpressions)
    .filter((r) => r.ctr <= maxCtr)
    .filter((r) => r.position <= maxPosition)
    .sort((a, b) => b.impressions - a.impressions);
}

/**
 * 順位押し上げ候補: 11〜20位のクエリ（あと一押しでTOP10）
 */
export function findPushUpCandidates(rows: ScRow[]): ScRow[] {
  return rows
    .filter((r) => r.position >= 8 && r.position <= 20)
    .filter((r) => r.impressions >= 50)
    .sort((a, b) => b.impressions - a.impressions);
}

/** 認証情報があるかどうか */
export function isSearchConsoleConfigured(): boolean {
  return Boolean(SITE_URL && CREDS);
}
