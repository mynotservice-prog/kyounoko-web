/**
 * ケンタッキー: 公式店舗検索（search.kfc.co.jp、goga storelocator v3）。
 * geohash セル単位の JSON（/api/points/<hash>）で全店舗を集め、各店舗の extra_fields にある
 * 絞り込み条件（「サービスで絞り込む」の項目）を読む。家族向け属性は「パーキング」のみ
 * （お子様椅子・おむつ交換台・キッズスペース等は属性なし）。
 */
import { tally, runAdapter } from './_lib.mjs';
import { fetchAllPoints } from './_goga.mjs';

const SOURCE = 'https://search.kfc.co.jp/';
// 絞り込みボタンの表示名 → 設備キー。extra_fields のキー名は表示名と同じ（"パーキング": "1"）
const LABELS = {
  parking: 'パーキング',
};

export async function crawl() {
  const { points, cells } = await fetchAllPoints((h) => `${SOURCE}api/points/${h}`, { headers: { Referer: SOURCE } });
  const stores = points.map((p) => ({
    name: p.name.trim(),
    facilities: Object.entries(LABELS).filter(([, f]) => p.extra_fields?.[f] === '1').map(([k]) => k),
  }));
  const unknown = points.filter((p) => p.extra_fields?.[LABELS.parking] == null).length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const future = points.filter((p) => (p.extra_fields?.['OPEN日'] || '') > todayStr).length;
  return {
    chain: 'kfc',
    name: 'ケンタッキー',
    sourceUrl: SOURCE,
    method: '公式店舗検索（goga storelocator）の geohash セル JSON（/api/points/<hash>）で日本全域を走査して全店舗を列挙し、各店舗の絞り込み条件「パーキング」の値を集計',
    note: `geohash 2 桁 ${cells} セルを走査。パーキング値が未設定（"1"/"0" どちらでもない）の店舗 ${unknown} 件は「なし」側に数えた。オープン予定（OPEN日が未来）${future} 件を含む。絞り込み条件のうち家族向け属性はパーキングのみ`,
    total: stores.length,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
