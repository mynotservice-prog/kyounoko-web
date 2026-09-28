/**
 * 媒体データの正本（/about・/business・その他の対外ページで共有）。
 *
 * 運用ルール:
 * - ここに書く数字は「実測値」だけ。盛らない・丸めすぎない。広告主に出す数字なので、
 *   聞かれたら根拠（GA4のスクリーンショット等）を出せる状態を保つ。
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
  asOfLabel: '2026年9月',
  updatedAtLabel: '2026年9月28日',
  updatedAtIso: '2026-09-28',

  /** アクセス（GA4 プロパティ 533628127 実測・2026-08-01〜08-31） */
  monthlyPv: 105242,
  monthlyPvLabel: '2026年8月',
  monthlySessions: 81864,
  monthlyUsers: 73665,
  /** 前月比の参考（GA4・2026年7月） */
  prevMonthlyPv: 62894,
  prevMonthlyPvLabel: '2026年7月',
  /** 検索エンジン経由セッションの比率（%・8月: Organic Search 78,597 / 81,864） */
  organicShare: 96.0,
  /** GA4 エンゲージメント率（%・8月） */
  engagementRate: 73.3,

  /** Google 検索（Search Console sc-domain:kyounoko.jp・8月・ウェブ検索・日付単位の集計） */
  searchClicks: 61539,
  searchImpressions: 1299765,
  searchAvgPosition: 7.7,

  /** 読者（%・8月セッション比。端末は全体比、地域は国=日本のうち地域が判明した69,135セッション比） */
  mobileShare: 92.5,
  tokyoShare: 50.1,
  /** 1都6県 */
  kantoShare: 65.4,
  /** 2府4県 */
  kansaiShare: 15.3,

  /** コンテンツ規模（本番 sitemap 実数・2026-09-28。駅は /station/line を除く駅ページ） */
  articles: 1078,
  spots: 782,
  kidReports: 56,
  stations: 587,
  stationsTokyo: 484,
  stationsKanagawa: 36,
  stationsSaitamaChiba: 30,
  stationsKansai: 37,
} as const;
