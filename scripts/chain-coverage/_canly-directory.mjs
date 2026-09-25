/**
 * can-ly 製店舗検索のうち「ディレクトリ型」（api.site.can-ly.com/v2/directories/<id>/...）の共通部品。
 * 築地銀だこ（stores.gindaco.com）・大起水産（shop.daiki-suisan.co.jp）が同じ仕組み。
 * ばんどう太郎（bandotaro.mjs）も同系統だが、既存アダプタはそのまま残す。
 *
 * - 店舗一覧: https://api.site.can-ly.com/v2/directories/<directoryId>/shops/search?cond=brand,<brandId>
 *   がブランドの全店舗を1回で返す（設備値は入らない）。
 * - 設備値: 店舗詳細ページ <source>detail/<storeCode>/ の __NEXT_DATA__ → props.pageProps.shop.cmsItemValues の
 *   うち、トップページの絞り込み条件（pageProps.categories[].id）と同じ cmsItemId の items[].checked。
 *   項目の表記はテンプレートにより label（checkBoxOnOffLabel）か text（checkBoxComposite）に入る。
 * 閉店扱い（openStatus=IS_CLOSED / IS_PERMANENTLY_CLOSED）は除外し、件数を note に書く。
 */
import { fetchText, fetchJson, tally } from './_lib.mjs';

const API = 'https://api.site.can-ly.com/v2/directories';

function nextData(html, url) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`__NEXT_DATA__ が無い: ${url}`);
  return JSON.parse(m[1]);
}
const itemLabel = (i) => (i.label ?? i.text ?? '').trim();
const itemsOf = (content) => content?.[content.componentName]?.items || [];

/**
 * @param {object} p
 * @param {string} p.chain
 * @param {string} p.name
 * @param {string} p.source       店舗検索トップ（末尾 /）
 * @param {number} p.directoryId  can-ly のディレクトリID
 * @param {number} p.brandId      絞り込み条件「ブランド」の id
 * @param {number} p.categoryId   設備の絞り込み条件カテゴリの id（= 店舗詳細の cmsItemId）
 * @param {string} p.categoryTitle カテゴリ名（検証用）
 * @param {Record<string,string>} p.labels 設備キー → 公式表記（そのまま）
 * @param {string} [p.note]
 */
export async function crawlCanlyDirectory({ chain, name, source, directoryId, brandId, categoryId, categoryTitle, labels, note }) {
  const origin = new URL(source).origin;
  // 1. トップの絞り込み条件で表記を検証
  const top = nextData(await fetchText(source), source);
  const cat = (top.props.pageProps.categories || []).find((c) => c.id === categoryId);
  if (!cat) throw new Error(`絞り込みカテゴリ id=${categoryId} がトップに無い`);
  if (cat.title !== categoryTitle) throw new Error(`カテゴリ名が "${cat.title}"（想定 "${categoryTitle}"）`);
  const catLabels = itemsOf(cat.content).map(itemLabel);
  for (const l of Object.values(labels)) if (!catLabels.includes(l)) throw new Error(`表記 "${l}" が絞り込み条件に無い（現在: ${catLabels.join('|')}）`);
  const labelToKey = Object.fromEntries(Object.entries(labels).map(([k, v]) => [v, k]));

  // 2. 店舗一覧（ブランドで絞る）
  const list = await fetchJson(`${API}/${directoryId}/shops/search?cond=brand,${brandId}`, { headers: { Origin: origin, Referer: source } });
  if (!Array.isArray(list.shops) || !list.shops.length) throw new Error('店舗一覧が空');
  if (list.maxPage > 1) throw new Error(`一覧が複数ページ（maxPage=${list.maxPage}）。ページ送りに未対応`);
  const closed = [];
  const otherBrand = list.shops.filter((s) => s.brand?.id !== brandId).length;
  if (otherBrand) throw new Error(`ブランド絞り込みに他ブランドが ${otherBrand} 件混ざっている`);

  // 3. 各店舗の詳細ページから checked を集計
  const stores = [];
  const missing = [];
  let noItem = 0;
  for (const s of list.shops) {
    if (/CLOSED/.test(s.openStatus || '')) { closed.push(s.nameKanji); continue; }
    const url = `${source}detail/${s.storeCode}/`;
    let html;
    try {
      html = await fetchText(url);
    } catch (e) {
      if (/HTTP 404/.test(e.message)) { missing.push(s.nameKanji); continue; }
      throw e;
    }
    const shop = nextData(html, url).props.pageProps.shop;
    if (!shop) throw new Error(`shop が無い: ${url}`);
    const v = (shop.cmsItemValues || []).find((x) => x.cmsItemId === categoryId);
    if (!v) noItem++;
    const items = v ? itemsOf(v.content) : [];
    const facilities = [...new Set(items.filter((i) => i.checked && labelToKey[itemLabel(i)]).map((i) => labelToKey[itemLabel(i)]))];
    stores.push({ name: (shop.nameKanji || s.nameKanji).replace(/\s+/g, ' ').trim(), url, facilities });
  }

  return {
    chain,
    name,
    sourceUrl: source,
    method: `公式店舗検索（can-ly製）の店舗一覧API（/v2/directories/${directoryId}/shops/search、ブランド絞り込み）で全店舗を取得し、各店舗の詳細ページ（/detail/<storeCode>/）の __NEXT_DATA__ にある絞り込み条件「${categoryTitle}」の checked を集計`,
    note: [
      note,
      `絞り込み条件「${categoryTitle}」の項目: ${catLabels.join('・')}`,
      closed.length ? `閉店扱い${closed.length}件（${closed.join('、')}）を除外` : null,
      missing.length ? `詳細ページが 404 のため除外: ${missing.join('、')}` : null,
      noItem ? `詳細ページに「${categoryTitle}」の値が無い店舗 ${noItem} 件（設備なしとして集計）` : null,
      '公式の絞り込みはブラウザ側で行われサーバ側の件数が無いため、絞り込み件数との突き合わせは未実施',
    ].filter(Boolean).join('。'),
    total: stores.length,
    facilities: tally(stores, labels),
    stores,
  };
}
