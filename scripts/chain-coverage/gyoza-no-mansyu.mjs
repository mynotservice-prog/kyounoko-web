/**
 * ぎょうざの満洲: 公式店舗一覧（www.mansyu.co.jp/shop/）。一覧は /shop/shop.json（店舗ページが読む公式データ）から描画される。
 * 店舗ごとの項目のうち設備に当たるのは parking（「駐車場あり」の表示）と party_room（「パーティールーム（4～30名様）」等）。
 * パーティールームは個室（privateRoom）に対応づける（デニーズの「パーティールームまたは個室」と同じ扱い）。
 * 飲食店でない貸教室・貸ギャラリーと工場直売店は除外する。
 */
import { fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.mansyu.co.jp/shop/';
const LABELS = { parking: '駐車場あり', privateRoom: 'パーティールーム' };
const NOT_RESTAURANT = /ギャラリー|貸教室|工場直売/;

export async function crawl() {
  const list = await fetchJson(`${SOURCE}shop.json`, { headers: { Referer: SOURCE } });
  if (!Array.isArray(list) || !list.length) throw new Error('shop.json が空');
  const excluded = [];
  const stores = [];
  const parkingValues = {};
  for (const s of list) {
    if (NOT_RESTAURANT.test(s.name)) { excluded.push(s.name); continue; }
    const p = (s.parking || '').trim();
    if (p) parkingValues[p] = (parkingValues[p] || 0) + 1;
    const facilities = [];
    if (p === '駐車場あり') facilities.push('parking');
    else if (p) throw new Error(`parking 欄に想定外の値 "${p}"（${s.name}）`);
    if (/パーティールーム/.test(s.party_room || '')) facilities.push('privateRoom');
    stores.push({ name: s.name.replace(/\s+/g, ' ').trim(), url: `${SOURCE}#${s.anchor}`, facilities });
  }
  return {
    chain: 'gyoza-no-mansyu',
    name: 'ぎょうざの満洲',
    sourceUrl: SOURCE,
    method: '公式店舗一覧が読む店舗データ（/shop/shop.json）の店舗ごとの「駐車場あり」表示とパーティールームの記載を集計',
    total: stores.length,
    note: [
      `一覧 ${list.length} 件のうち飲食店でない ${excluded.length} 件（${excluded.join('、')}）を除外`,
      'パーティールームは個室として集計',
    ].join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
