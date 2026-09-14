/**
 * 鳥貴族: 公式店舗検索（map.torikizoku.co.jp、can-ly製 — ばんどう太郎と同じ仕組み）。
 * 検索API（ブランド=鳥貴族で絞り込み）で店舗を列挙し、各店舗詳細ページの __NEXT_DATA__ にある
 * 「サービス」チェックボックス（checked: true/false）を店舗ごとに読む。
 * 「鳥貴族記念館/1号店」ブランドは brand id で除外する。
 */
import { fetchText, fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://map.torikizoku.co.jp/';
const BRAND_ID = 1643; // 鳥貴族（1644 = 鳥貴族記念館/1号店）
const API = `https://api.site.can-ly.com/v2/directories/74/shops/search?cond=brand,${BRAND_ID}`;
// 公式「サービス」ラベル → 設備キー。ここに無いラベル（昼営業・喫煙ブース・コンセント・テイクアウト・ネット予約）は無視する
const LABELS = {
  kidsChair: 'ベビーチェアあり',
  stepFree: 'バリアフリー店舗',
  parking: '駐車場あり',
};

function nextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('__NEXT_DATA__ が見つからない');
  return JSON.parse(m[1]);
}

export async function crawl() {
  const list = await fetchJson(API, { headers: { Origin: 'https://map.torikizoku.co.jp', Referer: SOURCE } });
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const closed = [];
  const stores = [];
  for (const s of list.shops) {
    if (s.brand?.id !== BRAND_ID) continue;
    if (s.openStatus === 'IS_PERMANENTLY_CLOSED') { closed.push(s.nameKanji); continue; }
    const url = `${SOURCE}detail/${s.storeCode}/`;
    const shop = nextData(await fetchText(url)).props.pageProps.shop;
    const items = (shop.cmsItemValues || [])
      .map((c) => c.content?.checkBoxOnOffLabel?.items)
      .filter(Boolean)
      .flat()
      .filter((it) => it.keyword === 'service');
    if (!items.length) throw new Error(`サービス欄が無い: ${s.nameKanji}`);
    const facilities = items.filter((it) => it.checked).map((it) => byLabel[it.label]).filter(Boolean);
    stores.push({ name: s.nameKanji.replace(/\s+/g, ' ').trim(), url, facilities });
  }
  return {
    chain: 'torikizoku',
    name: '鳥貴族',
    sourceUrl: SOURCE,
    method: '公式店舗検索（can-ly）の検索APIでブランド「鳥貴族」の店舗を列挙し、各店舗詳細ページの「サービス」チェック項目を集計',
    total: stores.length,
    note: `「鳥貴族記念館/1号店」ブランドは除外。閉店扱い${closed.length}件${closed.length ? `（${closed.join('、')}）` : ''}も除外。「バリアフリー店舗」を stepFree に対応づけた`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
