/**
 * データ源の健全性チェック。「今どの分析データがライブで取れているか」を一目で出す。
 *
 * 目的: GSC / GA4 / AdSense 等の分析は全て env（Google API資格情報）次第で
 * ライブ化する。どれが繋がっていてどれが未設定かが admin から見えないと、
 * データ・ドリブンの意思決定の前提（=データが実際に流れているか）が確認できない。
 * ここで各源の「設定済みか」＋「実フェッチが返るか（ライブか）」を実測する。
 *
 * 捏造ゼロ: 既存の isXConfigured() と、各クライアントへの小さな実フェッチのみ。
 * 失敗しても panel 全体は壊さない（source 単位で try/catch）。
 */
import { isSearchConsoleConfigured, getTopQueries } from './search-console';
import { isGa4Configured, getGa4Totals } from './ga4';
import { isAdsenseReportConfigured, getAdsenseEarnings } from './adsense-report';
import { getAllMonthlyMetrics } from './metrics';

export type DataSourceHealth = {
  key: string;
  label: string;
  /** 役割（この源で何の意思決定ができるか） */
  purpose: string;
  configured: boolean;
  /** 設定済みで実フェッチが成功したか。null=未設定で未チェック。 */
  live: boolean | null;
  /** 状態の一言（取得件数や未設定envなど）。 */
  detail: string;
  /** ライブ化に必要な env キー。 */
  envKeys: string[];
};

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getDataHealth(): Promise<DataSourceHealth[]> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400_000);

  // --- Search Console ---
  const gscConfigured = isSearchConsoleConfigured();
  const gsc: DataSourceHealth = {
    key: 'gsc',
    label: 'Search Console',
    purpose: '検索クエリ・順位・CTR改善/押上げ候補（/admin/seo）',
    configured: gscConfigured,
    live: gscConfigured ? false : null,
    detail: gscConfigured ? 'チェック中' : 'SEARCH_CONSOLE_SITE_URL 等が未設定',
    envKeys: ['SEARCH_CONSOLE_SITE_URL', 'GOOGLE_APPLICATION_CREDENTIALS_JSON'],
  };
  if (gscConfigured) {
    try {
      const rows = await getTopQueries(7, 5);
      gsc.live = rows.length > 0;
      gsc.detail = rows.length > 0 ? `直近7日 ${rows.length}件のクエリを取得` : '設定済みだが応答0件（データ未蓄積の可能性）';
    } catch (e) {
      gsc.live = false;
      gsc.detail = `設定済みだがフェッチ失敗: ${(e as Error).message.slice(0, 80)}`;
    }
  }

  // --- GA4（トラフィック） ---
  const ga4Configured = isGa4Configured();
  const ga4: DataSourceHealth = {
    key: 'ga4',
    label: 'GA4（トラフィック）',
    purpose: 'PV/セッション/ユーザー・月次トレンド・ページ別流入',
    configured: ga4Configured,
    live: ga4Configured ? false : null,
    detail: ga4Configured ? 'チェック中' : 'GA4_PROPERTY_ID / 認証情報が未設定',
    envKeys: ['GA4_PROPERTY_ID', 'GOOGLE_APPLICATION_CREDENTIALS_JSON'],
  };
  if (ga4Configured) {
    try {
      const t = await getGa4Totals(ymd(weekAgo), ymd(now));
      ga4.live = t != null;
      ga4.detail = t ? `直近7日 PV ${t.pageViews.toLocaleString()}・セッション ${t.sessions.toLocaleString()}` : '設定済みだが応答なし';
    } catch (e) {
      ga4.live = false;
      ga4.detail = `設定済みだがフェッチ失敗: ${(e as Error).message.slice(0, 80)}`;
    }
  }

  // --- AdSense（収益） ---
  const adsConfigured = isAdsenseReportConfigured();
  const ads: DataSourceHealth = {
    key: 'adsense',
    label: 'AdSense（収益）',
    purpose: '広告収益の実額・月次推移・急落アラート',
    configured: adsConfigured,
    live: adsConfigured ? false : null,
    detail: adsConfigured ? 'チェック中' : 'ADSENSE_OAUTH_* / ACCOUNT_ID が未設定',
    envKeys: ['ADSENSE_OAUTH_CLIENT_ID', 'ADSENSE_OAUTH_CLIENT_SECRET', 'ADSENSE_OAUTH_REFRESH_TOKEN', 'ADSENSE_ACCOUNT_ID'],
  };
  if (adsConfigured) {
    try {
      const e = await getAdsenseEarnings(weekAgo, now);
      ads.live = e != null;
      ads.detail = e != null ? `直近7日 収益 ¥${Math.round(e).toLocaleString()}` : '設定済みだが応答なし';
    } catch (err) {
      ads.live = false;
      ads.detail = `設定済みだがフェッチ失敗: ${(err as Error).message.slice(0, 80)}`;
    }
  }

  // --- 月次KVストア（手入力＋自動の蓄積。env不要で常時利用可） ---
  let monthsCount = 0;
  try {
    monthsCount = getAllMonthlyMetrics().length;
  } catch {
    monthsCount = 0;
  }
  const store: DataSourceHealth = {
    key: 'kpi-store',
    label: '月次KPIストア',
    purpose: 'PV/収益/アフィリの月次記録（/admin/kpi で編集・蓄積）',
    configured: true,
    live: monthsCount > 0,
    detail: `${monthsCount}ヶ月分を記録`,
    envKeys: [],
  };

  return [gsc, ga4, ads, store];
}
