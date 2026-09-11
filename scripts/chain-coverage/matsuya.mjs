/**
 * 松屋: NAVITIME 製公式店舗検索 pkg.navitime.co.jp/matsuyafoods。読み方は _navitime.mjs 参照。
 * 「条件で探す」のチェックのうち家族向けは「駐車場あり」「バリアフリー」のみ
 * （テーブル席あり・セルフサービス・タッチパネル注文等は対象外）。
 * locator は松屋フーズ全業態（松のや・マイカリー食堂・すし松等）共通なので、カテゴリ「松屋」(0101)「松屋PREMIUM」(0102) だけ数える。
 * 「バリアフリー」は公式に「当社基準によります」と注記あり（stepFree に対応づけ）。
 */
import { runAdapter } from './_lib.mjs';
import { crawlNavitime } from './_navitime.mjs';

export async function crawl() {
  return crawlNavitime({
    chain: 'matsuya',
    name: '松屋',
    site: 'https://pkg.navitime.co.jp/matsuyafoods/',
    categories: ['0101', '0102'],
    flags: {
      parking: { param: 'dcflg02', label: '駐車場あり' },
      stepFree: { param: 'dcflg07', label: 'バリアフリー' },
    },
    method: '公式店舗検索（pkg.navitime.co.jp/matsuyafoods）の一覧APIで全店舗を列挙し、「条件で探す」のチェック（駐車場あり・バリアフリー）で絞り込んだ結果に含まれる店舗を店舗ごとに集計',
    note: '松のや・マイカリー食堂等の別業態は除外。バリアフリーは公式注記「当社基準によります」',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
