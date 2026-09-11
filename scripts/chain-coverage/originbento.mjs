/**
 * オリジン弁当: 公式店舗検索（shop.toshu.co.jp/toshu/「オリジン東秀 店舗検索」、NAVITIME製）。詳細は _navitime.mjs。
 * 東秀グループ全業態（キッチンオリジン/オリジン弁当/オリジンデリカ/れんげ食堂Toshu/小麦晴れ/ゲッティ）が同じ検索に載るので、
 * 業態カテゴリ 01 オリジン弁当 + 04 キッチンオリジン（弁当・惣菜店の本体ブランド）に絞る。
 * 店舗詳細のフラグ項目のうち設備に当たるのは「駐車場」「イートイン」「コンセント」で、設備キーに対応するのは「駐車場」だけ。
 */
import { runAdapter } from './_lib.mjs';
import { crawlNavitime } from './_navitime.mjs';

export async function crawl() {
  return crawlNavitime({
    chain: 'originbento',
    name: 'オリジン弁当',
    site: 'https://shop.toshu.co.jp/toshu/',
    categories: ['01', '04'],
    flags: { parking: { param: 'd2', label: '駐車場' } },
    note: '業態カテゴリ「オリジン弁当」「キッチンオリジン」に絞って集計（同じ店舗検索に載るオリジンデリカ54店・れんげ食堂Toshu81店・武蔵野うどん小麦晴れ4店・鉄鍋焼きスパ ゲッティ2店は除外）。フラグ項目のうち設備は 駐車場・イートイン・コンセント で、設備キーに対応するのは「駐車場」（絞り込み表記「駐車場がある」）のみ。子ども向け設備の属性は公開されていない',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
