/**
 * 和食さと: 公式店舗検索（store.srsholdings.com/sato/、can-ly製・SRSホールディングス）。
 * 検索API（directory 9）で店舗を列挙し、ブランド「和食さと」(id 395) の国内店舗だけを対象に、
 * 各店舗詳細ページの __NEXT_DATA__ にある「設備・サービス」チェック項目（checked: true/false）を店舗ごとに読む。
 * 海外業態（SATO DON・Washoku SATO 等）は brand id で除外する。
 */
import { fetchText, fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://store.srsholdings.com/sato/';
const API = 'https://api.site.can-ly.com/v2/directories/9/shops/search';
const BRAND_ID = 395; // 和食さと（国内）
// 公式「設備・サービス」ラベル → 設備キー。ここに無いラベル（全席禁煙・ドリンクバー・アルコールバー）は無視する
const LABELS = {
  privateRoom: '個室あり',
  parking: '駐車場あり',
};

function nextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('__NEXT_DATA__ が見つからない');
  return JSON.parse(m[1]);
}

export async function crawl() {
  const list = await fetchJson(API, { headers: { Origin: 'https://store.srsholdings.com', Referer: SOURCE } });
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const closed = [];
  const stores = [];
  for (const s of list.shops) {
    if (s.brand?.id !== BRAND_ID) continue;
    if (s.openStatus !== 'IS_ALREADY_OPEN') { closed.push(`${s.nameKanji}(${s.openStatus})`); continue; }
    const url = `${SOURCE}detail/${s.storeCode}/`;
    const shop = nextData(await fetchText(url)).props.pageProps.shop;
    const items = (shop.cmsItemValues || [])
      .map((c) => c.content?.checkBoxComposite?.items)
      .filter(Boolean)
      .flat()
      .filter((it) => it.keyword === 'service');
    if (!items.length) throw new Error(`設備・サービス欄が無い: ${s.nameKanji}`);
    const facilities = items.filter((it) => it.checked).map((it) => byLabel[it.text]).filter(Boolean);
    stores.push({ name: s.nameKanji.replace(/\s+/g, ' ').trim(), url, facilities });
  }
  return {
    chain: 'washokusato',
    name: '和食さと',
    sourceUrl: SOURCE,
    method: '公式店舗検索（can-ly）の検索APIでブランド「和食さと」の国内店舗を列挙し、各店舗詳細ページの「設備・サービス」チェック項目を集計',
    total: stores.length,
    note: `海外業態（SATO DON・Washoku SATO 等）は除外。開店中以外${closed.length}件（${closed.join('、')}）も除外。設備・サービス欄の項目は 全席禁煙/個室あり/駐車場あり/ドリンクバーあり/セルフ式アルコールバーあり の5つで、子ども向け設備の属性は無い`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
