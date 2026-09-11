/**
 * はなまるうどん: NAVITIME 製公式店舗検索 stores.hanamaruudon.com。読み方は _navitime.mjs 参照。
 * 「条件で探す」のチェックのうち家族向けは「お子様メニュー」「駐車場」のみ（デリバリー各社・決済系は対象外）。
 * locator にはうまげな・つるさく等の別業態も載るので、カテゴリ「はなまるうどん」(01)「はなまるうどん×吉野家」(02) だけ数える。
 */
import { runAdapter } from './_lib.mjs';
import { crawlNavitime } from './_navitime.mjs';

export async function crawl() {
  return crawlNavitime({
    chain: 'hanamaru-udon',
    name: 'はなまるうどん',
    site: 'https://stores.hanamaruudon.com/hanamaru/',
    categories: ['01', '02'],
    flags: {
      kidsMenu: { param: 'd14', label: 'お子様メニュー' },
      parking: { param: 'd5', label: '駐車場' },
    },
    method: '公式店舗検索（stores.hanamaruudon.com）の一覧APIで全店舗を列挙し、「条件で探す」のチェック（お子様メニュー・駐車場）で絞り込んだ結果に含まれる店舗を店舗ごとに集計',
    note: 'うまげな・つるさく等の別業態は除外',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
