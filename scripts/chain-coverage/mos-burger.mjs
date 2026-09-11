/**
 * モスバーガー: 公式店舗検索（www.mos.jp/shop/、Vue 製）が読む全店舗 JSON（/data/shop/shop.json）。
 * 1 リクエストで全店舗が取れ、各店舗に絞り込み条件 sv01〜sv20 の on/off が付く。
 * 家族向け属性は「駐車場」(sv07) のみ（お子様椅子・おむつ交換台等は属性なし）。
 * 同 JSON にはマザーリーフ・MOSDO!・AEN・カフェ山と海と太陽など他業態も混在するため bus_cd が MOS_ で始まるものだけ数える。
 */
import { fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.mos.jp/shop/';
const API = 'https://www.mos.jp/data/shop/shop.json';
// 店舗検索の絞り込みチェックボックス name → 表記（店舗検索トップの label をそのまま）。設備キーに対応づけるのは駐車場のみ
const LABELS = {
  parking: '駐車場', // sv07
};
const FLAG = { parking: 'sv07' };
const MOS_BUS = /^MOS_/; // MOS_GREEN(緑モス)/MOS_RED(赤モス)/MOS_CF(モスカフェ)/MOS_PR(モスバーガープレミアム)/MOS_SH

export async function crawl() {
  const data = await fetchJson(API, { headers: { Referer: SOURCE } });
  const others = {};
  const stores = [];
  for (const s of data.shops) {
    if (!MOS_BUS.test(s.bus_cd)) { others[s.bus_name] = (others[s.bus_name] || 0) + 1; continue; }
    const facilities = Object.entries(FLAG).filter(([, f]) => s[f] === 1).map(([k]) => k);
    stores.push({ name: s.name.replace(/\s+/g, ' ').trim(), url: `${SOURCE}detail/?shop_cd=${s.shop_cd}`, facilities });
  }
  const otherNote = Object.entries(others).map(([n, c]) => `${n}${c}`).join('・');
  return {
    chain: 'mos-burger',
    name: 'モスバーガー',
    sourceUrl: SOURCE,
    method: '公式店舗検索が読む全店舗 JSON（/data/shop/shop.json）で bus_cd が MOS_ で始まる店舗を列挙し、絞り込み条件 sv07（駐車場）の on/off を集計',
    note: `JSON 総数 ${data.shops.length}。他業態（${otherNote}）は除外。モスカフェ業態（bus_name「モスカフェ」）は含む。絞り込み条件 20 項目のうち家族向け属性は駐車場のみ`,
    total: stores.length,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
