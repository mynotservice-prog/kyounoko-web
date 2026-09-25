/**
 * 大阪王将: 公式店舗検索（www.osaka-ohsho.com/store/）。
 * 画面は AppSync(GraphQL) を呼んで描画している。API の URL とキーは公式の店舗検索ページが読み込む
 * /assets/js/search_shops__response.js に書かれているもの（ブラウザが使うのと同じ公開キー）を実行時に読み取る。
 *  - 国内全店舗: getShopListByPrefectures（都道府県 1〜47）
 *  - 「条件から探す」: getShopListByCondition（1=駐車場あり 2=期間限定商品あり 3=フェア開催 4=デリバリー）
 * 設備に当たる条件は「駐車場あり」だけなので parking のみ数える。
 * 店舗別メニュー（getProductListByOhsho）にはキッズプレート等が載る店舗があるが、「子ども向け」という属性は無く
 * 商品名の読み取りで判定することになるため、このセンサスでは数えない（約束: 属性として持つ設備だけ）。
 */
import { fetchText, sleep, UA, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.osaka-ohsho.com/store/';
const JS = 'https://www.osaka-ohsho.com/assets/js/search_shops__response.js';
const LABELS = { parking: '駐車場あり' };
const FIELDS = 'total shops { shop_id shopName address parking }';

export async function crawl() {
  const js = await fetchText(JS);
  const apiUrl = js.match(/const apiUrl = '([^']+)'/)?.[1];
  const apiKey = js.match(/const apiKey = '([^']+)'/)?.[1];
  if (!apiUrl || !apiKey) throw new Error('店舗検索の API 設定が読み取れない');
  // 画面の「条件から探す」の表記を検証
  const page = await fetchText(SOURCE);
  if (!/value="1" name="el_note_chk"[\s\S]{0,200}?駐車場あり/.test(page)) throw new Error('「条件から探す」の 1=駐車場あり が見つからない');

  const gql = async (query, variables) => {
    await sleep(400);
    const r = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'User-Agent': UA, Origin: 'https://www.osaka-ohsho.com', Referer: SOURCE },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(25_000),
    });
    const j = await r.json();
    if (!r.ok || j.errors) throw new Error(`GraphQL エラー: ${JSON.stringify(j.errors || r.status)}`);
    return j.data;
  };

  const all = new Map();
  for (let pref = 1; pref <= 47; pref++) {
    const d = (await gql(
      `query($pref_id:Int!,$condition:[Int],$limit:Int!,$offset:Int!){getShopListByPrefectures(pref_id:$pref_id,condition:$condition,limit:$limit,offset:$offset){${FIELDS}}}`,
      { pref_id: pref, condition: [], limit: 1000, offset: 0 },
    )).getShopListByPrefectures;
    if (d.shops.length !== d.total) throw new Error(`都道府県 ${pref}: total ${d.total} と取得 ${d.shops.length} が違う`);
    for (const s of d.shops) all.set(s.shop_id, s);
  }
  const cond = (await gql(
    `query($condition:[Int],$limit:Int!,$offset:Int!){getShopListByCondition(condition:$condition,limit:$limit,offset:$offset){${FIELDS}}}`,
    { condition: [1], limit: 2000, offset: 0 },
  )).getShopListByCondition;
  if (cond.shops.length !== cond.total) throw new Error(`駐車場あり: total ${cond.total} と取得 ${cond.shops.length} が違う`);
  const parkingIds = new Set(cond.shops.map((s) => s.shop_id));
  const outside = cond.shops.filter((s) => !all.has(s.shop_id));

  const stores = [...all.values()].map((s) => ({
    name: s.shopName.replace(/\s+/g, ' ').trim(),
    url: `https://www.osaka-ohsho.com/store/store_detail.php?shop_id=${s.shop_id}`,
    facilities: parkingIds.has(s.shop_id) ? ['parking'] : [],
  }));
  const fieldMismatch = [...all.values()].filter((s) => (Number(s.parking) === 1) !== parkingIds.has(s.shop_id)).length;
  return {
    chain: 'osaka-ohsho',
    name: '大阪王将',
    sourceUrl: SOURCE,
    method: '公式店舗検索が使う店舗API（GraphQL）で都道府県別に国内全店舗を取得し、「条件から探す」の「駐車場あり」で絞り込んだ結果に含まれる店舗を店舗ごとに集計',
    total: stores.length,
    note: [
      '海外店舗（国別検索）は除外',
      outside.length ? `「駐車場あり」の絞り込み結果のうち都道府県別一覧に無い ${outside.length} 件（${outside.map((s) => s.shopName).join('、')}）は数えない` : null,
      fieldMismatch ? `店舗データの parking 欄と絞り込み結果が食い違う店舗 ${fieldMismatch} 件（絞り込み結果を採用）` : '店舗データの parking 欄と絞り込み結果は一致',
      '店舗別メニューのキッズプレート等は「子ども向け」の属性が無く商品名の読み取りになるため数えない',
    ].filter(Boolean).join('。'),
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
