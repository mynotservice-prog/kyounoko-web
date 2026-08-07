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
 *   アクセス数        : node scripts/ga4-report.mjs --property=533628127
 *   公開記事数        : grep -L "noindex: true" content/articles/* | wc -l
 *   実訪問レポート数  : /kid-reports の件数（lib/kid-reports.ts + lib/spots.ts のインライン分）
 */

export const CONTACT_EMAIL = 'service@remegift.jp';
export const INSTAGRAM_HANDLE = '@kyounoko_family_plan';
export const INSTAGRAM_URL = 'https://www.instagram.com/kyounoko_family_plan/';

export const SITE_FACTS = {
  /** 数字の基準時点 */
  asOfLabel: '2026年8月',
  updatedAtLabel: '2026年8月5日',
  updatedAtIso: '2026-08-05',

  /** アクセス（GA4 プロパティ 533628127 実測） */
  monthlyPv: 62894,
  monthlyPvLabel: '2026年7月',
  monthlySessions: 45093,
  pv28d: 68870,
  users28d: 44909,
  /** 検索エンジン経由セッションの比率（%） */
  organicShare: 94.9,
  /** GA4 エンゲージメント率（%・直近28日） */
  engagementRate: 60.1,

  /** 読者（直近28日セッション比・%） */
  mobileShare: 90.6,
  tokyoShare: 47.5,
  kantoShare: 60.3,
  kansaiShare: 14.6,

  /** コンテンツ規模 */
  articles: 755,
  spots: 98,
  kidReports: 54,
  stations: 589,
  stationsTokyo: 484,
  stationsKanagawa: 37,
  stationsSaitamaChiba: 30,
  stationsKansai: 38,
} as const;
