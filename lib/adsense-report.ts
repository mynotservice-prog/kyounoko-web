/**
 * AdSense Management API v2 連携（推定収益の自動取得）。
 * ※ 広告レンダリング設定は lib/adsense.ts。こちらはレポート取得専用。
 *
 * 注意: AdSense は GA4/GSC と違い **Service Account 共有に非対応** のため、
 *       OAuth2 のリフレッシュトークン方式で連携する。未設定なら手入力でOK
 *       （metrics の affiliate.adsense に手で入れられる）。
 *
 * セットアップ（任意・自動化したい場合のみ）:
 *   1. Google Cloud で OAuth クライアント（デスクトップ）を作成
 *   2. scope https://www.googleapis.com/auth/adsense.readonly でリフレッシュトークンを発行
 *   3. Vercel env:
 *      - ADSENSE_OAUTH_CLIENT_ID
 *      - ADSENSE_OAUTH_CLIENT_SECRET
 *      - ADSENSE_OAUTH_REFRESH_TOKEN
 *      - ADSENSE_ACCOUNT_ID   例: "pub-4445473825791494"（未設定なら lib/adsense.ts の pub-id を流用）
 */
import { ADSENSE_PUB_ID } from './adsense';

const CLIENT_ID = process.env.ADSENSE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.ADSENSE_OAUTH_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.ADSENSE_OAUTH_REFRESH_TOKEN;
const ACCOUNT_RAW = process.env.ADSENSE_ACCOUNT_ID || ADSENSE_PUB_ID;

export function isAdsenseReportConfigured(): boolean {
  return !!(CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN && ACCOUNT_RAW);
}

function accountName(): string {
  if (!ACCOUNT_RAW) return '';
  return ACCOUNT_RAW.startsWith('accounts/') ? ACCOUNT_RAW : `accounts/${ACCOUNT_RAW}`;
}

async function getAccessToken(): Promise<string | null> {
  if (!isAdsenseReportConfigured()) return null;
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        refresh_token: REFRESH_TOKEN!,
        grant_type: 'refresh_token',
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[adsense] token error', res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch (e) {
    console.error('[adsense] token exception', e instanceof Error ? e.message : e);
    return null;
  }
}

type AdsenseReport = {
  totals?: { cells: { value: string }[] };
  rows?: { cells: { value: string }[] }[];
};

async function generateReport(params: URLSearchParams): Promise<AdsenseReport | null> {
  const token = await getAccessToken();
  if (!token) return null;
  const url = `https://adsense.googleapis.com/v2/${accountName()}/reports:generate?${params.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) {
    console.error('[adsense] report error', res.status, (await res.text()).slice(0, 300));
    return null;
  }
  return (await res.json()) as AdsenseReport;
}

function dateParams(prefix: 'startDate' | 'endDate', d: Date): [string, string][] {
  return [
    [`${prefix}.year`, String(d.getFullYear())],
    [`${prefix}.month`, String(d.getMonth() + 1)],
    [`${prefix}.day`, String(d.getDate())],
  ];
}

/** 指定期間の推定収益（円） */
export async function getAdsenseEarnings(start: Date, end: Date): Promise<number | null> {
  const params = new URLSearchParams();
  for (const [k, v] of [...dateParams('startDate', start), ...dateParams('endDate', end)]) params.append(k, v);
  params.append('metrics', 'ESTIMATED_EARNINGS');
  params.append('currencyCode', 'JPY');
  const report = await generateReport(params);
  if (!report) return null;
  const val = report.totals?.cells?.[0]?.value;
  return val != null ? Number(val) || 0 : 0;
}

export type AdsenseMonthlyRow = { month: string; earnings: number };

/** 直近 N か月の月次推定収益（円） */
export async function getAdsenseMonthly(months = 12): Promise<AdsenseMonthlyRow[] | null> {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - (months - 1), 1);
  const params = new URLSearchParams();
  for (const [k, v] of [...dateParams('startDate', start), ...dateParams('endDate', end)]) params.append(k, v);
  params.append('metrics', 'ESTIMATED_EARNINGS');
  params.append('dimensions', 'MONTH');
  params.append('currencyCode', 'JPY');
  const report = await generateReport(params);
  if (!report) return null;
  return (report.rows ?? []).map((row) => {
    const ym = row.cells?.[0]?.value ?? '';
    const month = ym.includes('-') ? ym.slice(0, 7) : ym.length === 6 ? `${ym.slice(0, 4)}-${ym.slice(4)}` : ym;
    return { month, earnings: Number(row.cells?.[1]?.value) || 0 };
  });
}
