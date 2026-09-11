/**
 * MEO Cloud（can-ly.com）製の店舗検索（Next.js）の共通部品。
 * 大戸屋（store.ootoya.com）・フレッシュネスバーガー（search.freshnessburger.co.jp）・ロイヤルホスト（locations.royalhost.jp）が同じ仕組み。
 *
 * - 店舗一覧: https://g9ey9rioe.api.hp.can-ly.com/v2/companies/<companyId>/shops/search が全店舗を1回で返す
 *   （このAPIには設備値が入らず、絞り込みパラメータもサーバ側では効かない＝絞り込みはブラウザ側）。
 * - 設備値: 店舗詳細ページ <source>detail/<storeCode>/ の __NEXT_DATA__ → props.pageProps.shop.cmsItemValues に
 *   カテゴリ（cmsItemId）ごとの items[].checked が入る。トップページの絞り込み条件（pageProps.categories[].id）と同じ id。
 * 全店舗の詳細ページを取得して checked を集計する。公式の絞り込み件数はサーバ側に無いので突き合わせはしない。
 */
import { fetchText, fetchJson, tally } from './_lib.mjs';

const API = 'https://g9ey9rioe.api.hp.can-ly.com';

function nextData(html, url) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`__NEXT_DATA__ が無い: ${url}`);
  return JSON.parse(m[1]);
}

/**
 * @param {object} p
 * @param {string} p.chain
 * @param {string} p.name
 * @param {string} p.source     店舗検索トップ（末尾 /）
 * @param {number} p.companyId  can-ly の企業ID
 * @param {number} p.categoryId 絞り込み条件カテゴリの id（= 店舗詳細の cmsItemId）
 * @param {string} p.categoryTitle カテゴリ名（検証用）
 * @param {Record<string,string>} p.labels 設備キー → 公式表記（そのまま）
 * @param {string} [p.note]
 */
export async function crawlCanly({ chain, name, source, companyId, categoryId, categoryTitle, labels, note }) {
  // 1. トップの絞り込み条件で表記を検証
  const top = nextData(await fetchText(source), source);
  const cat = (top.props.pageProps.categories || []).find((c) => c.id === categoryId);
  if (!cat) throw new Error(`絞り込みカテゴリ id=${categoryId} がトップに無い`);
  if (cat.title !== categoryTitle) throw new Error(`カテゴリ名が "${cat.title}"（想定 "${categoryTitle}"）`);
  const catLabels = (cat.content[cat.content.componentName]?.items || []).map((i) => i.label);
  for (const l of Object.values(labels)) if (!catLabels.includes(l)) throw new Error(`表記 "${l}" が絞り込み条件に無い（現在: ${catLabels.join('|')}）`);
  const labelToKey = Object.fromEntries(Object.entries(labels).map(([k, v]) => [v, k]));

  // 2. 店舗一覧
  const list = await fetchJson(`${API}/v2/companies/${companyId}/shops/search`, { headers: { Referer: source } });
  if (!Array.isArray(list.shops) || !list.shops.length) throw new Error('店舗一覧が空');
  const status = {};
  for (const s of list.shops) status[s.businessStatus] = (status[s.businessStatus] || 0) + 1;

  // 3. 各店舗の詳細ページから checked を集計
  const stores = [];
  const missing = []; // 一覧にはあるが詳細ページが 404 の店舗（設備値が取れないので total から除外）
  let noItem = 0;
  for (const s of list.shops) {
    const url = `${source}detail/${s.storeCode}/`;
    let html;
    try {
      html = await fetchText(url);
    } catch (e) {
      if (/HTTP 404/.test(e.message)) { missing.push(s.nameKanji); continue; }
      throw e;
    }
    const d = nextData(html, url);
    const shop = d.props.pageProps.shop;
    if (!shop) throw new Error(`shop が無い: ${url}`);
    const v = (shop.cmsItemValues || []).find((x) => x.cmsItemId === categoryId);
    const items = v ? v.content[v.content.componentName]?.items || [] : [];
    if (!v) noItem++;
    const facilities = [...new Set(items.filter((i) => i.checked && labelToKey[i.label]).map((i) => labelToKey[i.label]))];
    stores.push({ name: (shop.nameKanji || s.nameKanji).replace(/\s+/g, ' ').trim(), url, facilities });
  }

  return {
    chain,
    name,
    sourceUrl: source,
    method: `公式店舗検索（MEO Cloud製）の店舗一覧API（/v2/companies/${companyId}/shops/search）で全店舗を取得し、各店舗の詳細ページ（/detail/<storeCode>/）の __NEXT_DATA__ にある絞り込み条件「${categoryTitle}」の checked を集計`,
    note: [
      `絞り込み条件「${categoryTitle}」の項目: ${catLabels.join('・')}`,
      `店舗一覧の businessStatus: ${Object.entries(status).map(([k, v]) => `${k}=${v}`).join('、')}（一覧 ${list.shops.length} 件）`,
      missing.length ? `詳細ページが 404 のため除外: ${missing.join('、')}` : null,
      noItem ? `詳細ページに「${categoryTitle}」の値が無い店舗 ${noItem} 件（設備なしとして集計）` : null,
      '公式の絞り込みはブラウザ側で行われサーバ側の件数が無いため、絞り込み件数との突き合わせは未実施',
      note,
    ].filter(Boolean).join('。'),
    total: stores.length,
    facilities: tally(stores, labels),
    stores,
  };
}
