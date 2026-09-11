/**
 * 吉野家: NAVITIME 製公式店舗検索 stores.yoshinoya.com。読み方は _navitime.mjs 参照。
 * 「お店の設備やご利用いただけるサービス」のチェックのうち家族向けは「お子様メニュー」「駐車場」のみ
 * （テーブル席・ドライブスルー・決済系は対象外。「お子様セット（ミニ牛丼）」等は販売メニューのフラグなので設備として数えない）。
 * 業態は 吉野家（0101: 吉野家／クッキング＆コンフォート／テイクアウト・デリバリー専門店）・そば処吉野家（0102）・吉野家×はなまるうどん（0103）。
 * 検索画面の既定条件 c_d1=0（「店舗ページに表示しない」店を除外）と exclude-category=02（オフィス）も同じ結果になるよう付ける。
 */
import { runAdapter } from './_lib.mjs';
import { crawlNavitime } from './_navitime.mjs';

export async function crawl() {
  return crawlNavitime({
    chain: 'yoshinoya',
    name: '吉野家',
    site: 'https://stores.yoshinoya.com/yoshinoya/',
    categories: ['0101', '0102', '0103'],
    extraParams: 'c_d1=0',
    flags: {
      kidsMenu: { param: 'd67', label: 'お子様メニュー' },
      parking: { param: 'd73', label: '駐車場' },
    },
    method: '公式店舗検索（stores.yoshinoya.com）の一覧APIで全店舗を列挙し、「条件で探す」のチェック（お子様メニュー・駐車場）で絞り込んだ結果に含まれる店舗を店舗ごとに集計',
    note: '検索画面の既定条件（店舗ページに表示しない店の除外）を適用',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
