/**
 * KPI急落アラート — 直近7日 vs その前7日 を比較し、PV / AdSense収益が
 * 閾値以上に落ちたら検知する。LINE への通知は呼び出し側（cronルート）で行う。
 *
 * ## なぜ「7日 vs 前7日」か
 * GA4 / AdSense は当日〜前日のデータが未確定で、曜日でも変動が大きい。
 * 7日窓どうしの比較なら曜日要因が打ち消され、季節・施策由来のトレンド急落だけを拾える。
 * いずれの窓も「昨日」を末尾にして、未確定の当日を含めない。
 *
 * ## しきい値
 *   KPI_ALERT_DROP_PCT（既定 30）… 下落率が これ% 以上で alert。
 *   ノイズ除去のため、前期間が極端に小さい指標（PV<200 / 収益<100円）は判定しない。
 *
 * ## 設定（未設定の指標はスキップ。全滅なら configured=false）
 *   GA4_*（PV）/ ADSENSE_OAUTH_*（収益）… 既存の集計 libと同じ env。
 */
import { getGa4Totals, isGa4Configured } from '@/lib/ga4';
import { getAdsenseEarnings, isAdsenseReportConfigured } from '@/lib/adsense-report';

export type KpiMetricDelta = {
  key: 'pv' | 'adsense';
  label: string;
  unit: string;
  recent: number;
  prior: number;
  /** 変化率（-0.42 = 42%減）。prior=0 のときは null。 */
  changePct: number | null;
  /** 急落判定 */
  alert: boolean;
};

export type KpiAlertReport = {
  configured: boolean;
  /** 比較窓（YYYY-MM-DD） */
  window: { recentStart: string; recentEnd: string; priorStart: string; priorEnd: string };
  dropPct: number;
  metrics: KpiMetricDelta[];
  /** alert=true の指標が1つ以上あるか */
  hasAlert: boolean;
};

const fmt = (d: Date): string => d.toISOString().slice(0, 10);

/** n 日前の Date（時刻は00:00で十分。日付文字列にしか使わない）。 */
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/** ノイズ除去：前期間がこの値未満の指標は急落判定しない。 */
const MIN_PRIOR: Record<KpiMetricDelta['key'], number> = {
  pv: 200,
  adsense: 100,
};

function evalDelta(
  key: KpiMetricDelta['key'],
  label: string,
  unit: string,
  recent: number,
  prior: number,
  dropPct: number,
): KpiMetricDelta {
  const changePct = prior > 0 ? (recent - prior) / prior : null;
  const alert =
    prior >= MIN_PRIOR[key] && changePct !== null && changePct <= -(dropPct / 100);
  return { key, label, unit, recent, prior, changePct, alert };
}

/**
 * 急落チェックを実行。LINE 送信は行わず、判定結果だけ返す。
 * 環境変数が一切無ければ configured=false（呼び出し側で no-op）。
 */
export async function runKpiAlertCheck(): Promise<KpiAlertReport> {
  const dropPct = Number(process.env.KPI_ALERT_DROP_PCT) || 30;

  // 末尾=昨日。recent=[昨日-6,昨日]、prior=[昨日-13,昨日-7]
  const recentEnd = daysAgo(1);
  const recentStart = daysAgo(7);
  const priorEnd = daysAgo(8);
  const priorStart = daysAgo(14);
  const window = {
    recentStart: fmt(recentStart),
    recentEnd: fmt(recentEnd),
    priorStart: fmt(priorStart),
    priorEnd: fmt(priorEnd),
  };

  const metrics: KpiMetricDelta[] = [];

  if (isGa4Configured()) {
    const [recent, prior] = await Promise.all([
      getGa4Totals(window.recentStart, window.recentEnd),
      getGa4Totals(window.priorStart, window.priorEnd),
    ]);
    if (recent && prior) {
      metrics.push(
        evalDelta('pv', 'PV', '', recent.pageViews, prior.pageViews, dropPct),
      );
    }
  }

  if (isAdsenseReportConfigured()) {
    const [recent, prior] = await Promise.all([
      getAdsenseEarnings(recentStart, recentEnd),
      getAdsenseEarnings(priorStart, priorEnd),
    ]);
    if (recent !== null && prior !== null) {
      metrics.push(evalDelta('adsense', 'AdSense収益', '円', recent, prior, dropPct));
    }
  }

  return {
    configured: metrics.length > 0,
    window,
    dropPct,
    metrics,
    hasAlert: metrics.some((m) => m.alert),
  };
}

/** 数値を見やすく（PVは桁区切り、収益は円）。 */
function fmtNum(m: KpiMetricDelta): string {
  return `${m.recent.toLocaleString('ja-JP')}${m.unit}`;
}

/** LINE 通知用のテキストを組み立てる。 */
export function buildKpiAlertMessage(report: KpiAlertReport): string {
  const head = `⚠️ きょうのこ KPI急落アラート\n直近7日 vs 前7日（${report.dropPct}%以上の下落）`;
  const lines = report.metrics.map((m) => {
    const pct =
      m.changePct === null ? '—' : `${(m.changePct * 100).toFixed(0)}%`;
    const mark = m.alert ? '🔴' : '🟢';
    const prior = `${m.prior.toLocaleString('ja-JP')}${m.unit}`;
    return `${mark} ${m.label}: ${fmtNum(m)}（前期 ${prior} / ${pct}）`;
  });
  const foot = `期間: ${report.window.recentStart}〜${report.window.recentEnd}\nhttps://kyounoko.jp/admin/kpi`;
  return [head, '', ...lines, '', foot].join('\n');
}
