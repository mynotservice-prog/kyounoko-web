/**
 * 大戸屋: 公式店舗検索（store.ootoya.com、MEO Cloud製）。詳細は _canly.mjs。
 * 絞り込み条件「サービス・施設」（駐車場／ドリンクバー／コーヒードリンクバーのみ／禁煙／2階以上店舗／地下店舗／
 * エレベーターあり／無料Wi-Fiあり／タッチパネル注文／スマホ注文／セルフレジ／フードコート型店舗／朝食あり）のうち、
 * 家族向け設備キーに対応するのは「駐車場」のみ（「エレベーターあり」は対応キーが無いため数えない）。
 */
import { runAdapter } from './_lib.mjs';
import { crawlCanly } from './_canly.mjs';

export async function crawl() {
  return crawlCanly({
    chain: 'ootoya',
    name: '大戸屋',
    source: 'https://store.ootoya.com/',
    companyId: 522,
    categoryId: 1044,
    categoryTitle: 'サービス・施設',
    labels: { parking: '駐車場' },
    note: '家族向け設備に対応する項目は駐車場のみ。「エレベーターあり」「2階以上店舗」「地下店舗」は対応する設備キーが無いため数えていない',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
