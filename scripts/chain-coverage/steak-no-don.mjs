/**
 * ステーキのどん: アークミールの公式店舗一覧（https://www.steak-don.jp/shop_list.html?pref=0）。読み方は _arcmeal.mjs 参照。
 */
import { runAdapter } from './_lib.mjs';
import { crawlArcmeal } from './_arcmeal.mjs';

export async function crawl() {
  return crawlArcmeal({ chain: 'steak-no-don', name: 'ステーキのどん', origin: 'https://www.steak-don.jp' });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
