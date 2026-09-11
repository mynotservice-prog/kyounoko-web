/**
 * NAVITIME 製店舗検索（pkg.navitime.co.jp 系。サーティワン store.br31.jp、オリジン東秀 shop.toshu.co.jp などが採用）の共通部品。
 * 一覧ページ（/<brand>/spot/lists）は /<brand>/api/proxy2/shop/list を呼んで描画する。
 * 店舗ごとの詳細フラグ（「駐車場」= d16 等、type=flag）は一覧JSONには載らないが、
 * 同APIに c_d<番号>=1 を付けると「そのフラグが立っている店舗」だけが返る（画面の「条件を反映」検索と同じ）。
 * ここでは全件を取ったうえで、フラグごとに絞り込み検索を投げて該当店舗の code 集合を作り、店舗ごとに設備を付ける。
 * limit は 500 まで（1000 は 400 が返る）。
 */
import { fetchJson, tally } from './_lib.mjs';

const LIMIT = 500;

async function listAll(api, referer, extra = '') {
  const items = [];
  let total = null;
  for (let offset = 0; ; offset += LIMIT) {
    const d = await fetchJson(`${api}?limit=${LIMIT}&offset=${offset}${extra}`, { headers: { Referer: referer, Accept: 'application/json' } });
    if (!d.count || !Array.isArray(d.items)) throw new Error(`想定外の応答: ${api}${extra}`);
    total = d.count.total;
    items.push(...d.items);
    if (items.length >= total || d.items.length === 0) break;
  }
  if (items.length !== total) throw new Error(`件数不一致 total=${total} got=${items.length} (${extra})`);
  return items;
}

/**
 * @param {object} o
 * @param {string} o.chain      設備DBのキー
 * @param {string} o.name       ブランド名
 * @param {string} o.site       店舗検索のオリジン+ブランドパス（例 https://store.br31.jp/br31/）
 * @param {Record<string,{param:string,label:string}>} o.flags  設備キー → { param: 'd16', label: 公式表記 }
 * @param {string[]} [o.categories]  絞り込む業態カテゴリコード（省略時は全件）
 * @param {string} [o.extraParams]  検索画面が既定で付ける追加クエリ（例 'c_d1=0'）。全件・絞り込みの両方に付く
 * @param {string} [o.method]
 * @param {string} [o.note]
 */
export async function crawlNavitime({ chain, name, site, flags, categories, extraParams, method, note }) {
  const api = `${site}api/proxy2/shop/list`;
  const referer = `${site}spot/lists`;
  // extraParams: 検索画面が既定で付けている追加条件（例 吉野家の c_d1=0「店舗ページに表示しない」店の除外）
  const cat = (categories?.length ? `&category=${categories.join('.')}` : '') + (extraParams ? `&${extraParams}` : '');
  const all = await listAll(api, referer, cat);
  const flagged = {};
  for (const [key, { param }] of Object.entries(flags)) {
    const hit = await listAll(api, referer, `${cat}&c_${param}=1`);
    flagged[key] = new Set(hit.map((s) => s.code));
  }
  const stores = all.map((s) => ({
    name: s.name.replace(/[\s　]+/g, ' ').trim(),
    url: `${site}spot/detail?code=${s.code}`,
    facilities: Object.keys(flags).filter((k) => flagged[k].has(s.code)),
  }));
  const labels = Object.fromEntries(Object.entries(flags).map(([k, v]) => [k, v.label]));
  const facilities = tally(stores, labels);
  for (const [k, set] of Object.entries(flagged)) {
    if (set.size !== facilities[k].count) throw new Error(`${k}: 絞り込み件数 ${set.size} と集計 ${facilities[k].count} が不一致`);
  }
  const cats = {};
  for (const s of all) {
    // categories は大・中・小の階層が全部入るので、いちばん細かい分類だけ数える
    const c = [...(s.categories || [])].sort((a, b) => (b.code || '').length - (a.code || '').length)[0];
    if (c) cats[c.name] = (cats[c.name] || 0) + 1;
  }
  return {
    chain,
    name,
    sourceUrl: referer,
    method: method || `公式店舗検索（NAVITIME製）が呼ぶ店舗API（/api/proxy2/shop/list）で全店舗を取得し、詳細フラグごとの絞り込み検索（c_d<番号>=1）の該当店舗を突き合わせて店舗ごとに集計`,
    total: stores.length,
    note: [note, `業態カテゴリ内訳: ${Object.entries(cats).map(([n, c]) => `${n}${c}店`).join('・')}`].filter(Boolean).join('。'),
    facilities,
    stores,
  };
}
