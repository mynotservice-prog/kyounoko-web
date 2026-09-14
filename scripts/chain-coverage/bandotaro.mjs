/**
 * ばんどう太郎: 公式店舗検索（shop.bandotaro.co.jp、can-ly製）。
 * 検索API（ブランド=ばんどう太郎で絞り込み）で店舗を列挙し、各店舗の詳細ページの
 * __NEXT_DATA__ にある「サービス」チェックボックス（checked: true/false）を店舗ごとに読む。
 * グループ内の他業態（かつ太郎・家族レストラン坂東太郎等）は brand id で除外する。
 */
import { fetchText, fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://shop.bandotaro.co.jp/';
const API = 'https://api.site.can-ly.com/v2/directories/39/shops/search?cond=brand,660'; // 660 = ばんどう太郎
// 公式「サービス」ラベル → 設備キー。ここに無いラベル（宴会・飲み放題・コース等）は無視する
const LABELS = {
  zashiki: '座敷',
  kidsChair: 'お子様椅子',
  kidsMenu: 'お子様メニュー',
  diaperTable: 'オムツ替えシート',
  kidsSpace: 'キッズスペース',
  privateRoom: '個室',
  multiToilet: 'トイレ車椅子仕様',
  parking: '駐車場',
};

function nextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('__NEXT_DATA__ が見つからない');
  return JSON.parse(m[1]);
}

export async function crawl() {
  const list = await fetchJson(API, { headers: { Origin: 'https://shop.bandotaro.co.jp', Referer: SOURCE } });
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const closed = [];
  const stores = [];
  for (const s of list.shops) {
    if (s.brand?.id !== 660) continue;
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
    chain: 'bandotaro',
    name: 'ばんどう太郎',
    sourceUrl: SOURCE,
    method: '公式店舗検索（can-ly）の検索APIでブランド「ばんどう太郎」の店舗を列挙し、各店舗詳細ページの「サービス」チェック項目を集計',
    total: stores.length,
    note: `グループ他業態（かつ太郎・家族レストラン坂東太郎等）は除外。閉店扱い${closed.length}件（${closed.join('、')}）も除外`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
