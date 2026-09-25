/**
 * 築地銀だこ: 公式店舗検索（stores.gindaco.com、can-ly製ディレクトリ型）。読み方は _canly-directory.mjs 参照。
 * ブランド「築地銀だこ」(id 262) の店舗だけ数える（銀だこハイボール酒場・銀だこ点心酒場は別ブランドとして除外）。
 * 絞り込み条件「設備/サービス」のうち設備に当たるのは「駐車場」「個室有」のみ
 * （テイクアウト・イートイン・取扱商品・カウンター席・テーブル席・喫煙BOX等は対象外。
 *  「テーブル席」は座敷・ボックス席のどちらにも当たらないので数えない）。
 * 「個室有」は 2026-09-25 の集計で築地銀だこ全店 0 件。居酒屋業態と共通の項目で、築地銀だこでは未入力と
 * 区別できないため数えない（平禄寿司の多目的トイレと同じ扱い）。
 */
import { runAdapter } from './_lib.mjs';
import { crawlCanlyDirectory } from './_canly-directory.mjs';

export async function crawl() {
  return crawlCanlyDirectory({
    chain: 'gindaco',
    name: '築地銀だこ',
    source: 'https://stores.gindaco.com/',
    directoryId: 7,
    brandId: 262,
    categoryId: 93,
    categoryTitle: '設備/サービス',
    labels: {
      parking: '駐車場',
    },
    note: '銀だこハイボール酒場・銀だこ点心酒場は別ブランドとして除外。持ち帰り中心の店舗も「築地銀だこ」ブランドなら含む。「個室有」は築地銀だこ全店で0件のため未入力と区別できず数えない',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
