/**
 * 上島珈琲店: 公式店舗検索（shop.ufs.co.jp/ufs、UCCフードサービス・NAVITIME製）。
 * 一覧API（/ufs/api/proxy2/shop/list?category=01）でカテゴリ「上島珈琲店」の店舗を列挙し、
 * 各店舗詳細ページに埋め込まれた spotDetail JSON の flags（アイコン項目の true/false）を店舗ごとに読む。
 * flags には 専用駐車場有・キッズメニュー のほか 抽出方法・禁煙区分・Wi-Fi・決済・デリバリー等が並ぶ。
 */
import { fetchText, fetchJson, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://shop.ufs.co.jp/ufs/spot/list?category=01';
const LIST_API = 'https://shop.ufs.co.jp/ufs/api/proxy2/shop/list?category=01&limit=100&offset=';
// 公式アイコンのラベル → 設備キー。ここに無いラベル（抽出方法・禁煙/分煙・Wi-Fi・決済・デリバリー等）は無視する
const LABELS = {
  parking: '専用駐車場有',
  kidsMenu: 'キッズメニュー',
};

/** `spotDetail = {...}` の JSON を文字列を考慮した波括弧対応で切り出す */
function spotDetail(html) {
  const start = html.indexOf('spotDetail = {');
  if (start < 0) throw new Error('spotDetail が見つからない');
  let i = html.indexOf('{', start);
  let depth = 0;
  let inStr = false;
  for (let j = i; j < html.length; j++) {
    const c = html[j];
    if (inStr) {
      if (c === '\\') j++;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return JSON.parse(html.slice(i, j + 1)); }
  }
  throw new Error('spotDetail の閉じ括弧が見つからない');
}

export async function crawl() {
  const items = [];
  let total = null;
  for (let offset = 0; ; offset += 100) {
    const j = await fetchJson(LIST_API + offset, { headers: { Referer: SOURCE, 'X-Requested-With': 'XMLHttpRequest' } });
    total = j.count.total;
    items.push(...j.items);
    if (items.length >= total || j.items.length === 0) break;
  }
  if (items.length !== total) throw new Error(`件数不一致 total=${total} got=${items.length}`);
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = [];
  for (const it of items) {
    const url = `https://shop.ufs.co.jp/ufs/spot/detail?code=${it.code}`;
    const d = spotDetail(await fetchText(url));
    const flags = Object.values(d.flags || {});
    if (!flags.length) throw new Error(`flags が無い: ${it.name}`);
    const facilities = flags.filter((f) => f.value === 'true').map((f) => byLabel[f.label]).filter(Boolean);
    stores.push({ name: it.name.replace(/\s+/g, ' ').trim(), url, facilities });
  }
  return {
    chain: 'ueshimacoffee',
    name: '上島珈琲店',
    sourceUrl: SOURCE,
    method: '公式店舗検索（NAVITIME製）の一覧APIでカテゴリ「上島珈琲店」の店舗を列挙し、各店舗詳細ページ埋め込みの spotDetail.flags（アイコン項目の true/false）を集計',
    total: stores.length,
    note: 'UCCフードサービスの他業態（カテゴリ01以外）は対象外。アイコン項目に子ども向けはキッズメニューのみで、座席・トイレ系の属性は無い',
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
