/**
 * 月次の経営メトリクス蓄積層（手入力 + スナップショット）。
 *
 * data/metrics-monthly.json に月単位で記録し、/admin/kpi から編集すると
 * GitHub commit → Vercel 自動デプロイで反映（spot-overrides と同じ方式）。
 * バージョン管理されるので「データ・ドリブンな意思決定」のための時系列が貯まる。
 *
 * 自動取得できる指標（GA4のPV / AdSense収益 / GSCクリック / LINE友だち数）は
 * ダッシュボード側でライブ取得し、ここには「アフィリエイト確定収益（収入源別）」など
 * 手入力が必要なものを中心に蓄積する。lineFollowers / pv は自動値の月末スナップショット
 * を残したいとき（60日より前は API で取れないため）に使う。
 */
import { unstable_cache } from 'next/cache';
import monthlyJson from '../data/metrics-monthly.json';
import { isKvConfigured, kvGet, kvSet } from './kv-store';

/** アフィリエイト確定収益（円）の収入源別内訳。手入力。 */
export type AffiliateBySource = {
  moshimo?: number;
  a8?: number;
  rakuten?: number;
  amazon?: number;
  adsense?: number;
  other?: number;
};

export type MonthlyMetric = {
  /** 'YYYY-MM' */
  month: string;
  /** アフィリエイト確定収益（収入源別・円）。手入力。 */
  affiliate?: AffiliateBySource;
  /** LINE 友だち数（自動取得の月末スナップショット or 手入力） */
  lineFollowers?: number;
  /** PV（自動が取れない月の手入力フォールバック） */
  pv?: number;
  /** メモ（施策・気づき） */
  note?: string;
};

export type MetricsMap = MonthlyMetric[];

export const AFFILIATE_SOURCES: { key: keyof AffiliateBySource; label: string }[] = [
  { key: 'moshimo', label: 'もしも' },
  { key: 'a8', label: 'A8.net' },
  { key: 'rakuten', label: '楽天' },
  { key: 'amazon', label: 'Amazon' },
  { key: 'adsense', label: 'AdSense' },
  { key: 'other', label: 'その他' },
];

const STORE = monthlyJson as MetricsMap;

export const METRICS_KV_KEY = 'metrics:monthly';
export const METRICS_TAG = 'metrics-monthly';

/** 全月次メトリクスを月降順（新しい順）で返す（同期・バンドル版）。 */
export function getAllMonthlyMetrics(): MetricsMap {
  return [...STORE].sort((a, b) => b.month.localeCompare(a.month));
}

/** 実行時の月次メトリクス（KV設定時はKV、無ければバンドル）。月降順。 */
export const getRuntimeMonthlyMetrics = unstable_cache(
  async (): Promise<MetricsMap> => {
    let data = STORE;
    if (isKvConfigured()) {
      const fromKv = await kvGet<MetricsMap>(METRICS_KV_KEY);
      if (fromKv) data = fromKv;
    }
    return [...data].sort((a, b) => b.month.localeCompare(a.month));
  },
  ['runtime-monthly-metrics'],
  { tags: [METRICS_TAG] },
);

/** 保存用に現在の全メトリクスを直読み（KV空ならバンドルをシード）。 */
export async function readMetricsForWrite(): Promise<MetricsMap> {
  if (isKvConfigured()) {
    const fromKv = await kvGet<MetricsMap>(METRICS_KV_KEY);
    return fromKv ?? [...STORE];
  }
  return [...STORE];
}

/** メトリクスを KV に保存。 */
export async function writeMetricsToKv(data: MetricsMap): Promise<boolean> {
  return kvSet(METRICS_KV_KEY, data);
}

/** アフィリエイト収益の合計（円） */
export function affiliateTotal(a?: AffiliateBySource): number {
  if (!a) return 0;
  return AFFILIATE_SOURCES.reduce((sum, s) => sum + (a[s.key] ?? 0), 0);
}

/** 'YYYY-MM'（当月） */
export function currentMonth(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** 'YYYY-MM' → '2026年6月' 表記 */
export function monthLabel(month: string): string {
  const [y, m] = month.split('-');
  return `${y}年${Number(m)}月`;
}
