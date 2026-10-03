/**
 * 媒体データの正本（/about・/business・その他の対外ページで共有）。
 *
 * 運用ルール:
 * - ここに書く数字は「実測値」だけ。盛らない。広告主に出す数字なので、
 *   聞かれたら根拠（GA4のスクリーンショット等）を出せる状態を保つ。
 * - サイト上（/business・/about）では正確な値を出さず、切り捨てで丸めた「◯万超」表記にする
 *   （2026-10-03 社長指示）。正確な値は媒体資料（問い合わせ時に送付）でのみ提示する。
 *   丸めは approxOver() を通す（切り捨てなので「超」が常に成り立つ）。
 * - 更新は月次。手順は下記コメントのコマンドをそのまま実行して差し替える。
 * - 更新したら asOfLabel / updatedAtLabel / updatedAtIso も必ず同時に直す。
 *
 * 更新コマンド:
 *   アクセス数        : node scripts/ga4-report.mjs --property=533628127（前月1日〜末日の確定値）
 *   検索クリック等    : node scripts/gsc-report.mjs（日付単位の集計を使う。クエリ単位は上位打ち切りで総数にならない）
 *   記事・スポット・駅: 本番 https://kyounoko.jp/sitemap.xml の /article/・/spot/・/station/<slug>（line除く）の件数
 *   公開記事数        : grep -L "noindex: true" content/articles/* | wc -l
 *   実訪問レポート数  : /kid-reports の件数（lib/kid-reports.ts + lib/spots.ts のインライン分）
 */

export const CONTACT_EMAIL = 'service@remegift.jp';
export const INSTAGRAM_HANDLE = '@kyounoko_family_plan';
export const INSTAGRAM_URL = 'https://www.instagram.com/kyounoko_family_plan/';

export const SITE_FACTS = {
  /** 数字の基準時点（アクセス系は前月の確定値を載せる。直近28日は連休等で振れるため看板にしない） */
  asOfLabel: '2026年10月',
  updatedAtLabel: '2026年10月3日',
  updatedAtIso: '2026-10-03',

  /** アクセス（GA4 プロパティ 533628127 実測・2026-09-01〜09-30） */
  monthlyPv: 135941,
  monthlyPvLabel: '2026年9月',
  monthlySessions: 108739,
  monthlyUsers: 95455,
  /** 前月比の参考（GA4・2026年8月） */
  prevMonthlyPv: 105242,
  prevMonthlyPvLabel: '2026年8月',
  /** 検索エンジン経由セッションの比率（%・9月: Organic Search 103,817 / 109,007） */
  organicShare: 95.2,
  /** GA4 エンゲージメント率（%・9月） */
  engagementRate: 75.6,

  /** Google 検索（Search Console sc-domain:kyounoko.jp・9月・ウェブ検索・デバイス別合計） */
  searchClicks: 75824,
  searchImpressions: 1791116,
  searchAvgPosition: 7.1,

  /** 読者（%・9月セッション比。端末は全体比、地域は国=日本のうち地域が判明した90,392セッション比） */
  mobileShare: 93.1,
  tokyoShare: 51.1,
  /** 1都6県 */
  kantoShare: 66.6,
  /** 2府4県 */
  kansaiShare: 12.2,

  /** コンテンツ規模（本番 sitemap 実数・2026-10-03。駅は /station/line を除く駅ページ） */
  articles: 1078,
  spots: 782,
  kidReports: 56,
  stations: 588,
  stationsTokyo: 484,
  stationsKanagawa: 36,
  stationsSaitamaChiba: 30,
  stationsKansai: 37,
} as const;

/**
 * サイト表示用の丸め（切り捨て）。「13万」「170万」を返し、表示側で「13万PV超」のように単位＋「超」を付ける。
 * unit は 10000（万）か 100000（十万）。切り捨てなので「超」が常に成り立つ。
 */
export function approxOver(n: number, unit: 10000 | 100000 = 10000): string {
  const floored = Math.floor(n / unit) * unit;
  return `${(floored / 10000).toLocaleString('ja-JP')}万`;
}

/** サイト表示用の丸めた値（/business・/about 共通） */
export const SITE_FACTS_APPROX = {
  monthlyPv: approxOver(SITE_FACTS.monthlyPv), // 13万 → 「13万PV超」
  monthlySessions: approxOver(SITE_FACTS.monthlySessions), // 10万
  monthlyUsers: approxOver(SITE_FACTS.monthlyUsers), // 9万
  searchClicks: approxOver(SITE_FACTS.searchClicks), // 7万
  searchImpressions: approxOver(SITE_FACTS.searchImpressions, 100000), // 170万
  /** 前月比（%・四捨五入） */
  pvGrowthPct: Math.round((SITE_FACTS.monthlyPv / SITE_FACTS.prevMonthlyPv - 1) * 100),
  mobileShare: Math.floor(SITE_FACTS.mobileShare), // 93
  organicShare: Math.floor(SITE_FACTS.organicShare), // 95
  engagementRate: Math.floor(SITE_FACTS.engagementRate), // 75
  kantoShare: Math.floor(SITE_FACTS.kantoShare), // 66
  tokyoShare: Math.floor(SITE_FACTS.tokyoShare), // 51
  kansaiShare: Math.floor(SITE_FACTS.kansaiShare), // 12
} as const;
