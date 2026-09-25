/**
 * フォルクス: アークミールの公式店舗一覧（https://www.volks-steak.jp/shop_list.html?pref=0）。読み方は _arcmeal.mjs 参照。
 */
import { runAdapter } from './_lib.mjs';
import { crawlArcmeal } from './_arcmeal.mjs';

export async function crawl() {
  return crawlArcmeal({ chain: 'volks', name: 'フォルクス', origin: 'https://www.volks-steak.jp' });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
