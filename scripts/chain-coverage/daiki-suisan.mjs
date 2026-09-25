/**
 * 大起水産回転寿司: 大起水産グループの公式店舗検索（shop.daiki-suisan.co.jp、can-ly製ディレクトリ型）。
 * 読み方は _canly-directory.mjs 参照。ブランド「大起水産回転寿司」(id 2501) の店舗だけ数える（街のみなと等の他業態は除外）。
 * 絞り込み条件「サービス/設備」のうち設備に当たるのは「駐車場あり」のみ
 * （お持ち帰り・鮮魚販売・デリバリー・駅から近い・テーブル席あり・決済等は対象外。
 *  「テーブル席あり」は座敷・ボックス席のどちらにも当たらないので数えない）。
 */
import { runAdapter } from './_lib.mjs';
import { crawlCanlyDirectory } from './_canly-directory.mjs';

export async function crawl() {
  return crawlCanlyDirectory({
    chain: 'daiki-suisan',
    name: '大起水産回転寿司',
    source: 'https://shop.daiki-suisan.co.jp/',
    directoryId: 86,
    brandId: 2501,
    categoryId: 1466,
    categoryTitle: 'サービス/設備',
    labels: {
      parking: '駐車場あり',
    },
    note: 'グループの他業態（街のみなと・海鮮丼と干物定食専門店等）は除外',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
