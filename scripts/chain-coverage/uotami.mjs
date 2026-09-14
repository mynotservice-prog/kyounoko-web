/**
 * 魚民: 公式店舗検索（shop.monteroza.co.jp、can-ly製・モンテローザ全業態共通）。
 * 検索API（directory 88、ブランド=魚民 id 2011）で店舗を列挙し、各店舗詳細ページの __NEXT_DATA__ にある
 * 「設備」チェック項目（個室/カラオケ/駐車場/キッズルーム/キッズスペース/TV視聴/無料Wi-Fi/喫煙専用ブース）を店舗ごとに読む。
 * 白木屋・笑笑などグループ他業態は brand id で除外する。
 */
import { fetchText, fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://shop.monteroza.co.jp/';
const API = 'https://api.site.can-ly.com/v2/directories/88/shops/search?cond=brand,2011'; // 2011 = 魚民
// 公式「設備」ラベル → 設備キー。ここに無いラベル（カラオケ・TV視聴・無料Wi-Fi・喫煙専用ブース）は無視する
const LABELS = {
  privateRoom: '個室',
  parking: '駐車場',
  kidsSpace: 'キッズルーム・キッズスペース', // 公式は2項目に分かれている。どちらかにチェックがあれば1店と数える
};
const KIDS_SPACE_LABELS = ['キッズルーム', 'キッズスペース'];

function nextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('__NEXT_DATA__ が見つからない');
  return JSON.parse(m[1]);
}

export async function crawl() {
  const list = await fetchJson(API, { headers: { Origin: 'https://shop.monteroza.co.jp', Referer: SOURCE } });
  const closed = [];
  const stores = [];
  let kidsRoom = 0;
  let kidsSpace = 0;
  for (const s of list.shops) {
    if (s.brand?.id !== 2011) continue;
    if (s.openStatus !== 'IS_ALREADY_OPEN') { closed.push(`${s.nameKanji}(${s.openStatus})`); continue; }
    const url = `${SOURCE}detail/${s.storeCode}/`;
    const shop = nextData(await fetchText(url)).props.pageProps.shop;
    const items = (shop.cmsItemValues || [])
      .map((c) => c.content?.checkBoxOnOffLabel?.items)
      .filter(Boolean)
      .flat()
      .filter((it) => it.keyword === 'facility');
    if (!items.length) throw new Error(`設備欄が無い: ${s.nameKanji}`);
    const checked = new Set(items.filter((it) => it.checked).map((it) => it.label));
    const facilities = [];
    if (checked.has('個室')) facilities.push('privateRoom');
    if (checked.has('駐車場')) facilities.push('parking');
    if (checked.has('キッズルーム')) kidsRoom++;
    if (checked.has('キッズスペース')) kidsSpace++;
    if (KIDS_SPACE_LABELS.some((l) => checked.has(l))) facilities.push('kidsSpace');
    stores.push({ name: s.nameKanji.replace(/\s+/g, ' ').trim(), url, facilities });
  }
  return {
    chain: 'uotami',
    name: '魚民',
    sourceUrl: SOURCE,
    method: '公式店舗検索（can-ly）の検索APIでブランド「魚民」の店舗を列挙し、各店舗詳細ページの「設備」チェック項目を集計',
    total: stores.length,
    note: `グループ他業態（白木屋・笑笑・目利きの銀次等）は除外。開店中以外${closed.length}件（${closed.join('、')}）も除外。kidsSpace は「キッズルーム」${kidsRoom}店・「キッズスペース」${kidsSpace}店のいずれかにチェックがある店舗数`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
