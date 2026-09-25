/**
 * からやま: アークランドサービスの公式店舗検索（shop.arclandservice.co.jp/ae-shop、NAVITIME製）。読み方は _navitime.mjs 参照。
 * 業態カテゴリ「からやま」(04) だけ数える。「施設情報」の条件のうち設備に当たるのは「駐車場あり」(d28) のみ
 * （テイクアウト・デリバリー・席予約・券売機・ドライブスルー・ペット同伴可等は対象外）。
 * 一覧には海外店も同じカテゴリで入る（住所が英語表記・地域コードが実在しない値）ので、住所が日本の都道府県で始まる店舗だけ数える。
 */
import { runAdapter } from './_lib.mjs';
import { crawlNavitime } from './_navitime.mjs';

const DOMESTIC = /^\s*(北海道|東京都|大阪府|京都府|[^\s]{2,3}県)/;

export async function crawl() {
  return crawlNavitime({
    chain: 'karayama',
    name: 'からやま',
    site: 'https://shop.arclandservice.co.jp/ae-shop/',
    categories: ['04'],
    flags: {
      parking: { param: 'd28', label: '駐車場あり' },
    },
    filter: { test: (s) => DOMESTIC.test(s.address_name || ''), label: '国内住所（都道府県で始まる住所）' },
    method: '公式店舗検索（shop.arclandservice.co.jp/ae-shop）の一覧APIでカテゴリ「からやま」の全店舗を列挙し、「施設情報」の条件「駐車場あり」で絞り込んだ結果に含まれる店舗を店舗ごとに集計（国内店のみ）',
    note: '海外店は除外。店舗検索の設備に当たる条件は「駐車場あり」のみで、子ども用の椅子・おむつ替え台等の項目は無い',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
