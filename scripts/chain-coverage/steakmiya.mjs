/**
 * ステーキ宮: 公式店舗一覧（www.miya.com/shop/）から全店舗を列挙し、各店舗詳細ページの
 * 「◼︎設備」「◼︎料理・サービス」表（個室／半個室／座席／その他 の行）を店舗ごとに読む。
 * 値は「ー」（該当なし）か「ソファー席あり」「駐車場あり／Wi-Fi…」のような文字列。
 */
import { fetchText, text, tally, runAdapter } from './_lib.mjs';

const SOURCE = 'https://www.miya.com/shop/';
// 公式の行見出し／値の表記 → 設備キー。ここに無い値（Wi-Fi・貸切・食べ放題等）は無視する
const LABELS = {
  privateRoom: '個室／半個室',
  boxSeat: 'ソファー席あり',
  parking: '駐車場あり',
};

function rows(html) {
  const out = {};
  for (const m of html.matchAll(/<th>([^<]+)<\/th>\s*<td>([\s\S]*?)<\/td>/g)) {
    out[m[1].replace(/[\s　]/g, '')] = text(m[2]);
  }
  return out;
}

export async function crawl() {
  const list = await fetchText(SOURCE);
  const items = [...list.matchAll(/<td class="name"><a href="detail\.php\?shop_no=(\d+)">([^<]+)<\/a>/g)];
  const seen = new Set();
  const stores = [];
  for (const [, id, rawName] of items) {
    if (seen.has(id)) continue;
    seen.add(id);
    const url = `${SOURCE}detail.php?shop_no=${id}`;
    const r = rows(await fetchText(url));
    if (!('座席' in r) || !('個室' in r)) throw new Error(`設備表が無い: ${rawName}`);
    const facilities = [];
    if (r['個室'] !== 'ー' || r['半個室'] !== 'ー') facilities.push('privateRoom');
    if (/ソファー席あり/.test(r['座席'])) facilities.push('boxSeat');
    if (/駐車場あり/.test(r['その他'] || '')) facilities.push('parking');
    stores.push({ name: text(rawName), url, facilities });
  }
  return {
    chain: 'steakmiya',
    name: 'ステーキ宮',
    sourceUrl: SOURCE,
    method: '公式店舗一覧の全店舗について、店舗詳細ページの設備表（個室／半個室／座席／その他）の値を集計',
    total: stores.length,
    note: '公式の設備表に「お子様椅子」「おむつ交換台」等の行は無い。値「ー」は「該当なし」と「未入力」を区別できない',
    facilities: tally(stores, LABELS),
    stores,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
