/**
 * ロイヤルホスト: 公式店舗検索（locations.royalhost.jp、MEO Cloud製。royalhost.jp のヘッダー「店舗検索」から遷移）。詳細は _canly.mjs。
 * 絞り込み条件「サービス・施設」（スロープ／テイクアウト／デリバリー／ドリンクバー／ベビーシート／駐車場）のうち
 * スロープ→stepFree、ベビーシート→diaperTable、駐車場→parking を集計する。
 * 店舗詳細の「メニュー」欄（グランドメニュー等のリンク有無）は設備属性ではないので数えない。
 */
import { runAdapter } from './_lib.mjs';
import { crawlCanly } from './_canly.mjs';

export async function crawl() {
  return crawlCanly({
    chain: 'royal-host',
    name: 'ロイヤルホスト',
    source: 'https://locations.royalhost.jp/',
    companyId: 872,
    categoryId: 1501,
    categoryTitle: 'サービス・施設',
    labels: { stepFree: 'スロープ', diaperTable: 'ベビーシート', parking: '駐車場' },
    note: '「スロープ」を段差なし（stepFree）として扱った',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) await runAdapter(crawl);
