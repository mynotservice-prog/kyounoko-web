/**
 * GA4 Data API 連携による「人気スポット」自動算出。
 *
 * 方針:
 * - 環境変数 GA4_PROPERTY_ID と GOOGLE_APPLICATION_CREDENTIALS_JSON が設定されていれば GA4 から取得
 * - 未設定なら curated な popular: true のスポットを返す（フォールバック）
 * - ビルド時に一度だけ GA4 を叩く（revalidate で更新）
 *
 * セットアップ手順:
 *   1. Google Cloud Console で Service Account を作成
 *   2. そのアカウントに GA4 プロパティへの「閲覧者」権限を付与
 *   3. JSON キーを生成して Vercel env に GOOGLE_APPLICATION_CREDENTIALS_JSON として貼る
 *   4. GA4_PROPERTY_ID も env に設定（GA4 管理画面で確認）
 *   5. npm install @google-analytics/data
 *
 * GA4 が設定されていれば、過去7日の /today?area=X ページの PV top エリアから
 * 該当スポットを優先表示する形式で popular判定を書き換え可能。
 */

import { SPOTS, type Spot } from './spots';
import type { AreaSlug } from './area';

type PopularItem = { area: AreaSlug; spot: Spot };

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const GA4_CREDS = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

/**
 * GA4から人気スポット（エリア別PVトップ）を取得。
 * SDKが存在し、認証情報もあれば GA4 Data API を叩く。
 * 取得失敗 or 未設定ならフォールバック。
 */
export async function getPopularSpotsFromGA4(limit = 6): Promise<PopularItem[]> {
  if (!GA4_PROPERTY_ID || !GA4_CREDS) {
    return getCuratedPopularSpots(limit);
  }

  try {
    // @google-analytics/data をインストールしたら以下を有効化:
    //
    // const { BetaAnalyticsDataClient } = await import('@google-analytics/data');
    // const credentials = JSON.parse(GA4_CREDS);
    // const client = new BetaAnalyticsDataClient({ credentials });
    //
    // const [response] = await client.runReport({
    //   property: `properties/${GA4_PROPERTY_ID}`,
    //   dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    //   dimensions: [{ name: 'pagePath' }],
    //   metrics: [{ name: 'screenPageViews' }],
    //   dimensionFilter: {
    //     filter: {
    //       fieldName: 'pagePath',
    //       stringFilter: { matchType: 'CONTAINS', value: '/today?area=' },
    //     },
    //   },
    //   limit: 20,
    // });
    //
    // const areaCount: Record<string, number> = {};
    // for (const row of response.rows ?? []) {
    //   const path = row.dimensionValues?.[0]?.value ?? '';
    //   const match = path.match(/area=([a-z-]+)/);
    //   if (match) {
    //     const area = match[1];
    //     const views = Number(row.metricValues?.[0]?.value ?? 0);
    //     areaCount[area] = (areaCount[area] ?? 0) + views;
    //   }
    // }
    //
    // // PV順で並べたエリアから popular スポットを抽出
    // const topAreas = Object.entries(areaCount)
    //   .sort((a, b) => b[1] - a[1])
    //   .map(([area]) => area as AreaSlug);
    //
    // const result: PopularItem[] = [];
    // for (const area of topAreas) {
    //   const spots = SPOTS[area];
    //   if (!spots) continue;
    //   for (const spot of spots) {
    //     if (spot.popular) {
    //       result.push({ area, spot });
    //       if (result.length >= limit) return result;
    //     }
    //   }
    // }
    // return result.length > 0 ? result : getCuratedPopularSpots(limit);

    return getCuratedPopularSpots(limit);
  } catch (err) {
    console.warn('[ga4-popularity] GA4 fetch failed, falling back to curated:', err);
    return getCuratedPopularSpots(limit);
  }
}

/** curated な popular: true スポットをソートして返す（フォールバック） */
export function getCuratedPopularSpots(limit = 6): PopularItem[] {
  const result: PopularItem[] = [];
  for (const [areaKey, list] of Object.entries(SPOTS)) {
    if (!list) continue;
    for (const spot of list) {
      if (spot.popular) {
        result.push({ area: areaKey as AreaSlug, spot });
      }
    }
  }
  result.sort((a, b) => a.spot.name.localeCompare(b.spot.name, 'ja'));
  return result.slice(0, limit);
}
