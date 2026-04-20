/**
 * GA4 Data API 連携による「人気スポット」自動算出。
 *
 * セットアップ:
 *   1. Google Cloud Console で Service Account 作成
 *   2. その Service Account を GA4 プロパティの「閲覧者」に追加
 *   3. Service Account の JSON キーを生成
 *   4. Vercel env に以下を設定:
 *      - GA4_PROPERTY_ID: GA4 プロパティID（例: 123456789）
 *      - GOOGLE_APPLICATION_CREDENTIALS_JSON: Service Account JSON の中身をそのまま貼り付け
 *   5. 再デプロイで自動的に GA4 から人気スポットが取得される
 *
 * 未設定時は curated な popular:true スポットにフォールバック。
 */

import { SPOTS, type Spot } from './spots';
import type { AreaSlug } from './area';

type PopularItem = { area: AreaSlug; spot: Spot };

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const GA4_CREDS = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

/**
 * GA4から人気スポット（エリア別PVトップ）を取得。
 * 認証情報があれば GA4 Data API を叩き、なければフォールバック。
 */
export async function getPopularSpotsFromGA4(limit = 6): Promise<PopularItem[]> {
  if (!GA4_PROPERTY_ID || !GA4_CREDS) {
    return getCuratedPopularSpots(limit);
  }

  try {
    const credentials = JSON.parse(GA4_CREDS);
    const mod = await import('@google-analytics/data');
    const client = new mod.BetaAnalyticsDataClient({ credentials });

    const [response] = await client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      dimensionFilter: {
        filter: {
          fieldName: 'pagePath',
          stringFilter: { matchType: 'CONTAINS', value: '/today' },
        },
      },
      limit: 30,
    });

    // エリアごとのPV数を集計
    const areaCount: Record<string, number> = {};
    for (const row of response.rows ?? []) {
      const p = row.dimensionValues?.[0]?.value ?? '';
      const match = p.match(/area=([a-z-]+)/);
      if (match) {
        const area = match[1];
        const views = Number(row.metricValues?.[0]?.value ?? 0);
        areaCount[area] = (areaCount[area] ?? 0) + views;
      }
    }

    // PV順にソートしたエリアから popular な spot を抜粋
    const topAreas = Object.entries(areaCount)
      .sort((a, b) => b[1] - a[1])
      .map(([a]) => a as AreaSlug);

    const result: PopularItem[] = [];
    for (const area of topAreas) {
      const spots = SPOTS[area];
      if (!spots) continue;
      for (const spot of spots) {
        if (spot.popular) {
          result.push({ area, spot });
          if (result.length >= limit) return result;
        }
      }
    }
    // 足りない場合は curated で補填
    if (result.length < limit) {
      const curated = getCuratedPopularSpots(limit);
      for (const c of curated) {
        if (result.length >= limit) break;
        if (!result.find((r) => r.spot.name === c.spot.name)) {
          result.push(c);
        }
      }
    }
    return result.slice(0, limit);
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
