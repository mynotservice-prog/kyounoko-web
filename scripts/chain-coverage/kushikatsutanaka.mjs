/**
 * 串カツ田中: 公式店舗検索（restaurant.kushi-tanaka.com、can-ly製 directory 49）。
 * 検索APIで全店舗を列挙し、各店舗詳細ページの __NEXT_DATA__ にある
 * 「席タイプ」（カウンター席／テーブル席／座敷／ボックス席）と「提供サービス」
 * （子供用イス／駐車場…）のチェック項目（checked: true/false）を店舗ごとに読む。
 * トップにある「ココロのバリアフリー情報」は外部サイトへのバナーで店舗属性ではないため扱わない。
 */
import { fetchText, fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://restaurant.kushi-tanaka.com/';
const API = 'https://api.site.can-ly.com/v2/directories/49/shops/search';
// 公式チェック項目のラベル → 設備キー。ここに無いラベル（喫煙ブース・Wi-Fi・ペット可等）は無視する
const LABELS = {
  zashiki: '座敷',
  boxSeat: 'ボックス席',
  kidsChair: '子供用イス',
  parking: '駐車場',
};

function nextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('__NEXT_DATA__ が見つからない');
  return JSON.parse(m[1]);
}

export async function crawl() {
  const list = await fetchJson(API, { headers: { Origin: SOURCE.slice(0, -1), Referer: SOURCE } });
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const closed = [];
  const noItems = [];
  const brands = {};
  const stores = [];
  for (const s of list.shops) {
    brands[s.brand?.name || '-'] = (brands[s.brand?.name || '-'] || 0) + 1;
    if (s.openStatus === 'IS_PERMANENTLY_CLOSED') { closed.push(s.nameKanji); continue; }
    const url = `${SOURCE}detail/${s.storeCode}/`;
    const shop = nextData(await fetchText(url)).props.pageProps.shop;
    const items = (shop.cmsItemValues || [])
      .map((c) => c.content?.checkBoxOnOffLabel?.items)
      .filter(Boolean)
      .flat();
    if (!items.length) { noItems.push(s.nameKanji); continue; } // 東京ドーム店など、詳細ページに席タイプ／提供サービス欄が無い店舗
    const facilities = items.filter((it) => it.checked).map((it) => byLabel[it.label]).filter(Boolean);
    stores.push({ name: s.nameKanji.replace(/\s+/g, ' ').trim(), url, facilities });
  }
  const brandNote = Object.entries(brands).map(([b, n]) => `${b}${n}店`).join('・');
  return {
    chain: 'kushikatsutanaka',
    name: '串カツ田中',
    sourceUrl: SOURCE,
    method: '公式店舗検索（can-ly）の検索APIで全店舗を列挙し、各店舗詳細ページの「席タイプ」「提供サービス」チェック項目を集計',
    total: stores.length,
    note: `検索APIの内訳: ${brandNote}${closed.length ? `。閉店扱い${closed.length}件は除外` : ''}${noItems.length ? `。詳細ページに席タイプ／提供サービス欄が無い${noItems.length}件（${noItems.join('、')}）は total から除外` : ''}`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
