/**
 * かっぱ寿司: 公式店舗検索 /shop2 が読み込む店舗マスタ JSON（/master_data/json/shoplist.json）に
 * 店舗ごとの facility1〜15 フラグが入っている。検索画面の「設備で絞り込む」チェックとの対応は
 * shop2 の JS（institution[] → facilityN）から取った:
 *   barrier=facility1 入り口バリアフリー / elevator=facility2 エレベーターあり / toiret=facility3 多目的トイレ /
 *   park=facility4 駐車場あり / other=facility5 その他昇降機あり / facility6〜14 は宅配各社（対象外）
 * 家族向けに該当するのは 入り口バリアフリー・多目的トイレ・駐車場あり の 3 つ。
 */
import { fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.kappasushi.jp/shop2/';
const JSON_URL = 'https://www.kappasushi.jp/master_data/json/shoplist.json';
const FLAGS = {
  stepFree: { field: 'facility1', label: '入り口バリアフリー' },
  multiToilet: { field: 'facility3', label: '多目的トイレ' },
  parking: { field: 'facility4', label: '駐車場あり' },
};

export async function crawl() {
  const data = await fetchJson(JSON_URL);
  const list = data.Store;
  if (!Array.isArray(list) || list.length === 0) throw new Error('shoplist.json の Store が空');
  const stores = list.map((s) => ({
    name: `かっぱ寿司 ${s.name.replace(/\s*※.*$/, '').trim()}`,
    url: `https://www.kappasushi.jp/shop/${s.code}`,
    facilities: Object.entries(FLAGS).filter(([, f]) => s[f.field] === '1').map(([k]) => k),
  }));
  const labels = Object.fromEntries(Object.entries(FLAGS).map(([k, f]) => [k, f.label]));
  return {
    chain: 'kappa-sushi',
    name: 'かっぱ寿司',
    sourceUrl: SOURCE,
    method: '公式店舗検索（/shop2）が読み込む店舗マスタ JSON の facility フラグを、検索画面の「設備で絞り込む」チェック（入り口バリアフリー・多目的トイレ・駐車場あり）と同じ対応で店舗ごとに集計',
    note: '店名末尾の「※タイプA」等の注記は除去。エレベーター・その他昇降機は家族向け設備に含めていない',
    facilities: tally(stores, labels),
    total: stores.length,
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
