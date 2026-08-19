/**
 * GA4 Data API 連携 — カスタムイベント計測の集計取得。
 *
 * 用途: /admin/events ダッシュボードで、サイトに仕込んだカスタムイベント
 * (favorite_add, today_finder_search, shindan_complete 等) の発火数と
 * パラメータ上位値を可視化する。
 *
 * セットアップは lib/ga4-popularity.ts と同じ環境変数を使う:
 *   - GA4_PROPERTY_ID
 *   - GOOGLE_APPLICATION_CREDENTIALS_JSON
 *
 * 未設定 or API エラー時は configured=false を返してプレースホルダ表示にフォールバック。
 */

import { getGa4PropertyId, getGoogleCredentialsJson } from './google-auth';

const GA4_PROPERTY_ID = getGa4PropertyId();
const GA4_CREDS = getGoogleCredentialsJson();

export type EventParamTop = {
  /** 例: "type=article", "platform=line" */
  label: string;
  count: number;
};

export type EventStat = {
  /** イベント名 (例: favorite_add) */
  name: string;
  /** 期間内の総発火数 */
  count: number;
  /** トップパラメータ値 (上位3件) */
  topParams: EventParamTop[];
};

export type EventsResult =
  | { configured: true; days: number; stats: Record<string, EventStat> }
  | { configured: false; reason: string };

/** GA4 Data API がここのコードベースで利用可能な状態か */
export function isGA4Configured(): boolean {
  return Boolean(GA4_PROPERTY_ID && GA4_CREDS);
}

/**
 * 指定イベント名リストについて、過去N日間の発火数 + 主要パラメータの
 * 上位値TOP3 を取得する。
 *
 * 内部では runReport を2回呼ぶ:
 *   1. eventName 次元で発火数を取得
 *   2. イベントごとに customEvent:<param> を次元として上位値を取得
 *      (Cardinality 制限を避けるため、各イベントで主要 param 1つに絞る)
 */
export async function getEventStats(opts: {
  eventNames: string[];
  /** 各イベントの主要 param 名 (TOP3 集計対象)。null/undefined はスキップ */
  primaryParamByEvent: Record<string, string | null>;
  days?: number;
}): Promise<EventsResult> {
  const days = opts.days ?? 7;

  if (!GA4_PROPERTY_ID || !GA4_CREDS) {
    return { configured: false, reason: 'GA4_PROPERTY_ID / GOOGLE_APPLICATION_CREDENTIALS_JSON 未設定' };
  }

  try {
    const credentials = JSON.parse(GA4_CREDS);
    const mod = await import('@google-analytics/data');
    const client = new mod.BetaAnalyticsDataClient({ credentials });

    const startDate = `${days}daysAgo`;
    const endDate = 'today';
    const property = `properties/${GA4_PROPERTY_ID}`;

    // 1. eventName 単位の発火回数
    const [countResp] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: { values: opts.eventNames },
        },
      },
      limit: 100,
    });

    const stats: Record<string, EventStat> = {};
    for (const name of opts.eventNames) {
      stats[name] = { name, count: 0, topParams: [] };
    }
    for (const row of countResp.rows ?? []) {
      const name = row.dimensionValues?.[0]?.value ?? '';
      const c = Number(row.metricValues?.[0]?.value ?? 0);
      if (stats[name]) stats[name].count = c;
    }

    // 2. 各イベントの主要 param 上位値 — 並列で取得 (発火0件はスキップ)
    await Promise.all(
      opts.eventNames.map(async (name) => {
        const param = opts.primaryParamByEvent[name];
        if (!param) return;
        if (stats[name].count === 0) return;
        try {
          const [paramResp] = await client.runReport({
            property,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: `customEvent:${param}` }],
            metrics: [{ name: 'eventCount' }],
            dimensionFilter: {
              filter: {
                fieldName: 'eventName',
                stringFilter: { matchType: 'EXACT', value: name },
              },
            },
            orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
            limit: 10,
          });
          const tops: EventParamTop[] = [];
          for (const row of paramResp.rows ?? []) {
            const v = row.dimensionValues?.[0]?.value ?? '';
            const c = Number(row.metricValues?.[0]?.value ?? 0);
            // 未設定 / (not set) は除外して表示
            if (!v || v === '(not set)') continue;
            tops.push({ label: `${param}=${v}`, count: c });
            if (tops.length >= 3) break;
          }
          stats[name].topParams = tops;
        } catch (err) {
          // 個別の param 取得失敗は全体を落とさない
          console.warn(`[ga4-events] param fetch failed for ${name}.${param}:`, err);
        }
      })
    );

    return { configured: true, days, stats };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn('[ga4-events] runReport failed:', reason);
    return { configured: false, reason };
  }
}
