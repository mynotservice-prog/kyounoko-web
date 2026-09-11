/**
 * サイゼリヤ: 公式店舗検索（shop.saizeriya.co.jp、NAVITIME製）。
 * 都道府県別の店舗一覧（limit=500 で1ページに全件）を47回取得し、各行の「施設情報」欄の
 * フラグラベルを店舗ごとに読む。公式が絞り込み条件として持つフラグは
 * 駐車場・テイクアウト・クレジット(VISA等)・電子マネー(交通系) の4つだけなので、
 * 設備キーに対応するのは「駐車場」のみ（座敷・お子様椅子等は属性として存在しない）。
 */
import { fetchText, tally, runAdapter, text } from './_lib.mjs';

const SOURCE = 'https://shop.saizeriya.co.jp/sz_restaurant/';
const LABELS = {
  parking: '駐車場',
};

export async function crawl() {
  const byLabel = Object.fromEntries(Object.entries(LABELS).map(([k, v]) => [v, k]));
  const stores = [];
  const seen = new Set();
  const prefTotals = [];
  for (let i = 1; i <= 47; i++) {
    const address = String(i).padStart(2, '0');
    const html = await fetchText(`${SOURCE}spot/list?address=${address}&search=address&limit=500`);
    const m = text(html).match(/検索結果： ?(\d+) 件 ?（(\d+) 件 - (\d+) 件）/);
    if (!m) throw new Error(`件数表示が読めない: address=${address}`);
    const [, total, , last] = m.map(Number);
    if (total !== last) throw new Error(`address=${address}: ${total}件中${last}件しか取れていない`);
    prefTotals.push(total);
    let n = 0;
    for (const row of html.split('<tr>')) {
      const link = row.match(/href="([^"]*spot\/detail\?code=(\d+))"/);
      if (!link) continue;
      const code = link[2];
      if (seen.has(code)) continue;
      seen.add(code);
      const name = text(row.match(/<a[^>]*spot\/detail[^>]*>([\s\S]*?)<\/a>/)?.[1] || '');
      const labels = [...row.matchAll(/detailFlagLabel">([^<]+)</g)].map((x) => x[1].trim());
      stores.push({ name, url: `https:${link[1]}`, facilities: [...new Set(labels.map((l) => byLabel[l]).filter(Boolean))] });
      n++;
    }
    if (n !== total) throw new Error(`address=${address}: 表示${total}件に対し行を${n}件しか読めていない`);
  }
  return {
    chain: 'saizeriya',
    name: 'サイゼリヤ',
    sourceUrl: SOURCE,
    method: '公式店舗検索（NAVITIME）の都道府県別一覧を47件取得し、各店舗の「施設情報」フラグを集計',
    total: stores.length,
    note: `公式店舗検索の絞り込み条件は駐車場・テイクアウト・クレジット・電子マネーの4つだけで、座敷・お子様椅子・おむつ交換台等は属性として存在しない。都道府県別件数の合計は${prefTotals.reduce((a, b) => a + b, 0)}件`,
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
