/**
 * 運営者ながみーが実店舗で確認した「チェーンの子連れ対応」の一次情報。
 *
 * ※ここに入るのは**運営者本人が店舗で確認した結果のみ**。口コミ・まとめサイト・
 *   他人の体験談は混ぜない。公式サイトに書いてあることもここには入れない
 *   （それは記事側で公式URLと確認日を添えて書く）。
 *
 * なぜ必要か（2026-07-28）:
 *   「離乳食を持ち込めるか」は検索需要が最も大きい軸なのに、主要チェーンはどこも
 *   公式サイトに書いていない（ガスト/ココス/サイゼリヤ/はま寿司/スシロー/
 *   ロイヤルホスト/焼肉きんぐ を実際に確認）。それなのに競合も自サイトも
 *   「公式がOKと案内している」と書いていた。根拠は存在しなかったので
 *   PR #99 で「店舗判断」へ修正した。
 *   → この軸で本当のことを書けるのは**実際に店舗で確認した人だけ**。ここが差別化点になる。
 *
 * 記事での使い方:
 *   「公式には記載がない」＋「編集長が◯◯店で確認（YYYY年M月）」の2段構えで書く。
 *   1店舗の結果を全店の方針として書かないこと（店舗判断であることが結論なので）。
 */

/** 確認した項目 */
export type ChainCheckItem =
  | 'rinyushoku-mochikomi' // 離乳食の持ち込み
  | 'atatame' // レンジでの温め
  | 'oyu' // ミルク用のお湯
  | 'baby-chair' // ベビーチェア
  | 'stroller'; // ベビーカー入店

/** 確認結果。「断られた」も同じ価値の一次情報なので必ず記録する。 */
export type ChainCheckResult = 'ok' | 'refused' | 'conditional';

export type ChainCheck = {
  item: ChainCheckItem;
  result: ChainCheckResult;
  /** conditional のときの条件、refused のときの理由など */
  note?: string;
};

export type ChainReport = {
  /** チェーン名（記事の表記と合わせる） */
  chain: string;
  /** 店舗名。「◯◯店」が分からなければ「郊外のロードサイド店」程度でもよい */
  store: string;
  /** 確認した年月（YYYY-MM）。日まで分かるなら YYYY-MM-DD */
  checkedAt: string;
  checks: ChainCheck[];
  /** その他の気づき */
  note?: string;
};

/**
 * 実店舗の確認記録。
 *
 * ⚠ 空のまま記事に「実店舗で確認した」と書かないこと。ここが唯一の正で、
 *   ここに無い確認結果は記事に書けない。
 */
export const CHAIN_REPORTS: ChainReport[] = [
  {
    chain: 'ガスト',
    store: '下赤塚店',
    checkedAt: '2025-01',
    checks: [
      { item: 'rinyushoku-mochikomi', result: 'ok' },
      { item: 'atatame', result: 'ok', note: 'ドリンクバーのお湯で湯煎する形で対応してもらえた' },
      { item: 'oyu', result: 'ok', note: 'ドリンクバーのお湯を案内された' },
    ],
  },
  {
    chain: 'ココス',
    store: '草加店',
    checkedAt: '2026-03',
    checks: [
      { item: 'atatame', result: 'ok', note: '店内で販売している離乳食は温めて提供された' },
      { item: 'oyu', result: 'ok' },
    ],
    note: '店舗で離乳食を販売していたため持ち込みは確認していない。ただしココスの公式おこさまメニューにベビーフードの掲載は無く（2026-07-28確認）、取り扱いは店舗による可能性がある。',
  },
  {
    chain: 'サイゼリヤ',
    store: 'イオン相模原店',
    checkedAt: '2025-10',
    checks: [
      { item: 'rinyushoku-mochikomi', result: 'ok' },
      { item: 'atatame', result: 'refused' },
      { item: 'oyu', result: 'ok', note: 'ドリンクバーから利用' },
    ],
  },
  {
    chain: 'スシロー',
    store: '港北ニュータウン店',
    checkedAt: '2025-09',
    checks: [
      { item: 'rinyushoku-mochikomi', result: 'ok' },
      { item: 'atatame', result: 'refused' },
      { item: 'oyu', result: 'ok' },
    ],
  },
  {
    chain: 'はま寿司',
    store: '板橋徳丸店',
    checkedAt: '2025-10',
    checks: [{ item: 'rinyushoku-mochikomi', result: 'ok' }],
  },
  {
    chain: 'ロイヤルホスト',
    store: '浦安店',
    checkedAt: '2025-04',
    checks: [
      { item: 'atatame', result: 'ok', note: '店内で販売している離乳食を温めて提供してもらえた' },
      { item: 'oyu', result: 'ok', note: 'ミルク用のお湯を用意してもらえた' },
    ],
    note: '店舗で離乳食を販売していたため持ち込みは確認していない。ロイヤルホストは公式のおこさまメニューに「ベビーフード かぼちゃのグラタン」「ベビーフード ひらめのリゾット」を掲載している（2026-07-28確認）。',
  },
  {
    chain: 'バーミヤン',
    store: '東中野店',
    checkedAt: '2025-01',
    checks: [{ item: 'rinyushoku-mochikomi', result: 'ok' }],
  },
  {
    chain: 'デニーズ',
    store: '梅島店',
    checkedAt: '2025-08',
    checks: [
      { item: 'atatame', result: 'ok', note: '店内で販売している離乳食を温めて提供してもらえた' },
      { item: 'oyu', result: 'ok', note: 'ミルク用のお湯を用意してもらえた' },
    ],
    note: '店舗で離乳食を販売していたため持ち込みは確認していない。デニーズは公式のおこさまメニューに「乳児向けベビーフード しらすの雑炊（生後7〜8ヶ月頃）300円（税込330円）」を掲載している（2026-07-28確認）。',
  },
];

/** チェーン名で確認記録を引く（記事側の表示用）。 */
export function getChainReports(chain: string): ChainReport[] {
  return CHAIN_REPORTS.filter((r) => r.chain === chain);
}

/** ある項目について確認済みかどうか。未確認なら記事に「確認済み」と書いてはいけない。 */
export function hasChainCheck(chain: string, item: ChainCheckItem): boolean {
  return CHAIN_REPORTS.some((r) => r.chain === chain && r.checks.some((c) => c.item === item));
}
