/**
 * タリーズコーヒー: 公式店舗検索（shop.tullys.co.jp、can-ly製）。
 * 全件一覧ページ（/all）の各店舗ブロックに data-store 属性として店舗JSONが埋まっており、
 * その facilities 配列（Wi-Fi/ChargeSpot/禁煙・喫煙区分/キッズスペース）を店舗ごとに集計する。
 * 1ページ・1リクエストで全店舗が取れる。
 */
import { fetchText, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://shop.tullys.co.jp/';
const LIST = 'https://shop.tullys.co.jp/all';
// 公式「設備」チェック項目のラベル → 設備キー。ここに無いラベル（Wi-Fi・ChargeSpot・禁煙/喫煙室）は無視する
const LABELS = {
  kidsSpace: 'キッズスペース',
};

const unescapeAttr = (s) => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

export async function crawl() {
  const html = await fetchText(LIST);
  const shown = html.match(/(\d+)\s*件/)?.[1];
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = [];
  for (const m of html.matchAll(/data-store="(\{[^"]*\})"/g)) {
    const s = JSON.parse(unescapeAttr(m[1]));
    if (!Array.isArray(s.facilities)) throw new Error(`facilities が無い: ${s.store_name_info}`);
    const facilities = s.facilities.map((t) => byLabel[t]).filter(Boolean);
    stores.push({ name: `タリーズコーヒー ${s.store_name_info}`.replace(/\s+/g, ' ').trim(), url: `${SOURCE}detail/${s.id}`, facilities });
  }
  return {
    chain: 'tullyscoffee',
    name: 'タリーズコーヒー',
    sourceUrl: SOURCE,
    method: '公式店舗検索（can-ly）の全件一覧ページに埋め込まれた店舗JSONの「設備」配列を店舗ごとに集計',
    total: stores.length,
    note: `一覧ページの表示件数は${shown ?? '不明'}件。設備の絞り込み項目は Tully’s Wi-Fi/ChargeSpot/禁煙/喫煙室区分/キッズスペース で、子ども向けはキッズスペースのみ。コンセプト店（&TEA 等）も一覧に含まれていれば含む`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
