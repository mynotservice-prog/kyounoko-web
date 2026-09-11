/**
 * コメダ珈琲店: 公式店舗検索（www.komeda.co.jp/shop/、Vue 製）の裏 API（eu.komeda.co.jp/v1/hp/shop）。
 * ブランド「コメダ珈琲店」(brand_type=1) の全店舗を一覧 API で列挙し、各店舗の詳細 API にある
 * 「店舗設備」「取扱いメニュー」の値 id と has_parking を読む。項目名は shop-meta-data の display_name。
 * おかげ庵・KOMEDA is □ 等の他ブランドは brand_type で除外する。
 */
import { fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.komeda.co.jp/shop/';
const API = 'https://eu.komeda.co.jp/v1/hp/shop';
const HEADERS = { Origin: 'https://www.komeda.co.jp', Referer: SOURCE };
// 公式の項目 display_name → 設備キー。ここに無い項目（WiFi・電源・決済・喫煙区分等）は無視する
const LABELS = {
  multiToilet: '多機能トイレ',      // 店舗設備 id 58
  diaperTable: 'トイレおむつ台',    // 店舗設備 id 59
  kidsMenu: 'お子様メニュー',       // 取扱いメニュー id 84
  parking: '駐車場あり',            // 絞り込みトグル（has_parking）
};
const VALUE_IDS = { multiToilet: 58, diaperTable: 59, kidsMenu: 84 };

export async function crawl() {
  // メタデータで id と表記の対応を検証する（サイト側で id が変わったら止まるように）
  const meta = await fetchJson(`${API}-meta-data?brand_type=1`, { headers: HEADERS });
  const names = {};
  for (const f of meta.fields || []) for (const v of f.values || []) names[Number(v.id)] = v.display_name;
  for (const [k, id] of Object.entries(VALUE_IDS)) {
    if (names[id] !== LABELS[k]) throw new Error(`メタデータの id ${id} が「${LABELS[k]}」ではない: ${names[id]}`);
  }

  const list = await fetchJson(`${API}?brand_type=1&all=true`, { headers: HEADERS });
  const stores = [];
  const skipped = [];
  for (const it of list.items) {
    if (it.brand_type !== 1) { skipped.push(it.name); continue; }
    const d = await fetchJson(`${API}/${it.id}`, { headers: HEADERS });
    const shop = d.shop;
    if (!Array.isArray(shop.details)) throw new Error(`details が無い: ${it.name}`);
    const ids = new Set(shop.details.flatMap((x) => x.values || []).map(Number));
    const facilities = Object.entries(VALUE_IDS).filter(([, id]) => ids.has(id)).map(([k]) => k);
    if (shop.has_parking === true) facilities.push('parking');
    stores.push({ name: it.name.replace(/\s+/g, ' ').trim(), url: `${SOURCE}detail.html?id=${it.id}`, facilities });
  }
  return {
    chain: 'komeda',
    name: 'コメダ珈琲店',
    sourceUrl: SOURCE,
    method: '公式店舗検索の裏 API（eu.komeda.co.jp/v1/hp/shop）でブランド「コメダ珈琲店」の全店舗を列挙し、各店舗詳細の「店舗設備」「取扱いメニュー」の値と駐車場ありフラグを集計',
    note: `一覧 API の total=${list.total}。他ブランド混入 ${skipped.length} 件は除外。「子育て支援」（店舗サービス）は設備ではないため未集計`,
    total: stores.length,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
