/**
 * ステーキガスト: すかいらーくグループ共通店舗検索（store-info.skylark.co.jp）。詳細は _skylark.mjs。
 * 店舗API（カテゴリ=0105）で全店舗を取得し、店舗ごとの設備フラグ（絞り込み検索と同じ項目）を集計する。
 */
import { runAdapter } from './_lib.mjs';
import { crawlBrand } from './_skylark.mjs';

export async function crawl() {
  return crawlBrand({ chain: 'steak-gusto', name: 'ステーキガスト', category: '0105' });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
