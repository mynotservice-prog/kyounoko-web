/**
 * CoCo壱番屋: 公式店舗検索（tenpo.ichibanya.co.jp、goga storelocator 旧版）。
 * geohash セル単位の JSON（/api/point/<hash>/）で全店舗を集め、各店舗の extra_fields にある
 * 絞り込み条件（駐車場・お子さまメニュー等）を読む。同じ店舗検索にはパスタ・デ・ココ等も
 * 入るため 業態コード "1"（CoCo壱番屋）だけを数える。
 */
import { tally, runAdapter } from './_lib.mjs';
import { fetchAllPoints } from './_goga.mjs';

const SOURCE = 'https://tenpo.ichibanya.co.jp/';
// 絞り込みボタンの表示名 → 設備キー（extra_fields のキー名は FIELDS）。
// ここに無い条件（宅配・ドライブスルー・24時間・カウンター席のみ・メニュー系）は無視する
const LABELS = {
  parking: '駐車場',
  kidsMenu: 'お子さまメニュー',
};
const FIELDS = { parking: '駐車場', kidsMenu: 'お子様メニュー' };

export async function crawl() {
  const { points, cells } = await fetchAllPoints((h) => `${SOURCE}api/point/${h}/`, { headers: { Referer: SOURCE } });
  const others = {};
  const stores = [];
  for (const p of points) {
    const code = p.extra_fields?.['業態コード'];
    if (code !== '1') { others[code] = (others[code] || 0) + 1; continue; }
    stores.push({
      name: p.name.trim(),
      facilities: Object.entries(FIELDS).filter(([, f]) => p.extra_fields?.[f] === '1').map(([k]) => k),
    });
  }
  const otherNote = Object.entries(others).map(([c, n]) => `業態コード${c}: ${n}件`).join('、');
  return {
    chain: 'cocoichi',
    name: 'CoCo壱番屋',
    sourceUrl: SOURCE,
    method: '公式店舗検索（goga storelocator）の geohash セル JSON（/api/point/<hash>/）で日本全域を走査して全店舗を列挙し、各店舗の絞り込み条件「駐車場」「お子さまメニュー」の値を集計',
    note: `geohash 2 桁 ${cells} セルを走査。業態コード "1"（CoCo壱番屋）以外（${otherNote || 'なし'}）は除外。お子さまメニューは店舗属性としては "お子様メニュー" キーで公開されている`,
    total: stores.length,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
