/**
 * サーティワン: 公式店舗検索（store.br31.jp/br31/、NAVITIME製）。詳細は _navitime.mjs。
 * 店舗詳細のフラグ項目は 出前館/UberEats/menu/駐車場/クレープ の5つで、設備に当たるのは「駐車場」だけ。
 * 子ども向け設備（ベビーチェア・おむつ替え等）の属性は無い。
 */
import { runAdapter } from './_lib.mjs';
import { crawlNavitime } from './_navitime.mjs';

export async function crawl() {
  return crawlNavitime({
    chain: 'baskin-robbins-31',
    name: 'サーティワン',
    site: 'https://store.br31.jp/br31/',
    flags: { parking: { param: 'd16', label: '駐車場' } },
    note: '店舗検索のフラグ項目は 出前館・UberEats・menu・駐車場・クレープ の5つで、設備属性は「駐車場」（絞り込み表記「駐車場のある」）のみ。子ども向け設備の属性は公開されていない',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
